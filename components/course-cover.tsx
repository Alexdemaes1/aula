import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Portada de curso sin fotografía: carácter chino sobre degradado por
 * disciplina. Si el curso tiene `coverUrl`, manda la imagen. El contenedor
 * define la relación de aspecto y el redondeo vía `className`.
 */
type Palette = {
  bg: string
  char: string
  ring?: string
  circle?: boolean
  labelColor: string
}

const PALETTES: Record<string, Palette> = {
  jade: {
    bg: 'linear-gradient(150deg,#1f3d34,#16241f)',
    char: 'rgba(199,154,69,0.85)',
    labelColor: 'rgba(239,230,207,0.55)',
  },
  qigong: {
    bg: 'linear-gradient(150deg,#2c5446,#1f3d34)',
    char: 'rgba(239,230,207,0.92)',
    labelColor: 'rgba(239,230,207,0.55)',
  },
  cream: {
    bg: '#efe6cf',
    char: '#1f3d34',
    ring: 'inset 0 0 0 1px rgba(199,154,69,0.4)',
    labelColor: '#1f3d34',
  },
  dark: {
    bg: 'linear-gradient(150deg,#16241f,#0f1a16)',
    char: '#c79a45',
    circle: true,
    labelColor: 'rgba(239,230,207,0.55)',
  },
  medicina: {
    bg: 'linear-gradient(150deg,#3a5247,#2c5446)',
    char: 'rgba(239,230,207,0.9)',
    labelColor: 'rgba(239,230,207,0.55)',
  },
}

interface CourseCoverProps {
  coverUrl?: string | null
  character?: string | null
  palette?: string | null
  title: string
  /** Etiqueta mono opcional abajo-izquierda (p. ej. "TAI JI"). */
  label?: string | null
  /** Clases del contenedor: aspecto + redondeo. */
  className?: string
  /** Tamaño del carácter (clase Tailwind). */
  charClassName?: string
  sizes?: string
  priority?: boolean
}

export function CourseCover({
  coverUrl,
  character,
  palette,
  title,
  label,
  className,
  charClassName = 'text-6xl',
  sizes,
  priority,
}: CourseCoverProps) {
  if (coverUrl) {
    return (
      <div className={cn('relative overflow-hidden bg-muted', className)}>
        <Image
          src={coverUrl}
          alt={title}
          fill
          className="object-cover"
          sizes={sizes}
          priority={priority}
        />
      </div>
    )
  }

  const p = PALETTES[palette ?? 'jade'] ?? PALETTES.jade

  return (
    <div
      className={cn('relative overflow-hidden flex items-center justify-center', className)}
      style={{ background: p.bg, boxShadow: p.ring }}
      aria-hidden
    >
      {p.circle && (
        <span
          className="absolute rounded-full border-2"
          style={{ width: '42%', aspectRatio: '1', borderColor: 'rgba(199,154,69,0.5)' }}
        />
      )}
      <span className={cn('font-heading leading-none relative select-none', charClassName)} style={{ color: p.char }}>
        {character || '天'}
      </span>
      {label && (
        <span
          className="absolute bottom-2.5 left-3 font-mono text-[9px] tracking-[0.12em] uppercase"
          style={{ color: p.labelColor }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
