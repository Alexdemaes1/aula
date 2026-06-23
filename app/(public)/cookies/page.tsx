export const metadata = {
  title: 'Política de cookies',
  description: 'Política de cookies de Tian Ying Fa — qué cookies usamos y para qué.',
}

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">Política de cookies</h1>
      <p className="text-muted-foreground text-sm mb-8">Última actualización: junio de 2026</p>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">¿Qué son las cookies?</h2>
          <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Sirven para mejorar tu experiencia y recordar tus preferencias.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Cookies que usamos</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground">Cookies esenciales</p>
              <p>Necesarias para el funcionamiento de la plataforma: gestión de sesión, autenticación y seguridad. No pueden desactivarse.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Cookies de rendimiento</p>
              <p>Nos ayudan a entender cómo se usa la plataforma para mejorar su funcionamiento. Los datos son anónimos y agregados.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Control de cookies</h2>
          <p>Puedes configurar tu navegador para bloquear o eliminar cookies, aunque esto puede afectar al funcionamiento de la plataforma. Consulta la ayuda de tu navegador para más información.</p>
        </section>
      </div>
    </div>
  )
}
