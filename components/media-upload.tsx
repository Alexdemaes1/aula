'use client'

import { useState, useTransition } from 'react'
import { createMediaUploadUrl, setLessonMediaAction, removeLessonMediaAction } from '@/app/actions/media'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, X, Music, Film } from 'lucide-react'
import { toast } from 'sonner'

const MAX = 50 * 1024 * 1024 // 50 MB (límite del plan gratuito de Supabase)

/** Subida directa navegador → Supabase Storage (bucket privado 'media'). Solo admin. */
export function MediaUpload({
  courseId,
  lessonId,
  kind,
  currentPath,
}: {
  courseId: string
  lessonId: string
  kind: 'audio' | 'video'
  currentPath: string | null
}) {
  const [path, setPath] = useState<string | null>(currentPath)
  const [busy, setBusy] = useState(false)
  const [, start] = useTransition()
  const accept = kind === 'audio' ? 'audio/mpeg,.mp3' : 'video/mp4,.mp4'

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const okType =
      kind === 'audio'
        ? file.type.includes('audio') || file.name.toLowerCase().endsWith('.mp3')
        : file.type.includes('mp4') || file.name.toLowerCase().endsWith('.mp4')
    if (!okType) return toast.error(kind === 'audio' ? 'Sube un archivo MP3' : 'Sube un archivo MP4')
    if (file.size > MAX) return toast.error('El archivo supera 50 MB (límite del plan gratuito)')

    setBusy(true)
    try {
      const signed = await createMediaUploadUrl(courseId, lessonId, kind)
      if (signed.error || !signed.path || !signed.token) {
        throw new Error(signed.error || 'No se pudo preparar la subida')
      }
      const supabase = createClient()
      const { error } = await supabase.storage.from('media').uploadToSignedUrl(signed.path, signed.token, file)
      if (error) throw error
      const res = await setLessonMediaAction(lessonId, courseId, signed.path, 'supabase')
      if (res.error) throw new Error(res.error)
      setPath(signed.path)
      toast.success('Archivo subido correctamente')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir el archivo')
    } finally {
      setBusy(false)
    }
  }

  function remove() {
    if (!path) return
    start(async () => {
      await removeLessonMediaAction(lessonId, courseId, path)
      setPath(null)
      toast.success('Archivo eliminado')
    })
  }

  const Icon = kind === 'audio' ? Music : Film

  return (
    <div className="space-y-2">
      {path ? (
        <div className="flex items-center gap-2 text-sm">
          <Icon className="size-4 text-primary" />
          <span className="text-muted-foreground">Archivo subido</span>
          <Button type="button" variant="ghost" size="sm" className="h-6 text-destructive" onClick={remove}>
            <X className="size-3 mr-1" /> Quitar
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input type="file" accept={accept} onChange={onChange} disabled={busy} className="text-sm" />
          {busy && <Loader2 className="size-4 animate-spin" />}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {kind === 'audio' ? 'MP3' : 'MP4'} · máximo 50 MB (plan gratuito de Supabase).
      </p>
    </div>
  )
}
