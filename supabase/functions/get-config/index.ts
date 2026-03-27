// supabase/functions/get-config/index.ts
// Devuelve la configuración de precios y las temporadas activas
// GET o POST sin body

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const [{ data: config, error: configError }, { data: temporadas, error: tempError }] =
      await Promise.all([
        supabase
          .from('configuracion')
          .select(
            'precio_noche_base, precio_noche_alta, extra_huesped_base, extra_huesped_alta, ' +
            'limpieza, descuento_no_reembolsable, porcentaje_senal, ' +
            'estancia_minima, capacidad_base, capacidad_max'
          )
          .single(),
        supabase
          .from('temporadas')
          .select('nombre, fecha_inicio, fecha_fin, tipo, estancia_minima')
          .eq('activa', true)
          .order('fecha_inicio'),
      ]);

    if (configError) {
      console.error('[get-config] Error configuracion:', configError);
      return new Response(
        JSON.stringify({ error: 'Error al leer configuración' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tempError) {
      console.error('[get-config] Error temporadas:', tempError);
    }

    return new Response(
      JSON.stringify({ config, temporadas: temporadas ?? [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[get-config] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
