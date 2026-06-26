import Link from 'next/link'
import Image from 'next/image'
import { GlobalNav } from '@/components/global-nav'
import { getNavData } from '@/lib/nav-data'
import { WhatsAppButton } from '@/components/whatsapp-button'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const nav = await getNavData()
  return (
    <div className="min-h-screen flex flex-col">
      <GlobalNav {...nav} />
      <main id="main-content" className="flex-1">{children}</main>
      <WhatsAppButton />

      <footer className="border-t bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <Image src="/logo-cream.png" alt="Tian Ying Fa" width={28} height={28} className="size-7 object-contain" />
              <span className="font-semibold text-base font-heading group-hover:text-brand-gold transition-colors">
                Tian Ying Fa
              </span>
            </Link>

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-sm text-white/55">
              <Link href="/cursos" className="hover:text-brand-gold transition-colors">Cursos</Link>
              <Link href="/#centro" className="hover:text-brand-gold transition-colors">El centro</Link>
              <Link href="/privacidad" className="hover:text-brand-gold transition-colors">Privacidad</Link>
              <Link href="/terminos" className="hover:text-brand-gold transition-colors">Términos</Link>
              <Link href="/cookies" className="hover:text-brand-gold transition-colors">Cookies</Link>
            </nav>

            {/* Copyright */}
            <p className="text-xs text-white/30 flex-shrink-0 text-center sm:text-right">
              © {new Date().getFullYear()} Centro Tian Ying Fa
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
