import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/logo.png" alt="Tian Ying Fa" width={36} height={36} className="size-9 object-contain" />
                <div>
                  <span className="font-bold text-base block font-heading">Tian Ying Fa</span>
                  <span className="text-[9px] text-brand-gold/70 tracking-widest uppercase">Centro de salud natural</span>
                </div>
              </div>
              <p className="text-sm text-white/50 max-w-xs leading-relaxed mb-4">
                Fusionamos el rigor de la salud natural moderna con el legado de disciplinas orientales de élite.
              </p>
              <p className="text-xs text-white/30">
                Av. del País Valencia 155-1, 46680 Algemesí, Valencia<br />
                696 799 639 · centrotianyingfa@gmail.com
              </p>
            </div>

            {/* Plataforma */}
            <div>
              <h4 className="font-semibold text-xs mb-4 tracking-widest uppercase text-white/50">
                Plataforma
              </h4>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li>
                  <Link href="/#cursos" className="hover:text-brand-gold transition-colors">
                    Cursos
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-brand-gold transition-colors">
                    El centro
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-brand-gold transition-colors">
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-brand-gold transition-colors">
                    Crear cuenta
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-xs mb-4 tracking-widest uppercase text-white/50">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm text-white/60">
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

          <div className="border-t border-white/10 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/30">
            <span>© {new Date().getFullYear()} Centro Tian Ying Fa. Todos los derechos reservados.</span>
            <span className="font-heading italic text-white/20">天鹰发</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
