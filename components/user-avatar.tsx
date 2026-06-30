import { cn } from '@/lib/utils'

function initialsFrom(name?: string | null, email?: string | null): string {
  const n = (name ?? '').trim()
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (email?.trim()?.[0] ?? 'U').toUpperCase()
}

/**
 * Avatar reutilizable: muestra la foto de perfil si existe, o las iniciales
 * del nombre (o del email como último recurso). Sin estado: vale para
 * componentes de servidor y de cliente.
 */
export function UserAvatar({
  name,
  email,
  avatarUrl,
  className,
  textClassName,
}: {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  /** Tamaño + colores del círculo, p.ej. "size-9 bg-cream text-primary". */
  className?: string
  textClassName?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full overflow-hidden font-heading font-semibold select-none',
        className
      )}
      aria-hidden="true"
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        <span className={textClassName}>{initialsFrom(name, email)}</span>
      )}
    </span>
  )
}
