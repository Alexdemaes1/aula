export const metadata = {
  title: 'Términos de uso',
  description: 'Términos y condiciones de uso de la plataforma Aula.',
}

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">Términos de uso</h1>
      <p className="text-muted-foreground text-sm mb-8">Última actualización: junio de 2026</p>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Aceptación de los términos</h2>
          <p>Al acceder y usar Aula, aceptas estos términos de uso. Si no estás de acuerdo, no debes usar la plataforma.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. Acceso a los cursos</h2>
          <p>Al adquirir un curso obtienes acceso vitalicio para uso personal y no transferible. Queda prohibida la distribución, reventa o compartición de credenciales.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Propiedad intelectual</h2>
          <p>Todo el contenido de los cursos (vídeos, PDF, materiales) está protegido por derechos de autor y pertenece a sus respectivos autores e instructores.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Política de reembolso</h2>
          <p>Tienes derecho a solicitar un reembolso completo dentro de los 14 días siguientes a la compra, siempre que no hayas completado más del 20% del curso.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Limitación de responsabilidad</h2>
          <p>Aula proporciona el contenido con fines educativos. No somos responsables de los resultados individuales derivados del aprendizaje.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Modificaciones</h2>
          <p>Nos reservamos el derecho a modificar estos términos. Los cambios significativos se comunicarán por email con al menos 30 días de antelación.</p>
        </section>
      </div>
    </div>
  )
}
