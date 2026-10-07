# Plan de captación de clientes — Andrade Parra Corporation

Octubre 2026. Objetivo: que ampargo.com genere conversaciones de WhatsApp,
llamadas y cotizaciones de propietarios en Houston, no solo visitas.

---

## 1. Diagnóstico (lo que se comprobó, no supuestos)

| Revisado | Resultado |
|---|---|
| ¿Google indexa el sitio? | **Sí.** `site:ampargo.com` devuelve inicio, servicios, proyectos, nosotros, cotización y contacto en ES y EN. |
| robots.txt / sitemap | Correctos. 82 URLs en el sitemap, con hreflang ES/EN. |
| Títulos y descripciones | Bien orientados a búsqueda local ("Home Remodeling & Construction in Houston, TX"). |
| Google Analytics 4 | Instalado (`G-D8E89G104T`) y midiendo clics de WhatsApp, teléfono, correo y cotizaciones. |
| `www.ampargo.com` | Servía una **copia duplicada** del sitio con 200. **Corregido** (ver §5). |
| Ficha de Google (Business Profile) | **No existe.** Al buscar el nombre de la empresa no aparece ninguna ficha ni directorio. |
| Reseñas | **Cero**, en Google y en el sitio. |
| Publicidad | Ninguna activa. |

**Conclusión:** el sitio no es el cuello de botella. Está bien construido e
indexado. El tráfico es bajo porque el dominio es nuevo (publicado en
septiembre de 2026), no tiene autoridad ni reseñas, y la empresa no aparece en
el **mapa de Google**, que es donde la gente busca contratistas ("remodelación
cerca de mí"). Un sitio nuevo tarda de 6 a 12 meses en posicionar solo por SEO
para "kitchen remodeling houston"; los canales de abajo traen clientes en
semanas.

### Sobre los correos recibidos en contacto@ampargo.com

Los dos mensajes ("Frank, Website Examiner" y el de "parameter handling /
thin-content indexing queues") son **spam de venta en frío**. Se envían en
masa a miles de sitios con plantillas: elogio genérico, "no posiciona para
palabras clave", y piden responder "Yes" para confirmar que el buzón está
activo y venderle un paquete SEO. Lo que afirman no se sostiene: el sitio no
usa URLs con parámetros y Google lo indexa sin problema.
**Recomendación: no responder; marcar como spam.**

---

## 2. Semana 1 — Lo gratuito y de mayor impacto

Ordenado por impacto. Casi todo lo tiene que hacer el cliente o quien tenga
acceso a sus cuentas.

### 2.1 Google Business Profile (prioridad n.º 1)

Es la ficha que aparece en Google Maps y en el bloque de 3 negocios del
buscador. Para un contratista local es la mayor fuente de llamadas.

1. Crear en <https://business.google.com> con el nombre exacto **Andrade Parra Corporation**.
2. Tipo: **negocio de área de servicio** (va a la obra del cliente). **Ocultar la
   dirección**: el sitio tampoco la publica, porque es un domicilio particular.
3. Categoría principal: **General contractor**. Secundarias: *Remodeler*,
   *Kitchen remodeler*, *Bathroom remodeler*, *Construction company*.
4. Áreas de servicio: Houston y los municipios donde **realmente** trabajan.
5. Teléfono principal, horario, y sitio web con este enlace (para medir lo que
   viene de la ficha):
   `https://ampargo.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`
6. Subir 20 o más fotos reales (las del portafolio sirven) y la descripción de
   cada servicio.
7. Verificar. Hoy Google suele pedir un video corto mostrando herramientas,
   vehículo o una obra.
8. Publicar una foto o novedad por semana (proyecto terminado, antes/después).

Cuando la ficha exista, pasar su URL al desarrollador para añadirla a `sameAs`
en `components/StructuredData.tsx`. Así Google relaciona sitio y ficha.

### 2.2 Reseñas (prioridad n.º 2)

Una ficha sin reseñas casi no recibe clics. La empresa tiene años de clientes
satisfechos: es el recurso más valioso y no está aprovechado.

- **Meta: 10 reseñas en 30 días, 25 en 90 días.**
- En la ficha, *Pedir reseñas* genera un enlace corto. Enviarlo por WhatsApp a
  clientes anteriores con un mensaje personal:
  > "Hola [nombre], le habla José de Andrade Parra. ¿Nos ayudaría con una
  > reseña de la cocina que hicimos? Nos ayuda mucho: [enlace]"
- Pedirla **siempre** al entregar cada obra nueva, el mismo día.
- Responder todas las reseñas.
- Con autorización escrita del cliente, las mejores pasan al sitio en
  `content/testimonials.ts` (la sección aparece sola en cuanto haya una).
- **No** comprar ni inventar reseñas: Google las borra y la FTC lo sanciona.

### 2.3 Google Search Console

1. <https://search.google.com/search-console> → *Agregar propiedad* → **Dominio** → `ampargo.com`.
2. Verificar con el registro TXT en **Cloudflare** (DNS → Add record → TXT).
3. Enviar el sitemap `https://ampargo.com/sitemap.xml`.
4. Desde ahí se ve qué búsquedas muestran el sitio, en qué posición y con qué
   tasa de clics. Es el dato que hace falta para decidir qué contenido escribir.

### 2.4 Marcar las conversiones en Google Analytics

El sitio ya envía los eventos, pero GA4 no los cuenta como conversiones hasta
que se marcan. En GA4: **Administrar → Eventos** (o *Eventos clave*) → activar
la estrella en:

| Evento | Qué significa |
|---|---|
| `whatsapp_clicked` | Abrió WhatsApp con un contacto (la conversión principal) |
| `phone_clicked` | Pulsó llamar |
| `quote_submitted` | Terminó el formulario de cotización |
| `email_clicked` | Pulsó el correo |

Sin esto, Google Ads no puede optimizar y no se sabe qué canal trae clientes.

### 2.5 Directorios con datos idénticos (NAP)

Mismo nombre, teléfono y sitio web en todos. Cada uno es una mención más que
Google usa para confiar en la empresa:

- **Bing Places** (importa la ficha de Google en un clic) y **Apple Business Connect** (Mapas del iPhone).
- **Facebook**: completar la página con sitio web, WhatsApp y servicios.
- **Yelp**, **Nextdoor Business**, **Houzz**, **BBB**, **Angi**, **Thumbtack**.
  Los perfiles gratuitos bastan; no hace falta pagar por leads ahí al principio.

---

## 3. Publicidad: dónde apuntar

Regla general: **cada anuncio lleva a la página del servicio que anuncia**, en
el idioma del anuncio. **Nunca a la portada**: el visitante tiene que buscar lo
que vio en el anuncio y se va.

### 3.1 Destinos por campaña

Añadir los parámetros UTM tal cual para que GA4 separe cada campaña.

| Anuncio sobre… | Destino (inglés) | Destino (español) |
|---|---|---|
| Cocinas y baños | `https://ampargo.com/en/services/kitchens-and-bathrooms` | `https://ampargo.com/es/servicios/cocinas-y-banos` |
| Remodelación general | `https://ampargo.com/en/services/remodeling` | `https://ampargo.com/es/servicios/remodelaciones` |
| Patios, exteriores, cocheras | `https://ampargo.com/en/services/outdoor-spaces` | `https://ampargo.com/es/servicios/espacios-exteriores` |
| Casa nueva / obra a medida | `https://ampargo.com/en/services/custom-construction` | `https://ampargo.com/es/servicios/construccion-personalizada` |
| Reparaciones | `https://ampargo.com/en/services/repairs-and-improvements` | `https://ampargo.com/es/servicios/reparaciones-y-mejoras` |
| "Cotización gratis" genérico | `https://ampargo.com/en/quote` | `https://ampargo.com/es/cotizacion` |

Ejemplo con UTM:
`https://ampargo.com/es/servicios/cocinas-y-banos?utm_source=google&utm_medium=cpc&utm_campaign=cocinas-es`

### 3.2 Google Ads de búsqueda (intención alta: buscan contratista ahora)

- **Empezar solo con Cocinas y baños y Remodelación**, que son el trabajo de más
  valor. Un grupo de anuncios por servicio.
- **Campaña en español aparte.** Houston tiene un mercado hispano enorme y las
  búsquedas en español tienen mucha menos competencia y clics más baratos. Es
  la ventaja que pocos competidores aprovechan, y el sitio ya está en español.
- Palabras clave de ejemplo (concordancia de frase):
  - EN: "kitchen remodeling houston", "bathroom remodel houston", "home remodeling contractor houston", "kitchen remodel near me"
  - ES: "remodelación de cocinas houston", "remodelación de baños", "contratista de remodelación houston", "constructora en houston"
- Palabras negativas desde el primer día: *jobs, empleo, trabajo, salary,
  DIY, how to, home depot, lowes, ikea, free, gratis, cursos, ideas*.
- Ubicación: radio real de trabajo alrededor de Houston, con la opción
  **"Presencia: personas que están en la zona"** (no "interesadas en").
- Extensiones: llamada con el teléfono principal, ubicación del Business Profile y fotos.
- Medición: vincular Google Ads con GA4 e **importar** `whatsapp_clicked`,
  `phone_clicked` y `quote_submitted` como conversiones. No hace falta código.
- Puja: empezar con *Maximizar clics* con tope por clic. Cambiar a *Maximizar
  conversiones* cuando haya unas 30 conversiones registradas.
- Presupuesto de prueba orientativo: 20–30 USD/día durante 30 días, y decidir
  con el costo por lead real.

### 3.3 Anuncios de Servicios Locales de Google ("Google Guaranteed")

Aparecen **por encima** de los anuncios normales y se paga por lead (llamada o
mensaje), no por clic. Exigen verificación de antecedentes, seguro y registro
del negocio. Conviene revisar en <https://ads.google.com/local-services-ads>
si la categoría aplica en Houston y qué documentos piden. Si califican, suele
ser el canal con mejor costo por lead para contratistas.

### 3.4 Facebook e Instagram: anuncios "Clic a WhatsApp"

Encaja exactamente con cómo trabaja la empresa: el anuncio abre una
conversación de WhatsApp directa, sin pasar por el sitio.

- Creatividad: **antes/después** reales y videos cortos de obra. Es el
  contenido que más convierte en remodelación.
- Público: propietarios en Houston y códigos postales cercanos, de 30 a 65
  años, con anuncios en español y en inglés por separado.
- Objetivo de campaña: *Interacción → Mensajes → WhatsApp*.
- Presupuesto de prueba: 10–20 USD/día.
- Alternativa con destino web: la página de servicio en español con UTM `utm_source=facebook&utm_medium=paid`.

### 3.5 Preguntar siempre "¿cómo nos encontró?"

El WhatsApp no le dice a GA4 si el cliente cerró trato. Llevar una hoja simple
(fecha, nombre, servicio, **origen**, ¿cotizado?, ¿cerrado?, monto). Con un mes
de datos se sabe qué canal paga y cuál no.

---

## 4. Calendario

| Cuándo | Qué | Quién |
|---|---|---|
| Semana 1 | Business Profile, Search Console, eventos clave en GA4, Facebook completo | Cliente / quien gestione las cuentas |
| Semana 1–2 | Primeras 10 solicitudes de reseña a clientes anteriores | Cliente |
| Semana 2 | Bing, Apple, Yelp, Nextdoor, Houzz, BBB | Cliente / asistente |
| Semana 2–3 | Google Ads (cocinas y baños + remodelación, ES y EN) | Gestor de anuncios |
| Semana 3 | Facebook/Instagram "Clic a WhatsApp" con antes/después | Gestor de anuncios |
| Mes 2 | Revisar costo por lead por canal; apagar lo que no convierta y subir lo que sí | Todos |
| Mes 2–3 | Contenido nuevo según lo que muestre Search Console (ver §6) | Desarrollador |

### Qué mirar cada semana

- **GA4 → Informes → Adquisición → Adquisición de tráfico**: sesiones y eventos clave por canal.
- **Business Profile → Rendimiento**: llamadas, solicitudes de ruta, clics al sitio.
- **Search Console → Rendimiento**: búsquedas, posición media y clics.
- **Hoja de leads**: costo por lead y por obra cerrada.

---

## 5. Cambios hechos en el sitio (esta pasada)

1. **Redirección `www.ampargo.com` → `ampargo.com`** (`next.config.mjs`).
   Hostinger servía el sitio entero también en www con 200: dos copias del
   mismo contenido, y en www la cabecera de idiomas anunciaba URLs con www que
   contradecían el canonical. Ahora es una redirección permanente que conserva
   ruta y parámetros. Solo se activa si `NEXT_PUBLIC_SITE_URL` es un dominio
   real, así que no afecta al desarrollo ni a las previews.
2. **Datos estructurados más completos** (`components/StructuredData.tsx`):
   se añadieron `logo`, `image`, `email` y `sameAs` (Facebook). Con esto Google
   puede relacionar la empresa con sus perfiles. La URL de Facebook pasó del
   enlace de compartir a la dirección canónica del perfil (`lib/site.ts`).

---

## 6. Siguientes mejoras del sitio (necesitan datos del cliente)

El sitio ya tiene el espacio preparado para cada una: aparecen solas en cuanto
llega el dato. No se inventa nada.

| Falta del cliente | Efecto en el sitio | Archivo |
|---|---|---|
| Municipios que realmente cubren (Pasadena, Pearland, Katy…) | Sección de cobertura y `areaServed`; señal fuerte de SEO local | `content/company.ts` → `nearbyAreas` |
| Reseñas con autorización | Sección de testimonios | `content/testimonials.ts` |
| URL del Business Profile | Vínculo ficha ↔ sitio | `components/StructuredData.tsx` → `sameAs` |
| Más pares antes/después | La sección que más convierte en remodelación | `content/before-after.ts` |
| Barrio o ciudad y año de cada proyecto | "Remodelación de cocina en Pearland, 2025": posiciona por zona | `content/projects.ts` |
| Rangos de precio orientativos | Artículos tipo "¿Cuánto cuesta remodelar una cocina en Houston?", que es una búsqueda muy frecuente | Nueva sección de guías |

Con dos o tres meses de datos de Search Console se decide qué guías escribir
primero, según las búsquedas reales que ya muestran el sitio.
