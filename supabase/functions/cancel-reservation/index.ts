// supabase/functions/cancel-reservation/index.ts
// Cancela una reserva aplicando la política de cancelación flexible
// POST { reservaId, cancelledBy: 'guest' | 'admin', reason? }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const POLITICA_CANCELACION = [
  { min_dias: 60, reembolso: 1.0 },
  { min_dias: 45, reembolso: 0.5 },
  { min_dias: 30, reembolso: 0.25 },
  { min_dias: 0,  reembolso: 0 },
];

function getPorcentajeReembolso(fechaEntrada: string): number {
  const hoy       = new Date();
  const entrada   = new Date(fechaEntrada);
  const diasHasta = Math.ceil((entrada.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  for (const tier of POLITICA_CANCELACION) {
    if (diasHasta >= tier.min_dias) return tier.reembolso;
  }
  return 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { reservaId, cancelledBy = 'admin', reason } = await req.json();
    if (!reservaId) return Response.json({ error: 'Missing reservaId' }, { status: 400, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Obtener reserva + pagos
    const [{ data: reserva }, { data: pagos }] = await Promise.all([
      supabase.from('reservas').select('*').eq('id', reservaId).single(),
      supabase.from('pagos').select('importe, estado').eq('reserva_id', reservaId),
    ]);

    if (!reserva) return Response.json({ error: 'Reserva no encontrada' }, { status: 404, headers: corsHeaders });
    if (!['CONFIRMED', 'PENDING_PAYMENT'].includes(reserva.estado)) {
      return Response.json({ error: 'La reserva no se puede cancelar en su estado actual' }, { status: 400, headers: corsHeaders });
    }

    // Calcular reembolso
    let importeReembolso = 0;
    let porcentajeReembolso = 0;

    if (reserva.estado_pago !== 'UNPAID' && reserva.tarifa === 'FLEXIBLE') {
      porcentajeReembolso = getPorcentajeReembolso(reserva.fecha_entrada);
      const totalPagado = (pagos ?? [])
        .filter((p: any) => p.estado === 'COMPLETADO')
        .reduce((sum: number, p: any) => sum + p.importe, 0);
      importeReembolso = totalPagado * porcentajeReembolso;
    }
    // NON_REFUNDABLE: reembolso siempre 0

    // Actualizar reserva
    await supabase.from('reservas').update({
      estado:         'CANCELLED',
      notas_admin:    reason ? `Cancelado: ${reason}` : `Cancelado por ${cancelledBy}`,
    }).eq('id', reservaId);

    // Procesar reembolso en Stripe
    if (importeReembolso > 0 && reserva.stripe_payment_intent) {
      try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
        await stripe.refunds.create({
          payment_intent: reserva.stripe_payment_intent,
          amount: Math.round(importeReembolso * 100),
          reason: 'requested_by_customer',
        });

        await supabase.from('pagos').insert({
          reserva_id:  reservaId,
          concepto:    'REEMBOLSO',
          importe:     -importeReembolso,
          estado:      'COMPLETADO',
          fecha_pago:  new Date().toISOString(),
        });

        await supabase.from('reservas').update({ estado_pago: 'REFUNDED' }).eq('id', reservaId);
      } catch (stripeErr) {
        console.error('Stripe refund error:', stripeErr);
      }
    }

    // Email de cancelación
    fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
      body: JSON.stringify({
        template_key:   'reservation_cancelled',
        to_email:       reserva.email,
        to_name:        `${reserva.nombre} ${reserva.apellidos}`,
        reservation_id: reservaId,
        extra_vars:     { refund_amount: importeReembolso.toFixed(2) },
      }),
    }).catch(console.error);

    // Auditoría
    await supabase.from('audit_log').insert({
      entity_type:  'reserva',
      entity_id:    reservaId,
      action:       'CANCELLED',
      old_values:   { estado: reserva.estado },
      new_values:   { estado: 'CANCELLED', importe_reembolso: importeReembolso },
      performed_by: cancelledBy,
    });

    return Response.json(
      { success: true, importe_reembolso: importeReembolso, porcentaje_reembolso: porcentajeReembolso * 100 },
      { headers: corsHeaders }
    );

  } catch (err) {
    console.error('cancel-reservation error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
});
