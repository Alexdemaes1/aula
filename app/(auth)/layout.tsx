import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-slate-900 text-white flex-col justify-between p-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <BookOpen className="size-5" />
          Aula
        </Link>
        <blockquote className="space-y-2">
          <p className="text-lg leading-relaxed text-slate-300">
            "El conocimiento es el único bien que crece cuando se comparte."
          </p>
          <footer className="text-sm text-slate-400">— Proverbio</footer>
        </blockquote>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg">
              <BookOpen className="size-5" />
              Aula
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
