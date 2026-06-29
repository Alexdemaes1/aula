-- 008 — Cuenta y cumplimiento: aceptación de términos
-- Idempotente. Ejecutar en Supabase (SQL Editor).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;
