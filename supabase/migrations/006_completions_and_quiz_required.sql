-- =====================================================================
-- 006_completions_and_quiz_required.sql
-- A) El cuestionario puede ser obligatorio para completar el curso.
-- B) Persistencia de la completación de curso (para el certificado).
-- Ejecutar en Supabase Dashboard → SQL Editor. Idempotente (patrón 004).
-- =====================================================================

-- A) Toggle por curso: el quiz es obligatorio para completar (default: no).
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS required_for_completion boolean NOT NULL DEFAULT false;

-- Invariante: un único cuestionario por curso (lo que asume la app y el cálculo
-- de completación). Hace que dashboard/sidebar y el helper coincidan siempre.
DO $$ BEGIN
  ALTER TABLE public.quizzes ADD CONSTRAINT quizzes_course_unique UNIQUE (course_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- B) Completaciones (una fila por user+course; fecha y tiempo congelados al completar).
CREATE TABLE IF NOT EXISTS public.course_completions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id     uuid NOT NULL REFERENCES public.courses(id)  ON DELETE CASCADE,
  completed_at  timestamptz NOT NULL DEFAULT now(),
  seconds_spent integer NOT NULL DEFAULT 0,
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_completions_user ON public.course_completions (user_id);

ALTER TABLE public.course_completions ENABLE ROW LEVEL SECURITY;

-- El alumno solo lee lo suyo; admin lee todo. La escritura va exclusivamente
-- por service_role (no se definen policies de INSERT/UPDATE/DELETE).
DROP POLICY IF EXISTS course_completions_select_own ON public.course_completions;
CREATE POLICY course_completions_select_own ON public.course_completions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
