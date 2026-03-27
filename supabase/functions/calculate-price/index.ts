// supabase/functions/calculate-price/index.ts
// Calcula el precio de una reserva
// POST { checkIn, checkOut, guests, rateType }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { checkIn, checkOut, guests, rateType } = await req.json();

    if (!checkIn || !checkOut || !guests || !rateType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
    }

    const nights = Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (nights < 1) return Response.json({ error: 'Invalid date range' }, { status: 400, headers: corsHeaders });
    if (guests < 1 || guests > 11) return Response.json({ error: 'Guests must be between 1 and 11' }, { status: 400, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Obtener configuración de precios
    const { data: config } = await supabase
      .from('configuracion')
      .select('*')
      .single();

    // Detectar temporada alta (temporada activa que abarca la fecha de entrada)
    const { data: temporada } = await supabase
      .from('temporadas')
      .select('tipo')
      .eq('activa', true)
      .eq('tipo', 'ALTA')
      .lte('fecha_inicio', checkIn)
      .gte('fecha_fin', checkIn)
      .limit(1)
      .maybeSingle();

    const isAlta = !!temporada;

    // Precios según temporada
    const precioNoche    = isAlta ? (config?.precio_noche_alta ?? 330)      : (config?.precio_noche_base ?? 300);
    const extraHuesped   = isAlta ? (config?.extra_huesped_alta ?? 30)      : (config?.extra_huesped_base ?? 30);
    const limpieza       = config?.limpieza ?? 60;
    const capacidadBase  = config?.capacidad_base ?? 10;

    // Cálculo
    const extraHuespedes   = Math.max(0, guests - capacidadBase);
    const importeAlojamiento = precioNoche * nights;
    const importeExtra       = extraHuespedes * extraHuesped * nights;

    let descuento = 0;
    if (rateType === 'NON_REFUNDABLE' || rateType === 'NO_REEMBOLSABLE') {
      const pctDescuento = (config?.descuento_no_reembolsable ?? 10) / 100;
      descuento = (importeAlojamiento + importeExtra) * pctDescuento;
    }

    const total         = importeAlojamiento + importeExtra + limpieza - descuento;
    const pctSenal      = (config?.porcentaje_senal ?? 30) / 100;
    const importeSenal  = (rateType === 'FLEXIBLE') ? total * pctSenal : null;

    return Response.json({
      nights,
      guests,
      extra_guests:       extraHuespedes,
      season_type:        isAlta ? 'ALTA' : 'BASE',
      rate_type:          rateType,
      precio_noche:       precioNoche,
      extra_huesped:      extraHuesped,
      importe_alojamiento: importeAlojamiento,
      importe_extra:      importeExtra,
      limpieza,
      descuento,
      total,
      importe_senal:      importeSenal,
    }, { headers: corsHeaders });

  } catch (err) {
    console.error('calculate-price error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
});
