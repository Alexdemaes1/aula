-- 002_admin_enhancements.sql
-- Ejecutar en Supabase Dashboard → SQL Editor

-- 1. Campo para almacenar el payment_intent de Stripe (necesario para reembolsos)
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS payment_intent_id text;

-- 2. Función atómica para intercambiar posición de dos lecciones.
--    La tabla tiene UNIQUE(course_id, position), por eso se usa
--    un valor temporal (-1) para no violar la constraint durante el swap.
CREATE OR REPLACE FUNCTION public.swap_lesson_positions(
  lesson_a uuid,
  lesson_b uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  pos_a integer;
  pos_b integer;
BEGIN
  SELECT position INTO pos_a FROM public.lessons WHERE id = lesson_a;
  SELECT position INTO pos_b FROM public.lessons WHERE id = lesson_b;
  UPDATE public.lessons SET position = -1    WHERE id = lesson_a;
  UPDATE public.lessons SET position = pos_a WHERE id = lesson_b;
  UPDATE public.lessons SET position = pos_b WHERE id = lesson_a;
END;
$$;

-- 3. Función RPC para calcular el embudo de finalización por curso.
--    Devuelve una fila por lección con cuántos alumnos la iniciaron,
--    cuántos la completaron y cuántos segundos vieron de media.
CREATE OR REPLACE FUNCTION public.course_funnel(p_course_id uuid)
RETURNS TABLE (
  lesson_id   uuid,
  "position"  integer,
  title       text,
  started     bigint,
  completed   bigint,
  avg_seconds numeric
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    l.id,
    l.position,
    l.title,
    COUNT(lp.user_id)                                  AS started,
    COUNT(lp.user_id) FILTER (WHERE lp.completed)     AS completed,
    ROUND(AVG(lp.watched_seconds), 0)                  AS avg_seconds
  FROM public.lessons l
  LEFT JOIN public.lesson_progress lp ON l.id = lp.lesson_id
  WHERE l.course_id = p_course_id
  GROUP BY l.id, l.position, l.title
  ORDER BY l.position;
$$;

-- 4. Ingresos por mes (últimos 6 meses)
CREATE OR REPLACE FUNCTION public.monthly_revenue()
RETURNS TABLE (month text, revenue_cents bigint, enrollments_count bigint)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    TO_CHAR(DATE_TRUNC('month', purchased_at), 'Mon YYYY') AS month,
    SUM(amount_paid_cents)::bigint,
    COUNT(*)::bigint
  FROM public.enrollments
  WHERE status = 'active'
    AND purchased_at >= NOW() - INTERVAL '6 months'
  GROUP BY DATE_TRUNC('month', purchased_at)
  ORDER BY DATE_TRUNC('month', purchased_at);
$$;

-- 5. Tasa de finalización global
CREATE OR REPLACE FUNCTION public.global_completion_rate()
RETURNS TABLE (completed_count bigint, total_count bigint)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    COUNT(*) FILTER (WHERE completed)::bigint,
    COUNT(*)::bigint
  FROM public.lesson_progress;
$$;

-- 6. Tabla de configuración del sitio (pares clave/valor editables desde el panel admin)
CREATE TABLE IF NOT EXISTS public.site_config (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "solo_admin" ON public.site_config
  USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.site_config (key, value) VALUES
  ('contact_phone',   '696 799 639'),
  ('contact_email',   'centrotianyingfa@gmail.com'),
  ('contact_address', 'Av. del País Valencia 155-1, 46680 Algemesí'),
  ('schedule',        'Lunes a Viernes · 9:00 – 21:00'),
  ('ntfy_topic',      'mlms-k9p2x7')
ON CONFLICT (key) DO NOTHING;

-- 7. Índices para acelerar queries de analytics
CREATE INDEX IF NOT EXISTS idx_lesson_progress_updated
  ON public.lesson_progress (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_purchased
  ON public.enrollments (purchased_at DESC);
