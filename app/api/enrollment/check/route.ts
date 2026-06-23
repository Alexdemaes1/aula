import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const courseId = request.nextUrl.searchParams.get('courseId')
  if (!courseId) return NextResponse.json({ enrolled: false })

  const user = await getUser().catch(() => null)
  if (!user) return NextResponse.json({ enrolled: false })

  const db = createAdminClient()
  const { data } = await db
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .maybeSingle()

  return NextResponse.json({ enrolled: !!data })
}
