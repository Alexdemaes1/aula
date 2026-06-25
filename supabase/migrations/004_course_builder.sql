-- =====================================================================
-- 004_course_builder.sql
-- Lecciones vídeo|texto + cuestionarios de autoevaluación (opcionales)
-- Ejecutar en Supabase Dashboard → SQL Editor.
-- Sigue el patrón de 001/003: RLS con is_admin()/is_enrolled(),
-- funciones SECURITY DEFINER SET search_path=public con check de admin.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. LECCIONES: tipo de contenido (vídeo | texto) + cuerpo markdown
-- ---------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.lesson_content_type AS ENUM ('video', 'text');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS content_type public.lesson_content_type NOT NULL DEFAULT 'video',
  ADD COLUMN IF NOT EXISTS body text;          -- markdown, solo para content_type='text'

-- youtube_video_id deja de ser obligatorio (las lecciones de texto no tienen vídeo)
ALTER TABLE public.lessons ALTER COLUMN youtube_video_id DROP NOT NULL;

-- Coherencia tipo ⇄ campos requeridos. NOT VALID + VALIDATE separado para que
-- falle ruidoso si hubiese datos legacy incoherentes en vez de bloquear en silencio.
DO $$ BEGIN
  ALTER TABLE public.lessons
    ADD CONSTRAINT lessons_content_coherence CHECK (
      (content_type = 'video' AND youtube_video_id IS NOT NULL)
      OR (content_type = 'text' AND body IS NOT NULL AND length(btrim(body)) > 0)
    ) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.lessons VALIDATE CONSTRAINT lessons_content_coherence;

-- NOTA: min_watch_seconds se reinterpreta como "segundos mínimos de lectura"
-- en lecciones de texto. El trigger refresh_lesson_count NO se toca.

-- ---------------------------------------------------------------------
-- 2. CUESTIONARIOS (entidad por curso, autoevaluación OPCIONAL)
--    No son lecciones: no entran en la secuencia ni en lesson_progress.
-- ---------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.quiz_question_type AS ENUM ('single', 'multiple', 'boolean');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.quizzes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title         text NOT NULL DEFAULT 'Autoevaluación',
  description   text NOT NULL DEFAULT '',
  passing_score integer NOT NULL DEFAULT 70 CHECK (passing_score BETWEEN 0 AND 100),
  max_attempts  integer,                      -- NULL = ilimitados
  position      integer NOT NULL DEFAULT 1,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id     uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  prompt      text NOT NULL,
  type        public.quiz_question_type NOT NULL DEFAULT 'single',
  explanation text NOT NULL DEFAULT '',
  position    integer NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quiz_id, position)
);

CREATE TABLE IF NOT EXISTS public.quiz_options (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  label       text NOT NULL,
  is_correct  boolean NOT NULL DEFAULT false,
  position    integer NOT NULL,
  UNIQUE (question_id, position)
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id      uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score        integer NOT NULL DEFAULT 0,    -- % obtenido 0..100
  passed       boolean NOT NULL DEFAULT false,
  answers      jsonb NOT NULL DEFAULT '{}',   -- { questionId: optionId[] }
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_course        ON public.quizzes (course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz   ON public.quiz_questions (quiz_id, position);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON public.quiz_options (question_id, position);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user    ON public.quiz_attempts (user_id, quiz_id);

-- ---------------------------------------------------------------------
-- 3. RLS (patrón exacto del 001)
-- ---------------------------------------------------------------------

ALTER TABLE public.quizzes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts  ENABLE ROW LEVEL SECURITY;

-- QUIZZES: lee admin o matriculado; escribe admin
DROP POLICY IF EXISTS quizzes_select_enrolled ON public.quizzes;
CREATE POLICY quizzes_select_enrolled ON public.quizzes
  FOR SELECT USING (public.is_admin() OR public.is_enrolled(course_id));
DROP POLICY IF EXISTS quizzes_admin_write ON public.quizzes;
CREATE POLICY quizzes_admin_write ON public.quizzes
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- QUIZ_QUESTIONS: hereda acceso vía quiz→course
DROP POLICY IF EXISTS quiz_questions_select_enrolled ON public.quiz_questions;
CREATE POLICY quiz_questions_select_enrolled ON public.quiz_questions
  FOR SELECT USING (
    public.is_admin() OR public.is_enrolled(
      (SELECT q.course_id FROM public.quizzes q WHERE q.id = quiz_id)
    )
  );
DROP POLICY IF EXISTS quiz_questions_admin_write ON public.quiz_questions;
CREATE POLICY quiz_questions_admin_write ON public.quiz_questions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- QUIZ_OPTIONS: hereda acceso vía question→quiz→course
-- NOTA DE SEGURIDAD: is_correct podría viajar al cliente vía SELECT. La app del
-- alumno lee las opciones omitiendo is_correct del select; la corrección se hace
-- siempre en servidor (server action con service_role).
DROP POLICY IF EXISTS quiz_options_select_enrolled ON public.quiz_options;
CREATE POLICY quiz_options_select_enrolled ON public.quiz_options
  FOR SELECT USING (
    public.is_admin() OR public.is_enrolled(
      (SELECT q.course_id
         FROM public.quizzes q
         JOIN public.quiz_questions qq ON qq.quiz_id = q.id
        WHERE qq.id = question_id)
    )
  );
DROP POLICY IF EXISTS quiz_options_admin_write ON public.quiz_options;
CREATE POLICY quiz_options_admin_write ON public.quiz_options
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- QUIZ_ATTEMPTS: el alumno gestiona los suyos; admin ve todo
DROP POLICY IF EXISTS quiz_attempts_select_own ON public.quiz_attempts;
CREATE POLICY quiz_attempts_select_own ON public.quiz_attempts
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS quiz_attempts_insert_own ON public.quiz_attempts;
CREATE POLICY quiz_attempts_insert_own ON public.quiz_attempts
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND public.is_enrolled((SELECT course_id FROM public.quizzes WHERE id = quiz_id))
  );

-- ---------------------------------------------------------------------
-- 4. RPC: intercambio atómico de posición de dos preguntas.
--    quiz_questions tiene UNIQUE(quiz_id, position) → valor temporal -1.
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.swap_question_positions(
  question_a uuid,
  question_b uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pos_a integer;
  pos_b integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;
  -- FOR UPDATE bloquea las filas para que dos reordenamientos concurrentes no se entrelacen.
  SELECT position INTO pos_a FROM public.quiz_questions WHERE id = question_a FOR UPDATE;
  SELECT position INTO pos_b FROM public.quiz_questions WHERE id = question_b FOR UPDATE;
  -- Si algún id no existe, abortar antes de escribir NULL (violaría NOT NULL y dejaría datos corruptos).
  IF pos_a IS NULL OR pos_b IS NULL THEN
    RAISE EXCEPTION 'Una o ambas preguntas no existen';
  END IF;
  UPDATE public.quiz_questions SET position = -1    WHERE id = question_a;
  UPDATE public.quiz_questions SET position = pos_a WHERE id = question_b;
  UPDATE public.quiz_questions SET position = pos_b WHERE id = question_a;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.swap_question_positions(uuid, uuid) FROM anon;
