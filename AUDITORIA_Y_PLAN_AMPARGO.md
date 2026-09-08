# AMPARGO — Auditoría, rediseño e implementación

> **Documento vivo.** Al reanudar una sesión, leer en este orden:
> `AGENTS.md` → este archivo → `docs/design-references/README.md` → estado del repositorio.

**Última actualización:** rediseño Concepto A + arquitectura multipágina bilingüe
**Estado:** implementación local terminada en lo desbloqueado · **lanzamiento bloqueado por dependencias externas**

---

## 1. Qué es este proyecto ahora

Sitio **multipágina** bilingüe para AMPARGO (construcción y remodelación, Houston TX),
siguiendo la dirección de arte aprobada **Concepto A — Monolithic Editorial**.

Sustituye a la versión anterior, que era una **landing de una sola página** con i18n
solo de cliente. Los archivos de aquella versión no se borraron: están respaldados
fuera del árbol del proyecto (ver §9).

---

## 2. Stack verificado

| Componente | Versión | Nota |
|---|---|---|
| Next.js | **16.3.2** | Turbopack por defecto; `proxy.ts` sustituye a `middleware.ts` |
| React | 19.2.8 | |
| next-intl | **4.13.7** | Compatibilidad confirmada: `peerDependencies` declara `next@^16.0.0` y `react@^19.0.0` |
| Tailwind CSS | 4.3.3 | Tokens en `@theme`, sin `tailwind.config.js` |
| Framer Motion | 11.18.2 | Presente; el hero actual no lo necesita |
| Playwright | 1.62.1 | Solo QA |

---

## 3. Bloqueo operativo: Git apunta al perfil del usuario

```
$ git rev-parse --show-toplevel
C:/Users/kevin          ← el perfil completo, no el proyecto
```

Comprobado de nuevo en esta sesión: **sigue vigente.** El repositorio abarca `.ssh/`,
`.claude.json`, `AppData/`. Un `git add -A` prepararía claves privadas para el commit.

**Regla aplicada:** cero commits, cero `reset`, `clean`, `checkout` o `add`. Todo el
trabajo se hizo por edición directa de archivos.

**Acción pendiente, que debe hacer una persona:** `git init` dentro de la carpeta del
proyecto para aislar el versionado. No lo he hecho porque solo el usuario sabe si el
repositorio del perfil es intencional.

---

## 4. Arquitectura implementada

### 4.1 Rutas multipágina bilingües

Registro único en `i18n/routing.ts`: de ahí salen la navegación, el canonical,
los `hreflang` y el sitemap. Si divergieran, `npm run check:i18n` lo detecta.

| Propósito | Español | Inglés |
|---|---|---|
| Inicio | `/es` | `/en` |
| Servicios | `/es/servicios` | `/en/services` |
| Proyectos | `/es/proyectos` | `/en/projects` |
| Detalle de proyecto | `/es/proyectos/[slug]` | `/en/projects/[slug]` |
| Proceso | `/es/proceso` | `/en/process` |
| Nosotros | `/es/nosotros` | `/en/about` |
| Cotización | `/es/cotizacion` | `/en/quote` |
| Contacto | `/es/contacto` | `/en/contact` |
| Legales (borrador, `noindex`) | `/es/privacidad`, `/es/terminos` | `/en/privacy`, `/en/terms` |

**Locales internos** `es-US` / `en-US`; **prefijos públicos** `/es` y `/en`.

> **Detalle que costó una depuración:** los prefijos personalizados **deben llevar
> barra inicial** (`/es`, no `es`). Sin ella, next-intl no reconoce el prefijo, el
> proxy le antepone el idioma por defecto y se produce un bucle infinito
> (`/en/es` → `/en/en/es` → …). Verificado con `curl -L`, que devolvió HTTP 431.

### 4.2 Idioma por defecto — decisión pendiente del cliente

`DEFAULT_LOCALE = "en-US"` en `i18n/routing.ts`. Es una **hipótesis de trabajo**, no una
decisión cerrada: Houston es bilingüe y el cliente no lo ha confirmado. Cambiar esa
única línea reconfigura el sitio entero; el comportamiento está probado en ambos sentidos.

### 4.3 Precedencia de idioma (probada)

1. Prefijo explícito en la URL (`/en/...`) — gana siempre
2. Cookie `AMPARGO_LOCALE` de una elección previa
3. Cabecera `Accept-Language`
4. `DEFAULT_LOCALE`

### 4.4 Server Components por defecto

Solo son cliente los que necesitan interactividad: `Header`, `MobileMenu`,
`LocaleSwitcher`, `QuoteShell` y sus hijos. Las páginas, el hero, las tarjetas de
proyecto, el proceso, el footer y los datos estructurados son Server Components:
**no pagan hidratación y el diccionario completo no viaja al navegador**, que era
un defecto de la arquitectura anterior.

