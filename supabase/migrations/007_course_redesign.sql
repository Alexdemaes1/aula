-- 007 — Rediseño visual: portadas por carácter + cursos destacados
-- Idempotente. Ejecutar en Supabase (SQL Editor).

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS cover_character text,
  ADD COLUMN IF NOT EXISTS cover_palette  text NOT NULL DEFAULT 'jade',
  ADD COLUMN IF NOT EXISTS is_featured    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_order integer;

-- Índice para resolver rápido los destacados publicados de la home
CREATE INDEX IF NOT EXISTS idx_courses_featured
  ON public.courses (is_featured, featured_order)
  WHERE is_published = true;
