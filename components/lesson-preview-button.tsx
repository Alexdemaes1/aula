'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PlayCircle, Loader2 } from 'lucide-react'
import { extractYouTubeId } from '@/lib/utils/youtube'
import { getSignedMediaUrl } from '@/app/actions/media'

/** Enlace "Vista previa" que abre el contenido de una lección gratuita (YouTube o audio). */
export function LessonPreviewButton({
  lessonId,
  title,
  contentType,
  videoId,
}: {
  lessonId: string
  title: string
  contentType: string
  videoId: string | null
}) {
  const [open, setOpen] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const ytId = contentType === 'video' ? extractYouTubeId(videoId) : null

  // Vídeo sin ID válido y no es audio → solo etiqueta.
  if (contentType === 'video' && !ytId) {
    return <span className="ml-auto text-xs font-medium text-emerald-600">Vista previa</span>
  }
  if (contentType === 'text') {
    return <span className="ml-auto text-xs font-medium text-emerald-600">Vista previa</span>
  }

  async function openPreview() {
    if (contentType === 'audio') {
      setLoading(true)
      const r = await getSignedMediaUrl(lessonId)
      setLoading(false)
      setAudioUrl(r.url ?? null)
    }
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <PlayCircle className="size-3.5" />} Vista previa
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm">{title}</DialogTitle>
          </DialogHeader>
          {contentType === 'audio' ? (
            audioUrl ? (
              <audio src={audioUrl} controls controlsList="nodownload" autoPlay className="w-full" />
            ) : (
              <p className="text-sm text-muted-foreground">No se pudo cargar la vista previa.</p>
            )
          ) : ytId ? (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&autoplay=1`}
                title={title}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
