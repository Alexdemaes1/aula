import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Course } from '@/types'

type SortOption = 'newest' | 'price_asc' | 'price_desc'

export const getPublishedCourses = unstable_cache(
  async (q?: string, sort?: SortOption): Promise<Course[]> => {
    const db = createAdminClient()
    let query = db.from('courses').select('*').eq('is_published', true)

    if (q?.trim()) {
      query = query.ilike('title', `%${q.trim()}%`)
    }

    if (sort === 'price_asc') {
      query = query.order('price_cents', { ascending: true })
    } else if (sort === 'price_desc') {
      query = query.order('price_cents', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data } = await query
    return (data as Course[]) ?? []
  },
  ['published-courses'],
  { revalidate: 300 }
)

/**
 * Cursos destacados para la home. Devuelve los marcados `is_featured`
 * ordenados por `featured_order`; si no hay ninguno, los más recientes.
 */
export const getFeaturedCourses = unstable_cache(
  async (limit = 3): Promise<Course[]> => {
    const db = createAdminClient()
    const { data: featured } = await db
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('featured_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (featured && featured.length > 0) return featured as Course[]

    const { data: recent } = await db
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    return (recent as Course[]) ?? []
  },
  ['featured-courses'],
  { revalidate: 300 }
)

export const getCourse = unstable_cache(
  async (slug: string): Promise<Course | null> => {
    const db = createAdminClient()
    const { data } = await db
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    return (data as Course) ?? null
  },
  ['course-detail'],
  { revalidate: 300 }
)