---

## 5. Sistema de diseño (Concepto A)

Tokens en `app/globals.css` (`@theme`). Contraste medido, no estimado:

| Par | Ratio | Uso |
|---|---|---|
| `ink` sobre `paper` | 15,24:1 | Texto principal |
| `muted` sobre `paper` | 4,92:1 | Texto secundario ✔ AA |
| `bone` sobre `carbon` | 17,13:1 | Texto sobre superficies oscuras |
| `accent` sobre `paper` | 4,65:1 | Vale como texto ✔ |
| `accent` sobre `carbon` | **3,46:1** | ✘ **No vale como texto** → existe `accent-ink` |
| `bone` sobre `accent` | 4,94:1 | Texto del botón principal ✔ |

### Contraste del hero — el fallo más grave que encontré y corregí

Los velos del hero llevaban `-z-10`, que los enviaba **detrás de la fotografía**:
el degradado no se aplicaba en absoluto.

| Momento | Titular (peor píxel) | Subtítulo |
|---|---|---|
| Con `-z-10` (roto) | **1,08:1** ✘ | 1,07:1 ✘ |
| Sin `-z-10`, velo fuerte | 10,47:1 | 15,52:1 — pero apagaba la foto |
| **Calibrado final** | **5,33:1** ✔ | **12,31:1** ✔ |

El mínimo para texto grande es 3:1. La medición se hace sobre los **píxeles reales
de la fotografía** bajo los glifos (usando un `Range` del DOM), no sobre los tokens:
un token puede pasar y el texto seguir siendo ilegible sobre una foto clara.

---

## 6. Herramientas de QA

```bash
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run check:i18n     # integridad de traducciones, slugs y fotos
npm run build          # build de producción
npm run qa:visual  concepto-a http://127.0.0.1:4318   # 64 capturas + diagnóstico
npm run qa:functional      http://127.0.0.1:4318      # 32 comprobaciones
```

`check:i18n` falla (exit 1) ante: claves desiguales entre idiomas, cadenas vacías,
IDs o slugs de proyecto duplicados, entidades sin pareja de idioma, y fotos
referenciadas que no existen en disco. **Verificado que detecta fallos**: al borrar
`Quote.submit` de `en-US.json` a propósito, lo reportó.

---

## 7. Resultados de la verificación

| Comprobación | Resultado |
|---|---|
| `typecheck` | ✅ sin errores |
| `lint` | ✅ sin errores ni avisos |
| `check:i18n` | ✅ 151 claves por idioma, 7 proyectos, 14 fotos — sin divergencias |
| `build` | ✅ todas las rutas prerenderizadas en ambos idiomas |
| QA visual | ✅ **64/64** (4 páginas × 8 viewports × 2 idiomas) |
| QA funcional | ✅ **32/32**, estable en **3 pasadas consecutivas** |

Viewports cubiertos: 320, 375, 390, 768, 1024, 1366, 1440, 1920.
Sin desbordamiento horizontal, sin errores de consola, sin objetivos táctiles < 44 px,
un solo `h1` por página, ninguna imagen sin `alt`.

### Comprobaciones funcionales destacadas

- Raíz redirige 307 según `Accept-Language`; idioma no soportado cae al configurado.
- Cookie de idioma vence a la cabecera; el prefijo explícito vence a la cookie.
- **Con JavaScript desactivado**, `/es` y `/en` ya sirven `lang` correcto y el copy
  del idioma correspondiente — y `/en` **no** contiene copy español. Esto resuelve
  el defecto de SEO de la arquitectura anterior, donde Google solo veía español.
- El selector de idioma preserva la página (`/es/proyectos` ↔ `/en/projects`).
- Menú móvil: no roba el foco al cargar, lo atrapa al abrir, Escape cierra, el foco
  vuelve al disparador, el scroll del fondo se bloquea y se restaura.
- Cotización: 3 etapas, canal Email/WhatsApp mutuamente excluyente, **no afirma
  ningún envío que no haya ocurrido** y declara el modo desarrollo.

### Bugs que la propia QA detectó y se corrigieron

1. **Velos del hero detrás de la foto** (`-z-10`) → titular a 1,08:1.
2. **El menú móvil robaba el foco al cargar** — el efecto se ejecutaba en el montaje
   con `open=false` y llamaba a `focus()`. Corregido con un centinela `hasOpened`.
   Era exactamente el defecto que el briefing advertía.
