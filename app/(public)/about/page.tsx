import Link from 'next/link'
import { Leaf, Heart, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export const metadata = {
  title: 'Sobre nosotros',
  description: 'Conoce el Centro Tian Ying Fa — más de 25 años fusionando la salud natural moderna con el legado de las disciplinas orientales de élite. Sifu Salvador Montiel.',
}

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HealthAndBeautyBusiness',
  name: 'Centro Tian Ying Fa',
  description:
    'Centro de salud natural con más de 25 años de formación en Tai Ji Quan, Qi Gong, medicina natural y artes marciales chinas bajo la dirección del Sifu Salvador Montiel.',
  url: 'https://aula-kappa-nine.vercel.app',
  telephone: '+34696799639',
  email: 'centrotianyingfa@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. del País Valencia 155-1',
    addressLocality: 'Algemesí',
    postalCode: '46680',
    addressRegion: 'Valencia',
    addressCountry: 'ES',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.1856,
    longitude: -0.4333,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '21:00',
    },
  ],
  priceRange: '€€',
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Cash, Credit Card',
}

const VALUES = [
  {
    icon: Leaf,
    title: 'Tradición auténtica',
    desc: 'Más de 25 años de formación ininterrumpida en Tai Ji Quan, Qi Gong, Kung Fu y medicina natural bajo una dirección técnica de élite.',
  },
  {
    icon: Heart,
    title: 'Visión integral',
    desc: 'Cuerpo, mente y energía son inseparables. Cada programa está diseñado para optimizar las tres dimensiones del ser humano.',
  },
  {
    icon: Sparkles,
    title: 'Rigor y calidez',
    desc: 'La disciplina oriental más exigente con la cercanía de un maestro que adapta el camino a cada alumno.',
  },
]

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      {/* Hero */}
      <section className="relative bg-brand-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.28_0.09_165/0.25),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-xs font-medium mb-8 tracking-wide uppercase">
            Algemesí, Valencia · Fundado hace más de 25 años
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 font-heading">
            Más de 25 años cultivando<br />
            <span className="text-brand-gold">el equilibrio</span>
          </h1>
          <p className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
            En Tian Ying Fa fusionamos el rigor de la salud natural moderna con el legado
            de disciplinas orientales de élite. Bajo la dirección del Sifu Salvador Montiel,
            ofrecemos una formación integral que transforma cuerpo, mente y energía.
          </p>
        </div>
      </section>

      {/* El Sifu */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3">Fundador y director técnico</p>
              <h2 className="text-3xl font-bold mb-6 font-heading">
                Sifu Salvador Montiel
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
                <p>
                  Con más de 25 años de experiencia, el Sifu Salvador Montiel ha dedicado su vida
                  a la práctica y enseñanza de las artes orientales de la salud. Su formación
                  abarca el Tai Ji Quan, el Qi Gong, el Kung Fu tradicional, las artes marciales
                  y la medicina tradicional china.
                </p>
                <p>
                  Su metodología única — el sistema <strong className="text-foreground">Biokinnetic</strong> — integra
                  la sabiduría ancestral con los conocimientos de la salud natural moderna,
                  ofreciendo programas personalizados para ejecutivos bajo estrés, deportistas
                  de élite y cualquier persona que busque mejorar su calidad de vida.
                </p>
                <p>
                  El centro ofrece formación presencial en Algemesí (Valencia) y, ahora,
                  acceso online para que su metodología llegue a cualquier lugar del mundo.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '25+', label: 'Años de experiencia' },
                { value: '8', label: 'Disciplinas enseñadas' },
                { value: '500+', label: 'Alumnos formados' },
                { value: '4.9/5', label: 'Valoración media' },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-lg border bg-card p-5 text-center">
                  <p className="text-3xl font-bold text-primary mb-1 font-heading">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 bg-muted/40">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-14 font-heading">
            Nuestra filosofía
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center space-y-4">
                <div className="mx-auto size-14 rounded-full bg-primary/8 flex items-center justify-center">
                  <Icon className="size-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios en el centro */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 font-heading">
            También en persona
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
            Además de los cursos online, el centro Tian Ying Fa ofrece servicios presenciales
            en Av. del País Valencia 155-1, 46680 Algemesí (Valencia).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-sm">
            {[
              'Acupuntura y electropuntura',
              'Craneopuntura Yamamoto',
              'Masaje Tui Na avanzado',
              'Clases presenciales Tai Ji',
              'Qi Gong terapéutico',
              'Programa BIOKINNETIC CEO',
            ].map((s) => (
              <div key={s} className="rounded-md border bg-card px-3 py-2.5 text-muted-foreground text-xs">
                {s}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-8">
            Horario: L–V 9:00–21:00 ·{' '}
            <a href="https://wa.me/34696799639" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">
              WhatsApp 696 799 639
            </a>{' '}
            ·{' '}
            <a href="mailto:centrotianyingfa@gmail.com" className="hover:text-foreground transition-colors">
              centrotianyingfa@gmail.com
            </a>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,oklch(0.28_0.09_165/0.15),transparent)]" />
        <div className="relative max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4 font-heading">
            Únete a la comunidad Tian Ying Fa
          </h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            Empieza hoy tu formación online en Tai Ji, Qi Gong y meditación.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className={`inline-flex items-center justify-center text-base px-8 h-11 rounded-md bg-brand-gold text-brand-dark font-semibold hover:opacity-90 transition-opacity`}
            >
              Crear cuenta gratis
            </Link>
            <Link href="/cursos" className={`inline-flex items-center justify-center text-base px-8 h-11 rounded-md border border-white/20 text-white hover:bg-white/5 transition-colors`}>
              Ver cursos
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
