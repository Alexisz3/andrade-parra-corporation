# Textos a revisar

**Fase 4 · 2 de septiembre de 2026**

Este documento **no cambia nada**. Es un inventario de los textos visibles del
sitio que suenan genéricos, con una propuesta para cada uno. Quien decide qué
se aplica es el responsable; aplicarlo es una fase posterior.

## Cómo leerlo

Cada fila lleva la clave exacta del diccionario para que la corrección sea
mecánica: `messages/es-US.json` y `messages/en-US.json` comparten estructura, y
`Espacio.clave` identifica el mismo texto en los dos idiomas.

**Criterios de «genérico»** usados para incluir una fila:

- **Intercambiable** — la frase describiría igual de bien a cualquier otra
  constructora de Houston. No dice nada que solo sea cierto de esta empresa.
- **Superlativo sin respaldo** — «extraordinario», «altos estándares»,
  «resultados exitosos». Afirman una calidad que el sitio no puede demostrar.
- **Relleno** — ocupa espacio sin aportar información al visitante.
- **Traducción que suena a traducción** — correcta pero no escrita en ese
  idioma; se nota sobre todo en el inglés, que es el idioma mayoritario del
  mercado.
- **Promesa encubierta** — no parece una afirmación de negocio, pero lo es:
  disponibilidad, plazos, durabilidad o satisfacción garantizada.

**REGLA DE CONTENIDO.** Ninguna propuesta afirma licencias, permisos,
certificaciones, años de experiencia, número de obras, garantías, precios,
plazos fijos ni disponibilidad. Donde una mejora real necesitaría uno de esos
datos, la propuesta lo deja **entre corchetes** como marcador visible y la
columna «Por qué» lo dice. Un corchete que llegue a producción es un fallo,
no un texto.

---

## Prioridad 1 — Afirman algo que el sitio no puede sostener

**Aplicada el 3 de septiembre de 2026.** Las seis propuestas de esta sección ya
están en `messages/es-US.json` y `messages/en-US.json`. La tabla se conserva
como registro de qué decía antes y por qué se cambió.

Estas seis no eran solo genéricas: decían algo concreto que nadie había
verificado.

