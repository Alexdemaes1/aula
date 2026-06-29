-- 009 — Metadatos de curso: disciplina, nivel, duración y objetivos
-- Idempotente. Ejecutar en Supabase (SQL Editor).

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS category           text,
  ADD COLUMN IF NOT EXISTS level              text,
  ADD COLUMN IF NOT EXISTS duration_minutes   integer,
  ADD COLUMN IF NOT EXISTS learning_objectives text;

CREATE INDEX IF NOT EXISTS idx_courses_category
  ON public.courses (category)
  WHERE is_published = true;
