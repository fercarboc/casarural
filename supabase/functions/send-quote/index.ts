// supabase/functions/send-quote/index.ts
// Envía respuestas comerciales desde el CRM de admin.
// Modos: EMAIL_LIBRE | PRESUPUESTO | SIN_DISPONIBILIDAD
// POST { consulta_id, tipo, to_email, to_nombre, ...datos }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Tipos ─────────────────────────────────────────────────────────────────────

type TipoRespuesta = 'EMAIL_LIBRE' | 'PRESUPUESTO' | 'SIN_DISPONIBILIDAD';

interface PriceData {
  nights: number;
  precio_noche: number;
  importe_alojamiento: number;
  importe_extra: number;
  limpieza: number;
  descuento: number;
  total: number;
  season_type: string;
  extra_guests: number;
}

interface RequestBody {
  consulta_id: string;
  tipo: TipoRespuesta;
  to_email: string;
  to_nombre: string;
  // EMAIL_LIBRE
  asunto?: string;
  cuerpo?: string;
  // PRESUPUESTO / SIN_DISPONIBILIDAD
  check_in?: string;
  check_out?: string;
  guests?: number;
  // PRESUPUESTO
  precio_data?: PriceData;
  descuento_comercial?: number;
  forma_pago?: string;
  notas_comerciales?: string;
  estancia_minima_advertencia?: boolean;
  estancia_minima_noches?: number;
}

