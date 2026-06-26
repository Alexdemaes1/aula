import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tian Ying Fa — Cursos online',
    short_name: 'Tian Ying Fa',
    description: 'Cursos online de Tai Ji Quan, Qi Gong, meditación y medicina natural',
    start_url: '/',
    display: 'standalone',
    background_color: '#16241F',
    theme_color: '#16241F',
    lang: 'es',
    dir: 'ltr',
    orientation: 'any',
    icons: [
      {
        src: '/favicon-512.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
