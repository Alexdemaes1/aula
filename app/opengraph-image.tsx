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
          position: 'relative',
        }}
      >
        {/* Glow sutil */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(ellipse 60% 60% at 80% 50%, rgba(185,143,53,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Logo + nombre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <img src={logoSrc} width={80} height={80} style={{ objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'white', fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px' }}>
              Tian Ying Fa
            </span>
            <span style={{ color: 'rgba(185,143,53,0.8)', fontSize: '13px', letterSpacing: '4px', textTransform: 'uppercase' }}>
              Centro de salud natural
            </span>
          </div>
        </div>

        {/* Línea separadora dorada */}
        <div style={{ width: '48px', height: '2px', background: 'rgba(185,143,53,0.5)', marginBottom: '32px' }} />

        {/* Headline */}
        <div
          style={{
            color: 'white',
            fontSize: '56px',
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: '720px',
            marginBottom: '20px',
          }}
        >
          Transforma tu cuerpo,{' '}
          <span style={{ color: '#B98F35' }}>mente y energía.</span>
        </div>

        {/* Subtítulo */}
        <div
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '24px',
            maxWidth: '640px',
          }}
        >
          Tai Ji · Qi Gong · Meditación · Medicina Natural
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '48px', marginTop: '48px' }}>
          {[
            ['25+', 'Años'],
            ['500+', 'Alumnos'],
            ['8', 'Disciplinas'],
          ].map(([v, l]) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column' }}>
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
