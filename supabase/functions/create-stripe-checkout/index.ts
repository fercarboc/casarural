// supabase/functions/create-stripe-checkout/index.ts
// Crea sesión Stripe Checkout para una reserva en PENDING_PAYMENT
// POST { reservaId }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function resolveAppUrl(): string {
  const configured = getRequiredEnv('APP_URL').replace(/\/$/, '');

  let parsed: URL;
  try {
    parsed = new URL(configured);
  } catch {
    throw new Error(`Invalid APP_URL: ${configured}`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`APP_URL must use http or https: ${configured}`);
  }

  // En un dominio público real, mejor exigir https.
  // Permitimos http solo si es localhost para desarrollo manual.
  const isLocalhost =
    parsed.hostname === 'localhost' ||
    parsed.hostname === '127.0.0.1';

  if (parsed.protocol !== 'https:' && !isLocalhost) {
    throw new Error(`APP_URL must use https in non-local environments: ${configured}`);
  }

  return parsed.origin;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = getRequiredEnv('SUPABASE_URL');
    const supabaseServiceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const stripeSecretKey = getRequiredEnv('STRIPE_SECRET_KEY');
    const appUrl = resolveAppUrl();

    console.log('[create-stripe-checkout] APP_URL resuelta:', appUrl);

    let payload: { reservaId?: string };
    try {
      payload = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const { reservaId } = payload;

    if (!reservaId) {
      return jsonResponse({ error: 'Missing reservaId' }, 400);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });

    const { data: reserva, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', reservaId)
      .single();

    if (error || !reserva) {
      console.error('[create-stripe-checkout] Reserva no encontrada:', error);
      return jsonResponse({ error: 'Reserva no encontrada' }, 404);
    }

    if (reserva.estado !== 'PENDING_PAYMENT') {
      return jsonResponse(
        { error: 'La reserva no está pendiente de pago' },
        400
      );
    }

    const isFlexible = reserva.tarifa === 'FLEXIBLE';
    const importePago = isFlexible ? reserva.importe_senal : reserva.total;

    if (!Number.isFinite(Number(importePago)) || Number(importePago) <= 0) {
      console.error('[create-stripe-checkout] Importe inválido:', {
        reservaId,
        tarifa: reserva.tarifa,
        importePago,
      });
      return jsonResponse({ error: 'Importe de pago inválido' }, 400);
    }

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

    if (isFlexible) {
      lineItems = [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Señal — La Rasilla (${reserva.noches} noche${reserva.noches > 1 ? 's' : ''})`,
              description: `Estancia ${reserva.fecha_entrada} → ${reserva.fecha_salida} · ${reserva.num_huespedes} huéspedes. Resto: ${(reserva.total - importePago).toFixed(2)} € a abonar antes de la llegada.`,
            },
            unit_amount: Math.round(Number(importePago) * 100),
          },
          quantity: 1,
        },
      ];
    } else {
      const descuentoImporte = Number(reserva.descuento ?? 0);
      const importeAlojamiento = Number(reserva.importe_alojamiento ?? 0);
      const importeExtra = Number(reserva.importe_extra ?? 0);
      const importeLimpieza = Number(reserva.importe_limpieza ?? 0);

      const alojamientoConDescuento = importeAlojamiento - descuentoImporte;

      if (alojamientoConDescuento < 0) {
        console.error('[create-stripe-checkout] El alojamiento neto es negativo:', {
          reservaId,
          importeAlojamiento,
          descuentoImporte,
        });
        return jsonResponse(
          { error: 'Configuración de importes inválida en la reserva' },
          400
        );
      }

      const descuentoLabel =
        descuentoImporte > 0
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

        ...(importeExtra > 0
          ? [
              {
                price_data: {
                  currency: 'eur',
                  product_data: {
                    name: `Suplemento huésped extra (${reserva.noches} noches)`,
                  },
                  unit_amount: Math.round(importeExtra * 100),
                },
                quantity: 1,
              } as Stripe.Checkout.SessionCreateParams.LineItem,
            ]
          : []),

        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Tarifa de limpieza',
            },
            unit_amount: Math.round(importeLimpieza * 100),
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
      cancel_url: `${appUrl}/reserva/cancelada`,
      metadata: {
        reserva_id: String(reserva.id),
        reserva_codigo: String(reserva.codigo ?? ''),
        tarifa: String(reserva.tarifa ?? ''),
        es_senal: isFlexible ? 'true' : 'false',
      },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
      payment_intent_data: {
        metadata: {
          reserva_id: String(reserva.id),
        },
      },
    });

    const { error: updateError } = await supabase
      .from('reservas')
      .update({ stripe_session_id: session.id })
      .eq('id', reservaId);

    if (updateError) {
      console.error('[create-stripe-checkout] Error guardando stripe_session_id:', updateError);
      return jsonResponse(
        { error: 'No se pudo actualizar la reserva con la sesión de Stripe' },
        500
      );
    }

    return jsonResponse({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (err) {
    console.error('create-stripe-checkout error:', err);

    const message =
      err instanceof Error ? err.message : 'Internal server error';

    return jsonResponse(
      {
        error: 'Internal server error',
        detail: message,
      },
      500
    );
  }
});