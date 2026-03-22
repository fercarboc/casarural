// supabase/functions/generate-ical-export/index.ts
// Genera el feed iCal propio de La Rasilla para exportar a OTAs
// GET — devuelve text/calendar

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const today        = new Date().toISOString().split('T')[0];
    const unAnoAdelante = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [{ data: reservas }, { data: bloqueos }] = await Promise.all([
      supabase
        .from('reservas')
        .select('id, fecha_entrada, fecha_salida, num_huespedes')
        .eq('estado', 'CONFIRMED')
        .gte('fecha_salida', today)
        .lte('fecha_entrada', unAnoAdelante),
      supabase
        .from('bloqueos')
        .select('id, fecha_inicio, fecha_fin, motivo')
        .eq('origen', 'ADMIN')
        .gte('fecha_fin', today),
    ]);

    const fmt  = (d: string) => d.replace(/-/g, '');
    const now  = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const vevents: string[] = [];

    reservas?.forEach(r => {
      vevents.push([
        'BEGIN:VEVENT',
        `DTSTART;VALUE=DATE:${fmt(r.fecha_entrada)}`,
        `DTEND;VALUE=DATE:${fmt(r.fecha_salida)}`,
        `SUMMARY:Reserva confirmada`,
        `UID:reserva-${r.id}@casarurallarasilla.com`,
        `DTSTAMP:${now}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      ].join('\r\n'));
    });

    bloqueos?.forEach(b => {
      vevents.push([
        'BEGIN:VEVENT',
        `DTSTART;VALUE=DATE:${fmt(b.fecha_inicio)}`,
        `DTEND;VALUE=DATE:${fmt(b.fecha_fin)}`,
        `SUMMARY:${b.motivo ?? 'Bloqueado'}`,
        `UID:bloqueo-${b.id}@casarurallarasilla.com`,
        `DTSTAMP:${now}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      ].join('\r\n'));
    });

    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//La Rasilla//Reservas//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:La Rasilla - Disponibilidad',
      'X-WR-TIMEZONE:Europe/Madrid',
      ...vevents,
      'END:VCALENDAR',
    ].join('\r\n');

    return new Response(ical, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="la-rasilla.ics"',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (err) {
    console.error('generate-ical-export error:', err);
    return new Response('Internal server error', { status: 500 });
  }
});