3. **Bucle infinito de redirección** por prefijos sin barra inicial.
4. **Rejilla de proyectos dentada**: respetar la orientación nativa producía filas
   desalineadas. Ahora la rejilla usa proporción uniforme y el encuadre completo se
   conserva en la página de detalle.
5. **Objetivos táctiles de 36–40 px** en footer, selector de idioma y stepper.
6. **Concordancia de género**: «Aún no seleccionado» se usaba para «Ubicación» e
   «Imágenes» (femeninas). Sustituido por «Sin seleccionar», neutro en género.
7. `ERR_NO_BUFFER_SPACE` en la QA por crear 64 contextos de navegador seguidos;
   ahora se reutiliza uno solo.

---

## 8. Datos: qué es real y qué no

**Los mockups de referencia contienen datos inventados por la generación de imagen.**
No se han transferido al sitio:

| En el mockup | En el sitio |
|---|---|
| `(713) 555-0198` | Los dos teléfonos reales del cliente |
| `info@ampargo.com` | «Correo en configuración — use WhatsApp mientras tanto» |
| «450+ obras», «12 años», «45 días» | Proposiciones de valor **cualitativas**, sin cifras |
| Nombres de proyecto inventados | Descripciones de lo que la foto realmente muestra |

Fuente única de contactos: `lib/site.ts` (`WHATSAPP_CONTACTS`). Deliberadamente **fuera**
de los diccionarios de idioma: un teléfono no se traduce, y tenerlo duplicado en dos
JSON es como se rompe un CTA a medias cuando alguien actualiza solo un idioma.

### Fotografía

Las 29 fotos del cliente **topan en 960 px** (comprimidas por WhatsApp; medido leyendo
las cabeceras JPEG). `next/image` no amplía. Mitigación aplicada: encuadres contenidos,
`sizes` ajustados, AVIF activado. **La solución real depende del cliente** (§10).

Excluidas de publicación: fotos con rostros identificables sin consentimiento, y
`acabado-01` (la arquitectura es del noreste de EE. UU., no de Houston).

---

## 9. Archivos del sistema anterior

No se borraron. Están en el scratchpad de la sesión, fuera del árbol del proyecto:

```
…/scratchpad/legacy-single-page/
  app/{layout,page}.tsx
  lib/i18n-context.tsx
  content/{es,en,types}.ts
  components/{About,Contact,Hero,Lightbox,Projects,Services,WhyUs,…}.tsx
```

Se movieron en lugar de eliminarse **porque Git no tiene nada versionado en este
proyecto**: sin red de seguridad, borrar no es reversible.

---

## 10. Bloqueado por el cliente

| Bloqueo | Impide |
|---|---|
| Dominio no comprado | Indexación, canonical real, Open Graph, correo verificado |
| Plan de Hostinger no contratado | Despliegue |
| Correo empresarial no definido | Canal Email completo |
| Sin base de datos ni almacenamiento | Persistencia de cotizaciones y subida real de imágenes |
| **Fotos en alta resolución** | Nitidez del hero y del portafolio — **mayor retorno** |
| Material antes/después | La sección de mayor conversión en remodelación |
| Política de privacidad aprobada | Publicar un formulario que recoge datos personales |
| Consentimiento de personas fotografiadas | Publicar 4 fotos con rostros |
| Decisión de idioma por defecto | Cerrar `DEFAULT_LOCALE` |
| Licencias/seguros, horario, año de fundación | Datos estructurados completos y confianza comercial |

### Requisitos de Hostinger (verificados en su documentación)

- Plan **Business** o superior — Premium y Single **no** incluyen aplicaciones Node.js.
- **Node 22** (Next 16 exige ≥ 20.9). `package.json` ya declara `engines`.
- `next.config.mjs` **debe exportar un objeto, no una función** — Hostinger fusiona su
  propia configuración con la tuya. Se cumple: `export default withNextIntl(nextConfig)`
  devuelve un objeto.
- La exportación estática es incompatible con el sistema de cotización.
- Hostinger **no** incluye almacenamiento de objetos ni Postgres: hay que contratarlos.

---

## 11. Sistema de cotización — alcance honesto

**Implementado:** interfaz completa de 3 etapas, validación de cliente, previsualización
de imágenes con liberación de object URLs, resumen persistente, selector de canal
mutuamente excluyente, textos honestos en ambos idiomas.

**No implementado (y así se declara en la propia interfaz):** persistencia, subida a
almacenamiento privado, envío por email o WhatsApp. La página muestra un aviso explícito
de modo desarrollo en vez de afirmar que la solicitud se envió.

**Diseño listo para conectar** (documentado en las sesiones de auditoría previas):
permiso firmado + `PUT` directo a almacenamiento privado + verificación de firma de
bytes en servidor. Base64 y multipart quedan descartados por límites reales de Next 16
(`serverActions.bodySizeLimit` = 1 MB; con `proxy.ts`, los cuerpos > 10 MB **se truncan
en silencio**).

