-- 015 — Cuenta: foto de perfil + preferencias de notificación (todo configurable)
-- Ejecutar en el SQL Editor de Supabase.

-- 1. Columnas nuevas en profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url               text,
  ADD COLUMN IF NOT EXISTS notify_news              boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_course_reminders  boolean NOT NULL DEFAULT true;

-- 2. Bucket público para fotos de perfil.
--    Los objetos de un bucket PÚBLICO se sirven por /object/public/... (getPublicUrl),
--    que NO pasa por RLS → NO hace falta policy de lectura (añadirla solo permitiría
--    LISTAR el bucket y dispararía el warning 0025 del linter).
--    La escritura/borrado va siempre por service_role (bypassa RLS).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
