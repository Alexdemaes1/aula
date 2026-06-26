import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tianyingfa.vercel.app'
  const db = createAdminClient()

  const { data: courses } = await db
    .from('courses')
    .select('slug, created_at')
    .eq('is_published', true)

  const courseUrls: MetadataRoute.Sitemap = (courses ?? []).map((course) => ({
    url: `${siteUrl}/courses/${course.slug}`,
    lastModified: course.created_at ?? new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: siteUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${siteUrl}/cursos`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/privacidad`,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    },
    {
      url: `${siteUrl}/terminos`,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    },
    {
      url: `${siteUrl}/cookies`,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    },
    ...courseUrls,
  ]
}
