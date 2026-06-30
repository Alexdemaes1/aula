-- 014 — Almacenamiento de media propio (audio ahora; vídeo preparado).
-- Ejecutar DESPUÉS de 013_media_enum.sql. Idempotente.

-- Bucket privado para audio/vídeo. Se sirve solo por URL firmada (como 'notes').
insert into storage.buckets (id, name, public) values ('media', 'media', false)
  on conflict (id) do nothing;

-- Columnas de media en lecciones.
alter table public.lessons
  add column if not exists media_path     text,
  add column if not exists media_provider text not null default 'youtube';

-- Coherencia tipo ⇄ campos. Sustituye al CHECK de 004 para admitir audio y,
-- de cara al futuro, vídeo propio (media_provider <> 'youtube'). 'media_path'
-- puede ser NULL hasta que se suba el archivo (la subida es posterior a crear).
alter table public.lessons drop constraint if exists lessons_content_coherence;
alter table public.lessons
  add constraint lessons_content_coherence check (
    (content_type = 'video' and media_provider = 'youtube' and youtube_video_id is not null)
    or (content_type = 'video' and media_provider <> 'youtube')
    or (content_type = 'audio')
    or (content_type = 'text' and body is not null and length(btrim(body)) > 0)
  );
