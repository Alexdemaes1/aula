-- 013 — Añade el valor 'audio' al enum de tipo de lección.
-- IMPORTANTE: ejecutar ESTE archivo SOLO y por separado ANTES del 014.
-- Postgres no permite usar un valor de enum recién añadido en la misma
-- transacción en que se crea, por eso va en su propia migración.

ALTER TYPE public.lesson_content_type ADD VALUE IF NOT EXISTS 'audio';
