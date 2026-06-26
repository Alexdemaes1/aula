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
      <div className="hidden lg:flex bg-brand-dark text-cream flex-col justify-between p-12 relative overflow-hidden">
        {/* Decoración sutil */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-jade/20 -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <span aria-hidden className="kanji-watermark right-[-30px] bottom-[-50px] text-[15rem]">心</span>

        <div className="relative">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-cream.png" alt="Tian Ying Fa" width={40} height={40} className="size-10 object-contain" />
            <div>
              <span className="font-heading font-semibold text-xl tracking-tight block">Tian Ying Fa</span>
              <span className="kicker text-brand-gold/80 !text-[10px]">天鷹法</span>
            </div>
          </Link>
        </div>

        <div className="relative space-y-8">
          <div className="w-8 h-px bg-brand-gold/40" />
          <blockquote className="space-y-4">
            <p className="text-2xl leading-relaxed text-cream/85 font-heading italic">
              "El que conquista a los demás es fuerte; el que se conquista a sí mismo es poderoso."
            </p>
            <footer className="kicker text-brand-gold/80">— Lao Tzu</footer>
          </blockquote>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/logo-clean.png" alt="Tian Ying Fa" width={32} height={32} className="size-8 object-contain" />
              <span className="font-heading font-semibold text-xl tracking-tight">Tian Ying Fa</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
