import { Skeleton } from '@/components/ui/skeleton'

export default function LessonLoading() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="aspect-video w-full rounded-xl" />
    </div>
  )
}
