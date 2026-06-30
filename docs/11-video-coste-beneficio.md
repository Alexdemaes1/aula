# 11 — Vídeo propio: coste/beneficio y predicciones

> Precios **aproximados** (2026) y orientativos — **verificar** en cada proveedor antes de decidir.
> Objetivo: ayudarte a elegir cuándo y cómo alojar **vídeo propio** en vez de YouTube.

## Situación actual
- **Vídeo**: hoy va por **YouTube** → gratis, pero el enlace es **público y compartible** (lo que queremos evitar).
- **Audio**: **ya implementado** con Supabase Storage privado (URLs firmadas que caducan, solo matriculados). **Funciona en el plan gratuito** (un mp3 de 30 min ≈ 25–35 MB).
- La arquitectura quedó **agnóstica al proveedor** (`lessons.media_provider`): cambiar el alojamiento del vídeo más adelante es un cambio pequeño, no una reescritura.

## Por qué el vídeo cuesta dinero (y el audio casi no)
El vídeo pesa mucho y, sobre todo, **el coste real está en el "egress"** (los GB que se descargan cada vez que un alumno reproduce). El plan **gratuito de Supabase no sirve para vídeo de verdad**: máx **50 MB/archivo**, **1 GB** total y **5 GB de egress/mes**.

**Supuestos para los cálculos** (1080p bien comprimido ≈ **1,5 GB/hora**):
- **A — Arranque**: 3 cursos (~9 h ≈ 14 GB) · 30 alumnos/mes viendo ~3 h ⇒ **~135 GB egress/mes**.
- **B — Crecimiento**: 8 cursos (~24 h ≈ 36 GB) · 150 alumnos/mes ⇒ **~675 GB egress/mes**.
- **C — Consolidado**: 15 cursos (~45 h ≈ 68 GB) · 500 alumnos/mes ⇒ **~2,25 TB egress/mes**.

## Opciones y coste estimado (€/mes)

| Opción | A (arranque) | B (crecimiento) | C (consolidado) | Notas |
|---|---|---|---|---|
| **YouTube no listado** | 0 € | 0 € | 0 € | Gratis, pero **el enlace se puede compartir** (lo que quieres evitar). Statu quo. |
| **Supabase Pro** | ~25 € | ~63 € | ~205 € | Todo en uno, sin cuentas nuevas. Incluye 100 GB + 250 GB egress; **el egress dispara el coste** al crecer (~0,09 €/GB extra). |
| **Cloudflare R2** | **~0 €** | **~0,4 €** | **~0,9 €** | 👑 **El más barato**: 10 GB almacenamiento gratis y **egress siempre GRATIS**. Solo almacenamiento (servir mp4 con URL prefirmada). Sin streaming adaptativo. Requiere cuenta Cloudflare. |
| **Bunny Stream** | ~1,5 € | ~7 € | ~23 € | Hecho para esto: **HLS adaptativo + marca de agua + tokens** nativos. Muy barato. Requiere cuenta Bunny. |
| **Cloudflare Stream** | ~8 € | ~34 € | ~104 € | Igual que Bunny en prestaciones; precio por minutos almacenados/entregados (sube rápido con muchas vistas). |

*(Cálculos: Supabase Pro 25 $ base + 0,09 $/GB egress sobre 250 incl · R2 0,015 $/GB-mes, egress 0 · Bunny ~0,005 $/GB almacenamiento + ~0,01 $/GB entrega · Stream 5 $/1000 min almacenados + 1 $/1000 min entregados.)*

## Beneficios de tener vídeo propio (vs YouTube)
- **Sin enlace público**: solo lo ven matriculados, con URLs que **caducan** → adiós al "toma, mira este link".
- **Marca de agua con el email** del alumno → disuade compartir grabaciones.
- **Control total**: sin recomendaciones de YouTube, sin anuncios, sin marca de YouTube, contenido bajo tu dominio.
- **Reproductor a tu medida** (sin botón de descarga, sin clic derecho, sin PiP).

> **Importante (honestidad)**: ninguna opción impide al 100 % que alguien **grabe la pantalla**. Lo que se elimina es el **compartir fácil**; la marca de agua es la disuasión real.

## Recomendación
- **Ahora**: usa **audio en Supabase** (ya hecho, **0 €**). Para meditaciones/audio es perfecto.
- **Cuando metas vídeo de verdad**, según prioridad:
  - **Prima el coste** → **Cloudflare R2** (≈ gratis; egress gratis para siempre). Es la opción más rentable con diferencia para vídeo de un centro pequeño/mediano.
  - **Prima la experiencia y la seguridad** (streaming adaptativo, marca de agua, DRM ligero) por poco dinero → **Bunny Stream** (~1,5–23 €/mes según escala).
  - **Comodidad de no abrir cuentas nuevas** → **Supabase Pro** (25 €/mes base; vigila el egress al crecer).
- **YouTube** queda como alternativa gratis solo si aceptas que el enlace sea compartible.

**Veredicto en una frase**: para vídeo propio barato y privado, **Cloudflare R2** es la mejor relación coste/privacidad; **Bunny Stream** si quieres lo más “pro” por unos euros. El código ya está preparado para enchufar cualquiera de los dos con poco esfuerzo.
