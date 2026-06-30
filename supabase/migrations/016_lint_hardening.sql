-- 016 — Endurecimiento para el linter de Supabase (0025, 0028, 0029)
-- Ejecutar en el SQL Editor de Supabase.
--
-- CAUSA RAÍZ: la migración 003 hizo `REVOKE EXECUTE ... FROM anon, authenticated`,
-- pero el privilegio EXECUTE se concede por defecto a PUBLIC. Revocar de anon/
-- authenticated NO quita el grant de PUBLIC, así que esos roles seguían pudiendo
-- ejecutar las funciones (de ahí los warnings). Aquí revocamos de PUBLIC y luego
-- concedemos de vuelta SOLO a quien lo necesita.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Funciones-trigger: no deben ser llamables por RPC. Los triggers se siguen
--    disparando aunque se revoque EXECUTE (la ejecución del trigger no comprueba
--    este privilegio). Los signups (handle_new_user) siguen funcionando.
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.handle_new_user()      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_role_change()  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_lesson_count() FROM PUBLIC, anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Analytics + reordenación: SECURITY DEFINER que el servidor llama siempre con
--    service_role (createAdminClient). Revocamos de todos y concedemos a service_role.
--    Esto cierra una fuga real: hoy un usuario podía pedir /rpc/monthly_revenue, etc.
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.course_funnel(uuid)                 FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.global_completion_rate()            FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.monthly_revenue()                   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.swap_lesson_positions(uuid, uuid)   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.swap_question_positions(uuid, uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.course_funnel(uuid)                 TO service_role;
GRANT EXECUTE ON FUNCTION public.global_completion_rate()            TO service_role;
GRANT EXECUTE ON FUNCTION public.monthly_revenue()                   TO service_role;
GRANT EXECUTE ON FUNCTION public.swap_lesson_positions(uuid, uuid)   TO service_role;
GRANT EXECUTE ON FUNCTION public.swap_question_positions(uuid, uuid) TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Helpers usados DENTRO de las políticas RLS. DEBEN seguir siendo ejecutables
--    por los roles que consultan las tablas protegidas, o las RLS fallarían.
--    Solo revelan información sobre uno mismo (riesgo mínimo). El linter seguirá
--    marcándolas como WARN: es esperado y correcto para helpers de RLS.
--      · is_admin():   la usan políticas de courses (lectura anónima de publicados)
--                      y de tablas de usuario logueado.
--      · is_enrolled(): solo la política de lessons (usuario logueado).
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.is_admin()        FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_enrolled(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_admin()        TO anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.is_enrolled(uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) Bucket público 'covers': quitar la policy SELECT amplia (warning 0025).
--    Las portadas se sirven por /object/public/covers/... (getPublicUrl), que NO
--    pasa por RLS; la policy solo permitía LISTAR el bucket. El borrado/listado
--    interno usa service_role (bypassa RLS), así que no se rompe nada.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "covers public read" ON storage.objects;
