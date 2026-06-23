import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tianyingfa.vercel.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/cursos', '/courses/', '/about', '/privacidad', '/terminos', '/cookies'],
        disallow: ['/dashboard', '/account', '/admin/', '/learn/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
