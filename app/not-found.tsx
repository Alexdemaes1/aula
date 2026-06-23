import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background">
      <span className="text-7xl text-primary/20 font-heading mb-4">四〇四</span>
      <h1 className="text-3xl font-bold mb-2 font-heading">Página no encontrada</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        El camino que buscas no existe. Regresa al inicio y explora desde allí.
      </p>
      <div className="flex gap-3">
        <Link href="/" className={buttonVariants()}>
          Ir al inicio
        </Link>
        <Link href="/cursos" className={buttonVariants({ variant: 'outline' })}>
          Ver cursos
        </Link>
      </div>
    </div>
  )
}
