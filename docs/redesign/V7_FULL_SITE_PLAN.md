# Andrade Parra Corporation — Plan de rediseño completo (V7 "Warm Craft", sitio entero)

## 0. Qué encontré antes de escribir esto

Antes de proponer nada, audité lo que ya existe, porque hay más trabajo en curso del que el pedido sugería:

- Existe una dirección de diseño **ya aprobada**: `docs/redesign/V7_IMPLEMENTATION_BRIEF.md`, con un prototipo HTML de referencia (`docs/redesign/v7-reference.html`) y un sistema de clases `.v7-*` completo en `app/globals.css` (paleta, tipografía, header, hero, proyectos, servicios, craft, about, FAQ, contacto, masthead interior, CTA final — todo ya escrito y coherente, con accesibilidad — objetivos táctiles de 44px, foco visible, `prefers-reduced-motion` — resuelta desde el CSS).
- Esa dirección **ya está parcialmente implementada** en la rama `redesign/v7-multipage`, con commits reales: home V7 completo, un proyecto de baño revisado añadido a `content/projects.ts`, y la extensión a más páginas en curso pero sin comitear.
- Encontré **dos ramas de respaldo** de iteraciones previas: `redesign/v7-final` (base del brief) y `backup/v7-onepage`. Existe también `redesign-v2`, una exploración distinta (paleta navy/rojo) que dejé pausada en una sesión anterior — no tiene relación con V7 y no la toco aquí.
- Rescaté el trabajo sin comitear que había en `redesign/v7-multipage` (vía `git stash`, sin perder nada) y creé esta rama, **`redesign/full-site`**, desde ahí — para no reiniciar de cero un sistema que ya es sólido y ya fue aprobado.
- **Aviso importante:** mientras revisaba el árbol de trabajo detecté un cambio nuevo apareciendo en vivo en `components/home/V7ProjectLibrary.tsx` (un botón de zoom en las tarjetas de proyecto) — alguien más (otra sesión, o tú en paralelo) está editando el mismo directorio ahora mismo. No he comiteado nada todavía por esto: prefiero que confirmes que es seguro antes de fijar un punto de partida.

**Buena noticia sobre integridad de contenido:** verifiqué que la V7 ya resuelve el problema que habíamos marcado en `redesign-v2` — el hero ya no usa ninguna imagen generada por IA (`home-architecture.png` no aparece en ningún componente); usa solo fotos reales de `content/projects.ts`. El brief además prohíbe explícitamente imágenes de stock/IA, años inventados, reseñas, licencias, garantías o direcciones no confirmadas — exactamente la regla que ya seguíamos.

## 1. Sistema de diseño (heredado, no lo reinvento)

| | |
|---|---|
| **Dirección** | Cálida, táctil, editorial — portafolio de construcción con fotografía real como protagonista, no un dashboard. |
| **Color** | Espresso `#171512` / `#211E1A` (fondo oscuro), Plaster `#F4F0E8` / Paper `#FCFAF6` (fondo claro), Sand `#B8AA99`, Muted `#665F58`, Amber `#F5871F` (acción), Clay `#D9782D`, texto de acento accesible `#A95316`, WhatsApp oficial `#25D366`. |
| **Tipografía** | Source Sans 3 (UI y cuerpo), Newsreader en cursiva para énfasis editorial puntual, Barlow Condensed para metadatos y etiquetas pequeñas. |
| **Logo** | El oficial existente. No se redibuja. |
| **Motion** | Restringido: crossfade de hero (~800ms), zoom sutil, transiciones de 200-250ms en hover. Todo se apaga con `prefers-reduced-motion`. |

Ya está escrito en `app/globals.css` como clases `.v7-*` reutilizables (header, hero, proyectos, servicios, craft, about, FAQ, contacto, CTA, masthead interior). No propongo tocar la paleta ni la tipografía — están bien resueltas y ya verificadas visualmente en home.

## 2. Estado real por página (verificado archivo por archivo, no supuesto)

