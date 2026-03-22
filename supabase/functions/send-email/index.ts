// supabase/functions/send-email/index.ts
// Envía emails transaccionales con Resend usando plantillas de la DB
// POST { template_key, to_email, to_name, reservation_id?, extra_vars? }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { template_key, to_email, to_name, reservation_id, extra_vars = {} } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Obtener plantilla
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('key', template_key)
      .eq('activa', true)
      .single();

    if (!template) {
      return Response.json({ error: `Plantilla '${template_key}' no encontrada` }, { status: 404, headers: corsHeaders });
    }

    // Variables de la reserva
    let reservaVars: Record<string, string> = {};
    if (reservation_id) {
      const { data: reserva } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', reservation_id)
        .single();

      if (reserva) {
        const optsDate: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        reservaVars = {
          guest_name:     `${reserva.nombre} ${reserva.apellidos}`,
          check_in:       new Date(reserva.fecha_entrada).toLocaleDateString('es-ES', optsDate),
          check_out:      new Date(reserva.fecha_salida).toLocaleDateString('es-ES', optsDate),
          total_amount:   `${reserva.total}€`,
          reservation_id: reserva.id,
          codigo:         reserva.codigo ?? reserva.id,
          nights:         String(reserva.noches),
          guests:         String(reserva.num_huespedes),
          rate_type:      reserva.tarifa === 'FLEXIBLE' ? 'Flexible' : 'No reembolsable',
        };
      }
    }

    const vars    = { guest_name: to_name, ...reservaVars, ...extra_vars };
    const subject = interpolate(template.subject,   vars);
    const html    = interpolate(template.body_html, vars);

    // Remitente desde configuración
    const { data: config } = await supabase
      .from('configuracion')
      .select('email')
      .single();
    const fromEmail = `La Rasilla <${config?.email ?? 'noreply@casarurallarasilla.com'}>`;

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      console.warn('RESEND_API_KEY no configurada — email omitido');
      return Response.json({ success: true, note: 'Email skipped: no API key' }, { headers: corsHeaders });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromEmail, to: [to_email], subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return Response.json({ error: 'Email sending failed' }, { status: 502, headers: corsHeaders });
    }

    return Response.json({ success: true }, { headers: corsHeaders });

  } catch (err) {
    console.error('send-email error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
});
