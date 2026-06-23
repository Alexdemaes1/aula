import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Course } from '@/types'

export const getPublishedCourses = unstable_cache(
  async (q?: string): Promise<Course[]> => {
    const db = createAdminClient()
    let query = db
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (q?.trim()) {
      query = query.ilike('title', `%${q.trim()}%`)
    }

    const { data } = await query
    return (data as Course[]) ?? []
  },
  ['published-courses'],
  { revalidate: 300 }
)
