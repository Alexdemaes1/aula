import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tian Ying Fa — Cursos online',
    short_name: 'Tian Ying Fa',
    description: 'Cursos online de Tai Ji Quan, Qi Gong, meditación y medicina natural',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#0f2e25',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