// ── Handler ────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body: RequestBody = await req.json();
    const { consulta_id, tipo, to_email, to_nombre } = body;

    if (!consulta_id || !tipo || !to_email) {
      return Response.json(
        { error: 'Faltan campos obligatorios: consulta_id, tipo, to_email' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verificar que la consulta existe
    const { data: consulta, error: consultaError } = await supabase
      .from('consultas')
      .select('id, email, nombre')
      .eq('id', consulta_id)
      .single();

    if (consultaError || !consulta) {
      return Response.json({ error: 'Consulta no encontrada' }, { status: 404, headers: corsHeaders });
    }

    // Leer configuración de la propiedad
    const { data: config } = await supabase
      .from('configuracion')
      .select('*')
      .single();

    const fromEmail = `La Rasilla <${config?.email ?? 'contacto@casarurallarasilla.com'}>`;
    const resendKey = Deno.env.get('RESEND_API_KEY');

    let subject = '';
    let htmlBody = '';
    const respuestaRecord: Record<string, unknown> = {
      consulta_id,
      tipo,
      to_email,
      to_nombre,
      enviado_ok: false,
    };

    // ── EMAIL LIBRE ────────────────────────────────────────────────────────────
    if (tipo === 'EMAIL_LIBRE') {
      if (!body.asunto || !body.cuerpo) {
        return Response.json(
          { error: 'EMAIL_LIBRE requiere asunto y cuerpo' },
          { status: 400, headers: corsHeaders }
        );
      }
      subject = body.asunto;
      htmlBody = buildEmailLibre({ to_nombre, cuerpo: body.cuerpo, config });
      respuestaRecord.asunto = body.asunto;
      respuestaRecord.cuerpo_html = htmlBody;
    }

    // ── SIN DISPONIBILIDAD ─────────────────────────────────────────────────────
    else if (tipo === 'SIN_DISPONIBILIDAD') {
      subject = 'Re: Consulta disponibilidad — Casa Rural La Rasilla';
      htmlBody = buildEmailSinDisponibilidad({
        to_nombre,
        check_in: body.check_in,
        check_out: body.check_out,
        config,
      });
      respuestaRecord.asunto = subject;
      respuestaRecord.cuerpo_html = htmlBody;
      respuestaRecord.habia_disponibilidad = false;
      if (body.check_in) respuestaRecord.fecha_entrada = body.check_in;
      if (body.check_out) respuestaRecord.fecha_salida = body.check_out;
      if (body.guests) respuestaRecord.num_huespedes = body.guests;
    }

    // ── PRESUPUESTO ────────────────────────────────────────────────────────────
    else if (tipo === 'PRESUPUESTO') {
      const {
        check_in, check_out, guests, precio_data,
        descuento_comercial = 0,
        forma_pago = 'TODOS',
        notas_comerciales = '',
        estancia_minima_advertencia = false,
        estancia_minima_noches = 0,
      } = body;

      if (!check_in || !check_out || !guests || !precio_data) {
        return Response.json(
          { error: 'PRESUPUESTO requiere check_in, check_out, guests y precio_data' },
          { status: 400, headers: corsHeaders }
        );
      }

      const totalFinal = Math.max(0, precio_data.total - descuento_comercial);

      subject = 'Propuesta de estancia — Casa Rural La Rasilla';
      htmlBody = buildEmailPresupuesto({
        to_nombre,
        check_in,
        check_out,
        guests,
        precio_data,
        descuento_comercial,
        total_final: totalFinal,
        forma_pago,
        notas_comerciales,
        estancia_minima_advertencia,
        estancia_minima_noches,
        config,
      });

      Object.assign(respuestaRecord, {
        asunto: subject,
        cuerpo_html: htmlBody,
        fecha_entrada: check_in,
        fecha_salida: check_out,
        num_huespedes: guests,
        noches: precio_data.nights,
        precio_noche: precio_data.precio_noche,
        importe_alojamiento: precio_data.importe_alojamiento,
        importe_extra: precio_data.importe_extra,
        importe_limpieza: precio_data.limpieza,
        descuento_comercial,
        total_ofertado: totalFinal,
        temporada: precio_data.season_type,
        habia_disponibilidad: true,
        estancia_minima_aplicada: estancia_minima_advertencia ? estancia_minima_noches : null,
        forma_pago,
        notas_comerciales: notas_comerciales || null,
      });
    } else {
      return Response.json({ error: `Tipo desconocido: ${tipo}` }, { status: 400, headers: corsHeaders });
    }

    // ── Enviar email ───────────────────────────────────────────────────────────
    let emailOk = false;
    let emailError: string | null = null;

    if (!resendKey) {
      console.warn('RESEND_API_KEY no configurada — email omitido en desarrollo');
      emailOk = true;
    } else {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: fromEmail, to: [to_email], subject, html: htmlBody }),
      });

      if (res.ok) {
        emailOk = true;
      } else {
        emailError = await res.text();
        console.error('Resend error:', emailError);
      }
    }

    // ── Guardar trazabilidad ───────────────────────────────────────────────────
    respuestaRecord.enviado_ok = emailOk;
    if (emailError) respuestaRecord.error_msg = emailError;

    await supabase.from('consulta_respuestas').insert(respuestaRecord);

    // ── Actualizar estado consulta ─────────────────────────────────────────────
    if (emailOk) {
      await supabase
        .from('consultas')
        .update({ estado: 'RESPONDIDA', updated_at: new Date().toISOString() })
        .eq('id', consulta_id);
    }

    if (!emailOk) {
      return Response.json(
        { error: 'Error al enviar el email', detail: emailError },
        { status: 502, headers: corsHeaders }
      );
    }

    return Response.json({ success: true }, { headers: corsHeaders });

  } catch (err) {
    console.error('send-quote error:', err);
    return Response.json(
      { error: 'Error interno del servidor', detail: String(err) },
      { status: 500, headers: corsHeaders }
    );
  }
});

// ── Helpers ────────────────────────────────────────────────────────────────────

