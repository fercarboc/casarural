// supabase/functions/send-reminders/index.ts
// Envía recordatorios 24h antes del check-in.
// Llamar como cron diario a las 10:00 (configurable en Supabase Dashboard → Edge Functions → Schedules).
// POST sin body (o con { dry_run: true } para simular sin enviar).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  let dryRun = false;
  try {
    const body = await req.json().catch(() => ({}));
    dryRun = body?.dry_run === true;
  } catch { /* no body */ }

  // Fecha de mañana en formato YYYY-MM-DD (UTC)
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const fechaMañana = tomorrow.toISOString().split('T')[0];

  // Reservas que hacen check-in mañana y están confirmadas
  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('id, nombre, apellidos, email, fecha_entrada, fecha_salida, noches, num_huespedes, total')
    .eq('fecha_entrada', fechaMañana)
    .eq('estado', 'CONFIRMED');

  if (error) {
    console.error('Error fetching reservas:', error);
    return Response.json({ error: 'DB error' }, { status: 500, headers: corsHeaders });
  }

  if (!reservas || reservas.length === 0) {
    return Response.json({ sent: 0, note: `No arrivals on ${fechaMañana}` }, { headers: corsHeaders });
  }

  // IDs de reservas que ya tienen recordatorio enviado (audit_log)
  const reservaIds = reservas.map((r: any) => r.id);
  const { data: yaEnviados } = await supabase
    .from('audit_log')
    .select('entity_id')
    .eq('entity_type', 'reserva')
    .eq('action', 'REMINDER_SENT')
    .in('entity_id', reservaIds);

  const yaEnviadosSet = new Set((yaEnviados ?? []).map((a: any) => a.entity_id));

  const pendientes = reservas.filter((r: any) => !yaEnviadosSet.has(r.id));

  if (pendientes.length === 0) {
    return Response.json({ sent: 0, note: 'All reminders already sent' }, { headers: corsHeaders });
  }

  const results: { id: string; email: string; status: string }[] = [];

  for (const reserva of pendientes) {
    if (dryRun) {
      results.push({ id: reserva.id, email: reserva.email, status: 'dry_run' });
      continue;
    }

    try {
      const emailRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          template_key:   'arrival_reminder',
          to_email:       reserva.email,
          to_name:        `${reserva.nombre} ${reserva.apellidos}`,
          reservation_id: reserva.id,
        }),
      });

      if (emailRes.ok) {
        // Registrar en audit_log para evitar duplicados
        await supabase.from('audit_log').insert({
          entity_type:  'reserva',
          entity_id:    reserva.id,
          action:       'REMINDER_SENT',
          new_values:   { template: 'arrival_reminder', fecha_entrada: reserva.fecha_entrada },
          performed_by: 'send-reminders-cron',
        });
        results.push({ id: reserva.id, email: reserva.email, status: 'sent' });
      } else {
        const errText = await emailRes.text();
        console.error(`Email failed for ${reserva.id}:`, errText);
        results.push({ id: reserva.id, email: reserva.email, status: 'failed' });
      }
    } catch (err) {
      console.error(`Error sending reminder for ${reserva.id}:`, err);
      results.push({ id: reserva.id, email: reserva.email, status: 'error' });
    }
  }

  const sent = results.filter(r => r.status === 'sent').length;
  console.log(`send-reminders: ${sent}/${pendientes.length} sent for ${fechaMañana}`);

  return Response.json({ sent, total: pendientes.length, results }, { headers: corsHeaders });
});
