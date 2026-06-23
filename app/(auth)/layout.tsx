import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel izquierdo — jade oscuro */}
      <div className="hidden lg:flex bg-brand-dark text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Decoración sutil */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-jade/10 -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-brand-gold/5 translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Tian Ying Fa" width={40} height={40} className="size-10 object-contain" />
            <div>
              <span className="font-bold text-lg tracking-tight block font-heading">Tian Ying Fa</span>
              <span className="text-[10px] text-brand-gold/80 tracking-widest uppercase">Centro de salud natural</span>
            </div>
          </Link>
        </div>

        <div className="relative space-y-8">
          <div className="w-8 h-px bg-brand-gold/40" />
          <blockquote className="space-y-4">
            <p className="text-xl leading-relaxed text-white/80 font-heading italic">
              "El que conquista a los demás es fuerte; el que se conquista a sí mismo es poderoso."
            </p>
            <footer className="text-sm text-brand-gold/80 tracking-wide">— Lao Tzu</footer>
          </blockquote>
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
            {[
              { v: '25+', l: 'Años' },
              { v: '500+', l: 'Alumnos' },
              { v: '8', l: 'Disciplinas' },
            ].map(({ v, l }) => (
              <div key={l}>
                <p className="text-lg font-bold text-brand-gold font-heading">{v}</p>
                <p className="text-xs text-white/40">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/logo.png" alt="Tian Ying Fa" width={32} height={32} className="size-8 object-contain" />
              <span className="font-bold text-lg tracking-tight font-heading">Tian Ying Fa</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
