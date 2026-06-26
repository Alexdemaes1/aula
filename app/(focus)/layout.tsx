import { requireUser } from '@/lib/auth'

/**
 * Contexto "modo enfoque" (reproductor): sin barra de navegación global.
 * El chrome lo aporta cada pantalla (FocusBar + sidebar de lecciones).
 */
export default async function FocusLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return <>{children}</>
}
