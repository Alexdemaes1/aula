-- 010 — Reseñas de cursos (solo compra verificada; escritura vía service_role)
-- Idempotente. Ejecutar en Supabase (SQL Editor).

CREATE TABLE IF NOT EXISTS public.course_reviews (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating     smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_reviews_course ON public.course_reviews (course_id);

ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

-- Lectura pública (se muestran en la página del curso).
DROP POLICY IF EXISTS course_reviews_select_public ON public.course_reviews;
CREATE POLICY course_reviews_select_public ON public.course_reviews
  FOR SELECT USING (true);

-- Escritura solo vía service_role (las server actions verifican la matrícula activa).
