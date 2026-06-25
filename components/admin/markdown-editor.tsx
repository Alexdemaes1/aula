'use client'

import { useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Markdown } from '@/components/markdown'
import { Bold, Italic, Heading2, List, Link2 } from 'lucide-react'

interface MarkdownEditorProps {
  name: string
  defaultValue?: string
  rows?: number
}

export function MarkdownEditor({ name, defaultValue = '', rows = 10 }: MarkdownEditorProps) {
  const [md, setMd] = useState(defaultValue)
  const ref = useRef<HTMLTextAreaElement>(null)

  function applyWrap(prefix: string, suffix: string, placeholder: string) {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = md.slice(start, end) || placeholder
    const next = md.slice(0, start) + prefix + selected + suffix + md.slice(end)
    setMd(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
    })
  }

  function applyLinePrefix(prefix: string) {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const lineStart = md.lastIndexOf('\n', start - 1) + 1
    const next = md.slice(0, lineStart) + prefix + md.slice(lineStart)
    setMd(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, start + prefix.length)
    })
  }

  function applyLink() {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = md.slice(start, end) || 'texto del enlace'
    const next = md.slice(0, start) + `[${selected}](https://)` + md.slice(end)
    setMd(next)
    requestAnimationFrame(() => el.focus())
  }

  const toolbar = [
    { icon: Bold, label: 'Negrita', onClick: () => applyWrap('**', '**', 'texto') },
    { icon: Italic, label: 'Cursiva', onClick: () => applyWrap('*', '*', 'texto') },
    { icon: Heading2, label: 'Encabezado', onClick: () => applyLinePrefix('## ') },
    { icon: List, label: 'Lista', onClick: () => applyLinePrefix('- ') },
    { icon: Link2, label: 'Enlace', onClick: applyLink },
  ]

  return (
    <div className="rounded-lg border">
      {/* Hidden input garantiza el envío aunque el panel del textarea se desmonte en "Vista previa" */}
      <input type="hidden" name={name} value={md} />
      <Tabs defaultValue="write">
        <div className="flex items-center justify-between border-b px-2 py-1.5">
          <div className="flex items-center gap-0.5">
            {toolbar.map(({ icon: Icon, label, onClick }) => (
              <Button
                key={label}
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={onClick}
                title={label}
                aria-label={label}
              >
                <Icon className="size-3.5" />
              </Button>
            ))}
          </div>
          <TabsList variant="line" className="h-7">
            <TabsTrigger value="write">Escribir</TabsTrigger>
            <TabsTrigger value="preview">Vista previa</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="p-0">
          <Textarea
            ref={ref}
            value={md}
            onChange={(e) => setMd(e.target.value)}
            rows={rows}
            placeholder="Escribe el contenido en Markdown… (**negrita**, *cursiva*, ## títulos, - listas, [enlaces](https://...))"
            className="border-0 rounded-none focus-visible:ring-0 resize-y font-mono text-sm"
          />
        </TabsContent>
        <TabsContent value="preview" className="p-4 min-h-[12rem]">
          {md.trim() ? (
            <Markdown source={md} />
          ) : (
            <p className="text-sm text-muted-foreground">Nada que previsualizar todavía.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
