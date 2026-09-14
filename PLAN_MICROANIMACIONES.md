# Plan de micro-animaciones — Andrade Parra Corporation

Estado: **MVP + Fase 2 + Fase 3 (barra de progreso) implementados en local, sin desplegar.**
- MVP: 1.1 (transición entre páginas, `components/PageTransition.tsx`), 1.4 (reduced-motion/compat), 2.1 (scroll-reveal sin JS, clase `.v7-scroll-reveal`), 2.2 (feedback de botones/tarjetas).
- Fase 2: 1.2 (crossfade del filtro de categoría en `/proyectos`, `V7ProjectLibrary.tsx`), 1.3 (morph de la miniatura a la foto de portada del detalle — el FAQ y el acordeón de Servicios YA tenían su propia animación de apertura de antes, no hizo falta tocarlos), 2.3 (pulso del botón flotante de WhatsApp) y 2.4 (indicador de "enviando" en el formulario de cotización, sin fingir un progreso que no se mide).
- 1.3 completo: la foto de portada y las fotos de la galería de la ficha de un proyecto (`ZoomableImage.tsx` / `Lightbox.tsx`) ahora también se transforman al abrir el visor, no solo al navegar entre páginas. Quedó fuera, a propósito, el mismo efecto para la lupa suelta de las tarjetas de `/proyectos` (`ZoomButton.tsx`): la foto vive en el componente padre, no en el botón, y resolverlo bien pide reestructurar esa relación — más riesgo del que valía la pena para hoy.
- Fase 3 (2026-09-15): se eligió la opción simple de las dos que planteaba este documento — barra de progreso de scroll en rojo de marca, fija arriba de todo el sitio (`components/ScrollProgress.tsx`). La idea de la "cinta métrica" sobre las fotos queda sin hacer, disponible si se quiere retomar más adelante.
- **Además, fuera del plan**: se rediseñó la galería de `/proyectos` completa a pedido del cliente sobre una referencia visual (tarjetas lado a lado con scroll nativo en vez del riel horizontal original) y se corrigió un bug de traducción preexistente y sin relación (`t.raw()` en el contador del comparador antes/después de `/proyectos`). Ver `V7ProjectLibrary.tsx` y `app/[locale]/projects/page.tsx`.
Objetivo del cliente: darle "vida" al sitio, algo distinto a una página de constructora genérica, con énfasis en que **cambiar de página no se sienta como un salto seco** ("no salga de una, pum"), sino como una transición con intención.

---

## 0. Lo que ya existe (para no reinventar)

El proyecto ya tiene más infraestructura de animación de la que parece a simple vista — el plan se apoya en esto, no lo reemplaza:

- `app/globals.css` ya define keyframes reutilizables: `v7-rise` (aparecer + subir), `v7-crossfade`, `v7-progress`, `v7-faq-open`, `v7-hero-kenburns/enter/fade`, `v7-cue-drift`.
- `.v7-reveal-in` ya se usa (p. ej. `V7Hero.tsx`) para el "aparecer" inicial de una sección.
- **Ya existe un bloque global `@media (prefers-reduced-motion: reduce)`** que anula el movimiento — este plan tiene que seguir respetándolo sin excepción. La suite `qa/axe.mjs` / `qa/functional.mjs` ya verifica "contenido visible de inmediato" con movimiento reducido; cualquier animación nueva tiene que pasar por ese mismo criterio antes de darse por terminada.
- **`framer-motion` ya está instalado** (`package.json`) pero no se usa en ningún componente todavía — es una dependencia disponible, no hay que decidir si se instala.
- El proyecto corre **Next.js 16 con React 19 (canary vía App Router)**, lo que significa que tiene disponible **`<ViewTransition>` de React de forma nativa**, integrado con la View Transitions API del navegador — sin instalar nada. Esto es justo la pieza que falta para el efecto de "cambio de sección" que pediste. Documentado en `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` (lo leí completo para armar este plan).

**Decisión de arquitectura clave:** usar `<ViewTransition>` nativo para las transiciones *entre páginas*, y `framer-motion` (ya instalado) para micro-interacciones *dentro* de una página donde hace falta más control (hover, drag, números, stagger de listas). No mezclar una tercera librería.

---

## 1. Transiciones entre páginas (esto es lo que pediste explícitamente)

