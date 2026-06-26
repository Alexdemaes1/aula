import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tianyingfa.vercel.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/cursos', '/courses/', '/privacidad', '/terminos', '/cookies'],
        disallow: ['/dashboard', '/account', '/admin/', '/learn/', '/api/', '/login', '/register', '/forgot-password', '/reset-password'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
