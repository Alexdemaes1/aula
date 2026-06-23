import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { WhatsAppButton } from '@/components/whatsapp-button'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">{children}</main>
      <WhatsAppButton />

      <footer className="border-t bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

            {/* Columna 1 — Identidad de marca */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-5 group">
                <Image
                  src="/logo.png"
                  alt="Tian Ying Fa"
                  width={40}
                  height={40}
                  className="size-10 object-contain"
                />
                <div>
                  <span className="font-bold text-base block font-heading group-hover:text-brand-gold transition-colors">
                    Tian Ying Fa
                  </span>
                  <span className="text-[9px] text-brand-gold/70 tracking-widest uppercase">
                    Centro de salud natural
                  </span>
                </div>
              </Link>
              <p className="text-sm text-white/55 max-w-xs leading-relaxed mb-6">
                Formación online en Tai Ji, Qi Gong, Meditación y Medicina Natural.
                Aprende con el Sifu Salvador Montiel, 25 años de experiencia.
              </p>
              <div className="space-y-1.5 text-sm text-white/40">
                <p>Av. del País Valencia 155-1, 46680 Algemesí (Valencia)</p>
                <p className="flex flex-wrap gap-x-3 gap-y-1">
                  <a
                    href="https://wa.me/34696799639"
                    className="hover:text-brand-gold transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp 696&nbsp;799&nbsp;639
                  </a>
                  <span aria-hidden="true">·</span>
                  <a href="mailto:centrotianyingfa@gmail.com" className="hover:text-brand-gold transition-colors">
                    centrotianyingfa@gmail.com
                  </a>
                </p>
                <p className="text-white/25">Lunes a Viernes · 9:00 – 21:00</p>
              </div>
            </div>

            {/* Columna 2 — Explora */}
            <div>
              <h4 className="font-semibold text-xs mb-5 tracking-widest uppercase text-white/40">
                Explora
              </h4>
              <ul className="space-y-3 text-sm text-white/65">
                <li>
                  <Link href="/" className="hover:text-brand-gold transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/cursos" className="hover:text-brand-gold transition-colors">
                    Todos los cursos
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-brand-gold transition-colors">
                    El centro y el Sifu
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 3 — Tu cuenta + Legal */}
            <div className="space-y-8">
              <div>
                <h4 className="font-semibold text-xs mb-5 tracking-widest uppercase text-white/40">
                  Tu cuenta
                </h4>
                <ul className="space-y-3 text-sm text-white/65">
                  <li>
                    <Link href="/login" className="hover:text-brand-gold transition-colors">
                      Iniciar sesión
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-brand-gold transition-colors">
                      Crear cuenta gratis
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:text-brand-gold transition-colors">
                      Mis cursos
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-xs mb-5 tracking-widest uppercase text-white/40">
                  Legal
                </h4>
                <ul className="space-y-3 text-sm text-white/65">
                  <li>
                    <Link href="/privacidad" className="hover:text-brand-gold transition-colors">
                      Política de privacidad
                    </Link>
                  </li>
                  <li>
                    <Link href="/terminos" className="hover:text-brand-gold transition-colors">
                      Términos de uso
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="hover:text-brand-gold transition-colors">
                      Política de cookies
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Pie de copyright */}
          <div className="border-t border-white/10 mt-10 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/30">
            <span>© {new Date().getFullYear()} Centro Tian Ying Fa · Todos los derechos reservados.</span>
            <span className="font-heading italic text-white/15 text-base tracking-wider">天鹰发</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
