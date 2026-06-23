export const metadata = {
  title: 'Política de privacidad',
  description: 'Política de privacidad de Aula — cómo tratamos tus datos personales.',
}

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
      <h1 className="text-3xl font-bold mb-8">Política de privacidad</h1>
      <p className="text-muted-foreground text-sm mb-8">Última actualización: junio de 2026</p>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Responsable del tratamiento</h2>
          <p>Aula es el responsable del tratamiento de tus datos personales recogidos a través de esta plataforma.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. Datos que recopilamos</h2>
          <p>Recogemos los datos que tú mismo nos proporcionas al registrarte (nombre, email) y los datos de uso generados al interactuar con los cursos (progreso de lecciones).</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Finalidad del tratamiento</h2>
          <p>Utilizamos tus datos para gestionar tu cuenta, procesar pagos, enviarte información sobre tus cursos y mejorar nuestros servicios.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Base jurídica</h2>
          <p>El tratamiento se basa en la ejecución del contrato de prestación de servicios que aceptas al registrarte, y en el consentimiento explícito para comunicaciones comerciales.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Conservación de datos</h2>
          <p>Conservamos tus datos mientras mantengas una cuenta activa. Si solicitas la eliminación de tu cuenta, borraremos tus datos en un plazo de 30 días.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Tus derechos</h2>
          <p>Tienes derecho a acceder, rectificar, suprimir y portabilizar tus datos. Para ejercerlos, escríbenos a través del formulario de contacto.</p>
        </section>
      </div>
    </div>
  )
}