Hoy no existe ningún `template.tsx` en `app/[locale]/` — solo `layout.tsx`, que persiste entre navegaciones. Para que algo se anime *en cada cambio de ruta* hace falta envolver el contenido en `<ViewTransition>` dentro de cada `page.tsx` (los layouts no disparan enter/exit).

### 1.1 — Deslizamiento direccional entre secciones del menú
Cuando el visitante navega Inicio → Proyectos → Servicios, etc. (los links del nav principal en `Header.tsx` / `MobileMenu.tsx`):
- El contenido saliente se desliza y se desvanece levemente hacia un lado; el entrante llega desde el otro lado.
- El **header se ancla** (no se mueve, no parpadea) — patrón "Anchoring the header" de la guía, usando `viewTransitionName` en `Header.tsx`.
- Dirección: como es un menú plano (no hay jerarquía "padre/hijo" clara entre Inicio/Proyectos/Servicios/Nosotros/Contacto), la opción más simple y honesta es una sola dirección consistente (ej. entra desde la derecha) en vez de fingir "adelante/atrás" — se puede refinar más adelante si se quiere jerarquía real.
- Duración: 150ms salida / ~400ms entrada (los valores que trae la guía ya están pensados para sentirse rápido, no lento ni mareante).

**Archivos a tocar:** cada `page.tsx` en `app/[locale]/` (envolver el contenido principal), `Header.tsx` (anclar), `globals.css` (nuevos keyframes `nav-forward`/`nav-back` estilo guía, con nombres propios de marca en vez de genéricos).

### 1.2 — Cambios dentro de la misma ruta (crossfade, no slide)
Casos donde la URL no cambia de "sección" pero el contenido sí — un slide direccional aquí se sentiría mal, lo correcto es un crossfade:
- Filtro de categoría en `/proyectos` (`categoria=...` por query, visto en la suite de QA).
- Acordeón de servicios (`/servicios`).
- Abrir/cerrar preguntas del FAQ.

**Patrón:** `<ViewTransition key={valorQueCambia}>` con `share="auto" enter="auto"` (el crossfade automático de React, sin CSS a medida).

### 1.3 — La pieza más "wow" y de menor riesgo: morph de imagen en el Lightbox y en Proyectos
Ya existe `components/Lightbox.tsx` y una cuadrícula de proyectos con miniaturas que abren tanto un lightbox como el detalle del proyecto (`/proyectos/[slug]`). Este es el caso de uso *de libro* para "shared element morphing": la miniatura no desaparece y reaparece — **se convierte** en la foto grande, en el mismo lugar visual donde el usuario puso el ojo.
- Miniatura en `V7FeaturedProjects` / grid de `/proyectos` y la foto del detalle en `/proyectos/[slug]` comparten un `<ViewTransition name={`project-${slug}`}>`.
- Mismo patrón para abrir el Lightbox: la miniatura se convierte en la imagen ampliada del modal.
- Esto no compite con nada existente — el Lightbox ya maneja foco/teclado/scroll-lock correctamente (verificado en QA), solo se le agrega la transición visual.

**Impacto esperado:** es probablemente el cambio que más se va a "sentir" distinto a cualquier otra página de constructora — la mayoría no tiene esto.

### 1.4 — Accesibilidad y compatibilidad de esta fase
- El bloque `@media (prefers-reduced-motion: reduce)` ya existente se extiende para incluir `::view-transition-*` (la guía trae el snippet exacto).
- Sin soporte de navegador (Safari viejo, Firefox viejo), la app **sigue funcionando normal** — la navegación simplemente no anima, no hay fallback que programar a mano.
- `pointer-events: none` en `::view-transition` para que un clic durante la animación no se pierda (viene en la guía, hay que aplicarlo).

---

## 2. Micro-animaciones dentro de cada página

Esto es lo que le da textura al "vivo" que pediste, más allá del cambio de página:

