import type { ReactNode } from 'react'

/**
 * Renderizador de markdown ligero, sin dependencias.
 * Parsea a elementos React (no usa dangerouslySetInnerHTML) y sanea los
 * enlaces a http(s)/mailto. Subconjunto suficiente para lecciones de texto:
 * encabezados (#, ##, ###), negrita (**), cursiva (*), código (`),
 * enlaces [t](u), listas (- / 1.), citas (>) y separadores (---).
 *
 * Es un componente sin estado ni hooks → usable en Server Components y Client.
 */

function sanitizeUrl(url: string): string | null {
  const u = url.trim()
  if (/^https?:\/\//i.test(u) || /^mailto:/i.test(u)) return u
  return null
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\*\*([^*]+?)\*\*|\*([^*]+?)\*|`([^`]+?)`|\[([^\]]+?)\]\(([^)]+?)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const key = `${keyPrefix}-${i++}`
    if (m[1] !== undefined) {
      out.push(<strong key={key}>{m[1]}</strong>)
    } else if (m[2] !== undefined) {
      out.push(<em key={key}>{m[2]}</em>)
    } else if (m[3] !== undefined) {
      out.push(
        <code key={key} className="rounded bg-muted px-1 py-0.5 text-[0.85em] font-mono">
          {m[3]}
        </code>
      )
    } else if (m[4] !== undefined && m[5] !== undefined) {
      const href = sanitizeUrl(m[5])
      out.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:no-underline">
            {m[4]}
          </a>
        ) : (
          m[4]
        )
      )
    }
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const lines = (source ?? '').replace(/\r\n?/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // Línea en blanco → separador
    if (line.trim() === '') {
      i++
      continue
    }

    // Separador horizontal
    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push(<hr key={`b${key++}`} className="my-6 border-border" />)
      i++
      continue
    }

    // Encabezados
    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1].length
      const content = renderInline(heading[2].trim(), `h${key}`)
      if (level === 1) blocks.push(<h1 key={`b${key++}`} className="text-2xl font-bold mt-6 mb-3 font-heading">{content}</h1>)
      else if (level === 2) blocks.push(<h2 key={`b${key++}`} className="text-xl font-semibold mt-6 mb-2 font-heading">{content}</h2>)
      else blocks.push(<h3 key={`b${key++}`} className="text-lg font-semibold mt-4 mb-2">{content}</h3>)
      i++
      continue
    }

    // Cita en bloque (agrupa líneas consecutivas con >)
    if (/^\s*>\s?/.test(line)) {
      const quoteLines: string[] = []
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ''))
        i++
      }
      blocks.push(
        <blockquote key={`b${key++}`} className="border-l-4 border-border pl-4 italic text-muted-foreground my-4">
          {renderInline(quoteLines.join(' '), `q${key}`)}
        </blockquote>
      )
      continue
    }

    // Lista no ordenada
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i++
      }
      blocks.push(
        <ul key={`b${key++}`} className="list-disc pl-6 space-y-1 my-3">
          {items.map((it, idx) => <li key={idx}>{renderInline(it, `ul${key}-${idx}`)}</li>)}
        </ul>
      )
      continue
    }

    // Lista ordenada
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i++
      }
      blocks.push(
        <ol key={`b${key++}`} className="list-decimal pl-6 space-y-1 my-3">
          {items.map((it, idx) => <li key={idx}>{renderInline(it, `ol${key}-${idx}`)}</li>)}
        </ol>
      )
      continue
    }

    // Párrafo (agrupa líneas consecutivas de texto)
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])
    ) {
      paraLines.push(lines[i].trim())
      i++
    }
    blocks.push(
      <p key={`b${key++}`} className="leading-relaxed my-3">
        {renderInline(paraLines.join(' '), `p${key}`)}
      </p>
    )
  }

  return <div className={className}>{blocks}</div>
}
