// supabase/functions/check-availability/index.ts
// Comprueba disponibilidad. Usa tablas: reservas, bloqueos
// POST { start, end } → lista días bloqueados del periodo
// POST { checkIn, checkOut } → verifica si el rango está libre

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ── Modo calendario: lista de días bloqueados ──────────────────────────
    if (body.start && body.end) {
      const { start, end } = body;

      const [{ data: reservas }, { data: bloqueos }] = await Promise.all([
        supabase
          .from('reservas')
          .select('fecha_entrada, fecha_salida')
          .in('estado', ['CONFIRMED', 'PENDING_PAYMENT'])
          .lt('fecha_entrada', end)
          .gt('fecha_salida', start),
        supabase
          .from('bloqueos')
          .select('fecha_inicio, fecha_fin')
          .lt('fecha_inicio', end)
          .gt('fecha_fin', start),
      ]);

      const blocked = new Set<string>();
      const addRange = (startDate: string, endDate: string) => {
        const cur = new Date(startDate);
        const fin = new Date(endDate);
        while (cur < fin) {
          blocked.add(cur.toISOString().split('T')[0]);
          cur.setDate(cur.getDate() + 1);
        }
      };

      reservas?.forEach(r => addRange(r.fecha_entrada, r.fecha_salida));
      bloqueos?.forEach(b => addRange(b.fecha_inicio, b.fecha_fin));

      return Response.json({ blocked_dates: Array.from(blocked) }, { headers: corsHeaders });
    }

    // ── Modo verificación: ¿está libre un rango concreto? ─────────────────
    const { checkIn, checkOut } = body;
    if (!checkIn || !checkOut) {
      return Response.json({ error: 'Missing checkIn or checkOut' }, { status: 400, headers: corsHeaders });
    }

    const [{ data: conflictReservas }, { data: conflictBloqueos }] = await Promise.all([
      supabase
        .from('reservas')
        .select('id, fecha_entrada, fecha_salida, estado')
        .in('estado', ['CONFIRMED', 'PENDING_PAYMENT'])
        .lt('fecha_entrada', checkOut)
        .gt('fecha_salida', checkIn),
      supabase
        .from('bloqueos')
        .select('id, fecha_inicio, fecha_fin, motivo')
        .lt('fecha_inicio', checkOut)
        .gt('fecha_fin', checkIn),
    ]);

    const conflicts = [
      ...(conflictReservas?.map(r => r.id) ?? []),
      ...(conflictBloqueos?.map(b => b.id) ?? []),
    ];

    return Response.json(
      { available: conflicts.length === 0, conflicts },
      { headers: corsHeaders }
    );

  } catch (err) {
    console.error('check-availability error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
});
