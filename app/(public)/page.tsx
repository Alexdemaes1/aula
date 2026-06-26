import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Leaf, Heart, Sparkles, MapPin, Clock, Phone, Mail } from 'lucide-react'
import { getFeaturedCourses } from '@/lib/data/courses'
import { CourseCard } from '@/components/course-card'
import { SectionDivider } from '@/components/section-divider'

export const metadata = {
  title: 'Tian Ying Fa — Tai Ji, Qi Gong y Medicina Natural',
  description:
    'Cursos online de Tai Ji Quan, Qi Gong, meditación y medicina natural con el Sifu Salvador Montiel. Más de 25 años formando en la tradición oriental de élite, en Algemesí (Valencia).',
}

const DISCIPLINES = [
  { char: '太', label: 'Tai Ji Quan' },
  { char: '氣', label: 'Qi Gong' },
  { char: '禪', label: 'Meditación' },
  { char: '武', label: 'Kung Fu' },
]

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

const SERVICES = [
  'Acupuntura y electropuntura',
  'Craneopuntura Yamamoto',
  'Masaje Tui Na avanzado',
  'Clases presenciales Tai Ji',
  'Qi Gong terapéutico',
  'Programa BIOKINNETIC CEO',
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
  logo: `${SITE_URL}/logo-clean.png`,
  description:
    'Centro de cursos online de Tai Ji Quan, Qi Gong, meditación y medicina natural con el Sifu Salvador Montiel.',
}

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HealthAndBeautyBusiness',
  name: 'Centro Tian Ying Fa',
  description:
    'Centro de salud natural con más de 25 años de formación en Tai Ji Quan, Qi Gong, medicina natural y artes marciales chinas bajo la dirección del Sifu Salvador Montiel.',
  url: SITE_URL,
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
  geo: { '@type': 'GeoCoordinates', latitude: 39.1856, longitude: -0.4333 },
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