| Archivo y clave | Texto actual (ES) | Texto actual (EN) | Por qué suena genérico | Propuesta |
|---|---|---|---|---|
| `messages/*.json` · `Contact.callHelp` | De lunes a sábado | Monday through Saturday | **No es genérico: es una promesa de disponibilidad sin confirmar.** El proyecto prohíbe afirmar disponibilidad, y nadie ha verificado ese horario. Quien llame un sábado y no obtenga respuesta habrá recibido una promesa incumplida en el primer contacto. | ES: `Llame o escriba cuando le venga bien` · EN: `Call or message whenever it suits you` — y si el cliente confirma horario, sustituir por `[HORARIO CONFIRMADO POR EL CLIENTE]` |
| `messages/*.json` · `Contact.serviceAreaHelp` | Trabajamos en toda el área metropolitana de Houston | We travel throughout the Houston metro area | Contradice una decisión ya tomada: `SERVICE_AREA.nearbyAreas` se dejó **vacío a propósito** para no afirmar cobertura en municipios a los que quizá no se desplazan. «Toda el área metropolitana» afirma justo eso, y en una frase suelta. | ES: `Nos desplazamos a la obra en Houston y alrededores` · EN: `We travel to the job site in Houston and nearby areas` |
| `messages/*.json` · `Process.step4Body` | Verificamos calidad y aseguramos su satisfacción. | We verify quality and make sure you're satisfied. | «Aseguramos su satisfacción» es una garantía. Suena a fórmula y además compromete algo que no está por escrito en ningún sitio. | ES: `Recorremos la obra con usted y corregimos lo que no esté bien.` · EN: `We walk the job with you and fix what isn't right.` |
| `messages/*.json` · `Services.planning.description` | Organizamos tiempos, materiales y equipo para que su proyecto avance sin sorpresas. | We organize schedule, materials, and crew so your project moves forward without surprises. | «Sin sorpresas» se lee como promesa de que no habrá desvíos de plazo ni de coste. En obra los hay, y prometerlos ausentes es lo que rompe la confianza cuando aparecen. | ES: `Organizamos tiempos, materiales y equipo, y le avisamos en cuanto algo cambia.` · EN: `We organize schedule, materials, and crew — and tell you as soon as something changes.` |
| `messages/*.json` · `Home.valuesBody4` | Conocemos la zona, los códigos locales y lo que importa a nuestra comunidad. | We know the area, the local codes, and what matters to our community. | «Conocemos los códigos locales» roza la afirmación de competencia normativa, vecina de la de licencias que el proyecto prohíbe. Además, «lo que importa a nuestra comunidad» es relleno puro. | ES: `Trabajamos en Houston y conocemos cómo se construye aquí.` · EN: `We work in Houston and we know how building goes here.` — si el cliente confirma tramitación de permisos, ampliar con `[PERMISOS: ALCANCE CONFIRMADO POR EL CLIENTE]` |
| `messages/*.json` · `Services.design.title` + `.description` | Diseño arquitectónico — Convertimos ideas y planos en un proyecto claro antes de la primera herramienta. | Architectural design — We turn ideas and drawings into a clear plan before the first tool touches the site. | El texto no es el problema; el **título** sí. En Texas, «architectural design» sugiere trabajo de arquitecto colegiado. La ficha de servicio ya dice que se coordina con arquitectos cuando el proyecto lo pide, lo que apunta a que no lo hacen en casa. | Renombrar a ES: `Planos y anteproyecto` · EN: `Drawings and pre-design`, y añadir en la descripción: `Coordinamos con el arquitecto o ingeniero cuando el proyecto lo requiere.` Necesita confirmación del cliente sobre qué hacen ellos y qué subcontratan: `[ALCANCE DE DISEÑO POR CONFIRMAR]` |

---

## Prioridad 2 — Intercambiables: describen a cualquier constructora

**Aplicada el 3 de septiembre de 2026**, con una ronda de revisión sobre las
propuestas originales: se pidió un registro más profesional (menos coloquial,
sin nombrar detalles técnicos como "juntas" o "cantos") y menos especificidad
no verificable en el punto de comunicación. El texto final quedó grabado en
`messages/es-US.json` y `messages/en-US.json`; la tabla conserva las
propuestas originales como referencia, no como lo que se aplicó.

**Excepción: `ServiceCards.repairs.description` (fila de reparaciones) queda
pendiente.** Depende de la respuesta del cliente sobre qué reparaciones acepta
de verdad — ver la lista de requerimientos enviada.

`Projects.resultsNote` no solo se reescribió: se eliminó la clave por
completo de ambos idiomas. No se usaba en ningún componente.

| Archivo y clave | Texto actual (ES) | Texto actual (EN) | Por qué suena genérico | Propuesta |
|---|---|---|---|---|
| `messages/*.json` · `Home.valuesHeading1` + `valuesBody1` | Enfoque personalizado — Escuchamos sus objetivos y diseñamos soluciones a su medida. | A personalized approach — We listen to your goals and design solutions built around you. | «Soluciones a su medida» es la frase más intercambiable del sitio. Cabe idéntica en la web de cualquier gremio. | ES: `Empezamos preguntando — Antes de dar un número, vemos el espacio y entendemos qué quiere cambiar.` · EN: `We start by asking — Before we give you a number, we look at the space and understand what you want to change.` |
| `messages/*.json` · `Home.valuesHeading2` + `valuesBody2` | Calidad en cada detalle — Materiales seleccionados y trabajo ejecutado con altos estándares. | Quality in every detail — Selected materials and work carried out to a high standard. | «Altos estándares» es un superlativo sin respaldo: no dice qué estándar ni quién lo comprueba. «Calidad en cada detalle» es el titular por defecto del sector. | ES: `Se ve en el remate — Lo que distingue una obra bien hecha son las juntas, los encuentros y los cantos. Ahí es donde miramos.` · EN: `You see it in the finish — What separates good work is the joints, the transitions, and the edges. That's where we look.` |
| `messages/*.json` · `Home.valuesHeading3` + `valuesBody3` | Gestión transparente — Comunicación clara y cronogramas realistas de principio a fin. | Transparent management — Clear communication and realistic timelines from start to finish. | «Comunicación clara» y «de principio a fin» son relleno. «Cronogramas realistas» además insinúa cumplimiento de plazos. | ES: `Sabe con quién habla — Trata con las mismas dos personas desde la visita hasta la entrega.` · EN: `You know who you're talking to — You deal with the same two people from the first visit to handover.` — es cierto y comprobable: el sitio publica los dos contactos |
| `messages/*.json` · `Home.processHeading` | Un proceso claro para resultados exitosos. | A clear process for successful results. | «Resultados exitosos» no significa nada. La primera mitad ya dice lo necesario. | ES: `Cinco pasos, y en cada uno sabe qué sigue.` · EN: `Five steps, and at each one you know what comes next.` |
| `messages/*.json` · `Home.ctaBandHeading` + `ctaBandBody` | Construyamos algo extraordinario juntos. — Solicite una cotización sin compromiso y dé el primer paso hacia su nuevo espacio. | Let's build something extraordinary together. — Request a no-obligation quote and take the first step toward your new space. | «Extraordinario» es superlativo vacío y «dé el primer paso hacia su nuevo espacio» es relleno de folleto. Es además el CTA principal del sitio: es donde menos se puede permitir sonar a plantilla. | ES: `Cuéntenos qué quiere cambiar. — Describa el proyecto en una línea y le respondemos por WhatsApp.` · EN: `Tell us what you want to change. — Describe the project in a line and we'll reply on WhatsApp.` |
| `messages/*.json` · `About.ctaHeading` | Construyamos algo bueno juntos | Let's build something great together | Es la misma frase que `Home.ctaBandHeading` con otro adjetivo. Dos titulares casi idénticos en dos páginas delatan la plantilla. | Unificar con la propuesta de `ctaBandHeading` o, aquí, ES: `¿Hablamos de su proyecto?` · EN: `Want to talk about your project?` |
| `messages/*.json` · `Projects.intro` | Explore una selección de proyectos de construcción y remodelación en Houston. Cada uno refleja nuestro compromiso con la calidad, la funcionalidad y la atención al detalle. | Explore a selection of construction and remodeling projects in Houston. Each one reflects our commitment to quality, function, and attention to detail. | La segunda frase es una tríada de tópicos —calidad, funcionalidad, atención al detalle— que no informa de nada. La primera ya cumple. | ES: `Obras de construcción y remodelación en Houston. Cada ficha muestra las fotos que se tomaron durante el trabajo.` · EN: `Construction and remodeling jobs in Houston. Each entry shows the photos taken while the work was going on.` |
| `messages/*.json` · `Projects.resultsNote` | Mostrando trabajos reales de nuestro portafolio. | Showing real work from our portfolio. | Decir que el trabajo es «real» invita a preguntarse por qué habría que aclararlo. Y no aporta nada bajo una cuadrícula de fotos. | Retirar la línea, o sustituirla por el aviso sobre la procedencia de las fotos si el cliente lo aprueba. |
| `messages/*.json` · `Home.valuesSectionHeading` | Por qué los propietarios eligen Andrade Parra Corporation | Why homeowners choose Andrade Parra Corporation | Da por hecho un volumen de clientes que no está documentado en ningún sitio, y es una fórmula de plantilla. | ES: `Cómo trabajamos` · EN: `How we work` — o, si el cliente confirma volumen, `[N.º DE OBRAS CONFIRMADO]` permitiría una versión más fuerte |
| `messages/*.json` · `ServiceCards.repairs.description` | Soluciones confiables para mantener y mejorar su propiedad. | Reliable solutions to maintain and improve your property. | «Soluciones confiables» no dice qué se repara. Un visitante con una gotera no reconoce aquí su problema. | ES: `Arreglos y mejoras puntuales: humedades, carpintería, instalaciones y acabados.` · EN: `Targeted repairs and upgrades: water damage, carpentry, systems, and finishes.` — **verificar con el cliente qué reparaciones acepta de verdad** antes de listar |
| `messages/*.json` · `Services.commercial.description` | Levantamos y adecuamos espacios comerciales con los mismos estándares de calidad. | We build and fit out commercial spaces to the same quality standards. | «Los mismos estándares de calidad» remite a un estándar que en ningún momento se define. | ES: `Levantamos y adecuamos locales comerciales: obra, instalaciones y acabados.` · EN: `We build and fit out commercial spaces: structure, systems, and finishes.` |
| `messages/*.json` · `About.heading` | Construido en torno a su visión | Built around your vision | «Su visión» es vocabulario de agencia, no de obra. En español además suena a traducción del inglés, que es lo que es. | ES: `Dos apellidos, una forma de trabajar` · EN: `Two names, one way of working` — apoyado en el concepto del logotipo, que ya cuenta esa idea |

---

## Prioridad 3 — Durabilidad afirmada sin respaldo

**Aplicada el 3 de septiembre de 2026**, tal como estaba propuesta. El
periodo de seguimiento de `Services.maintenance.description` queda sin
confirmar — depende de la misma respuesta del cliente que el punto de
reparaciones (Prioridad 2, fila 10).

Van juntas porque comparten el mismo problema: prometían que la obra
duraría. Sin garantía escrita, «para durar» es una afirmación que la empresa
no puede sostener si algo falla.

| Archivo y clave | Texto actual (ES) | Texto actual (EN) | Por qué suena genérico | Propuesta |
|---|---|---|---|---|
| `messages/*.json` · `Home.featuredHeading` | Trabajos reales. Resultados que duran. | Real work. Results that last. | «Resultados que duran» es una promesa de durabilidad sin garantía detrás. Y «trabajos reales» vuelve a aclarar algo que no debería necesitar aclaración. | ES: `Obras terminadas y obras en curso.` · EN: `Finished jobs and jobs in progress.` — es lo que la sección muestra de verdad, incluidas las fichas marcadas «En proceso» |
| `messages/*.json` · `ServiceCards.outdoor.description` | Patios, terrazas, cocinas exteriores y piscinas construidas para durar. | Patios, decks, outdoor kitchens, and pools built to last. | La enumeración es buena y concreta; «construidas para durar» sobra y es lo único que promete algo. | ES: `Patios, terrazas, cocinas exteriores y piscinas.` · EN: `Patios, decks, outdoor kitchens, and pools.` |
| `messages/*.json` · `Services.maintenance.description` | Seguimiento y mantenimiento de las obras entregadas para que duren en el tiempo. | We follow up and maintain completed work so it holds up over time. | Mismo caso. Además «para que duren en el tiempo» es pleonasmo. | ES: `Seguimiento y mantenimiento de las obras que hemos entregado.` · EN: `Follow-up and maintenance on work we've delivered.` — **si existe un periodo de seguimiento acordado, indicarlo:** `[PERIODO DE SEGUIMIENTO POR CONFIRMAR]` |
| `messages/*.json` · `Process.step5Body` | Entregamos su proyecto listo para disfrutar. | We deliver your project ready to enjoy. | «Listo para disfrutar» es lenguaje de folleto inmobiliario, no de contratista. | ES: `Le entregamos el espacio limpio y terminado.` · EN: `We hand over the space clean and finished.` |

---

## Prioridad 4 — El inglés suena a traducción

**Aplicada el 3 de septiembre de 2026.** Una propuesta se ajustó al aplicar
(`Process.step3Body`, gramática más natural que la fila original) — el resto,
tal como estaba.

El inglés es el idioma mayoritario de Houston y es probablemente el que más
visitas reciba. Estas frases eran correctas pero se leían como versión de
otra cosa, no como original.

| Archivo y clave | Texto actual (ES) | Texto actual (EN) | Por qué suena a traducción | Propuesta (solo EN) |
|---|---|---|---|---|
| `messages/*.json` · `Projects.heading` | Trabajo real. Proceso visible. | Real work. Visible process. | «Visible process» es calco literal. En inglés no se dice así de un oficio; se habla de *seeing the work*. | `Real work. You see how it's done.` |
| `messages/*.json` · `ServiceCards.kitchensBaths.description` | Diseño y renovación con acabados de calidad y funcionalidad. | Design and renovation with quality finishes and function. | «with quality finishes and function» arrastra la estructura del español; en inglés queda una lista sin verbo que no encaja. | `Full kitchen and bath renovations, down to the finishes.` |
| `messages/*.json` · `Process.step3Body` | Ejecutamos con precisión y cuidamos cada detalle. | We execute with precision and care for every detail. | «We execute with precision» es traducción directa: en inglés de obra se dice *we build* o *we do the work*. Y «care for every detail» se lee como «cuidamos DE cada detalle», que no es lo que quiere decir. | `We do the work, and we keep you posted while it's going.` |
| `messages/*.json` · `About.metaDescription` | Quiénes somos, cómo trabajamos y los criterios detrás de cada obra… | Who we are, how we work and the standards behind every Andrade Parra Corporation project… | «the standards behind every project» promete unos estándares que la página no llega a enumerar — la sección de historia y la de equipo están vacías a la espera del cliente. | `Who we are and how we work, on every Andrade Parra Corporation project in Houston, TX.` |
| `messages/*.json` · `Home.valuesHeading4` | Orgullosamente Houston | Proudly Houston | «Proudly Houston» sin sustantivo queda cojo en inglés; el modismo es *Proudly Houston-based* o *Houston born and built*. En español, «orgullosamente» tiene además un tono de eslogan importado. | ES: `De Houston` · EN: `Houston-based` |

---

## Textos que NO están en esta lista, y por qué

Para que la revisión no se convierta en reescribirlo todo:

- **`Home.trustServiceArea`, `trustResidentialCommercial`, `trustFreeEstimates`,
  `trustBilingual`.** Cada una está respaldada por un hecho comprobable —el
  formulario no cuesta nada, el sitio existe en dos idiomas— y así está
  documentado en `content/company.ts`. No tocar.
- **`Quote.handoffHeading` y `handoffBody`.** Su literalidad es deliberada y
  está razonada en `QuoteShell.tsx`: `wa.me` no envía nada, y decir «hemos
  recibido su solicitud» sería afirmar algo que el sitio no puede comprobar.
  Suenan secas a propósito. **No tocar.**
- **Mensajes de error del formulario.** Están en lenguaje humano y explican qué
  corregir. Son de lo mejor escrito del sitio.
- **`Metadata.description`.** Concreta, con las categorías reales y sin
  superlativos.
- **Nombres de servicio y de categoría, etiquetas de interfaz, textos de
  navegación.** No hay nada que mejorar en «Cocinas» o «Ver proyecto».
- **`content/projects.ts`.** Los extractos describen cada obra por lo que se ve
  en sus fotos, sin adjetivos de venta. Es el modelo a seguir para el resto.

---

## Qué haría falta del cliente para escribir algo mejor

Casi todas las propuestas de arriba son mejoras dentro de lo que ya se puede
afirmar. Para pasar de «no genérico» a «convincente» harían falta datos que hoy
no existen, y que se piden en `docs/MATERIAL_PENDIENTE_CLIENTE.html`:

| Dato | Qué desbloquearía |
|---|---|
| Año de fundación o años en el oficio | La sección «Nuestra historia», hoy vacía por decisión (`COMPANY_STORY = null`) |
| Horario real de atención | `Contact.callHelp`, hoy una promesa sin verificar |
| Municipios que cubren de verdad | `SERVICE_AREA.nearbyAreas`, vacío a propósito, y `Contact.serviceAreaHelp` |
| Qué hacen en casa y qué subcontratan | El título del servicio de diseño, y el alcance de reparaciones |
| Licencias y seguros, con documento | Todo el argumento de confianza. Hoy prohibido afirmarlo, y con razón |
| Reseñas reales con permiso | La sección de testimonios, que devuelve `null` mientras no las haya |
| Cargos de Jose, Ramon y Mario, y permiso de imagen | La sección de equipo, hoy `TEAM = []` |

Mientras esos datos no existan, **la propuesta correcta es la más sobria de
las dos**: un texto que no promete nada envejece bien; uno que promete lo que
no puede cumplir se convierte en el argumento del cliente descontento.

---

## Copy nuevo pendiente de revisión

**Fase de portada de Proyectos · 11 de septiembre de 2026.** Al rediseñar la
portada de `/proyectos` se añadió un cierre editorial en la esquina inferior
derecha que **no existía antes en ningún idioma**. No está aprobado: se
registra aquí para que el responsable lo confirme, lo reescriba o lo retire.

| Clave | Texto puesto | Por qué se registra |
|---|---|---|
| `Projects.heroCoverTagline` | ES «Espacios que inspiran una mejor vida» · EN «Spaces that inspire a better life» | Es una frase de marca, no un dato: no afirma licencias, plazos ni resultados, así que no choca con la regla de contenido. Pero sí es intercambiable —describiría igual a cualquier constructora— y ese es justo el criterio que las Prioridades 1-4 usaron para retirar texto. Si el responsable no la reconoce como propia de la empresa, la portada funciona igual sin ella. |

`Projects.heroCoverImageAlt` se añadió en la misma tanda pero no entra en esta
tabla: es texto alternativo de accesibilidad, describe lo que se ve en la
fotografía y no afirma autoría de la obra.

**Portada de Servicios · 11 de septiembre de 2026.** La misma portada
editorial se aplicó a `/servicios`, con tres textos que tampoco existían
antes. Dos de ellos rozan criterios que este documento ya usó para retirar
copy, así que van aquí antes de darse por buenos.

| Clave | Texto puesto | Por qué se registra |
|---|---|---|
| `Services.heroCoverTagline` | ES «Espacios construidos para durar» · EN «Spaces built to last» | **Es una afirmación de durabilidad**, justo la categoría de la Prioridad 3 de este documento. No dice cuántos años ni bajo qué condiciones, así que no es una garantía formal, pero promete algo que el sitio no puede demostrar. La portada funciona sin ella. |
| `Services.heroCoverIntro` | ES «…con atención directa, alcances claros y ejecución de calidad.» · EN «…with direct communication, clear scope, and quality workmanship.» | «Ejecución de calidad» es un superlativo sin respaldo del mismo tipo que «altos estándares». Las dos primeras mitades sí son verificables —la atención es directa y el alcance se define por escrito—; la tercera es la que habría que revisar. |
| `Services.heroScrollCue` | Antes «Explorar servicios» → ahora «Deslizar para explorar» | No es texto nuevo: se reusa la frase que ya estaba aprobada en `Projects.heroScrollCue`, para que las dos portadas digan lo mismo. Se anota sólo para que el cambio quede con fecha. |

`Services.heroCoverKicker`, `heroCoverServicesLabel` y `heroCoverImageAlt` no
entran en la tabla: son una etiqueta de sección, el sustantivo del contador
—que cuenta servicios reales de `content/services.ts`— y texto alternativo de
accesibilidad.

**Portada de Nosotros · 11 de septiembre de 2026.** La portada editorial se
aplicó también a `/nosotros`. Casi todo el copy ya estaba aprobado y se
reutiliza tal cual: `About.eyebrow`, `About.heading` (el titular),
`Home.valuesBody4` (la descripción) y `About.heroScrollCue` (ahora el link
«Conocer más»). Sólo un texto es nuevo.

| Clave | Texto puesto | Por qué se registra |
|---|---|---|
| `About.heroCoverTagline` | ES «Relaciones reales. Trabajo bien hecho» · EN «Real relationships. Work done right» | «Trabajo bien hecho» es una afirmación de calidad sin respaldo, de la misma familia que «ejecución de calidad» en Servicios. «Relaciones reales» sí describe algo verificable —el trato es directo con Jose, no con un comercial— y encaja con lo que ya dice `About`. La portada funciona si se recorta a la primera mitad. |

`About.heroCoverScrollCue` («Deslizar para explorar») no entra en la tabla:
es la misma frase ya aprobada en `Projects.heroScrollCue`, repetida aquí para
que las tres portadas digan lo mismo. `About.heroCoverImageAlt` tampoco: es
texto alternativo de accesibilidad y describe la fotografía sin afirmar que
la obra sea de la empresa.

**Portada de Preguntas · 11 de septiembre de 2026.** La portada editorial se
aplicó a `/preguntas`, que hasta ahora no tenía ninguna. El eyebrow, el
titular y la frase de instrucción se reutilizan tal cual de
`HomeV7.faqEyebrow`, `HomeV7.faqTitle` y `HomeV7.faqPrompt` — antes abrían la
lista de preguntas y ahora abren la página, así que **dejaron de mostrarse
dos veces**. Sólo el cierre de esquina es nuevo.

| Clave | Texto puesto | Por qué se registra |
|---|---|---|
| `Faq.heroCoverTagline` | ES «Respuestas claras desde el inicio» · EN «Clear answers from the start» | Es una promesa sobre cómo se comunica la empresa, no sobre el resultado de la obra, así que es más defendible que «trabajo bien hecho» o «construidos para durar»: lo que promete se puede comprobar leyendo las ocho respuestas de abajo. Aun así, es una afirmación sobre el propio servicio y conviene que el responsable la lea. |

`Faq.heroCoverScrollCue` y `Faq.heroCoverImageAlt` no entran en la tabla: la
primera repite la frase ya aprobada de las otras portadas, la segunda es
texto alternativo de accesibilidad.

**Portada de Contacto · 11 de septiembre de 2026.** La portada editorial se
aplicó a `/contacto`. El eyebrow, el titular y el área de servicio se
reutilizan de `HomeV7.contactEyebrow`, `HomeV7.contactTitle` y
`HomeV7.contactArea`, ya aprobados. Tres textos son nuevos o cambian.

| Clave | Texto puesto | Por qué se registra |
|---|---|---|
| `HomeV7.contactBody` | Antes «Envíenos los datos básicos del espacio y le ayudamos a ordenar el siguiente paso.» → ahora «Comparta la idea, el espacio y el objetivo del proyecto. Le ayudamos a convertirlo en un siguiente paso claro.» | No afirma nada nuevo: describe la misma conversación con otras palabras. Se registra porque sustituye copy que ya había pasado revisión. |
| `HomeV7.contactSign` | ES «Construyamos algo juntos.» · EN «Let's build something together.» | Cierre de la hoja de contacto, en serif cursiva. Es una invitación, no una promesa de resultado — de las cuatro frases de cierre de las portadas, la única que no afirma nada sobre la obra. |
| `Contact.heroMicrocopy` | ES «Atención directa. Respuesta clara.» · EN «Direct attention. Clear answers.» | «Atención directa» es verificable: los dos teléfonos de la propia hoja son los de Jose y Mario, no una centralita. «Respuesta clara» es una promesa sobre el trato; sin plazo asociado, pero conviene que el responsable la lea. |

`HomeV7.contactEmailLabel` es sólo la etiqueta «Email», antes escrita a mano
en el componente y ahora traducible.
