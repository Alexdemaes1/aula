'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface FocusBarProps {
  courseTitle: string
  lessons: { id: string; title: string; completed: boolean }[]
}

/** Barra de enfoque del reproductor: salir · contexto · progreso. Sin nav global ni migas. */
export function FocusBar({ courseTitle, lessons }: FocusBarProps) {
  const pathname = usePathname()
  const total = lessons.length
  const done = lessons.filter((l) => l.completed).length
  const currentIdx = lessons.findIndex((l) => pathname.includes(l.id))
  const current = currentIdx >= 0 ? lessons[currentIdx] : null
  const percent = total ? Math.round((done / total) * 100) : 0

  return (
    <header className="flex items-center gap-3.5 px-4 sm:px-5 h-14 shrink-0 bg-[#0f1a16] text-cream">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-cream/70 hover:text-cream transition-colors"
      >
        <ArrowLeft className="size-4" /> Salir
      </Link>
      <div className="h-5 w-px bg-cream/15" />
      <div className="min-w-0 leading-tight">
        <div className="text-[12.5px] font-semibold truncate">{courseTitle}</div>
        {current && (
          <div className="text-[10.5px] text-cream/50 truncate">
            Lección {currentIdx + 1} de {total} · {current.title}
          </div>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2.5">
        <div className="w-16 sm:w-24 h-1 rounded-full bg-cream/15 overflow-hidden">
          <div className="h-full bg-brand-gold transition-all" style={{ width: `${percent}%` }} />
        </div>
        <span className="font-mono text-[10px] text-brand-gold">{percent}%</span>
      </div>
    </header>
  )
}
