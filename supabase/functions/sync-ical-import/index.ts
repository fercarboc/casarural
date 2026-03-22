// supabase/functions/sync-ical-import/index.ts
// Importa bloqueos de disponibilidad desde feeds iCal externos
// POST { feedId? } — sin feedId sincroniza todos los feeds activos

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function parseICalBlocks(icalText: string): Array<{ start: string; end: string; summary: string }> {
  const events: Array<{ start: string; end: string; summary: string }> = [];
  const lines = icalText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let inEvent = false;
  let current: Partial<{ start: string; end: string; summary: string }> = {};

  const parseDate = (value: string): string => {
    const clean = value.split(';').pop()?.split(':').pop() ?? value;
    if (clean.length === 8) return `${clean.slice(0,4)}-${clean.slice(4,6)}-${clean.slice(6,8)}`;
    return new Date(clean).toISOString().split('T')[0];
  };

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { inEvent = true; current = {}; continue; }
    if (line === 'END:VEVENT') {
      if (current.start && current.end) events.push({ start: current.start, end: current.end, summary: current.summary ?? 'Ocupado' });
      inEvent = false; continue;
    }
    if (!inEvent) continue;
    if (line.startsWith('DTSTART')) current.start   = parseDate(line);
    if (line.startsWith('DTEND'))   current.end     = parseDate(line);
    if (line.startsWith('SUMMARY')) current.summary = line.split(':').slice(1).join(':');
  }

  return events;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { feedId } = body;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let query = supabase.from('feeds_ical').select('*').eq('activo', true);
    if (feedId) query = query.eq('id', feedId);
    const { data: feeds } = await query;

    if (!feeds?.length) return Response.json({ message: 'No hay feeds activos' }, { headers: corsHeaders });

    const results = [];

    for (const feed of feeds) {
      try {
        const response = await fetch(feed.url, { signal: AbortSignal.timeout(15_000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const icalText = await response.text();
        const blocks   = parseICalBlocks(icalText);

        // Eliminar bloqueos previos de este feed
        await supabase.from('bloqueos').delete().eq('feed_id', feed.id).eq('origen', 'ICAL_IMPORT');

        // Insertar nuevos
        if (blocks.length > 0) {
          await supabase.from('bloqueos').insert(
            blocks.map(b => ({
              fecha_inicio: b.start,
              fecha_fin:    b.end,
              motivo:       `${feed.plataforma}: ${b.summary}`,
              origen:       'ICAL_IMPORT',
              feed_id:      feed.id,
            }))
          );
        }

        await supabase.from('feeds_ical').update({ ultima_sync: new Date().toISOString(), error_ultimo: null }).eq('id', feed.id);
        await supabase.from('logs_ical').insert({ feed_id: feed.id, resultado: 'OK', bloqueos_importados: blocks.length });

        results.push({ feed_id: feed.id, status: 'OK', imported: blocks.length });

      } catch (feedErr) {
        const errMsg = feedErr instanceof Error ? feedErr.message : String(feedErr);
        await supabase.from('feeds_ical').update({ error_ultimo: errMsg }).eq('id', feed.id);
        await supabase.from('logs_ical').insert({ feed_id: feed.id, resultado: 'ERROR', mensaje: errMsg });
        results.push({ feed_id: feed.id, status: 'ERROR', error: errMsg });
      }
    }

    return Response.json({ results }, { headers: corsHeaders });

  } catch (err) {
    console.error('sync-ical-import error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
});
