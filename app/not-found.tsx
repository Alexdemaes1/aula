import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <BookOpen className="size-12 text-muted-foreground/30 mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-muted-foreground mb-6">La página que buscas no existe.</p>
      <Link href="/" className={buttonVariants({ variant: 'outline' })}>
        Volver al inicio
      </Link>
    </div>
  )
}
