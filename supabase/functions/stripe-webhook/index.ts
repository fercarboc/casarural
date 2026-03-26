// supabase/functions/stripe-webhook/index.ts
// Webhook de Stripe: confirma reservas tras pago exitoso
// FIX: idempotencia — verifica estado antes de procesar para evitar duplicados

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

serve(async (req) => {
  const signature     = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

  if (!signature) return new Response('Missing stripe-signature', { status: 400 });

  let event: Stripe.Event;
  try {
    const body   = await req.text();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
    event        = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // ─── checkout.session.completed ────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session   = event.data.object as Stripe.Checkout.Session;
    const reservaId = session.metadata?.reserva_id;
    const esSenal   = session.metadata?.es_senal === 'true';

    if (!reservaId) {
      console.error('No reserva_id in session metadata');
      return new Response('ok', { status: 200 });
    }

    // FIX: idempotencia — leer estado actual antes de procesar
    const { data: reservaActual } = await supabase
      .from('reservas')
      .select('id, estado, estado_pago')
      .eq('id', reservaId)
      .single();

    if (!reservaActual) {
      console.error('Reserva no encontrada:', reservaId);
      return new Response('ok', { status: 200 });
    }

    // Si ya está CONFIRMED, Stripe está reenviando el evento — ignorar silenciosamente
    if (reservaActual.estado === 'CONFIRMED') {
      console.log(`Reserva ${reservaId} ya confirmada, evento ignorado (idempotencia)`);
      return new Response('ok', { status: 200 });
    }

    // Solo procesar si está en PENDING_PAYMENT
    if (reservaActual.estado !== 'PENDING_PAYMENT') {
      console.warn(`Reserva ${reservaId} en estado inesperado: ${reservaActual.estado}`);
      return new Response('ok', { status: 200 });
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent as Stripe.PaymentIntent)?.id ?? null;

    const importePagado = (session.amount_total ?? 0) / 100;

    // Actualizar reserva
    const { data: reserva } = await supabase
      .from('reservas')
      .update({
        estado:                'CONFIRMED',
        estado_pago:           esSenal ? 'PARTIAL' : 'PAID',
        stripe_payment_intent: paymentIntentId,
        importe_pagado:        importePagado,
        updated_at:            new Date().toISOString(),
      })
      .eq('id', reservaId)
      .select('*')
      .single();

    // FIX: idempotencia en pagos — verificar que no existe ya este payment_intent
    const { data: pagoExistente } = await supabase
      .from('pagos')
      .select('id')
      .eq('stripe_payment_intent', paymentIntentId)
      .maybeSingle();

    if (!pagoExistente) {
      await supabase.from('pagos').insert({
        reserva_id:            reservaId,
        stripe_payment_intent: paymentIntentId,
        concepto:              esSenal ? 'SENAL' : 'TOTAL',
        importe:               importePagado,
        estado:                'COMPLETADO',
        fecha_pago:            new Date().toISOString(),
      });
    }

    // Audit log
    await supabase.from('audit_log').insert({
      entity_type:  'reserva',
      entity_id:    reservaId,
      action:       'PAYMENT_CONFIRMED',
      new_values:   {
        estado:      'CONFIRMED',
        estado_pago: esSenal ? 'PARTIAL' : 'PAID',
        importe:     importePagado,
        stripe_session_id: session.id,
      },
      performed_by: 'stripe_webhook',
    });

    // Enviar email de confirmación (fire & forget, no bloquea respuesta a Stripe)
    if (reserva) {
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // send-email tiene verify_jwt: false, no necesita Authorization
          // pero lo incluimos por si cambia en el futuro
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        },
        body: JSON.stringify({
          template_key:   'reservation_confirmed',
          to_email:       reserva.email,
          to_name:        `${reserva.nombre} ${reserva.apellidos}`,
          reservation_id: reservaId,
        }),
      }).catch(err => console.error('Email send error:', err));
    }
  }

  // ─── checkout.session.expired ──────────────────────────────────────────────
  if (event.type === 'checkout.session.expired') {
    const session   = event.data.object as Stripe.Checkout.Session;
    const reservaId = session.metadata?.reserva_id;

    if (reservaId) {
      // Solo expirar si sigue en PENDING_PAYMENT (idempotencia)
      const { data: updated } = await supabase
        .from('reservas')
        .update({ estado: 'EXPIRED', updated_at: new Date().toISOString() })
        .eq('id', reservaId)
        .eq('estado', 'PENDING_PAYMENT') // condición de guarda
        .select('id')
        .maybeSingle();

      if (updated) {
        console.log(`Reserva ${reservaId} marcada como EXPIRED`);
        await supabase.from('audit_log').insert({
          entity_type:  'reserva',
          entity_id:    reservaId,
          action:       'SESSION_EXPIRED',
          new_values:   { estado: 'EXPIRED' },
          performed_by: 'stripe_webhook',
        });
      }
    }
  }

  // ─── payment_intent.payment_failed ─────────────────────────────────────────
  if (event.type === 'payment_intent.payment_failed') {
    const pi        = event.data.object as Stripe.PaymentIntent;
    const reservaId = pi.metadata?.reserva_id;

    if (reservaId) {
      console.warn(`Pago fallido para reserva ${reservaId}:`, pi.last_payment_error?.message);
      // No cambiamos estado — la sesión sigue activa 30 min para reintentar
      // Solo registramos en audit para visibilidad en admin
      await supabase.from('audit_log').insert({
        entity_type:  'reserva',
        entity_id:    reservaId,
        action:       'PAYMENT_FAILED',
        new_values:   { motivo: pi.last_payment_error?.message ?? 'unknown' },
        performed_by: 'stripe_webhook',
      });
    }
  }

  return new Response('ok', { status: 200 });
});