export default async function HomePage() {
  const featured = await getFeaturedCourses(3)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />

      {/* ===== Hero ===== */}
      <section className="relative bg-brand-dark text-cream overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(65%_90%_at_16%_10%,oklch(0.34_0.045_165/0.85),transparent_70%),radial-gradient(50%_70%_at_100%_100%,oklch(0.72_0.10_80/0.10),transparent_70%)]" />
        <span aria-hidden className="kanji-watermark right-[-1%] top-1/2 -translate-y-1/2 text-[20rem] hidden lg:block">氣</span>
        <div className="relative max-w-6xl mx-auto px-6 py-24 sm:py-32 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/30 mb-7">
              <span className="size-1.5 rounded-full bg-brand-gold" />
              <span className="kicker text-brand-gold/90">Algemesí · Valencia</span>
            </div>
            <h1 className="font-heading font-semibold text-5xl sm:text-6xl xl:text-7xl leading-[1.02] tracking-tight mb-6">
              Cuerpo, mente
              <br />
              y energía
              <br />
              <span className="text-brand-gold">en equilibrio.</span>
            </h1>
            <p className="text-lg text-cream/70 max-w-lg mb-9 leading-relaxed">
              Cursos online de Tai Ji Quan, Qi Gong, meditación y medicina natural
              con el Sifu Salvador Montiel — más de 25 años de tradición oriental.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center text-base px-8 h-12 rounded-lg bg-brand-gold text-brand-dark font-semibold hover:opacity-90 transition-opacity"
              >
                Comenzar ahora
              </Link>
              <Link
                href="/cursos"
                className="inline-flex items-center justify-center text-base px-8 h-12 rounded-lg border border-cream/20 text-cream hover:bg-white/5 transition-colors"
              >
                Ver cursos
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-brand-gold/10 blur-3xl scale-125" />
              <Image
                src="/logo-cream.png"
                alt="Tian Ying Fa"
                width={300}
                height={300}
                className="relative size-72 object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>

        {/* Tira de disciplinas */}
        <div className="relative border-t border-cream/10 bg-brand-jade/40">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-6 flex-wrap">
            <span className="kicker text-cream/50">Disciplinas</span>
            <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
              {DISCIPLINES.map(({ char, label }) => (
                <span key={label} className="font-heading text-lg sm:text-xl text-cream">
                  <span className="text-brand-gold mr-1.5">{char}</span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Cursos destacados ===== */}
      {featured.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <p className="kicker mb-2">Empieza por aquí</p>
                <h2 className="font-heading font-semibold text-3xl sm:text-4xl">Cursos destacados</h2>
              </div>
              <Link href="/cursos" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all">
                Ver todos <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== El método / El Sifu ===== */}
      <section id="metodo" className="py-20 scroll-mt-16 bg-card">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="kicker mb-3">Fundador y director técnico · 道</p>
              <h2 className="font-heading font-semibold text-3xl sm:text-4xl mb-6">Sifu Salvador Montiel</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
                <p>
                  Con más de 25 años de experiencia, el Sifu Salvador Montiel ha dedicado su vida
                  a la práctica y enseñanza de las artes orientales de la salud: Tai Ji Quan,
                  Qi Gong, Kung Fu tradicional y medicina tradicional china.
                </p>
                <p>
                  Su metodología única — el sistema <strong className="text-foreground">Biokinnetic</strong> — integra
                  la sabiduría ancestral con la salud natural moderna, con programas personalizados
                  para ejecutivos bajo estrés, deportistas de élite y cualquier persona que busque
                  mejorar su calidad de vida.
                </p>
                <p>
                  El centro ofrece formación presencial en Algemesí (Valencia) y, ahora,
                  acceso online para que su metodología llegue a cualquier lugar del mundo.
                </p>
              </div>
            </div>
            {/* Tarjeta jade con sello de cinabrio */}
            <div className="relative overflow-hidden rounded-2xl bg-brand-dark text-cream p-10 text-center">
              <span aria-hidden className="kanji-watermark right-[-10px] bottom-[-30px] text-[10rem]">心</span>
              <div className="relative">
                <p className="font-heading font-semibold text-6xl text-brand-gold leading-none">25+</p>
                <p className="text-sm text-cream/70 mt-2 mb-7">años de experiencia</p>
                <div className="inline-flex items-center gap-3 pt-6 border-t border-cream/12">
                  <span className="flex items-center justify-center size-12 rounded-lg bg-seal text-cream font-heading text-2xl shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.2)]">
                    法
                  </span>
                  <span className="text-left leading-tight">
                    <span className="block font-heading italic text-lg text-cream">S. Montiel</span>
                    <span className="kicker text-cream/50">Sello del centro</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Valores ===== */}
      <section className="py-16 section-wash-jade">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-heading font-semibold text-3xl sm:text-4xl text-center">Nuestra filosofía</h2>
          <SectionDivider className="mb-12" />
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

      {/* ===== El centro presencial ===== */}
      <section id="centro" className="py-20 scroll-mt-16 bg-card">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          <div>
            <p className="kicker mb-3">También en persona</p>
            <h2 className="font-heading font-semibold text-3xl sm:text-4xl mb-4">Visítanos en Algemesí</h2>
            <p className="text-muted-foreground leading-relaxed mb-7 max-w-md">
              Además de los cursos online, el centro ofrece tratamientos y clases presenciales
              en el corazón de la Ribera valenciana.
            </p>
            <div className="space-y-1">
              <div className="flex gap-3.5 py-3.5 border-t border-border">
                <MapPin className="size-[18px] text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Av. del País Valencia 155-1</p>
                  <p className="text-sm text-muted-foreground">46680 Algemesí · Valencia</p>
                </div>
              </div>
              <div className="flex gap-3.5 py-3.5 border-t border-border">
                <Clock className="size-[18px] text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Lunes a viernes · 9:00 – 21:00</p>
                  <p className="text-sm text-muted-foreground">Cita previa recomendada</p>
                </div>
              </div>
              <div className="flex gap-3.5 py-3.5 border-t border-border">
                <Phone className="size-[18px] text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">696 799 639</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="size-3.5" /> centrotianyingfa@gmail.com
                  </p>
                </div>
              </div>
            </div>
            <a
              href="https://wa.me/34696799639?text=Hola%2C%20me%20interesa%20informaci%C3%B3n%20sobre%20Tian%20Ying%20Fa"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-gold px-5 h-11 text-sm font-semibold text-brand-dark hover:opacity-90 transition-opacity"
            >
              Escríbenos por WhatsApp
            </a>
          </div>
          {/* Panel del lugar (sin foto) */}
          <div className="relative overflow-hidden rounded-2xl bg-brand-dark text-cream p-9 flex flex-col justify-between min-h-[360px]">
            <span aria-hidden className="kanji-watermark right-[-20px] top-[-30px] text-[12.5rem]">天</span>
            <div className="relative flex items-center gap-2.5">
              <MapPin className="size-5 text-brand-gold" />
              <span className="kicker text-cream/60">El centro · 天鷹法</span>
            </div>
            <p className="relative font-heading text-3xl leading-snug text-cream">
              En el corazón de
              <br />
              la Ribera valenciana
            </p>
            <div className="relative grid grid-cols-2 gap-2.5">
              {SERVICES.map((s) => (
                <div key={s} className="rounded-lg border border-brand-gold/20 bg-cream/[0.06] px-3 py-2.5 text-xs text-cream">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-heading font-semibold text-3xl text-center mb-10">Preguntas frecuentes</h2>
          <div className="space-y-2">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group border rounded-lg bg-card">
                <summary className="flex justify-between items-center cursor-pointer px-5 py-4 font-medium text-sm select-none list-none [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="ml-4 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180">▾</span>
                </summary>
                <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <section className="relative overflow-hidden bg-brand-dark text-cream py-24">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,oklch(0.34_0.045_165/0.25),transparent_70%)]" />
        <span aria-hidden className="kanji-watermark left-1/2 -translate-x-1/2 bottom-[-4rem] text-[16rem]">道</span>
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-heading font-semibold text-3xl sm:text-4xl mb-4 leading-tight">
            Comienza tu camino
            <br />
            hacia el equilibrio
          </h2>
          <p className="text-cream/70 mb-9 leading-relaxed">
            Aprende Tai Ji, Qi Gong y meditación bajo la guía del Sifu Salvador Montiel,
            con más de 25 años de experiencia en disciplinas orientales.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center text-base px-10 h-12 rounded-lg bg-brand-gold text-brand-dark font-semibold hover:opacity-90 transition-opacity"
          >
            Empezar ahora — es gratis
          </Link>
        </div>
      </section>
    </>
  )
}
