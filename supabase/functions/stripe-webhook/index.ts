// supabase/functions/stripe-webhook/index.ts
// Webhook de Stripe: confirma reservas tras pago exitoso
// Stripe envía POST firmado con STRIPE_WEBHOOK_SECRET

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

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

  // ── Pago completado ────────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session    = event.data.object as Stripe.Checkout.Session;
    const reservaId  = session.metadata?.reserva_id;
    const esSenal    = session.metadata?.es_senal === 'true';

    if (!reservaId) {
      console.error('No reserva_id in session metadata');
      return new Response('ok', { status: 200 });
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent as any)?.id ?? null;

    const importePagado = (session.amount_total ?? 0) / 100;

    const { data: reserva } = await supabase
      .from('reservas')
      .update({
        estado:             'CONFIRMED',
        estado_pago:        esSenal ? 'PARTIAL' : 'PAID',
        stripe_payment_intent: paymentIntentId,
        importe_pagado:     importePagado,
      })
      .eq('id', reservaId)
      .select('*')
      .single();

    // Registrar pago
    await supabase.from('pagos').insert({
      reserva_id:   reservaId,
      stripe_payment_intent: paymentIntentId,
      concepto:     esSenal ? 'SENAL' : 'TOTAL',
      importe:      importePagado,
      estado:       'COMPLETADO',
      fecha_pago:   new Date().toISOString(),
    });

    // Auditoría
    await supabase.from('audit_log').insert({
      entity_type:  'reserva',
      entity_id:    reservaId,
      action:       'PAYMENT_CONFIRMED',
      new_values:   { estado: 'CONFIRMED', estado_pago: esSenal ? 'PARTIAL' : 'PAID', importe: importePagado },
      performed_by: 'stripe_webhook',
    });

    // Email de confirmación (fire & forget)
    if (reserva) {
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          template_key:   'reservation_confirmed',
          to_email:       reserva.email,
          to_name:        `${reserva.nombre} ${reserva.apellidos}`,
          reservation_id: reservaId,
        }),
      }).catch(err => console.error('Email error:', err));
    }
  }

  // ── Sesión expirada sin pagar ──────────────────────────────────────────
  if (event.type === 'checkout.session.expired') {
    const session   = event.data.object as Stripe.Checkout.Session;
    const reservaId = session.metadata?.reserva_id;
    if (reservaId) {
      await supabase
        .from('reservas')
        .update({ estado: 'EXPIRED' })
        .eq('id', reservaId)
        .eq('estado', 'PENDING_PAYMENT');
    }
  }

  return new Response('ok', { status: 200 });
});
