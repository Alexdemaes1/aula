import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aula-kappa-nine.vercel.app'
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
      url: `${siteUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    ...courseUrls,
  ]
}
