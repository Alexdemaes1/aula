'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { uploadCoverAction, setCoverUrlAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Upload, Link2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface CoverUploadProps {
  courseId: string
  currentUrl: string | null
}

const MAX_BYTES = 5 * 1024 * 1024

export function CoverUpload({ courseId, currentUrl }: CoverUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [urlValue, setUrlValue] = useState(currentUrl ?? '')
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setFileError(null)
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFileError('El archivo debe ser una imagen')
      setFileMeta(null)
      return
    }
    if (file.size > MAX_BYTES) {
      setFileError('La imagen no puede superar 5 MB')
      setFileMeta(null)
      return
    }
    setFileMeta({ name: file.name, size: file.size })
    setPreview(URL.createObjectURL(file))
  }

  function handleFileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (fileError) return
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await uploadCoverAction(courseId, formData)
      if (result?.error) toast.error(result.error)
      else {
        setPreview(result.success ?? null)
        toast.success('Portada actualizada')
      }
    })
  }

  function handleUrlSave() {
    startTransition(async () => {
      const result = await setCoverUrlAction(courseId, urlValue)
      if (result.error) toast.error(result.error)
      else {
        setPreview(result.success ?? null)
        toast.success('Portada actualizada')
      }
    })
  }

  return (
    <div className="space-y-4">
      {preview && (
        <div className="aspect-video relative rounded-xl overflow-hidden border bg-muted">
          <Image src={preview} alt="Portada del curso" fill className="object-cover" unoptimized />
        </div>
      )}

      <Tabs defaultValue="file">
        <TabsList variant="line">
          <TabsTrigger value="file">Subir archivo</TabsTrigger>
          <TabsTrigger value="url">Pegar URL</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4">
          <form onSubmit={handleFileSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="cover">Imagen de portada</Label>
              <Input
                id="cover"
                name="cover"
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                aria-invalid={!!fileError}
              />
              <p className="text-xs text-muted-foreground">JPG, PNG o WebP. Máximo 5 MB. Ratio 16:9 recomendado.</p>
              {fileMeta && !fileError && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="size-3.5" />
                  <span className="truncate">{fileMeta.name}</span>
                  <span>· {(fileMeta.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
              {fileError && <p className="text-xs text-destructive">{fileError}</p>}
            </div>
            <Button type="submit" disabled={isPending || !!fileError}>
              {isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Upload className="size-4 mr-2" />}
              Subir portada
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="cover_url_input">URL de la imagen</Label>
              <Input
                id="cover_url_input"
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://ejemplo.com/portada.jpg"
              />
              <p className="text-xs text-muted-foreground">Enlace directo a una imagen pública.</p>
            </div>
            <Button type="button" disabled={isPending || !urlValue.trim()} onClick={handleUrlSave}>
              {isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Link2 className="size-4 mr-2" />}
              Guardar URL
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
