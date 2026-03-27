// supabase/functions/create-stripe-checkout/index.ts
// Crea sesión Stripe Checkout para una reserva en PENDING_PAYMENT
// POST { reservaId }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { reservaId } = await req.json();
    if (!reservaId) return Response.json({ error: 'Missing reservaId' }, { status: 400, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });

    const { data: reserva, error } = await supabase
      .from('reservas').select('*').eq('id', reservaId).single();

    if (error || !reserva) return Response.json({ error: 'Reserva no encontrada' }, { status: 404, headers: corsHeaders });
    if (reserva.estado !== 'PENDING_PAYMENT') return Response.json({ error: 'La reserva no está pendiente de pago' }, { status: 400, headers: corsHeaders });
    // APP_URL: tomar de variable de entorno (configurada en Supabase Secrets).
    // Si no está definida, intentar derivarla desde el Origin/Referer de la request
    // para no caer en localhost (que bloquearía la confirmación en producción).
    const appUrl = (() => {
      const configured = Deno.env.get('APP_URL');
      if (configured) return configured.replace(/\/$/, '');
      const origin = req.headers.get('origin') ?? req.headers.get('referer') ?? '';
      if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        try { return new URL(origin).origin; } catch { /* ignorar */ }
      }
      return 'http://localhost:5173';
    })();
    const isFlexible = reserva.tarifa === 'FLEXIBLE';
    const importePago = isFlexible ? reserva.importe_senal : reserva.total;

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

    if (isFlexible) {
      // ─── TARIFA FLEXIBLE: cobrar solo la señal (50%) ───────────────────────
      // Un único line item claro. El desglose completo se muestra en la web.
      lineItems = [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Señal — La Rasilla (${reserva.noches} noche${reserva.noches > 1 ? 's' : ''})`,
            description: `Estancia ${reserva.fecha_entrada} → ${reserva.fecha_salida} · ${reserva.num_huespedes} huéspedes. Resto: ${(reserva.total - importePago).toFixed(2)} € a abonar antes de la llegada.`,
          },
          unit_amount: Math.round(importePago * 100),
        },
        quantity: 1,
      }];
    } else {
      // ─── TARIFA NO REEMBOLSABLE: desglose completo en el recibo ────────────
      // Stripe no admite unit_amount negativo en Checkout Sessions,
      // así que el descuento se netea sobre el importe de alojamiento.
      const descuentoImporte = reserva.descuento ?? 0;
      const alojamientoConDescuento = reserva.importe_alojamiento - descuentoImporte;
      const descuentoLabel = descuentoImporte > 0
        ? ` (incluye −10% no reembolsable: −${descuentoImporte.toFixed(2)} €)`
        : '';

      lineItems = [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `La Rasilla — ${reserva.noches} noche${reserva.noches > 1 ? 's' : ''}`,
              description: `Alojamiento${descuentoLabel}`,
            },
            unit_amount: Math.round(alojamientoConDescuento * 100),
          },
          quantity: 1,
        },

        // Suplemento huésped extra (solo si aplica)
        ...(reserva.importe_extra > 0 ? [{
          price_data: {
            currency: 'eur',
            product_data: { name: `Suplemento huésped extra (${reserva.noches} noches)` },
            unit_amount: Math.round(reserva.importe_extra * 100),
          },
          quantity: 1,
        }] : []),

        // Limpieza (siempre presente)
        {
          price_data: {
            currency: 'eur',
            product_data: { name: 'Tarifa de limpieza' },
            unit_amount: Math.round(reserva.importe_limpieza * 100),
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: reserva.email,
      line_items: lineItems,
      success_url: `${appUrl}/reserva/confirmada?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/reservar?cancelled=true`,
      metadata: {
        reserva_id:     reserva.id,
        reserva_codigo: reserva.codigo,
        tarifa:         reserva.tarifa,
        es_senal:       isFlexible ? 'true' : 'false',
      },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // 30 minutos
      payment_intent_data: {
        metadata: { reserva_id: reserva.id },
      },
    });

    // Guardar session_id en la reserva
    await supabase
      .from('reservas')
      .update({ stripe_session_id: session.id })
      .eq('id', reservaId);

    return Response.json(
      { checkout_url: session.url, session_id: session.id },
      { headers: corsHeaders }
    );

  } catch (err) {
    console.error('create-stripe-checkout error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
});