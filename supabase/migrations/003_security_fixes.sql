-- 003_security_fixes.sql
-- Corrige los warnings del linter de seguridad de Supabase.
--
-- RESUMEN DE CAMBIOS:
--   A) SET search_path = public en las 4 funciones de analytics/swap
--      (warning: function_search_path_mutable)
--   B) Añadir check interno de is_admin() en funciones RPC de analytics
--      y convertirlas a plpgsql para poder lanzar la excepción
--      (warning: anon/authenticated_security_definer_function_executable)
--   C) REVOKE EXECUTE en funciones-trigger que no tienen ningún sentido
--      como RPC públicos (handle_new_user, prevent_role_change, refresh_lesson_count)
--
-- NOTA: is_admin() e is_enrolled() permanecen como SECURITY DEFINER y con
--   EXECUTE para anon porque las políticas RLS las invocan en contexto anon.
--   Revocar ese permiso rompe las políticas. El riesgo es nulo: con auth.uid()=NULL
--   (anon) ambas funciones devuelven FALSE sin filtrar datos.
--
-- NOTA: El warning auth_leaked_password_protection se resuelve desde el
--   Dashboard de Supabase → Auth → Settings → "Enable leaked password protection".

-- ======================================================================
-- A + B. Funciones analytics: search_path fijo + check de admin
-- ======================================================================

CREATE OR REPLACE FUNCTION public.swap_lesson_positions(
  lesson_a uuid,
  lesson_b uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pos_a integer;
  pos_b integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;
  SELECT position INTO pos_a FROM public.lessons WHERE id = lesson_a;
  SELECT position INTO pos_b FROM public.lessons WHERE id = lesson_b;
  UPDATE public.lessons SET position = -1    WHERE id = lesson_a;
  UPDATE public.lessons SET position = pos_a WHERE id = lesson_b;
  UPDATE public.lessons SET position = pos_b WHERE id = lesson_a;
END;
$$;

CREATE OR REPLACE FUNCTION public.course_funnel(p_course_id uuid)
RETURNS TABLE (
  lesson_id   uuid,
  "position"  integer,
  title       text,
  started     bigint,
  completed   bigint,
  avg_seconds numeric
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;
  RETURN QUERY
    SELECT
      l.id,
      l.position,
      l.title,
      COUNT(lp.user_id)                              AS started,
      COUNT(lp.user_id) FILTER (WHERE lp.completed) AS completed,
      ROUND(AVG(lp.watched_seconds), 0)              AS avg_seconds
    FROM public.lessons l
    LEFT JOIN public.lesson_progress lp ON l.id = lp.lesson_id
    WHERE l.course_id = p_course_id
    GROUP BY l.id, l.position, l.title
    ORDER BY l.position;
END;
$$;

CREATE OR REPLACE FUNCTION public.monthly_revenue()
RETURNS TABLE (month text, revenue_cents bigint, enrollments_count bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;
  RETURN QUERY
    SELECT
      TO_CHAR(DATE_TRUNC('month', purchased_at), 'Mon YYYY') AS month,
      SUM(amount_paid_cents)::bigint,
      COUNT(*)::bigint
    FROM public.enrollments
    WHERE status = 'active'
      AND purchased_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', purchased_at)
    ORDER BY DATE_TRUNC('month', purchased_at);
END;
$$;

CREATE OR REPLACE FUNCTION public.global_completion_rate()
RETURNS TABLE (completed_count bigint, total_count bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;
  RETURN QUERY
    SELECT
      COUNT(*) FILTER (WHERE completed)::bigint,
      COUNT(*)::bigint
    FROM public.lesson_progress;
END;
$$;

-- ======================================================================
-- C. Revocar EXECUTE en funciones-trigger
--    Los triggers las invocan internamente sin comprobar permisos de usuario.
-- ======================================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user()     FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_role_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_lesson_count() FROM anon, authenticated;

-- Revocar también anon en las funciones de analytics
-- (authenticated sigue pudiendo llamarlas, pero el check interno las protege)
REVOKE EXECUTE ON FUNCTION public.swap_lesson_positions(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.course_funnel(uuid)               FROM anon;
REVOKE EXECUTE ON FUNCTION public.monthly_revenue()                  FROM anon;
REVOKE EXECUTE ON FUNCTION public.global_completion_rate()           FROM anon;