// deno-fmt-ignore
function baseStyles(): string {
  return `<style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Georgia,'Times New Roman',serif;background-color:#fafaf9;color:#1c1917;-webkit-font-smoothing:antialiased}
    .wrap{max-width:620px;margin:0 auto;background:#fff}
    .hdr{background-color:#1c1917;padding:40px;text-align:center}
    .logo{font-size:30px;font-weight:bold;color:#fff;letter-spacing:-0.5px}
    .tag{font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:3px;margin-top:8px;font-family:Arial,sans-serif}
    .body{padding:40px}
    .hi{font-size:22px;color:#1c1917;margin-bottom:20px;font-weight:bold}
    .intro{font-size:15px;line-height:1.8;color:#57534e;margin-bottom:28px}
    .box{background-color:#f5f5f4;border-radius:10px;padding:24px;margin-bottom:24px}
    .box-title{font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#a8a29e;margin-bottom:16px;font-family:Arial,sans-serif}
    .dr{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #e7e5e4;font-size:14px;font-family:Arial,sans-serif}
    .dr:last-child{border-bottom:none}
    .lbl{color:#78716c}
    .val{font-weight:600;color:#1c1917}
    .tr{display:flex;justify-content:space-between;font-size:20px;font-weight:bold;color:#1c1917;padding:16px 0 4px;font-family:Arial,sans-serif}
    .disc{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #e7e5e4;font-size:14px;color:#16a34a;font-family:Arial,sans-serif}
    .warn{background-color:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;padding:16px 20px;margin-bottom:24px;font-size:13px;color:#92400e;font-family:Arial,sans-serif;line-height:1.7}
    .pay{border:1px solid #e7e5e4;border-radius:10px;padding:24px;margin-bottom:24px}
    .pm{background-color:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:10px 16px;margin-bottom:8px;font-size:13px;color:#15803d;font-weight:600;font-family:Arial,sans-serif}
    .bank{background-color:#f5f5f4;border-radius:6px;padding:16px;font-size:13px;color:#57534e;font-family:'Courier New',monospace;line-height:1.9;margin-top:12px}
    .bank b{font-family:Arial,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#a8a29e;display:block;margin-bottom:2px;font-weight:bold}
    .notes{font-size:14px;color:#57534e;font-style:italic;line-height:1.7;margin-bottom:24px;border-left:3px solid #d4d2d0;padding-left:16px;font-family:Arial,sans-serif}
    .cta{text-align:center;margin:32px 0 24px}
    .cta a{background-color:#1c1917;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif}
    .valid{text-align:center;font-size:12px;color:#a8a29e;font-family:Arial,sans-serif;margin-bottom:28px}
    .ct{font-size:14px;color:#57534e;font-family:Arial,sans-serif;margin-bottom:6px}
    .cv{font-size:15px;color:#1c1917;font-weight:600;font-family:Arial,sans-serif;margin-bottom:4px}
    .foot{background-color:#f5f5f4;padding:28px 40px;text-align:center;font-size:11px;color:#a8a29e;font-family:Arial,sans-serif;line-height:1.8}
    .foot a{color:#a16207;text-decoration:none}
    .foot strong{color:#78716c;font-size:13px}
  </style>`;
}

