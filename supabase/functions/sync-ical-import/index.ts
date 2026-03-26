// supabase/functions/sync-ical-import/index.ts
// Importa reservas desde feeds iCal externos (Booking, Airbnb, Escapada Rural)
// y las guarda como reservas reales en la tabla reservas.
// Deduplicación: si ya existe reserva confirmada con la misma fecha_entrada, se omite.
// POST { feedId? } — sin feedId sincroniza todos los feeds activos

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ICalEvent {
  uid:     string;
  start:   string; // YYYY-MM-DD
  end:     string; // YYYY-MM-DD (fecha_salida real — día que se va el huésped)
  summary: string;
}

// ─── Parser iCal ──────────────────────────────────────────────────────────────

function parseICalEvents(icalText: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = icalText
    .replace(/\r\n[ \t]/g, '') // unfold long lines
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');

  let inEvent = false;
  let current: Partial<ICalEvent> = {};

  const parseDate = (value: string): string => {
    // Soporta DTSTART;VALUE=DATE:20250320 y DTSTART:20250320T160000Z
    const raw = value.includes(':') ? value.split(':').slice(1).join(':') : value;
    const clean = raw.split('T')[0].replace(/-/g, '');
    if (clean.length === 8) {
      return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
    }
    return new Date(raw).toISOString().split('T')[0];
  };

  for (const line of lines) {
    if (line.trim() === 'BEGIN:VEVENT') { inEvent = true; current = {}; continue; }
    if (line.trim() === 'END:VEVENT') {
      if (current.start && current.end && current.uid) {
        events.push({
          uid:     current.uid,
          start:   current.start,
          end:     current.end,
          summary: current.summary ?? 'Reserva',
        });
      }
      inEvent = false;
      continue;
    }
    if (!inEvent) continue;

    const [key, ...rest] = line.split(':');
    const val = rest.join(':').trim();
    const keyBase = key.split(';')[0].toUpperCase();

    if (keyBase === 'UID')     current.uid     = val;
    if (keyBase === 'DTSTART') current.start   = parseDate(line);
    if (keyBase === 'DTEND')   current.end     = parseDate(line);
    if (keyBase === 'SUMMARY') current.summary = val;
  }

  return events;
}

// ─── Mapeo plataforma → origen ────────────────────────────────────────────────

const ORIGEN_MAP: Record<string, string> = {
  BOOKING:       'BOOKING_ICAL',
  AIRBNB:        'AIRBNB_ICAL',
  ESCAPADARURAL: 'ESCAPADARURAL_ICAL',
  OTRO:          'ADMIN',
};

const NOMBRE_MAP: Record<string, string> = {
  BOOKING:       'Booking.com',
  AIRBNB:        'Airbnb',
  ESCAPADARURAL: 'Escapada Rural',
  OTRO:          'Externo',
};

