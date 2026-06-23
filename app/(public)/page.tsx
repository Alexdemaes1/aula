import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getUser } from '@/lib/auth'
import { CatalogSearch } from '@/components/catalog-search'
import { CourseCatalog } from '@/components/course-catalog'
import { Brain, Leaf, Heart, Video, Shield, Flame } from 'lucide-react'

export const metadata = {
  title: 'Tian Ying Fa — Tai Ji, Qi Gong y Medicina Natural',
  description:
    'Cursos online de Tai Ji Quan, Qi Gong, meditación y medicina natural con el Sifu Salvador Montiel. Más de 25 años formando en la tradición oriental de élite.',
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden animate-pulse">
          <div className="aspect-video bg-muted" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-9 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

const FEATURES = [
  {
    icon: Brain,
    title: 'Tai Ji Quan',
    desc: 'La práctica ancestral que armoniza cuerpo y mente a través del movimiento consciente y la respiración.',
  },
  {
    icon: Leaf,
    title: 'Qi Gong',
    desc: 'Ejercicios energéticos para cultivar el qi vital, fortalecer el sistema inmune y reducir el estrés profundo.',
  },
  {
    icon: Heart,
    title: 'Meditación y paz mental',
    desc: 'Técnicas orientales de introspección para transformar tu relación con la mente y encontrar el equilibrio.',
  },
  {
    icon: Flame,
    title: 'Medicina natural',
    desc: 'Fundamentos de medicina tradicional china y salud natural aplicados al bienestar cotidiano.',
  },
  {
    icon: Shield,
    title: 'Artes marciales chinas',
    desc: 'Kung Fu, defensa personal y disciplina marcial bajo la guía directa del Sifu Salvador Montiel.',
  },
  {
    icon: Video,
    title: 'Formación online HD',
    desc: 'Aprende desde cualquier lugar y a tu ritmo, con acceso vitalicio y materiales descargables.',
  },
]

const TESTIMONIALS = [
  {
    body: 'Llevo practicando Qi Gong con el Sifu Montiel casi un año. La claridad mental que he ganado es difícil de describir. Los cursos online tienen la misma presencia que en persona.',
    name: 'Ana Ferrer',
    role: 'Médica de familia, Valencia',
  },
  {
    body: 'El programa para ejecutivos me cambió la vida. Aprendí a gestionar el estrés con herramientas reales que uso cada mañana. La inversión más valiosa que he hecho.',
    name: 'Marcos Ruiz',
    role: 'Director financiero, Madrid',
  },
  {
    body: 'Empecé con el Tai Ji sin saber nada. La metodología del Sifu es excepcional — técnica impecable y una paciencia infinita. Mi cuerpo y mi mente son otro.',
    name: 'Carmen López',
    role: 'Enfermera, Algemesí',
  },
]

const FAQ = [
  {
    q: '¿Necesito tener experiencia previa en artes marciales o meditación?',
    a: 'No es necesario. Todos nuestros cursos están diseñados desde cero. El Sifu Montiel lleva más de 25 años enseñando a personas de todo nivel y condición.',
  },
  {
    q: '¿Cuánto tiempo tengo acceso a los cursos?',
    a: 'El acceso es de por vida. Una vez adquieres un curso, puedes revisarlo todas las veces que necesites, sin fecha de caducidad.',
  },
  {
    q: '¿Puedo practicar aunque no tenga mucho espacio en casa?',
    a: 'Sí. El Tai Ji, el Qi Gong y la meditación pueden practicarse en espacios reducidos. Con un par de metros cuadrados es más que suficiente para comenzar.',
  },
  {
    q: '¿Hay alguna suscripción mensual?',
    a: 'No. Cada curso se compra con un pago único y el acceso es vitalicio. Sin cargos recurrentes ni sorpresas.',
  },
  {
    q: '¿Puedo combinar los cursos con sesiones presenciales en el centro?',
    a: 'Sí. Los cursos online son perfectamente complementarios a las clases presenciales en nuestro centro de Algemesí (Valencia).',
  },
]

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tianyingfa.vercel.app'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tian Ying Fa',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    'Centro de cursos online de Tai Ji Quan, Qi Gong, meditación y medicina natural con el Sifu Salvador Montiel.',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+34696799639',
    contactType: 'customer service',
    availableLanguage: 'Spanish',
  },
}

