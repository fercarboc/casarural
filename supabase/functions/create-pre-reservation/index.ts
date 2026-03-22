// supabase/functions/create-pre-reservation/index.ts
// Crea pre-reserva en PENDING_PAYMENT tras verificar disponibilidad y calcular precio
// POST { checkIn, checkOut, guests, rateType, guestData: { nombre, apellidos, email, telefono } }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { checkIn, checkOut, guests, rateType, guestData } = await req.json();

    if (!checkIn || !checkOut || !guests || !rateType || !guestData?.email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const baseUrl = Deno.env.get('SUPABASE_URL')!;
    const svcKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const headers  = { 'Content-Type': 'application/json', Authorization: `Bearer ${svcKey}` };

    // 1. Verificar disponibilidad
    const availRes = await fetch(`${baseUrl}/functions/v1/check-availability`, {
      method: 'POST', headers,
      body: JSON.stringify({ checkIn, checkOut }),
    });
    const avail = await availRes.json();
    if (!avail.available) {
      return Response.json({ error: 'Las fechas seleccionadas no están disponibles' }, { status: 409, headers: corsHeaders });
    }

    // 2. Calcular precio
    const priceRes = await fetch(`${baseUrl}/functions/v1/calculate-price`, {
      method: 'POST', headers,
      body: JSON.stringify({ checkIn, checkOut, guests, rateType }),
    });
    const price = await priceRes.json();
    if (price.error) return Response.json({ error: price.error }, { status: 400, headers: corsHeaders });

    // 3. Crear reserva (datos del huésped inline)
    const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const { data: reserva, error } = await supabase
      .from('reservas')
      .insert({
        nombre:              guestData.nombre ?? guestData.first_name,
        apellidos:           guestData.apellidos ?? guestData.last_name ?? '',
        email:               guestData.email,
        telefono:            guestData.telefono ?? guestData.phone ?? '',
        dni:                 guestData.dni ?? guestData.document_number ?? '',
        fecha_entrada:       checkIn,
        fecha_salida:        checkOut,
        num_huespedes:       guests,
        temporada:           price.season_type,
        tarifa:              rateType === 'NON_REFUNDABLE' ? 'NO_REEMBOLSABLE' : 'FLEXIBLE',
        precio_noche:        price.precio_noche,
        noches:              price.nights,
        importe_alojamiento: price.importe_alojamiento,
        importe_extra:       price.importe_extra,
        importe_limpieza:    price.limpieza,
        descuento:           price.descuento,
        total:               price.total,
        importe_senal:       price.importe_senal,
        estado:              'PENDING_PAYMENT',
        estado_pago:         'UNPAID',
        origen:              'DIRECT_WEB',
        expires_at,
      })
      .select('id, codigo')
      .single();

    if (error) throw error;

    // 4. Auditoría
    await supabase.from('audit_log').insert({
      entity_type:  'reserva',
      entity_id:    reserva.id,
      action:       'CREATED',
      new_values:   { total: price.total, estado: 'PENDING_PAYMENT' },
      performed_by: guestData.email,
    });

    return Response.json({ reserva_id: reserva.id, codigo: reserva.codigo, price }, { headers: corsHeaders });

  } catch (err) {
    console.error('create-pre-reservation error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
});