// ─── Servicio ─────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { feedId } = body;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Obtener feeds activos
    let query = supabase.from('feeds_ical').select('*').eq('activo', true);
    if (feedId) query = query.eq('id', feedId);
    const { data: feeds } = await query;

    if (!feeds?.length) {
      return Response.json({ message: 'No hay feeds activos' }, { headers: corsHeaders });
    }

    const results = [];

    for (const feed of feeds) {
      const origen    = ORIGEN_MAP[feed.plataforma]  ?? 'ADMIN';
      const plataforma = NOMBRE_MAP[feed.plataforma] ?? feed.plataforma;

      try {
        // 1. Descargar iCal
        const response = await fetch(feed.url, { signal: AbortSignal.timeout(15_000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const icalText = await response.text();
        const events   = parseICalEvents(icalText);

        // Filtrar eventos pasados (más de 1 día atrás) para no procesar histórico innecesario
        const hoy = new Date();
        hoy.setDate(hoy.getDate() - 1);
        const cutoff = hoy.toISOString().split('T')[0];
        const eventosFuturos = events.filter(e => e.end > cutoff);

        // 2. Cargar reservas existentes de ESTA plataforma
        const { data: reservasExistentes } = await supabase
          .from('reservas')
          .select('id, fecha_entrada, fecha_salida, estado, notas_admin')
          .eq('origen', origen)
          .neq('estado', 'CANCELLED');

        // Mapa: uid → reserva (almacenamos UID en notas_admin como "ICAL_UID:xxxxx")
        const reservasByUid = new Map<string, any>();
        const reservasByFecha = new Map<string, any>();
        for (const r of (reservasExistentes ?? [])) {
          const uidMatch = r.notas_admin?.match(/ICAL_UID:(\S+)/);
          if (uidMatch) reservasByUid.set(uidMatch[1], r);
          reservasByFecha.set(r.fecha_entrada, r);
        }

        // 3. Cargar todos los rangos ocupados (cualquier origen) para detectar solapamientos
        const { data: todasReservas } = await supabase
          .from('reservas')
          .select('fecha_entrada, fecha_salida')
          .not('estado', 'in', '("CANCELLED","EXPIRED")');

        // Rangos ocupados para check de solapamiento: event solapa si start < r.end && end > r.start
        const rangosOcupados: Array<{ start: string; end: string }> = (todasReservas ?? []).map(
          (r: any) => ({ start: r.fecha_entrada, end: r.fecha_salida })
        );
        const sesolapa = (s: string, e: string) =>
          rangosOcupados.some(r => s < r.end && e > r.start);

        // Máximo de noches razonable (filtrar bloqueos masivos de plataformas)
        const MAX_NOCHES = 60;

        // 4. Procesar eventos del feed
        let creadas = 0;
        let omitidas = 0;
        let actualizadas = 0;

        const uidsEnFeed = new Set(eventosFuturos.map(e => e.uid));

        for (const event of eventosFuturos) {
          const noches = Math.round(
            (new Date(event.end).getTime() - new Date(event.start).getTime()) / 86_400_000
          );
          // Descartar eventos sin duración o bloqueos masivos (p.ej. Booking bloquea todo el año)
          if (noches <= 0 || noches > MAX_NOCHES) { omitidas++; continue; }

          // ¿Ya existe reserva con este UID de esta plataforma?
          const existentePorUid = reservasByUid.get(event.uid);
          if (existentePorUid) {
            actualizadas++;
            continue; // ya la tenemos, no tocar
          }

          // ¿Se solapa con cualquier reserva ya existente (mismo o distinto origen)?
          if (sesolapa(event.start, event.end)) {
            omitidas++;
            continue; // duplicado de otra plataforma o reserva manual
          }

          // Intentar extraer nombre del SUMMARY (Airbnb suele poner el nombre)
          const summaryLimpio = event.summary
            .replace(/^(Reserved|Reservation|Closed|CLOSED|Not available|Ocupado)\s*/i, '')
            .trim();
          const nombre     = summaryLimpio || plataforma;
          const notasAdmin = `ICAL_UID:${event.uid}\nImportado desde ${plataforma}`;

          // Crear reserva
          const { error: insertError } = await supabase.from('reservas').insert({
            nombre,
            apellidos:           '',
            email:               `sync@${feed.plataforma.toLowerCase()}.ical`,
            fecha_entrada:       event.start,
            fecha_salida:        event.end,
            noches,
            num_huespedes:       1,   // desconocido desde iCal
            temporada:           'BASE',
            tarifa:              'FLEXIBLE',
            precio_noche:        0,
            importe_alojamiento: 0,
            importe_extra:       0,
            importe_limpieza:    0,
            descuento:           0,
            total:               0,
            estado:              'CONFIRMED',
            estado_pago:         'PAID',
            importe_pagado:      0,
            origen,
            notas_admin:         notasAdmin,
          });

          if (insertError) {
            console.error(`Error insertando reserva iCal:`, insertError.message);
          } else {
            creadas++;
            rangosOcupados.push({ start: event.start, end: event.end }); // evitar duplicados dentro del mismo ciclo
          }
        }

        // 5. Cancelar reservas de esta plataforma que ya no están en el feed
        const uidsAusentes = [...reservasByUid.keys()].filter(uid => !uidsEnFeed.has(uid));
        for (const uid of uidsAusentes) {
          const reserva = reservasByUid.get(uid)!;
          await supabase
            .from('reservas')
            .update({ estado: 'CANCELLED', notas_admin: `${reserva.notas_admin ?? ''}\nCancelado: ya no aparece en feed ${plataforma}` })
            .eq('id', reserva.id);
          console.log(`Reserva ${reserva.id} marcada CANCELLED (desapareció del feed)`);
        }

        // 6. Actualizar bloqueos (para el calendario de disponibilidad)
        await supabase.from('bloqueos').delete().eq('feed_id', feed.id).eq('origen', 'ICAL_IMPORT');
        if (eventosFuturos.length > 0) {
          await supabase.from('bloqueos').insert(
            eventosFuturos.map(e => ({
              fecha_inicio: e.start,
              fecha_fin:    e.end,
              motivo:       `${plataforma}: ${e.summary}`,
              origen:       'ICAL_IMPORT',
              feed_id:      feed.id,
            }))
          );
        }

        // 7. Actualizar estado del feed
        await supabase.from('feeds_ical')
          .update({ ultima_sync: new Date().toISOString(), error_ultimo: null })
          .eq('id', feed.id);

        await supabase.from('logs_ical').insert({
          feed_id:            feed.id,
          resultado:          'OK',
          bloqueos_importados: eventosFuturos.length,
          mensaje:            `Creadas: ${creadas} | Omitidas (duplicado): ${omitidas} | Ya existían: ${actualizadas} | Canceladas: ${uidsAusentes.length}`,
        });

        results.push({
          feed:        plataforma,
          status:      'OK',
          total_feed:  eventosFuturos.length,
          creadas,
          omitidas,
          actualizadas,
          canceladas:  uidsAusentes.length,
        });

      } catch (feedErr) {
        const errMsg = feedErr instanceof Error ? feedErr.message : String(feedErr);
        await supabase.from('feeds_ical').update({ error_ultimo: errMsg }).eq('id', feed.id);
        await supabase.from('logs_ical').insert({ feed_id: feed.id, resultado: 'ERROR', mensaje: errMsg });
        results.push({ feed: feed.plataforma, status: 'ERROR', error: errMsg });
      }
    }

    return Response.json({ results }, { headers: corsHeaders });

  } catch (err) {
    console.error('sync-ical-import error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
});
