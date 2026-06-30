'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { uploadAvatarAction, removeAvatarAction } from '@/app/actions/profile'

const MAX_DIM = 512

/** Redimensiona la imagen en el navegador a ≤512px y la exporta como JPEG. */
function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('No se pudo procesar la imagen'))
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo procesar la imagen'))), 'image/jpeg', 0.85)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Archivo de imagen no válido'))
    }
    img.src = url
  })
}

export function AvatarUploader({
  fullName,
  email,
  avatarUrl,
}: {
  fullName: string
  email: string
  avatarUrl: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite re-seleccionar el mismo archivo
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona una imagen (JPG, PNG o WebP)')
      return
    }
    setBusy(true)
    try {
      const blob = await resizeImage(file)
      const fd = new FormData()
      fd.append('avatar', new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
      const res = await uploadAvatarAction(null, fd)
      if (res?.error) toast.error(res.error)
      else {
        toast.success(res?.success ?? 'Foto actualizada')
        router.refresh()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo subir la foto')
    } finally {
      setBusy(false)
    }
  }

  function onRemove() {
    startTransition(async () => {
      const res = await removeAvatarAction()
      if (res?.error) toast.error(res.error)
      else {
        toast.success(res?.success ?? 'Foto eliminada')
        router.refresh()
      }
    })
  }

  const loading = busy || pending

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <UserAvatar
          name={fullName}
          email={email}
          avatarUrl={avatarUrl}
          className="size-16 bg-primary/10 text-primary text-xl border border-border"
        />
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Loader2 className="size-5 animate-spin text-white" />
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => inputRef.current?.click()}>
            <Camera className="size-4 mr-2" />
            {avatarUrl ? 'Cambiar foto' : 'Subir foto'}
          </Button>
          {avatarUrl && (
            <Button type="button" variant="ghost" size="sm" disabled={loading} onClick={onRemove}>
              <Trash2 className="size-4 mr-2" /> Quitar
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG o WebP · se recorta a un cuadrado.</p>
      </div>

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFile} />
    </div>
  )
}