export default async function HomePage({ searchParams }: PageProps) {
  const [{ q }, user] = await Promise.all([searchParams, getUser()])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {!user && (
        <>
          {/* Hero */}
          <section className="relative bg-brand-dark text-white overflow-hidden">
            {/* Gradiente sutil tipo pintura china */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_30%_50%,oklch(0.28_0.09_165/0.25),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_80%_50%,oklch(0.72_0.14_85/0.08),transparent)]" />
            <div className="relative max-w-6xl mx-auto px-6 py-24 sm:py-36 grid lg:grid-cols-2 gap-12 items-center">
              {/* Contenido */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-xs font-medium mb-8 tracking-wide uppercase">
                  Centro Tian Ying Fa · Algemesí, Valencia
                </div>
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-tight mb-6 font-heading">
                  Transforma tu cuerpo,
                  <br />
                  <span className="text-brand-gold">mente y energía.</span>
                </h1>
                <p className="text-lg text-white/70 max-w-lg mb-10 leading-relaxed">
                  Cursos online de Tai Ji Quan, Qi Gong, meditación y medicina natural
                  con el Sifu Salvador Montiel — más de 25 años fusionando la tradición
                  oriental con la salud natural moderna.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-14">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center text-base px-8 h-11 rounded-md bg-brand-gold text-brand-dark font-semibold hover:opacity-90 transition-opacity"
                  >
                    Comenzar ahora
                  </Link>
                  <a
                    href="#cursos"
                    className="inline-flex items-center justify-center text-base px-8 h-11 rounded-md border border-white/20 text-white hover:bg-white/5 transition-colors"
                  >
                    Ver cursos
                  </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-white/10">
                  {[
                    { value: '25+', label: 'Años de experiencia' },
                    { value: '500+', label: 'Alumnos formados' },
                    { value: '8', label: 'Disciplinas' },
                    { value: '4.9', label: 'Valoración' },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <p className="text-xl font-bold text-brand-gold">{value}</p>
                      <p className="text-[11px] text-white/50 mt-0.5 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logo centrado en columna derecha */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-brand-gold/5 blur-3xl scale-150" />
                  <div className="relative size-72 rounded-full border border-brand-gold/20 bg-brand-jade/10 flex items-center justify-center">
                    <div className="size-52 rounded-full border border-brand-gold/10 bg-brand-jade/10 flex items-center justify-center">
                      <Image
                        src="/logo.png"
                        alt="Tian Ying Fa"
                        width={128}
                        height={128}
                        className="size-32 object-contain drop-shadow-2xl opacity-90"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Separador con cita */}
          <div className="bg-primary text-primary-foreground py-8 text-center px-6">
            <p className="text-sm sm:text-base italic font-heading tracking-wide max-w-2xl mx-auto">
              "En Tian Ying Fa fusionamos el rigor de la salud natural moderna con el legado de disciplinas orientales de élite."
            </p>
            <p className="text-primary-foreground/70 text-xs mt-2 tracking-widest uppercase">
              — Sifu Salvador Montiel
            </p>
          </div>

          {/* Features */}
          <section className="py-20 bg-background">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-14">
                <h2 className="text-3xl font-bold tracking-tight font-heading">
                  Disciplinas que transforman
                </h2>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                  Cada curso está diseñado bajo la filosofía integral de Tian Ying Fa:
                  optimizar cuerpo, mente y energía de forma duradera.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {FEATURES.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="group p-6 rounded-lg border bg-card hover:border-primary/30 hover:shadow-sm transition-all">
                    <div className="size-10 rounded-md bg-primary/8 flex items-center justify-center mb-4">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Cómo funciona */}
          <section className="py-20 bg-muted/40">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-4 font-heading">
                Empieza en tres pasos
              </h2>
              <p className="text-muted-foreground mb-14 max-w-xl mx-auto">
                Sin complicaciones. En minutos puedes estar aprendiendo del Sifu Salvador Montiel desde casa.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                {[
                  {
                    n: '一',
                    title: 'Crea tu cuenta',
                    desc: 'Regístrate gratis en menos de un minuto. Sin tarjeta de crédito requerida.',
                  },
                  {
                    n: '二',
                    title: 'Elige tu disciplina',
                    desc: 'Explora el catálogo y selecciona el curso que mejor se adapte a tu momento.',
                  },
                  {
                    n: '三',
                    title: 'Practica a tu ritmo',
                    desc: 'Accede desde cualquier dispositivo, cuando quieras, con acceso vitalicio.',
                  },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex flex-col items-center">
                    <div className="size-14 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mb-4 font-heading tracking-wider">
                      {n}
                    </div>
                    <h3 className="font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Catálogo */}
      <section id="cursos" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {user ? 'Tu formación' : 'Cursos disponibles'}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {q
                ? `Resultados para "${q}"`
                : 'Tai Ji, Qi Gong, meditación y medicina natural'}
            </p>
          </div>
          <div className="sm:ml-auto">
            <Suspense>
              <CatalogSearch />
            </Suspense>
          </div>
        </div>
        <Suspense fallback={<CatalogSkeleton />}>
          <CourseCatalog q={q} userId={user?.id} />
        </Suspense>
      </section>

      {!user && (
        <>
          {/* Testimonios */}
          <section className="py-20 bg-muted/40">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-14">
                <h2 className="text-3xl font-bold tracking-tight font-heading">
                  Lo que dicen nuestros alumnos
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {TESTIMONIALS.map(({ body, name, role }) => (
                  <div key={name} className="rounded-lg border bg-card p-6 space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="text-brand-gold text-2xl font-heading leading-none mr-1">"</span>
                      {body}
                      <span className="text-brand-gold text-2xl font-heading leading-none ml-1">"</span>
                    </p>
                    <div className="pt-2 border-t border-border">
                      <p className="font-semibold text-sm">{name}</p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 bg-background">
            <div className="max-w-3xl mx-auto px-6">
              <h2 className="text-3xl font-bold tracking-tight text-center mb-12 font-heading">
                Preguntas frecuentes
              </h2>
              <div className="space-y-2">
                {FAQ.map(({ q: question, a }) => (
                  <details key={question} className="group border rounded-lg bg-card">
                    <summary className="flex justify-between items-center cursor-pointer px-5 py-4 font-medium text-sm select-none list-none [&::-webkit-details-marker]:hidden">
                      {question}
                      <span className="ml-4 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180">
                        ▾
                      </span>
                    </summary>
                    <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA final */}
          <section className="bg-brand-dark text-white py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,oklch(0.28_0.09_165/0.20),transparent)]" />
            <div className="relative max-w-2xl mx-auto px-6 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-heading leading-tight">
                Comienza tu camino<br />hacia el equilibrio
              </h2>
              <p className="text-white/70 mb-10 leading-relaxed">
                Únete a más de 500 alumnos que practican Tai Ji, Qi Gong y meditación
                bajo la guía del Sifu Salvador Montiel.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center text-base px-10 h-12 rounded-md bg-brand-gold text-brand-dark font-semibold hover:opacity-90 transition-opacity"
              >
                Empezar ahora — es gratis
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  )
}