**Regla innegociable:** con `wa.me` es imposible saber si el mensaje se envió. Ningún
texto del sitio dice «enviado», «entregado» ni «recibimos su mensaje». Hay una prueba
automatizada que lo verifica.

---

## 12. Plataforma 3D — frontera y roadmap

**No se ha añadido ninguna librería 3D al sitio principal**, y no debe añadirse:
un visor 3D pesa cientos de kilobytes en la ruta crítica de una página cuyo objetivo
es cargar rápido en móvil y generar cotizaciones.

**Frontera:** dos aplicaciones separadas. `ampargo-web` (esta) registra la solicitud y
muestra su estado; `ampargo-3d-platform` (servicio aparte, subdominio propio) procesa,
almacena y renderiza. Contrato API versionado entre ambas.

**Roadmap:** Fase 1 solicitud y carga → Fase 2 conversión manual asistida + visor →
Fase 3 automatización parcial → Fase 4 automatización avanzada.

**Mientras el servicio no exista:** ningún CTA de 3D visible, y prohibido prometer
precisión arquitectónica, estructural o BIM.

---

## 13. Checklist para el cliente

**Urgente (bloquea la calidad visual):**
- [ ] Fotos originales sin comprimir, por Drive o WeTransfer — **no por WhatsApp**
- [ ] Logotipo en alta calidad (hoy hay un favicon provisional; falta imagen Open Graph)

**Decisiones:**
- [ ] ¿Idioma por defecto español o inglés?
- [ ] Correo empresarial · Dominio · Plan de Hostinger
- [ ] Texto de privacidad y plazos de retención de datos
- [ ] ¿Están licenciados y asegurados? Es la primera pregunta de un propietario en Texas

**Confirmaciones de contenido:**
- [ ] Nombre, zona y año de cada proyecto
- [ ] Consentimiento por escrito de los trabajadores con rostro visible
- [ ] Pares antes/después confirmados como el mismo espacio
- [ ] ¿`acabado-01` es obra suya y dónde se hizo?

---

## 14. Lo que NO se ha verificado

Declarado explícitamente para que nadie lo dé por bueno:

- **Rendimiento real** (LCP/INP/CLS): medido solo en localhost, que no representa
  producción. No se ejecutó Lighthouse.
- **Dispositivos físicos** iOS/Android: solo emulación de Chromium.
- **Lectores de pantalla reales** (NVDA/VoiceOver): la semántica se revisó por código
  y por comportamiento del foco, no con software de asistencia.
- **Firefox y WebKit**: los E2E corrieron solo en Chromium.
- **Envío real** por WhatsApp o email: deliberadamente no se envió nada.

---

## 15. Próxima acción

1. **El usuario** resuelve el repositorio Git (§3) antes de cualquier commit.
2. Enviar al cliente la petición de fotos originales — es la acción de mayor retorno
   y no cuesta desarrollo.
3. Con la decisión de idioma, cerrar `DEFAULT_LOCALE`.
4. Con dominio y credenciales, conectar el sistema de cotización sobre el diseño ya
   definido.

---

## 16. Actualización de Privacidad y Catálogo (8 de Septiembre 2026)

- Foto 79 del ZIP original verificada y añadida a `full-bath-rebuild` como `bano-integral-09-impermeabilizacion-ducha.jpeg`.
- `bano-03.jpeg` retirada temporalmente por trabajador parcialmente visible.
- Fotos de ventana/ladrillo (66–67) y exterior residencial (59) continúan bloqueadas.
- No se crearon proyectos nuevos.
- ZIP original de imágenes sigue sin versionarse.

### Saneamiento post-agente (8 de septiembre de 2026)

- Retirados `window-installation`, su imagen recortada de la foto 66 y las afirmaciones técnicas sin respaldo. El catálogo vuelve a 9 proyectos.
- Retirado `exterior-lujo-02.jpeg`, recorte de la foto 59 bloqueada, de la galería y de `public`.
- Retirados los 18 archivos WhatsApp sin uso añadidos en `20fe094`; las fuentes 59, 66 y 72 muestran personas. No se salvan fuentes bloqueadas mediante recorte.
- Se mantiene la foto 79 sanitizada en `full-bath-rebuild` y la retirada de `bano-03.jpeg`. Las fotos 59 y 66–67 siguen bloqueadas; el ZIP original permanece intacto.
- El gitlink accidental de `.claude/worktrees/full-site` deja de versionarse; el worktree local se conserva. El trabajo visual anterior queda preservado en la rama local `safety/pre-astro-v7`, sin push.
