import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Tian Ying Fa — Tai Ji, Qi Gong y Medicina Natural'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), 'public/logo.png'))
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    (
      // Satori: todo div con varios hijos necesita display:flex explícito
      <div
        style={{
          background: '#0f2e25',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {/* Logo + nombre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <img src={logoSrc} width={72} height={72} style={{ objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'white', fontSize: '30px', fontWeight: 700 }}>
              Tian Ying Fa
            </span>
            <span style={{ color: 'rgba(185,143,53,0.8)', fontSize: '12px', letterSpacing: '4px' }}>
              CENTRO DE SALUD NATURAL
            </span>
          </div>
        </div>

        {/* Línea dorada */}
        <div style={{ display: 'flex', width: '48px', height: '2px', background: 'rgba(185,143,53,0.5)', marginBottom: '32px' }} />

        {/* Headline — dos spans en flex para evitar nodos de texto mixtos */}
        <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '760px', marginBottom: '20px' }}>
          <span style={{ color: 'white', fontSize: '54px', fontWeight: 700, lineHeight: 1.1 }}>
            Transforma tu cuerpo,&nbsp;
          </span>
          <span style={{ color: '#B98F35', fontSize: '54px', fontWeight: 700, lineHeight: 1.1 }}>
            mente y energía.
          </span>
        </div>

        {/* Subtítulo */}
        <div style={{ display: 'flex' }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '24px' }}>
            Tai Ji · Qi Gong · Meditación · Medicina Natural
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '48px', marginTop: '48px' }}>
          {[['25+', 'Años'], ['500+', 'Alumnos'], ['8', 'Disciplinas']].map(([v, l]) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#B98F35', fontSize: '28px', fontWeight: 700 }}>{v}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
