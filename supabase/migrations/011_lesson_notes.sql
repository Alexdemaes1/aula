-- 011 — Notas personales del alumno por lección
-- Idempotente. Ejecutar en Supabase (SQL Editor).

CREATE TABLE IF NOT EXISTS public.lesson_notes (
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id  uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  content    text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

-- Solo el dueño accede a sus notas.
DROP POLICY IF EXISTS lesson_notes_select_own ON public.lesson_notes;
CREATE POLICY lesson_notes_select_own ON public.lesson_notes
  FOR SELECT USING (user_id = auth.uid());
-- Escritura vía service_role (server action con requireUser).
