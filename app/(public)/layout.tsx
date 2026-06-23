import Link from 'next/link'
import { Navbar } from '@/components/navbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo.png" alt="Aula" className="size-8 object-contain" />
                <span className="font-bold text-lg">Aula</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Cursos de meditación, mindfulness y vida saludable para transformar tu bienestar.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/#cursos" className="hover:text-foreground transition-colors">
                    Cursos
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground transition-colors">
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-foreground transition-colors">
                    Crear cuenta
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacidad" className="hover:text-foreground transition-colors">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terminos" className="hover:text-foreground transition-colors">
                    Términos de uso
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-foreground transition-colors">
                    Política de cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-10 pt-6 text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Aula. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