| Ruta | Estado | Qué falta |
|---|---|---|
| **Home** `/` | ✅ V7 completo: `V7Hero` (rotación de proyectos reales), `TrustBar`, `V7FeaturedProjects`, `V7ServicesPreview`, `V7AboutPreview`, `V7HomeCta` | Nada estructural — solo entra en la ronda de verificación final |
| **Nosotros** `/about` | ✅ `PageHero` + `V7Craft` + `V7About` | Revisar copy contra `content/company.ts` (¿usa placeholder honesto porque `COMPANY_STORY` sigue en `null`?) |
| **Contacto** `/contact` | ✅ `V7Contact` (modo página) + `V7Faq` | — |
| **Proyectos** `/projects` | ✅ `PageHero` + `V7ProjectLibrary` (con el botón de zoom que se está añadiendo ahora mismo) | — |
| **Servicios** `/services` | ✅ `PageHero` + `V7Services` | — |
| **Cotización** `/quote` | 🟡 Solo el masthead (`v7-quote-intro`) tocado; el formulario debajo sigue con su diseño Tailwind clásico | Decidir si el formulario necesita re-vestirse o si su diseño funcional actual (ya probado, con la lógica de canal WhatsApp/correo) se deja intacto y solo se ajusta el masthead — **mi recomendación: no tocar el formulario**, es lógica sensible ya verificada; alinear solo tipografía/espaciados de alrededor |
| **Proceso** `/process` | ❌ Sin tocar. Usa `PageHero` (ya en V7) + `ProcessTimeline` (Tailwind clásico) + `CtaBand` | Migrar `ProcessTimeline` al lenguaje editorial (numeración tipo Newsreader/mono, como `.v7-craft-copy ol` o `.v7-about-story ul`) |
| **Detalle de proyecto** `/projects/[slug]` | ❌ Sin tocar. Tailwind clásico, pero con los tokens de color correctos (hereda la paleta V7 automáticamente) | Es la página con más contenido condicional del sitio (scope, workCompleted, result, antes/después — todos opcionales, ya modelados en `content/projects.ts`). Migrar su tipografía y estructura de sección al lenguaje `.v7-*`, sin tocar la lógica condicional que ya respeta "dato ausente → sección ausente" |
| **Detalle de servicio** `/services/[slug]` | ❌ Sin tocar. Mismo caso: tokens correctos, estructura Tailwind clásica | Migrar al lenguaje editorial; mantiene intacta la lógica de "proyectos relacionados" derivada de `relatedProjectCategories` |
| **Privacidad** `/privacy`, **Términos** `/terms` | ⚪ No se sirven — devuelven 404 a propósito porque `PRIVACY_POLICY`/`TERMS` son `null` en `content/legal.ts` (decisión ya documentada: un texto legal a medias es peor que ninguno) | No es tarea de diseño. Cuando exista el texto real, aplicar el mismo tratamiento tipográfico simple que ya tienen (heredan los tokens correctos); no requiere masthead V7 — es contenido legal, no editorial |
| **404 / catch-all** `[...rest]` | ⚪ Sin auditar en esta pasada | Revisar en la ronda de verificación general |

## 3. Componentes compartidos

| Componente | Estado | Acción |
|---|---|---|
| `Footer.tsx` | Clases Tailwind clásicas — hereda los colores V7 correctos vía tokens, pero no tiene el lenguaje tipográfico editorial del resto del sitio ya migrado | Alinear estructura/tipografía al sistema `.v7-*` (es lo último que se ve en cada página — debe sentirse parte del mismo sitio) |
| `MobileContactBar.tsx` | Igual que Footer: colores correctos, estructura pre-V7 | Alinear al mismo lenguaje, cuidando que siga siendo el patrón de contacto rápido en móvil que ya funciona |
| `PageHero.tsx` | ✅ Ya usa `.v7-page-hero` | — |
| `Header.tsx` / `MobileMenu.tsx` | ✅ Ya en V7 (en el diff sin comitear) | Entra en verificación final |

## 4. Limpieza: código muerto confirmado

Verifiqué que estos 4 archivos **ya no los importa nada** desde que V7 reemplazó al home anterior:

- `components/home/HomeHero.tsx` (100 líneas)
- `components/home/FeaturedProjects.tsx` (48 líneas)
- `components/home/ServiceCards.tsx` (78 líneas)
- `components/home/ValueProps.tsx` (49 líneas)

Propongo eliminarlos en la misma pasada — dejarlos invita a que alguien los reconecte por error o se confunda sobre cuál es la fuente de verdad visual.

## 5. Lo que NO toco

- La lógica de negocio: asignación de contacto WhatsApp, envío por correo, validación del formulario de cotización, JSON-LD, i18n, slugs localizados, `content/*.ts` como fuente de datos.
- Las reglas de contenido ya establecidas: nada de licencias, años, conteos, garantías, direcciones o reseñas sin confirmar por escrito.
- La rama `redesign-v2` (paleta navy/rojo) — queda aparte, sin relación con este plan.

## 6. Orden de trabajo propuesto

1. **Confirmar contigo** que es seguro fijar un punto de partida (por el cambio en vivo detectado en `V7ProjectLibrary.tsx`).
2. Terminar las páginas a medias: revisar y comitear about/contact/projects/quote/services tal como están, verificadas.
3. Migrar `/process` (`ProcessTimeline`) al lenguaje editorial.
4. Migrar `/projects/[slug]` (la página más compleja) preservando toda su lógica condicional.
5. Migrar `/services/[slug]`.
6. Alinear `Footer.tsx` y `MobileContactBar.tsx`.
7. Eliminar los 4 componentes huérfanos.
8. Verificación completa: `typecheck`, `lint`, `check:i18n`, `build`, `qa:functional`, `qa:axe`, y revisión visual en 375/390 (móvil) y 1440 (escritorio) de cada ruta.
9. Un solo PR desde `redesign/full-site` hacia `main`, para tu revisión — sin mergear sin tu aprobación.

Un componente/página a la vez, con verificación antes de pasar al siguiente, como hemos venido trabajando.
