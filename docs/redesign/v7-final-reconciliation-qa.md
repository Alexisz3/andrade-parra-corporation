# V7 multipage — reconciliación final

Fecha: 2026-09-08. Rama: `redesign/v7-multipage`.

## Preservación y alcance

- Base comprobada: `20fe094198980c371ca39644effb5830c6b6ab67`.
- Respaldo local: `safety/pre-astro-v7`, commit `da9f77e904c896a2f2f825a019be72cff803db44`. No subir esta rama.
- Saneamiento: `9979a73`. Mejoras visuales: `39e393c`.
- `main` se mantiene en `a56d81b8c8bedc6dca33ac383978734cc17ea84b`.
- Worktree físico `redesign/full-site` preservado en `dc0f433`, sin gitlink en el repositorio padre.
- ZIP original intacto e ignorado. Premium y cuatro fondos IA permanecen únicamente en el respaldo, fuera del runtime y de los commits de entrega.
- Retirados del nuevo árbol público: instalación de ventanas, exterior-lujo-02 y 18 imágenes WhatsApp raw. Se conservan la retirada de bano-03 y la foto 79 aprobada. Catálogo: 9 proyectos.
- Este saneamiento no modifica producción ni reescribe el historial o deployments antiguos.

## Implementación

- PageHero interno: fotografía real del catálogo, overlay espresso, panel sobrio con blur de 4px; aproximadamente 65–68svh desktop y 60svh móvil, con mínimos y crecimiento natural del contenido.
- FAQ: ocho preguntas en su ruta independiente; Header sólido desde SSR y un H1. Sin cambiar metadata o rutas.
- Featured: rail manual de hasta seis entradas del catálogo; actualmente tres destacados, sin alterar sus flags. Scroll-snap, botones de 44px, teclado, indicador localizado y sin autoplay.
- Servicios: selección por botón, hover de escritorio y observación del elemento centrado en móvil/tablet; observer y listeners con cleanup y respeto a reduced-motion.
- V7Hero original y GlobalCta conservados. Solo se amplían hit areas invisibles de los links del Hero y navegación, sin cambiar su geometría visual. El consentimiento usa su etiqueta completa como área táctil.

## Verificación reproducible

Build servido localmente en `http://127.0.0.1:4319`. Al reconstruir, iniciar un proceso nuevo de `next start` para no conservar manifiestos de assets de un build anterior.

Comandos:

```text
npm run typecheck
npm run lint
npm run check:i18n
npm run build
npm run qa:functional -- http://127.0.0.1:4319
npm run qa:axe -- http://127.0.0.1:4319
node qa/v7-interactions.mjs http://127.0.0.1:4319
node qa/v7-hitareas.mjs http://127.0.0.1:4319
```

En este equipo el shim global de npm apunta a un archivo ausente. Se ejecutaron los mismos scripts con `node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run …`, sin cambiar instalaciones ni dependencias.

Matriz visual mediante `qa/capture-pages.mjs`, etiqueta `v7-final-verified`, con:

- `QA_PAGES=home,proyectos,servicios,nosotros,preguntas,contacto,cotizacion,proceso,detalle-proyecto,servicio-detalle`.
- `QA_VIEWPORTS=360x800,375x812,390x844,430x932,1366x768,1440x900,1920x1080`.
- `QA_CAPTURE=review`: comprueba 140 escenarios ES/EN y solo guarda diez capturas para inspección humana (Home, Proyectos, Servicios, Nosotros y FAQ; 390/1440px).

El medidor de objetivos incluye etiquetas nativas y pseudo-elementos realmente clicables. Los fragmentos de la próxima tarjeta se evalúan con el ancho completo accesible al deslizar; no se confunden con botones pequeños. `v7-hitareas.mjs` verifica además los bordes con hit-testing real, y `v7-interactions.mjs` comprueba scroll, selección, teclado, breakpoints y reduced-motion en 16 escenarios.

Pruebas funcionales actualizadas a la arquitectura aprobada (FAQ independiente, cinco servicios seleccionables) y sincronizadas con hidratación observable. No se eliminan comprobaciones de navegación, formulario, privacidad o accesibilidad.

Las capturas e informes JSON quedan en `qa/shots/`, ignorado por Git. Ningún resultado de QA, ZIP o material de trabajo se publica como asset.

## Resultado local final

- Typecheck, lint, i18n y build: correctos; 347 claves por idioma, sin divergencias.
- Funcional: 93/93 comprobaciones.
- Axe: cero infracciones bloqueantes y menores en las 28 combinaciones de ruta/viewport y el menú móvil abierto.
- Interacciones: 16/16 escenarios; fotos y rutas retiradas responden 404.
- Hit-testing: los siete anchos confirman objetivos de 44px sin agrandar el Hero.
- Responsive: 140/140 escenarios, todos HTTP 200, un H1, sin overflow horizontal, errores de consola/JS, imágenes sin alt u objetivos pequeños.
- Inspección visual de Home, Proyectos, Servicios, Nosotros y FAQ en móvil y escritorio: completada.
