// supabase/functions/create-stripe-checkout/index.ts
// Crea sesión Stripe Checkout para una reserva en PENDING_PAYMENT
// POST { reservaId }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

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
      .from('reservas')
      .select('*')
      .eq('id', reservaId)
      .single();

    if (error || !reserva) return Response.json({ error: 'Reserva no encontrada' }, { status: 404, headers: corsHeaders });
    if (reserva.estado !== 'PENDING_PAYMENT') return Response.json({ error: 'La reserva no está pendiente de pago' }, { status: 400, headers: corsHeaders });

    const appUrl    = Deno.env.get('APP_URL') ?? 'https://casarurallarasilla.com';
    const isFlexible = reserva.tarifa === 'FLEXIBLE';
    const importePago = isFlexible ? reserva.importe_senal : reserva.total;
    const importeCents = Math.round(importePago * 100);

    // Para tarifa flexible: un único ítem con la señal
    // Para no reembolsable: desglose completo
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

    if (isFlexible) {
      lineItems = [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Señal reserva La Rasilla (${reserva.noches} noches) — ${reserva.fecha_entrada} → ${reserva.fecha_salida}`,
            description: `El resto (${(reserva.total - importePago).toFixed(2)}€) se abonará 30 días antes de la llegada.`,
          },
          unit_amount: importeCents,
        },
        quantity: 1,
      }];
    } else {
      lineItems = [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `La Rasilla — ${reserva.noches} noche${reserva.noches > 1 ? 's' : ''}`,
              description: `${reserva.fecha_entrada} → ${reserva.fecha_salida} · ${reserva.num_huespedes} huéspedes`,
            },
            unit_amount: Math.round(reserva.importe_alojamiento * 100),
          },
          quantity: 1,
        },
        ...(reserva.importe_extra > 0 ? [{
          price_data: {
            currency: 'eur',
            product_data: { name: 'Suplemento huésped extra' },
            unit_amount: Math.round(reserva.importe_extra * 100),
          },
          quantity: 1,
        }] : []),
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
        reserva_id: reserva.id,
        tarifa:     reserva.tarifa,
        es_senal:   isFlexible ? 'true' : 'false',
      },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
      payment_intent_data: {
        metadata: { reserva_id: reserva.id },
      },
    });

    // Guardar session id en la reserva
    await supabase
      .from('reservas')
      .update({ stripe_session_id: session.id })
      .eq('id', reservaId);

    return Response.json({ checkout_url: session.url, session_id: session.id }, { headers: corsHeaders });

  } catch (err) {
    console.error('create-stripe-checkout error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
});
