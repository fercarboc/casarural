-- ============================================================
-- Migration: 20260410_consulta_respuestas
-- Añade infraestructura para respuestas comerciales desde CRM
-- ============================================================

-- 1. Nuevos campos en configuracion (datos bancarios para emails)
ALTER TABLE configuracion
  ADD COLUMN IF NOT EXISTS iban              text,
  ADD COLUMN IF NOT EXISTS bizum_titular     text,
  ADD COLUMN IF NOT EXISTS bizum_telefono    text,
  ADD COLUMN IF NOT EXISTS validez_presupuesto_dias int DEFAULT 7;

-- 2. Tabla de trazabilidad de respuestas a consultas
CREATE TABLE IF NOT EXISTS consulta_respuestas (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id              uuid        NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,

  -- Tipo de respuesta enviada
  tipo                     text        NOT NULL
    CHECK (tipo IN ('EMAIL_LIBRE', 'PRESUPUESTO', 'SIN_DISPONIBILIDAD')),

  -- Email enviado
  asunto                   text,
  cuerpo_html              text,
  to_email                 text        NOT NULL,
  to_nombre                text,

  -- Datos del presupuesto (NULL para EMAIL_LIBRE / SIN_DISPONIBILIDAD)
  fecha_entrada            date,
  fecha_salida             date,
  num_huespedes            int,
  noches                   int,
  precio_noche             numeric,
  importe_alojamiento      numeric,
  importe_extra            numeric,
  importe_limpieza         numeric,
  descuento_comercial      numeric      DEFAULT 0,
  total_ofertado           numeric,
  temporada                text,

  -- Disponibilidad y estancia mínima
  habia_disponibilidad     boolean,
  estancia_minima_aplicada int,

  -- Configuración del presupuesto
  forma_pago               text,
  notas_comerciales        text,

  -- Resultado del envío
  enviado_ok               boolean     DEFAULT false,
  error_msg                text,

  created_at               timestamptz DEFAULT now()
);

-- Índice para lookup rápido por consulta
CREATE INDEX IF NOT EXISTS idx_consulta_respuestas_consulta
  ON consulta_respuestas(consulta_id);

-- RLS: solo service_role y admin autenticados pueden operar
ALTER TABLE consulta_respuestas ENABLE ROW LEVEL SECURITY;

-- Política: admins autenticados pueden leer
CREATE POLICY "Admin puede leer respuestas"
  ON consulta_respuestas FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política: service_role puede insertar (desde edge functions)
-- (service_role bypasses RLS by default)
