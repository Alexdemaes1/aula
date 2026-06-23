import { createClient } from '@supabase/supabase-js'

// Cliente con service_role key — omite RLS. Usar SOLO en el servidor.
// Se limpia la key de espacios/saltos de línea que Vercel puede insertar al pegar JWTs largos.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s/g, '')
  )
}
