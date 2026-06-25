-- =====================================================================
-- 005_storage_buckets.sql
-- Crea/asegura los buckets de Storage usados por la app.
-- Causa raíz del bug de portadas: los buckets no existían.
-- Ejecutar en Supabase Dashboard → SQL Editor.
-- =====================================================================

-- Bucket de portadas de curso: PÚBLICO (se sirven con getPublicUrl + next/image).
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do update set public = true;

-- Bucket de apuntes PDF: PRIVADO (se sirven con URL firmada vía service_role).
insert into storage.buckets (id, name, public)
values ('notes', 'notes', false)
on conflict (id) do nothing;

-- Lectura pública explícita de portadas (el bucket público ya sirve los objetos;
-- esta policy lo hace explícito y robusto ante cambios de configuración).
drop policy if exists "covers public read" on storage.objects;
create policy "covers public read" on storage.objects
  for select using (bucket_id = 'covers');

-- Las subidas/borrados las hace el código con service_role (bypassa RLS),
-- por eso no se definen policies de escritura para anon/authenticated.
