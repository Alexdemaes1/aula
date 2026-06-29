-- 012 — Favoritos (wishlist) + lecciones de vista previa gratuita
-- Idempotente. Ejecutar en Supabase (SQL Editor).

-- Lección marcable como vista previa gratuita (accesible sin matrícula).
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS is_preview boolean NOT NULL DEFAULT false;

-- Wishlist / favoritos del alumno.
CREATE TABLE IF NOT EXISTS public.course_favorites (
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id  uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

ALTER TABLE public.course_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS course_favorites_select_own ON public.course_favorites;
CREATE POLICY course_favorites_select_own ON public.course_favorites
  FOR SELECT USING (user_id = auth.uid());
-- Escritura vía service_role (server action con requireUser).
