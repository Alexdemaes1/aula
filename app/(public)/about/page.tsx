import Link from 'next/link'
import { Leaf, Heart, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export const metadata = {
  title: 'Sobre nosotros',
  description: 'Conoce la misión y los valores de Aula, la plataforma de cursos de meditación y vida saludable.',
}

const VALUES = [
  {
    icon: Leaf,
    title: 'Autenticidad',
    desc: 'Contenido creado por instructores expertos que practican lo que enseñan. Sin atajos, sin promesas vacías.',
  },
  {
    icon: Heart,
    title: 'Compasión',
    desc: 'Un aprendizaje libre de juicios. Avanza a tu ritmo, desde donde estás, con todo lo que eres.',
  },
  {
    icon: Sparkles,
    title: 'Transformación',
    desc: 'Creemos en el potencial humano. Cada lección es un paso hacia una versión más consciente de ti mismo.',
  },
]

export default function AboutPage() {
  return (
    <>
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(217,166,72,0.12),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 font-heading">
            Nuestra misión es tu bienestar
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Aula nació de la convicción de que el acceso al conocimiento sobre meditación y vida saludable debería ser universal, accesible y de alta calidad.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-14 font-heading">
            Nuestros valores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center space-y-4">
                <div className="mx-auto size-14 rounded-full bg-amber-400/10 flex items-center justify-center">
                  <Icon className="size-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '50h+', label: 'Contenido en vídeo' },
              { value: '12+', label: 'Instructores expertos' },
              { value: '500+', label: 'Alumnos activos' },
              { value: '4.9/5', label: 'Valoración media' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-amber-600">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-4 font-heading">
            ¿Te unes a nuestra comunidad?
          </h2>
          <p className="text-muted-foreground mb-8">
            Empieza hoy a aprender meditación y a construir hábitos que transformen tu vida.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className={buttonVariants({ size: 'lg' })}>
              Crear cuenta gratis
            </Link>
            <Link href="/#cursos" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Ver cursos
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