1. **Generalizar el scroll-reveal.** Hoy el `.v7-reveal-in` solo se ve en el hero de Inicio. Proponer un patrón reutilizable (`IntersectionObserver` + clase, o el `whileInView` de `framer-motion`) para que secciones/tarjetas aparezcan con un `v7-rise` sutil al entrar en viewport, en Proyectos, Servicios, Nosotros — con `stagger` (retraso escalonado) en listas de tarjetas para que no aparezcan todas a la vez.
2. **Botones y tarjetas con feedback de intención**, no solo `:hover` de color: un `scale(0.97)` breve en `:active` de los botones píldora que acabamos de rediseñar, ligera elevación (`translateY`) en tarjetas de proyecto/servicio al pasar el mouse.
3. **Iconos de contacto con un pulso sutil** — el botón flotante de WhatsApp (`WhatsAppIcon` en `V7EditorialSections.tsx` / el flotante mencionado en las capturas) con una animación de "respiración" muy leve, para que no se sienta un elemento estático más.
4. **Formulario de cotización** (`QuoteShell.tsx`): el estado `submitState === "sending"` ya existe (lo construimos para el canal de correo) — hoy solo cambia texto del botón; se le puede agregar un spinner o barra de progreso animada (`v7-progress` ya existe en CSS, sin usar todavía) para que "enviando..." se sienta activo, no congelado.
5. **Contador animado** en cifras si el sitio muestra alguna (años de experiencia, proyectos completados, etc. — revisar si existe en Nosotros/Home) — números que suben de 0 al valor real al entrar en viewport. Detalle pequeño pero muy típico de sitios "vivos".

---

## 3. Un detalle de marca propio (diferenciador real)

Lo pedido es "algo nuevo y distinto a otras páginas" — un scroll-reveal genérico ya lo tiene medio internet. Una idea concreta y con identidad, ligada a la marca (rojo/negro, construcción):
- **Barra de progreso de lectura/scroll** en rojo de marca, delgada, fija arriba (ya existe el keyframe `v7-progress` sin usar) — común en editorial, poco común en sitios de construcción, y conecta con el rojo que ya reforzamos en el eyebrow.
- Alternativa más específica al rubro: un **cursor/indicador tipo "medición"** (línea + tick marks, evocando una cinta métrica) al pasar sobre las fotos de proyectos en el before/after o en la galería — más trabajo, mayor riesgo, se puede dejar como "fase 3, opcional" para no comprometer la fecha de mañana.

---

## 4. Fases y qué es realista para mañana

| Fase | Contenido | Riesgo | ¿Cabe para mañana? |
|---|---|---|---|
| **MVP (1 día)** | 1.1 (slide entre secciones) + 1.4 (reduced-motion/compat) + 2.1 (scroll-reveal generalizado) + 2.2 (feedback en botones/tarjetas) | Bajo — son patrones ya usados en el proyecto o copiados literal de la guía oficial de Next | **Sí**, es el alcance recomendado para desplegar mañana |
| **Fase 2** | 1.2 (crossfade filtros/FAQ) + 1.3 (morph de imágenes en Proyectos/Lightbox) + 2.3/2.4 (iconos, spinner del formulario) | Medio — el morph necesita probarse bien en Safari/iOS (ver nota de compatibilidad) | Mejor no apurarlo, se prueba con calma después del MVP |
| **Fase 3** | Sección 3 completa (detalle de marca tipo "cinta métrica", contador animado) | Bajo impacto técnico pero es diseño nuevo desde cero, no una receta de la guía | Queda para cuando el resto esté validado |

**Recomendación:** implementar el MVP hoy/mañana temprano, correr `npm run typecheck / lint / build / qa:functional / qa:axe` (igual que con cada cambio anterior de esta sesión), probarlo contigo en el preview de Vercel, y **recién ahí decidir si se despliega** — no tocar producción sin que lo veas primero, como hemos hecho hasta ahora.

---

## 5. Cómo se va a validar (mismo criterio que el resto del proyecto)

- `npm run typecheck`, `npm run lint`, `npm run build` — igual que cada cambio anterior.
- `npm run qa:functional` y `npm run qa:axe` — ya cubren foco, teclado y "movimiento reducido"; cualquier animación nueva tiene que seguir pasando esto en 0 violaciones, no es opcional.
- Prueba manual en el navegador (como hemos hecho con cada feature) en móvil y escritorio, en al menos Chrome y Safari por la nota de compatibilidad de la View Transitions API.
- Nada se despliega a Vercel/producción sin pasar por ahí primero, igual que el resto de esta sesión.

---

## 6. Preguntas abiertas para cuando retomemos esto

1. ¿La dirección del slide entre secciones te importa (ej. que siga un orden del menú), o con que "algo se mueva" al cambiar de página ya cumple la idea?
2. Para el "detalle de marca" (sección 3): ¿prefieres la barra de progreso roja (simple, rápida) o algo más elaborado tipo cinta métrica (más trabajo, más distintivo)?
3. ¿El morph de imágenes (proyecto → detalle/lightbox) es prioridad para el primer despliegue, o se puede dejar para una segunda pasada una vez que el resto esté probado?
