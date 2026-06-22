'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { uploadCoverAction } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface CoverUploadProps {
  courseId: string
  currentUrl: string | null
}

export function CoverUpload({ courseId, currentUrl }: CoverUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
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

  return (
    <div className="space-y-4">
      {preview && (
        <div className="aspect-video relative rounded-xl overflow-hidden border">
          <Image src={preview} alt="Portada del curso" fill className="object-cover" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="cover">Imagen de portada</Label>
          <Input
            id="cover"
            name="cover"
            type="file"
            accept="image/*"
            required
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground">JPG, PNG o WebP. Máximo 5 MB. Ratio 16:9 recomendado.</p>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Upload className="size-4 mr-2" />}
          Subir portada
        </Button>
      </form>
    </div>
  )
}
