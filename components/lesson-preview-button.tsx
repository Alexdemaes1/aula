'use client'

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PlayCircle } from 'lucide-react'
import { extractYouTubeId } from '@/lib/utils/youtube'

/** Enlace "Vista previa" que abre el vídeo de una lección gratuita en un diálogo. */
export function LessonPreviewButton({ title, videoId }: { title: string; videoId: string | null }) {
  const id = extractYouTubeId(videoId)
  if (!id) {
    return <span className="ml-auto text-xs font-medium text-emerald-600">Vista previa</span>
  }
  return (
    <Dialog>
      <DialogTrigger className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
        <PlayCircle className="size-3.5" /> Vista previa
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm">{title}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
            title={title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