function fmtDate(d: string): string {
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// deno-fmt-ignore
function buildEmailLibre({ to_nombre, cuerpo, config }: {
  to_nombre: string; cuerpo: string; config: Record<string, unknown> | null;
}): string {
  const tel  = String(config?.telefono ?? '+34 690 288 707');
  const mail = String(config?.email    ?? 'contacto@casarurallarasilla.com');
  const dir  = String(config?.direccion ?? 'Castillo Pedroso, 39699 Corvera de Toranzo, Cantabria');
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${baseStyles()}</head><body>
<div class="wrap">
  <div class="hdr"><div class="logo">La Rasilla</div><div class="tag">Casa Rural · Cantabria</div></div>
  <div class="body">
    <p class="hi">Hola, ${to_nombre},</p>
    <div class="intro">${cuerpo.replace(/\n/g, '<br>')}</div>
    <div class="cta"><a href="https://www.casarurallarasilla.com/reservar">Ver disponibilidad</a></div>
    <p class="ct" style="margin-top:32px;">Para cualquier consulta:</p>
    <p class="cv">📞 ${tel}</p>
    <p class="cv">✉️ ${mail}</p>
  </div>
  <div class="foot"><strong>Casa Rural La Rasilla</strong><br>${dir}<br><a href="https://www.casarurallarasilla.com">www.casarurallarasilla.com</a></div>
</div></body></html>`;
}

// deno-fmt-ignore
function buildEmailSinDisponibilidad({ to_nombre, check_in, check_out, config }: {
  to_nombre: string; check_in?: string; check_out?: string; config: Record<string, unknown> | null;
}): string {
  const tel  = String(config?.telefono ?? '+34 690 288 707');
  const mail = String(config?.email    ?? 'contacto@casarurallarasilla.com');
  const dir  = String(config?.direccion ?? 'Castillo Pedroso, 39699 Corvera de Toranzo, Cantabria');
  const fechas = (check_in && check_out)
    ? `del <strong>${fmtDate(check_in)}</strong> al <strong>${fmtDate(check_out)}</strong>`
    : 'solicitadas';
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${baseStyles()}</head><body>
<div class="wrap">
  <div class="hdr"><div class="logo">La Rasilla</div><div class="tag">Casa Rural · Cantabria</div></div>
  <div class="body">
    <p class="hi">Hola, ${to_nombre},</p>
    <p class="intro">Gracias por tu interés en Casa Rural La Rasilla. Lamentablemente, <strong>no disponemos de disponibilidad para las fechas ${fechas}</strong>.</p>
    <p class="intro">Te invitamos a consultar otras fechas directamente en nuestra web o a contactarnos para que podamos orientarte hacia la mejor opción.</p>
    <div class="cta"><a href="https://www.casarurallarasilla.com/reservar">Consultar disponibilidad</a></div>
    <p class="ct" style="margin-top:32px;">También puedes contactarnos:</p>
    <p class="cv">📞 ${tel}</p>
    <p class="cv">✉️ ${mail}</p>
    <p class="intro" style="margin-top:28px;">Esperamos poder darte la bienvenida en otra ocasión.<br><br>Un saludo,<br><strong>El equipo de Casa Rural La Rasilla</strong></p>
  </div>
  <div class="foot"><strong>Casa Rural La Rasilla</strong><br>${dir}<br><a href="https://www.casarurallarasilla.com">www.casarurallarasilla.com</a></div>
</div></body></html>`;
}

// deno-fmt-ignore
function buildEmailPresupuesto({ to_nombre, check_in, check_out, guests, precio_data,
  descuento_comercial, total_final, forma_pago, notas_comerciales,
  estancia_minima_advertencia, estancia_minima_noches, config }: {
  to_nombre: string; check_in: string; check_out: string; guests: number;
  precio_data: PriceData; descuento_comercial: number; total_final: number;
  forma_pago: string; notas_comerciales: string;
  estancia_minima_advertencia: boolean; estancia_minima_noches: number;
  config: Record<string, unknown> | null;
}): string {
  const tel         = String(config?.telefono         ?? '+34 690 288 707 / +34 672 336 572');
  const mail        = String(config?.email             ?? 'contacto@casarurallarasilla.com');
  const dir         = String(config?.direccion         ?? 'Castillo Pedroso, 39699 Corvera de Toranzo, Cantabria');
  const iban        = String(config?.iban              ?? 'ES84 1563 2626 3932 6181 0395'); // Configura en panel admin
  const bizumTel    = String(config?.bizum_telefono    ?? tel);
  const bizumTit    = String(config?.bizum_titular     ?? 'Fernando Carbonell');
  const validez     = Number(config?.validez_presupuesto_dias ?? 7);
  const temporada   = precio_data.season_type === 'ALTA' ? 'Temporada alta' : 'Temporada base';

  const formas = forma_pago === 'TODOS'
    ? ['TRANSFERENCIA', 'BIZUM', 'TARJETA']
    : [forma_pago];
  const labels: Record<string, string> = {
    TRANSFERENCIA: '🏦 Transferencia bancaria',
    BIZUM: '📱 Bizum',
    TARJETA: '💳 Tarjeta online (reservar en la web)',
  };  const pmHtml = formas.map(f => `<div class="pm">${labels[f] ?? f}</div>`).join('');
  const bankHtml = formas.includes('TRANSFERENCIA') ? `
    <div class="bank">
      <b>Titular</b>${bizumTit}
      <b>IBAN</b>${iban}
      <span style="font-family:Arial,sans-serif;font-size:11px;color:#a8a29e;">Concepto: Reserva La Rasilla — ${to_nombre}</span>
    </div>` : '';
  const bizumHtml = formas.includes('BIZUM') ? `
    <p style="font-size:13px;color:#57534e;margin-top:12px;font-family:Arial,sans-serif;"><strong>Bizum:</strong> ${bizumTel} (${bizumTit})</p>` : '';
  const warnHtml = estancia_minima_advertencia ? `
    <div class="warn">
      <strong>Estancia mínima para este periodo: ${estancia_minima_noches} noches.</strong><br>
      Esta propuesta ha sido adaptada a ${precio_data.nights} noches conforme al mínimo requerido para las fechas solicitadas.
    </div>` : '';
  const extraHtml = precio_data.importe_extra > 0 ? `
    <div class="dr"><span class="lbl">Suplemento huésped adicional</span><span class="val">${precio_data.importe_extra.toFixed(2)}€</span></div>` : '';
  const discHtml = descuento_comercial > 0 ? `
    <div class="disc"><span class="lbl">✨ Descuento especial</span><span style="font-weight:600;">−${descuento_comercial.toFixed(2)}€</span></div>` : '';
  const notasHtml = notas_comerciales ? `
    <div class="notes">${notas_comerciales.replace(/\n/g, '<br>')}</div>` : '';

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${baseStyles()}</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="logo">La Rasilla</div>
    <div class="tag">Casa Rural · Valles Pasiegos · Cantabria</div>
  </div>
  <div class="body">
    <p class="hi">Hola, ${to_nombre},</p>
    <p class="intro">Gracias por ponerte en contacto con nosotros. Es un placer enviarte esta propuesta para tu estancia en <strong>Casa Rural La Rasilla</strong>, en el corazón de los Valles Pasiegos.</p>
    ${warnHtml}
    <div class="box">
      <div class="box-title">Detalle de la estancia</div>
      <div class="dr"><span class="lbl">Entrada</span><span class="val">${fmtDate(check_in)}</span></div>
      <div class="dr"><span class="lbl">Salida</span><span class="val">${fmtDate(check_out)}</span></div>
      <div class="dr"><span class="lbl">Duración</span><span class="val">${precio_data.nights} noches</span></div>
      <div class="dr"><span class="lbl">Huéspedes</span><span class="val">${guests} personas</span></div>
      <div class="dr"><span class="lbl">Régimen</span><span class="val">${temporada}</span></div>
      <div class="dr"><span class="lbl">Disponibilidad</span><span class="val" style="color:#16a34a;">✓ Confirmada</span></div>
    </div>
    <div class="box">
      <div class="box-title">Desglose de precio</div>
      <div class="dr">
        <span class="lbl">${precio_data.nights} noches × ${precio_data.precio_noche.toFixed(0)}€/noche</span>
        <span class="val">${precio_data.importe_alojamiento.toFixed(2)}€</span>
      </div>
      ${extraHtml}
      <div class="dr"><span class="lbl">Gastos de limpieza</span><span class="val">${precio_data.limpieza.toFixed(2)}€</span></div>
      ${discHtml}
      <div class="tr"><span>Total</span><span>${total_final.toFixed(2)}€</span></div>
    </div>
    <div class="pay">
      <div class="box-title">Formas de pago disponibles</div>
      ${pmHtml}
      ${bankHtml}
      ${bizumHtml}
    </div>
    ${notasHtml}
    <div class="cta"><a href="https://www.casarurallarasilla.com/reservar">Reservar en nuestra web</a></div>
    <p class="valid">Esta propuesta tiene validez de <strong>${validez} días</strong> desde la fecha de envío.</p>
    <p class="ct" style="margin-top:24px;">Para cualquier consulta o para confirmar la reserva:</p>
    <p class="cv">📞 ${tel}</p>
    <p class="cv">✉️ ${mail}</p>
    <p class="intro" style="margin-top:32px;">Esperamos poder darte la bienvenida muy pronto.<br><br>Un saludo,<br><strong>El equipo de Casa Rural La Rasilla</strong></p>
  </div>
  <div class="foot">
    <strong>Casa Rural La Rasilla</strong><br>
    ${dir}<br>
    <a href="https://www.casarurallarasilla.com">www.casarurallarasilla.com</a> · ${tel}
  </div>
</div>
</body></html>`;
}
