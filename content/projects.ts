import type { AppLocale } from "@/i18n/routing";

export type ProjectCategory = "kitchens" | "bathrooms" | "exteriors" | "structures" | "interiors";
export type ProjectStatus = "completed" | "in_progress";

export interface ProjectPhoto {
  file: string;
  orientation: "vertical" | "horizontal";
}

export interface Project {
  /** Estable e independiente del idioma — no cambia aunque cambien los slugs. */
  id: string;
  slugs: Record<AppLocale, string>;
  category: ProjectCategory;
  status: ProjectStatus;
  /** Título y extracto por locale. */
  title: Record<AppLocale, string>;
  excerpt: Record<AppLocale, string>;
  /**
   * Párrafo largo para "Sobre este proyecto". Describe lo que se ve en la
   * foto de portada —colores, materiales, distribución— con más detalle que
   * el extracto corto. Igual que `scope`, describe solo lo visible en la
   * imagen; no afirma nada que la foto no pruebe (fechas, nombres de
   * clientes, marcas de materiales). Opcional por si un proyecto futuro se
   * publica antes de redactar este texto.
   */
  description?: Record<AppLocale, string>;
  location: string;
  coverPhoto: ProjectPhoto;
  gallery: ProjectPhoto[];
  /** Featured en portada solo si aporta variedad de categoría. */
  featuredOnHome: boolean;

  /* ─── Campos de caso de estudio ───────────────────────────────────────
   * Todos OPCIONALES y todos ausentes hoy: describen decisiones y resultados
   * de obra que solo el cliente conoce. La página de detalle renderiza cada
   * bloque únicamente si su campo existe, así que un proyecto sin estos datos
   * se ve completo y sin huecos, y se enriquece solo cuando lleguen.
   *
   * Deducirlos de las fotos sería inventar: una encimera de cuarzo no prueba
   * quién hizo la plomería.
   */

  /** Alcance contratado, en viñetas. Confirmado por el cliente. */
  scope?: Record<AppLocale, string[]>;
  /** Oficios realmente ejecutados en ESTA obra. Nunca supuestos. */
  workCompleted?: Record<AppLocale, string[]>;
  /** Resultado final descrito por el cliente. */
  result?: Record<AppLocale, string>;
  /** Id de un par en BEFORE_AFTER_PAIRS, si existe material confirmado. */
  beforeAfterId?: string;
}

/**
 * Categoría de obra → servicio que la cubre.
 *
 * Es una correspondencia DERIVADA, no un dato inventado: una obra de cocina
 * la cubre el servicio de cocinas y baños. Permite que la ficha del proyecto
 * enlace a su servicio sin pedirle al cliente un dato más.
 */
export const CATEGORY_TO_SERVICE: Record<ProjectCategory, string> = {
  kitchens: "kitchens-bathrooms",
  bathrooms: "kitchens-bathrooms",
  exteriors: "outdoor-spaces",
  structures: "custom-construction",
  interiors: "remodeling",
};

/**
 * Fuente de verdad de proyectos publicables.
 *
 * Solo se incluyen fotos ya revisadas visualmente (ver AUDITORIA_Y_PLAN_AMPARGO.md
 * §10): sin rostros identificables sin consentimiento, sin incoherencias de
 * ubicación, sin desenfoques. Las leyendas describen exactamente lo que se ve;
 * no se afirma nombre de cliente, año ni dirección exacta porque el cliente
 * no los ha confirmado (pendiente, documentado en la auditoría).
 */
export const PROJECTS: Project[] = [
  {
    id: "patio-pool-lake",
    slugs: { "es-US": "terraza-piscina-lago", "en-US": "lakeside-patio-pool" },
    category: "exteriors",
    status: "in_progress",
    title: {
      "es-US": "Terraza y piscina en construcción",
      "en-US": "Lakeside patio & pool under construction",
    },
    excerpt: {
      "es-US": "Diseño y construcción de terraza con piscina y área de estar al aire libre.",
      "en-US": "Design and construction of a patio with pool and outdoor living area.",
    },
    description: {
      "es-US":
        "Un patio de piedra natural en tono claro envuelve una piscina geométrica junto a un lago, con una cabaña de techo oscuro a dos aguas que integra chimenea de piedra y área de asador bajo el mismo techo. El vaso de la piscina, todavía sin agua, deja ver el azulejo azul de la línea de flotación y confirma que la obra sigue en la etapa de acabados finales antes de llenarla.",
      "en-US":
        "A light natural stone patio wraps a geometric pool right on the lake, anchored by a dark gable-roofed pavilion that houses a stone fireplace and outdoor kitchen under one roof. The pool shell, still empty, shows the blue waterline tile already set — a clear sign the project is in its final finishing stage before it's filled.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "exterior-lujo-01.jpeg", orientation: "horizontal" },
    gallery: [{ file: "exterior-lujo-01.jpeg", orientation: "horizontal" }],
    featuredOnHome: true,
    // Alcance y trabajos: SOLO lo que la foto confirma a simple vista (piedra
    // ya colocada, vaso de piscina sin terminar, estructura de sombra en pie)
    // — no hay dato de plomería, filtración ni permisos que la imagen pruebe.
    scope: {
      "es-US": [
        "Terraza en piedra natural alrededor del área de piscina",
        "Estructura de sombra cubierta, junto a chimenea exterior",
        "Preparación del vaso de la piscina, aún sin acabado final",
      ],
      "en-US": [
        "Natural stone patio surrounding the pool area",
        "Covered shade structure next to an outdoor fireplace",
        "Pool shell preparation, not yet at final finish",
      ],
    },
    workCompleted: {
      "es-US": ["Terraza en piedra natural", "Estructura de sombra", "Piscina en preparación"],
      "en-US": ["Natural stone patio", "Shade structure", "Pool in preparation"],
    },
  },
  {
    id: "carport-gable-frame",
    slugs: { "es-US": "construccion-de-cochera", "en-US": "carport-construction" },
    category: "structures",
    status: "in_progress",
    title: { "es-US": "Construcción de cochera", "en-US": "Carport construction" },
    excerpt: {
      "es-US": "Estructura de cochera en madera con cubierta y soporte reforzado.",
      "en-US": "Wood-framed carport structure with roofing and reinforced support.",
    },
    description: {
      "es-US":
        "La cochera se levanta como una estructura independiente de madera junto a la fachada de ladrillo de la vivienda, con columnas y cerchas a la vista que definen ya la pendiente del techo a dos aguas. En esta etapa la madera queda expuesta, sin tejado ni acabado, mostrando el armazón que sostendrá la cubierta final.",
      "en-US":
        "The carport rises as a freestanding wood structure beside the home's brick facade, its posts and trusses already exposed and shaping the gable roofline. At this stage the framing is bare — no roofing or finish yet — showing the skeleton that will carry the final covering.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "estructura-02.jpeg", orientation: "horizontal" },
    // `-03` y `-06` quedan FUERA: muestran a un operario de frente, con el
    // rostro identificable, sin consentimiento por escrito — mismo criterio
    // que las fotos de cocina excluidas más arriba. `-05` y `-07` son la
    // misma cochera (mismo ladrillo, misma cerca, mismo camión) vista desde
    // la calle, sin nadie reconocible en el encuadre.
    gallery: [
      { file: "estructura-02.jpeg", orientation: "horizontal" },
      { file: "estructura-09.jpeg", orientation: "vertical" },
      { file: "estructura-10-gable.jpeg", orientation: "vertical" },
      { file: "estructura-08.jpeg", orientation: "horizontal" },
      { file: "estructura-05.jpeg", orientation: "vertical" },
      { file: "estructura-07.jpeg", orientation: "vertical" },
    ],
    featuredOnHome: false,
    scope: {
      "es-US": [
        "Estructura de cochera en madera, con columnas y vigas de soporte",
        "Techo a dos aguas, armado con cerchas de madera",
        "Entablado y tejado con teja asfáltica",
      ],
      "en-US": [
        "Wood carport structure, with support posts and beams",
        "Gable roof, framed with wood trusses",
        "Roof decking and asphalt shingle roofing",
      ],
    },
    workCompleted: {
      "es-US": ["Estructura de madera", "Armado de techo a dos aguas", "Teja asfáltica"],
      "en-US": ["Wood framing", "Gable roof framing", "Asphalt shingles"],
    },
  },
  {
    id: "quartz-kitchen",
    slugs: { "es-US": "renovacion-de-cocina", "en-US": "kitchen-renovation" },
    category: "kitchens",
    status: "completed",
    title: { "es-US": "Renovación de cocina", "en-US": "Kitchen renovation" },
    excerpt: {
      "es-US": "Actualización completa de cocina con nuevos gabinetes, encimera y salpicadero.",
      "en-US": "Full kitchen update with new cabinets, countertop, and backsplash.",
    },
    description: {
      "es-US":
        "Encimera de cuarzo blanco con vetas grises finas, terminada con un salpicadero a juego que sube directo hasta los gabinetes en madera clara. El fregadero de acero se integra bajo cubierta, con la instalación eléctrica reajustada para quedar al ras de la nueva superficie.",
      "en-US":
        "White quartz countertop with fine gray veining, finished with a matching backsplash that runs straight up to the light wood cabinetry. The stainless undermount sink sits flush with the new surface, with the outlets reset to line up cleanly against it.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-cuarzo-05.jpeg", orientation: "horizontal" },
    // `cocina-cuarzo-04` y `-06` quedan FUERA: en ambas el rostro del operario
    // es identificable y no hay consentimiento por escrito. Ver §Privacidad en
    // AUDITORIA_Y_PLAN_AMPARGO.md. No reincorporar sin autorización firmada.
    // `-02` y `-07` son la misma cocina desde otro ángulo (mismo salpicadero
    // en cascada, mismos armarios claros, misma ventana con rejas) — sin
    // gente en el encuadre, se suman como material adicional real.
    gallery: [
      { file: "cocina-cuarzo-05.jpeg", orientation: "horizontal" },
      { file: "cocina-cuarzo-02.jpeg", orientation: "horizontal" },
      { file: "cocina-cuarzo-07.jpeg", orientation: "horizontal" },
    ],
    featuredOnHome: true,
    scope: {
      "es-US": [
        "Encimera de cuarzo blanco con veta en cascada hasta la barra",
        "Salpicadero a juego, del mostrador al gabinete superior",
        "Ajuste de tomas eléctricas para dejarlas al ras de la encimera nueva",
      ],
      "en-US": [
        "White quartz countertop with waterfall veining down to the bar",
        "Matching backsplash, from the counter to the upper cabinets",
        "Electrical outlets reset flush with the new countertop",
      ],
    },
    workCompleted: {
      "es-US": ["Encimera de cuarzo", "Salpicadero a juego", "Gabinetes en madera clara"],
      "en-US": ["Quartz countertop", "Matching backsplash", "Light wood cabinetry"],
    },
    result: {
      "es-US":
        "La cocina quedó con la encimera y el salpicadero en la misma pieza de cuarzo, así que la veta corre sin cortes de un extremo al otro del mostrador.",
      "en-US":
        "The kitchen was finished with the countertop and backsplash cut from the same quartz slab, so the veining runs uninterrupted across the whole counter.",
    },
  },
  {
    id: "granite-kitchen",
    slugs: { "es-US": "cocina-encimera-granito", "en-US": "granite-countertop-kitchen" },
    category: "kitchens",
    status: "completed",
    title: { "es-US": "Cocina con encimera de granito", "en-US": "Granite countertop kitchen" },
    excerpt: {
      "es-US": "Cocina terminada con encimera de granito e iluminación bajo gabinete.",
      "en-US": "Finished kitchen with granite countertop and under-cabinet lighting.",
    },
    description: {
      "es-US":
        "Gabinetes en verde salvia contrastan con una encimera de granito oscuro de vetas grises y blancas, sobre un salpicadero en azulejo tipo madera. La iluminación bajo gabinete, ya instalada, ilumina el mostrador y resalta el veteado de la piedra.",
      "en-US":
        "Sage-green cabinetry contrasts with a dark granite countertop threaded with gray and white veining, set against a wood-look tile backsplash. Under-cabinet lighting, already wired in, washes over the counter and brings out the stone's veining.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-granito-01.jpeg", orientation: "horizontal" },
    gallery: [{ file: "cocina-granito-01.jpeg", orientation: "horizontal" }],
    featuredOnHome: false,
    scope: {
      "es-US": [
        "Encimera de granito con lavabo doble bajo cubierta",
        "Salpicadero en piedra veteada, a juego con la encimera",
        "Iluminación bajo gabinete a lo largo del mostrador",
      ],
      "en-US": [
        "Granite countertop with an undermount double sink",
        "Veined stone backsplash, matching the countertop",
        "Under-cabinet lighting along the full counter",
      ],
    },
    workCompleted: {
      "es-US": ["Encimera de granito", "Salpicadero en piedra", "Iluminación bajo gabinete"],
      "en-US": ["Granite countertop", "Stone backsplash", "Under-cabinet lighting"],
    },
    result: {
      "es-US":
        "Quedó una cocina con gabinetes en verde salvia, encimera de granito oscuro y la luz bajo gabinete encendida sobre el salpicadero — el contraste es lo que más se nota al entrar.",
      "en-US":
        "The kitchen came together with sage-green cabinetry, a dark granite countertop, and under-cabinet lighting washing over the backsplash — the contrast is the first thing you notice walking in.",
    },
  },
  {
    id: "marble-mosaic-bath",
    slugs: { "es-US": "remodelacion-de-bano", "en-US": "bathroom-remodel" },
    category: "bathrooms",
    status: "in_progress",
    title: { "es-US": "Remodelación de baño", "en-US": "Bathroom remodel" },
    excerpt: {
      "es-US": "Conversión de baño con ducha amplia y acabados en tonos grises.",
      "en-US": "Bathroom conversion with a spacious shower and gray-toned finishes.",
    },
    description: {
      "es-US":
        "La ducha queda revestida en mármol blanco y gris con vetas verticales, con un nicho empotrado en la pared para artículos de baño. El piso continúa en el mismo mármol, cortado en mosaico de patrón cestería, corriendo sin interrupción desde la ducha hasta el resto del baño.",
      "en-US":
        "The shower is tiled in white-and-gray marble with vertical veining, with a built-in wall niche for toiletries. The floor continues in the same marble, cut into a basketweave mosaic that runs unbroken from the shower into the rest of the bathroom.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "bano-01.jpeg", orientation: "vertical" },
    gallery: [
      { file: "bano-01.jpeg", orientation: "vertical" },
      { file: "plomeria-01.jpeg", orientation: "horizontal" },
    ],
    featuredOnHome: true,
    scope: {
      "es-US": [
        "Ducha revestida en mármol, con nicho integrado en la pared",
        "Piso en mosaico de mármol, patrón de cestería",
        "Trabajo de plomería en el desagüe de piso, previo al enchape",
      ],
      "en-US": [
        "Marble-tiled shower, with a built-in wall niche",
        "Basketweave marble mosaic flooring",
        "Plumbing work on the floor drain, ahead of the tile work",
      ],
    },
    workCompleted: {
      "es-US": ["Revestimiento en mármol", "Piso en mosaico", "Plomería de desagüe"],
      "en-US": ["Marble tile work", "Mosaic flooring", "Drain plumbing"],
    },
  },
  {
    id: "blue-bath-renovation",
    slugs: { "es-US": "renovacion-bano-azul", "en-US": "blue-bathroom-renovation" },
    category: "bathrooms",
    status: "in_progress",
    title: {
      "es-US": "Renovación de baño en tonos azules",
      "en-US": "Blue bathroom renovation",
    },
    excerpt: {
      "es-US":
        "Remodelación en proceso con mobiliario azul, superficies claras y ducha revestida.",
      "en-US":
        "Remodel in progress with blue cabinetry, light surfaces, and a tiled shower.",
    },
    description: {
      "es-US":
        "Gabinetes en azul grisáceo enmarcan tanto el lavabo como la tina, ambos rematados en encimera de mármol blanco. Los muros de la tina están revestidos en el mismo mármol veteado que sube hasta la ducha, y el piso combina el mosaico de mármol tipo cestería con el molduraje azul a juego con los gabinetes.",
      "en-US":
        "Blue-gray cabinetry frames both the vanity and the tub, each topped in white marble. The tub surround is clad in the same veined marble that continues into the shower, and the basketweave marble mosaic floor ties the room together with paneling painted to match the cabinetry.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "bano-azul-02-banera.jpeg", orientation: "vertical" },
    gallery: [
      { file: "bano-azul-02-banera.jpeg", orientation: "vertical" },
      { file: "bano-azul-01-lavabo.jpeg", orientation: "horizontal" },
      { file: "bano-azul-03-ducha.jpeg", orientation: "vertical" },
      { file: "bano-azul-04-doble-lavabo.jpeg", orientation: "horizontal" },
    ],
    featuredOnHome: false,
    scope: {
      "es-US": [
        "Gabinetes en tono azul grisáceo, con encimera de mármol",
        "Grifería empotrada en pared, en acabado dorado",
        "Muros en mármol veteado, con nicho en ducha y remate en la tina",
        "Piso en mosaico de mármol tipo cestería",
      ],
      "en-US": [
        "Blue-gray cabinetry, with a marble countertop",
        "Wall-mounted fixtures in a gold finish",
        "Veined marble wall tile, with a shower niche and tub surround",
        "Basketweave marble mosaic flooring",
      ],
    },
    workCompleted: {
      "es-US": ["Gabinetes nuevos", "Encimera de mármol", "Grifería empotrada", "Mosaico de piso"],
      "en-US": ["New cabinetry", "Marble countertop", "Wall-mounted fixtures", "Mosaic flooring"],
    },
  },
  {
    id: "full-bath-rebuild",
    slugs: { "es-US": "renovacion-integral-bano", "en-US": "full-bathroom-rebuild" },
    category: "bathrooms",
    status: "in_progress",
    title: {
      "es-US": "Renovación integral de baño",
      "en-US": "Full bathroom rebuild",
    },
    excerpt: {
      "es-US":
        "Secuencia real de obra: instalaciones, muros, impermeabilización y revestimiento en proceso.",
      "en-US":
        "A real job sequence: systems, walls, waterproofing, and tile work in progress.",
    },
    description: {
      "es-US":
        "El baño se documentó desde los muros abiertos: instalación eléctrica y de plomería nueva antes de cerrar con aislamiento térmico. Ya con las paredes cerradas, el azulejo tipo metro blanco cubre la ducha y el piso se remata en mosaico hexagonal, con la impermeabilización de la zona húmeda hecha antes de colocar el enchape.",
      "en-US":
        "The bathroom was documented from the studs out: new electrical and plumbing rough-in before the walls were closed up with insulation. With the walls finished, white subway tile covers the shower and the floor is set in hexagonal mosaic, with the wet area waterproofed ahead of the tile work.",
    },
    location: "Houston, TX",
    coverPhoto: {
      file: "bano-integral-07-ducha-en-proceso.jpeg",
      orientation: "horizontal",
    },
    gallery: [
      { file: "bano-integral-07-ducha-en-proceso.jpeg", orientation: "horizontal" },
      { file: "bano-integral-01-instalaciones.jpeg", orientation: "vertical" },
      { file: "bano-integral-02-desague.jpeg", orientation: "vertical" },
      { file: "bano-integral-03-plomeria.jpeg", orientation: "vertical" },
      { file: "bano-integral-04-muros.jpeg", orientation: "vertical" },
      { file: "bano-integral-05-piso.jpeg", orientation: "horizontal" },
      { file: "bano-integral-06-piso-detalle.jpeg", orientation: "horizontal" },
      { file: "bano-integral-09-impermeabilizacion-ducha.jpeg", orientation: "vertical" },
      { file: "bano-integral-08-ducha-revestida.jpeg", orientation: "vertical" },
    ],
    featuredOnHome: false,
    // La galería de este proyecto documenta la obra desde los muros abiertos
    // hasta la ducha revestida — el alcance sigue ese mismo orden.
    scope: {
      "es-US": [
        "Instalaciones eléctricas y de plomería nuevas, con muros abiertos",
        "Reconstrucción de muros con aislamiento térmico",
        "Impermeabilización de la zona de ducha antes del enchape",
        "Revestimiento en azulejo tipo metro y piso en mosaico hexagonal",
      ],
      "en-US": [
        "New electrical and plumbing rough-in, with walls opened up",
        "Wall rebuild with thermal insulation",
        "Shower area waterproofing ahead of the tile work",
        "Subway tile walls and hexagonal mosaic flooring",
      ],
    },
    workCompleted: {
      "es-US": ["Plomería", "Electricidad", "Impermeabilización", "Azulejo tipo metro", "Mosaico hexagonal"],
      "en-US": ["Plumbing", "Electrical", "Waterproofing", "Subway tile", "Hexagonal mosaic"],
    },
  },
  {
    id: "exterior-repairs",
    slugs: { "es-US": "reparaciones-exteriores", "en-US": "exterior-repairs" },
    category: "exteriors",
    status: "completed",
    title: { "es-US": "Reparaciones exteriores", "en-US": "Exterior repairs" },
    excerpt: {
      "es-US": "Jardineras nuevas y mejoras de paisajismo junto al área de patio cubierta.",
      "en-US": "New planting beds and landscaping improvements next to the covered patio area.",
    },
    description: {
      "es-US":
        "Junto al área de patio cubierta se instalaron jardineras nuevas, delimitadas con bloque de concreto, y se sembraron plantas ornamentales de hoja púrpura y amarilla contra la fachada de ladrillo. El resultado suaviza el volumen del porche con vegetación recién colocada, lista para crecer.",
      "en-US":
        "New planting beds, framed in concrete block, were added next to the covered patio area, with ornamental purple- and yellow-leafed plants set against the brick facade. The result softens the porch's brick volume with freshly placed greenery, left to fill in.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "exterior-jardin-01.jpeg", orientation: "vertical" },
    gallery: [{ file: "exterior-jardin-01.jpeg", orientation: "vertical" }],
    featuredOnHome: false,
    // Alcance corto a propósito: la única foto disponible es del área de
    // patio con jardineras ya terminadas. El extracto ANTES afirmaba una
    // "reparación de pared de ladrillo" que ninguna foto de este proyecto
    // muestra — se corrigió para no prometer algo que no se puede verificar.
    scope: {
      "es-US": ["Jardineras nuevas junto al área de patio cubierta"],
      "en-US": ["New planting beds next to the covered patio area"],
    },
    workCompleted: {
      "es-US": ["Paisajismo"],
      "en-US": ["Landscaping"],
    },
    result: {
      "es-US": "El área de patio cubierta quedó con jardineras nuevas, integrando vegetación junto al espacio de estar exterior.",
      "en-US": "The covered patio area was finished with new planting beds, bringing greenery right up against the outdoor living space.",
    },
  },
  {
    id: "kitchen-island-waterfall-quartz",
    slugs: { "es-US": "isla-cocina-cuarzo-cascada", "en-US": "kitchen-island-waterfall-quartz" },
    category: "kitchens",
    status: "completed",
    title: {
      "es-US": "Isla de cocina con encimera de cuarzo",
      "en-US": "Kitchen island with quartz countertop",
    },
    excerpt: {
      "es-US": "Reemplazo de encimera en isla de cocina, con salpicadero a juego hasta el techo.",
      "en-US": "Kitchen island countertop replacement, with a matching backsplash up to the ceiling.",
    },
    description: {
      "es-US":
        "La isla se cubrió con cuarzo blanco de veta continua, terminado en cascada por ambos costados hasta el piso, y el salpicadero detrás de la estufa sube en la misma piedra hasta el techo. La veta corre sin interrupción del mostrador al panel lateral, sin corte visible entre piezas.",
      "en-US":
        "The island was clad in continuous-veined white quartz, finished waterfall-style down both sides to the floor, with the backsplash behind the range running in the same stone all the way to the ceiling. The veining runs uninterrupted from the counter into the side panel, with no visible seam between pieces.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-isla-cuarzo-despues.jpg", orientation: "horizontal" },
    gallery: [
      { file: "cocina-isla-cuarzo-despues.jpg", orientation: "horizontal" },
      { file: "cocina-isla-cuarzo-completa.jpg", orientation: "horizontal" },
    ],
    featuredOnHome: false,
    beforeAfterId: "cocina-isla-cuarzo",
    scope: {
      "es-US": [
        "Encimera de isla en cuarzo blanco con veta en cascada",
        "Salpicadero hasta el techo, en la misma piedra",
      ],
      "en-US": [
        "Island countertop in white waterfall-veined quartz",
        "Ceiling-height backsplash in the same stone",
      ],
    },
    workCompleted: {
      "es-US": ["Encimera de cuarzo", "Salpicadero hasta el techo"],
      "en-US": ["Quartz countertop", "Ceiling-height backsplash"],
    },
    result: {
      "es-US":
        "La isla quedó con la encimera y el salpicadero de la misma veta de cuarzo, sin corte visible entre uno y otro.",
      "en-US": "The island ended up with the countertop and backsplash in matching quartz veining, with no visible seam between them.",
    },
  },
  {
    id: "kitchen-subway-tile-backsplash",
    slugs: { "es-US": "cocina-salpicadero-metro", "en-US": "kitchen-subway-tile-backsplash" },
    category: "kitchens",
    status: "completed",
    title: {
      "es-US": "Cocina con salpicadero de azulejo tipo metro",
      "en-US": "Kitchen with subway tile backsplash",
    },
    excerpt: {
      "es-US": "Salpicadero de azulejo tipo metro y encimera de cuarzo blanco.",
      "en-US": "Subway tile backsplash and white quartz countertop.",
    },
    description: {
      "es-US":
        "Azulejo blanco tipo metro cubre la pared de pared a pared, con la encimera de cuarzo blanco corriendo a lo largo de todo el mostrador en L. Los gabinetes y electrodomésticos en blanco, con el lavavajillas en acero inoxidable como único contraste, completan una cocina de líneas limpias y superficies claras.",
      "en-US":
        "White subway tile runs wall-to-wall, with the white quartz countertop stretching the full length of the L-shaped counter. White cabinetry and appliances, with the stainless dishwasher as the only contrast, round out a kitchen built on clean lines and light surfaces.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-metro-blanco-despues.jpg", orientation: "horizontal" },
    gallery: [
      { file: "cocina-metro-blanco-despues.jpg", orientation: "horizontal" },
      { file: "cocina-metro-blanco-detalle.jpg", orientation: "horizontal" },
    ],
    featuredOnHome: false,
    beforeAfterId: "cocina-metro-blanco",
    scope: {
      "es-US": ["Salpicadero de azulejo tipo metro, de mostrador a gabinete", "Encimera de cuarzo blanco"],
      "en-US": ["Subway tile backsplash, from the counter to the cabinets", "White quartz countertop"],
    },
    workCompleted: {
      "es-US": ["Azulejo tipo metro", "Encimera de cuarzo"],
      "en-US": ["Subway tile", "Quartz countertop"],
    },
    result: {
      "es-US": "Cocina con salpicadero de metro blanco de pared a pared y encimera de cuarzo a juego con los electrodomésticos en acero.",
      "en-US": "A kitchen finished with white subway tile wall-to-wall and a quartz countertop that pairs with the stainless appliances.",
    },
  },
  {
    id: "kitchen-gray-mosaic-backsplash",
    slugs: { "es-US": "cocina-mosaico-gris", "en-US": "kitchen-gray-mosaic-backsplash" },
    category: "kitchens",
    status: "completed",
    title: {
      "es-US": "Cocina con salpicadero de mosaico gris",
      "en-US": "Kitchen with gray mosaic backsplash",
    },
    excerpt: {
      "es-US": "Encimera de cuarzo en isla y salpicadero de mosaico hasta el techo.",
      "en-US": "Quartz island countertop with a mosaic backsplash up to the ceiling.",
    },
    description: {
      "es-US":
        "La isla en forma de L se remató en cuarzo blanco con vetas grises suaves, y detrás de la estufa el salpicadero sube en mosaico gris de piso a techo, cubriendo toda la pared. El acabado pulido de la piedra refleja la luz de la cocina, ampliando visualmente el espacio.",
      "en-US":
        "The L-shaped island was finished in white quartz with soft gray veining, and behind the range the backsplash climbs floor-to-ceiling in gray mosaic, covering the full wall. The stone's polished finish reflects the kitchen's light, visually opening up the space.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-mosaico-gris-01.jpg", orientation: "vertical" },
    gallery: [{ file: "cocina-mosaico-gris-01.jpg", orientation: "vertical" }],
    featuredOnHome: false,
    scope: {
      "es-US": ["Encimera de cuarzo en isla", "Salpicadero en mosaico gris, de piso a techo"],
      "en-US": ["Quartz island countertop", "Gray mosaic backsplash, floor to ceiling"],
    },
    workCompleted: {
      "es-US": ["Encimera de cuarzo", "Mosaico de piso a techo"],
      "en-US": ["Quartz countertop", "Floor-to-ceiling mosaic"],
    },
    result: {
      "es-US": "La isla quedó con encimera de cuarzo blanco y, detrás, un muro completo cubierto en mosaico gris hasta el techo.",
      "en-US": "The island was finished with a white quartz countertop, backed by a full wall of gray mosaic running up to the ceiling.",
    },
  },
  {
    id: "living-room-engineered-wood-floor",
    slugs: { "es-US": "sala-piso-madera-tecnica", "en-US": "living-room-engineered-wood-floor" },
    category: "interiors",
    status: "completed",
    title: {
      "es-US": "Sala con piso de madera técnica",
      "en-US": "Living room with engineered wood flooring",
    },
    excerpt: {
      "es-US": "Cambio de piso en sala junto a chimenea de ladrillo pintado de blanco.",
      "en-US": "New flooring in a living room next to a white-painted brick fireplace.",
    },
    description: {
      "es-US":
        "El piso de la sala se cambió a madera técnica en tono gris cálido, corriendo sin interrupción hasta la base de la chimenea de ladrillo pintado de blanco. El brillo satinado del piso nuevo contrasta con el mueble oscuro de la chimenea, dando a la sala una sensación más amplia y luminosa.",
      "en-US":
        "The living room floor was replaced with warm gray engineered wood, running unbroken up to the base of the white-painted brick fireplace. The floor's satin sheen contrasts with the fireplace's dark mantel, giving the room a brighter, more open feel.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "sala-piso-chimenea-despues.jpg", orientation: "horizontal" },
    gallery: [{ file: "sala-piso-chimenea-despues.jpg", orientation: "horizontal" }],
    featuredOnHome: false,
    beforeAfterId: "sala-piso-chimenea",
    scope: {
      "es-US": ["Cambio de piso a madera técnica en toda la sala"],
      "en-US": ["Flooring replaced with engineered wood throughout the living room"],
    },
    workCompleted: {
      "es-US": ["Piso de madera técnica"],
      "en-US": ["Engineered wood flooring"],
    },
    result: {
      "es-US": "La sala quedó con piso de madera técnica de pared a pared, corriendo sin interrupción hasta la base de la chimenea.",
      "en-US": "The living room was finished with engineered wood flooring wall-to-wall, running uninterrupted up to the base of the fireplace.",
    },
  },
  {
    id: "bedroom-closet-wood-floor",
    slugs: { "es-US": "recamara-closet-piso-madera", "en-US": "bedroom-closet-wood-floor" },
    category: "interiors",
    status: "completed",
    title: {
      "es-US": "Recámara con clóset y piso de madera técnica",
      "en-US": "Bedroom with closet and engineered wood flooring",
    },
    excerpt: {
      "es-US": "Piso nuevo y clóset abierto terminados en recámara principal.",
      "en-US": "New flooring and a finished open closet in a primary bedroom.",
    },
    description: {
      "es-US":
        "La recámara principal recibió piso de madera técnica que continúa sin transición hacia el clóset abierto, integrando ambos espacios como uno solo. Un ventilador de techo y las dos ventanas laterales completan una habitación luminosa, ya lista para amueblar.",
      "en-US":
        "The primary bedroom received engineered wood flooring that continues without a transition into the open closet, tying both spaces together as one. A ceiling fan and the two side windows round out a bright room, ready to be furnished.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "interior-recamara-piso-madera.jpg", orientation: "horizontal" },
    gallery: [{ file: "interior-recamara-piso-madera.jpg", orientation: "horizontal" }],
    featuredOnHome: false,
    scope: {
      "es-US": ["Piso de madera técnica en recámara principal", "Clóset abierto terminado"],
      "en-US": ["Engineered wood flooring in the primary bedroom", "Finished open closet"],
    },
    workCompleted: {
      "es-US": ["Piso de madera técnica", "Clóset abierto"],
      "en-US": ["Engineered wood flooring", "Open closet"],
    },
    result: {
      "es-US": "La recámara quedó con piso de madera técnica continuo hasta el clóset abierto, sin transición de material entre los dos espacios.",
      "en-US": "The bedroom was finished with continuous engineered wood flooring running into the open closet, with no material transition between the two spaces.",
    },
  },
  {
    id: "open-concept-interior",
    slugs: { "es-US": "interior-concepto-abierto", "en-US": "open-concept-interior" },
    category: "interiors",
    status: "completed",
    title: { "es-US": "Interior de concepto abierto", "en-US": "Open-concept interior" },
    excerpt: {
      "es-US": "Interior terminado y amueblado con piso de madera y cielorraso de lambrín.",
      "en-US": "Finished, furnished interior with wood flooring and a shiplap ceiling.",
    },
    description: {
      "es-US":
        "El área social se resolvió con piso de madera continuo desde la sala hasta la cocina abierta, bajo un cielorraso de listones de madera con viga vista. Los gabinetes verde salvia de la cocina y los muebles ya colocados muestran el espacio terminado y en uso.",
      "en-US":
        "The social area was finished with continuous wood flooring running from the living room into the open kitchen, under a wood-slat ceiling with an exposed beam. The kitchen's sage-green cabinetry and the furniture already in place show the space finished and lived-in.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "interior-01.jpeg", orientation: "vertical" },
    gallery: [{ file: "interior-01.jpeg", orientation: "vertical" }],
    featuredOnHome: false,
    scope: {
      "es-US": [
        "Cielorraso en madera con viga vista, sobre el área social",
        "Piso de madera del área de estar a la cocina abierta",
      ],
      "en-US": [
        "Wood ceiling with an exposed beam over the living area",
        "Wood flooring from the living area into the open kitchen",
      ],
    },
    workCompleted: {
      "es-US": ["Cielorraso de madera", "Piso de madera", "Concepto abierto"],
      "en-US": ["Wood ceiling", "Wood flooring", "Open-concept layout"],
    },
    result: {
      "es-US":
        "Quedó un espacio social abierto de un extremo a otro: mismo piso de madera desde la sala hasta la cocina, bajo el mismo cielorraso con viga vista.",
      "en-US":
        "The result is one open social space end to end: the same wood flooring runs from the living room into the kitchen, under the same exposed-beam ceiling.",
    },
  },
  {
    id: "kitchen-dark-quartz-progress",
    slugs: { "es-US": "cocina-cuarzo-oscuro", "en-US": "dark-quartz-kitchen" },
    category: "kitchens",
    status: "in_progress",
    title: { "es-US": "Cocina con encimera de cuarzo oscuro", "en-US": "Kitchen with dark quartz countertop" },
    excerpt: {
      "es-US": "Encimera de cuarzo oscuro con veta en cascada, salpicadero en instalación.",
      "en-US": "Dark quartz countertop with waterfall veining, backsplash being installed.",
    },
    description: {
      "es-US":
        "La encimera de cuarzo oscuro, con veta clara en cascada, ya está instalada sobre los gabinetes en madera clara. El salpicadero a juego, con el hueco reservado para la campana extractora, sigue en instalación — la cocina se documenta en plena etapa de acabados.",
      "en-US":
        "The dark quartz countertop, with light waterfall-style veining, is already set over the light wood cabinetry. The matching backsplash, with the niche left open for the range hood, is still being installed — the kitchen is documented mid-finish.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-cuarzo-oscuro-01.jpg", orientation: "horizontal" },
    gallery: [
      { file: "cocina-cuarzo-oscuro-01.jpg", orientation: "horizontal" },
      { file: "cocina-cuarzo-oscuro-02.jpg", orientation: "horizontal" },
      { file: "cocina-cuarzo-oscuro-03.jpg", orientation: "horizontal" },
      { file: "cocina-cuarzo-oscuro-04.jpg", orientation: "horizontal" },
    ],
    featuredOnHome: false,
    scope: {
      "es-US": ["Encimera de cuarzo oscuro con veta clara, tipo cascada", "Salpicadero a juego, con nicho para campana"],
      "en-US": ["Dark quartz countertop with light veining, waterfall style", "Matching backsplash, with a niche for the range hood"],
    },
    workCompleted: {
      "es-US": ["Encimera de cuarzo"],
      "en-US": ["Quartz countertop"],
    },
  },
  {
    id: "kitchen-black-granite",
    slugs: { "es-US": "cocina-granito-negro", "en-US": "black-granite-kitchen" },
    category: "kitchens",
    status: "completed",
    title: { "es-US": "Cocina con encimera de granito negro", "en-US": "Kitchen with black granite countertop" },
    excerpt: {
      "es-US": "Encimera de granito negro con veta clara y gabinetes en madera clara.",
      "en-US": "Black granite countertop with light veining and light wood cabinetry.",
    },
    description: {
      "es-US":
        "La cocina en forma de U se remató en granito negro con vetas doradas y grises que recorren toda la superficie, incluida la isla central con fregadero doble. El contraste entre la piedra oscura y los gabinetes en madera clara define el carácter de este espacio, documentado en obra antes de cerrar la instalación eléctrica de pared.",
      "en-US":
        "The U-shaped kitchen was finished in black granite with gold and gray veining running across the full surface, including the central island with its double sink. The contrast between the dark stone and the light wood cabinetry defines the space, documented mid-project before the wall electrical was closed up.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-granito-negro-01.jpg", orientation: "horizontal" },
    gallery: [{ file: "cocina-granito-negro-01.jpg", orientation: "horizontal" }],
    featuredOnHome: false,
    scope: {
      "es-US": ["Encimera de granito negro con veta clara", "Gabinetes en madera clara con repisas abiertas"],
      "en-US": ["Black granite countertop with light veining", "Light wood cabinetry with open shelving"],
    },
    workCompleted: {
      "es-US": ["Encimera de granito"],
      "en-US": ["Granite countertop"],
    },
    result: {
      "es-US": "Cocina con encimera de granito negro, en contraste marcado con los gabinetes en madera clara y las repisas abiertas.",
      "en-US": "Kitchen finished with a black granite countertop, in sharp contrast with the light wood cabinets and open shelving.",
    },
  },
  {
    id: "kitchen-cherry-subway",
    slugs: { "es-US": "cocina-cerezo-salpicadero-metro", "en-US": "cherry-kitchen-subway-tile" },
    category: "kitchens",
    status: "completed",
    title: {
      "es-US": "Cocina en cerezo con salpicadero tipo metro",
      "en-US": "Cherry kitchen with subway tile backsplash",
    },
    excerpt: {
      "es-US": "Salpicadero de azulejo tipo metro y encimera de cuarzo blanco sobre gabinetes en cerezo.",
      "en-US": "Subway tile backsplash and a white quartz countertop over cherry cabinetry.",
    },
    description: {
      "es-US":
        "Sobre los gabinetes en madera de cerezo se instaló una encimera de cuarzo blanco, con salpicadero de azulejo tipo metro que cubre la pared completa hasta la campana extractora. La combinación de madera oscura y superficies claras mantiene la cocina luminosa sin perder calidez.",
      "en-US":
        "A white quartz countertop was set over the cherry wood cabinetry, with subway tile backsplash covering the full wall up to the range hood. The mix of dark wood and light surfaces keeps the kitchen bright without losing its warmth.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-cerezo-metro-01.jpg", orientation: "horizontal" },
    gallery: [{ file: "cocina-cerezo-metro-01.jpg", orientation: "horizontal" }],
    featuredOnHome: false,
    scope: {
      "es-US": ["Salpicadero de azulejo tipo metro, de pared a pared", "Encimera de cuarzo blanco"],
      "en-US": ["Wall-to-wall subway tile backsplash", "White quartz countertop"],
    },
    workCompleted: {
      "es-US": ["Azulejo tipo metro", "Encimera de cuarzo"],
      "en-US": ["Subway tile", "Quartz countertop"],
    },
    result: {
      "es-US": "Cocina con salpicadero de azulejo tipo metro de pared a pared y encimera de cuarzo blanco sobre los gabinetes en cerezo.",
      "en-US": "Kitchen finished with wall-to-wall subway tile and a white quartz countertop over the cherry cabinetry.",
    },
  },
  {
    id: "kitchen-white-inprogress",
    slugs: { "es-US": "cocina-blanca-en-proceso", "en-US": "white-kitchen-in-progress" },
    category: "kitchens",
    status: "in_progress",
    title: { "es-US": "Cocina blanca en instalación", "en-US": "White kitchen under installation" },
    excerpt: {
      "es-US": "Gabinetes blancos con microondas empotrado, encimera en instalación.",
      "en-US": "White cabinetry with a built-in microwave, countertop being installed.",
    },
    description: {
      "es-US":
        "Los gabinetes blancos nuevos ya están instalados, con el microondas empotrado sobre la estufa y la encimera clara colocada en la sección principal. La esquina en L, con la instalación de plomería aún a la vista, muestra la cocina en plena etapa de montaje antes del remate final.",
      "en-US":
        "The new white cabinetry is already in, with a built-in microwave over the range and the light countertop set on the main run. The L-shaped corner, with the plumbing rough-in still exposed, shows the kitchen mid-installation, ahead of the final finish.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-blanca-proceso-01.jpg", orientation: "vertical" },
    gallery: [{ file: "cocina-blanca-proceso-01.jpg", orientation: "vertical" }],
    featuredOnHome: false,
    scope: {
      "es-US": ["Gabinetes blancos nuevos, con microondas empotrado", "Encimera clara en instalación"],
      "en-US": ["New white cabinetry, with a built-in microwave", "Light countertop being installed"],
    },
    workCompleted: {
      "es-US": ["Gabinetes nuevos"],
      "en-US": ["New cabinetry"],
    },
  },
  {
    id: "kitchen-full-remodel",
    slugs: { "es-US": "cocina-remodelacion-completa", "en-US": "full-kitchen-remodel" },
    category: "kitchens",
    status: "completed",
    title: { "es-US": "Remodelación completa de cocina", "en-US": "Full kitchen remodel" },
    excerpt: {
      "es-US": "Encimera de cuarzo blanco nueva sobre gabinetes en madera repintados.",
      "en-US": "New white quartz countertop over repainted wood cabinetry.",
    },
    description: {
      "es-US":
        "Los gabinetes originales en madera se conservaron y repintaron, y sobre ellos se instaló una encimera de cuarzo blanco nueva que reemplazó tanto el mostrador como el salpicadero anteriores. El resultado combina la estructura ya existente de la cocina con superficies completamente renovadas.",
      "en-US":
        "The original wood cabinetry was kept and repainted, and a new white quartz countertop was installed over it, replacing both the old counter and backsplash. The result pairs the kitchen's existing structure with fully renewed surfaces.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-remodelacion-despues.jpg", orientation: "horizontal" },
    gallery: [
      { file: "cocina-remodelacion-despues.jpg", orientation: "horizontal" },
      { file: "cocina-remodelacion-antes.jpg", orientation: "horizontal" },
    ],
    featuredOnHome: false,
    beforeAfterId: "cocina-remodelacion",
    scope: {
      "es-US": ["Retiro del respaldo y la encimera anteriores", "Encimera de cuarzo blanco nueva", "Gabinetes repintados"],
      "en-US": ["Removal of the previous backsplash and countertop", "New white quartz countertop", "Repainted cabinetry"],
    },
    workCompleted: {
      "es-US": ["Encimera de cuarzo", "Gabinetes repintados"],
      "en-US": ["Quartz countertop", "Repainted cabinetry"],
    },
    result: {
      "es-US": "La cocina quedó con encimera de cuarzo blanco nueva sobre los mismos gabinetes, ahora repintados.",
      "en-US": "The kitchen was finished with a new white quartz countertop over the same cabinetry, now repainted.",
    },
  },
  {
    id: "staircase-kitchen-marble",
    slugs: { "es-US": "escalera-cocina-piso-marmol", "en-US": "staircase-kitchen-marble-floor" },
    category: "interiors",
    status: "in_progress",
    title: {
      "es-US": "Piso en mármol de escalera a cocina",
      "en-US": "Marble-look flooring from the staircase to the kitchen",
    },
    excerpt: {
      "es-US": "Piso en mármol tipo mosaico corriendo de la escalera al área de cocina abierta.",
      "en-US": "Marble mosaic-look flooring running from the staircase into the open kitchen area.",
    },
    description: {
      "es-US":
        "El piso en mármol tipo mosaico corre desde la base de la escalera hasta el área de cocina abierta, sin corte entre ambos espacios. La isla de cocina, todavía protegida bajo plástico, se documenta en plena instalación junto al resto de la obra en proceso.",
      "en-US":
        "Marble mosaic-look flooring runs from the base of the staircase into the open kitchen area, with no break between the two spaces. The kitchen island, still wrapped in protective plastic, is documented mid-installation alongside the rest of the ongoing work.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "escalera-cocina-marmol-01.jpg", orientation: "horizontal" },
    gallery: [
      { file: "escalera-cocina-marmol-01.jpg", orientation: "horizontal" },
      { file: "escalera-cocina-marmol-02.jpg", orientation: "horizontal" },
      { file: "escalera-cocina-marmol-03.jpg", orientation: "vertical" },
    ],
    featuredOnHome: false,
    scope: {
      "es-US": [
        "Piso en mármol tipo mosaico, de la escalera al área de cocina",
        "Isla de cocina en instalación, protegida bajo plástico",
      ],
      "en-US": [
        "Marble mosaic-look flooring, from the staircase into the kitchen area",
        "Kitchen island under installation, protected under plastic",
      ],
    },
    workCompleted: {
      "es-US": ["Piso de mármol"],
      "en-US": ["Marble flooring"],
    },
  },
  {
    id: "kitchen-decorative-backsplash",
    slugs: { "es-US": "cocina-salpicadero-decorativo", "en-US": "kitchen-decorative-backsplash" },
    category: "kitchens",
    status: "completed",
    title: { "es-US": "Cocina con salpicadero decorativo", "en-US": "Kitchen with decorative backsplash" },
    excerpt: {
      "es-US": "Salpicadero en patrón geométrico e isla con fregadero doble, abierta al comedor.",
      "en-US": "Geometric-pattern backsplash and an island with a double sink, open to the dining area.",
    },
    description: {
      "es-US":
        "Un salpicadero en azulejo con patrón decorativo cubre la pared completa detrás de la estufa, aportando el único punto de color en una cocina blanca de líneas simples. La isla con fregadero doble se abre hacia el comedor, y las puertas francesas al fondo conectan la cocina directamente con el patio.",
      "en-US":
        "A decorative-pattern tile backsplash covers the full wall behind the range, giving the only pop of pattern in an otherwise all-white kitchen. The island with its double sink opens onto the dining area, and the French doors at the back connect the kitchen straight out to the patio.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-mosaico-decorativo-01.jpg", orientation: "horizontal" },
    gallery: [
      { file: "cocina-mosaico-decorativo-01.jpg", orientation: "horizontal" },
      { file: "cocina-mosaico-decorativo-02.jpg", orientation: "horizontal" },
    ],
    featuredOnHome: false,
    scope: {
      "es-US": ["Salpicadero decorativo en patrón geométrico", "Isla con fregadero doble y grifería nueva"],
      "en-US": ["Decorative geometric-pattern backsplash", "Island with a double sink and new faucet"],
    },
    workCompleted: {
      "es-US": ["Salpicadero decorativo", "Isla con fregadero"],
      "en-US": ["Decorative backsplash", "Island with sink"],
    },
    result: {
      "es-US": "Cocina terminada con salpicadero decorativo geométrico e isla con fregadero doble, abierta a la zona de comedor.",
      "en-US": "Kitchen finished with a decorative geometric backsplash and an island with a double sink, opening onto the dining area.",
    },
  },
  {
    id: "kitchen-patterned-tile-island",
    slugs: { "es-US": "cocina-isla-mosaico-patron", "en-US": "kitchen-patterned-tile-island" },
    category: "kitchens",
    status: "completed",
    title: { "es-US": "Isla de cocina con salpicadero en mosaico patrón", "en-US": "Kitchen island with patterned tile backsplash" },
    excerpt: {
      "es-US": "Encimera de cuarzo blanco en isla, con salpicadero en azulejo de patrón decorativo.",
      "en-US": "White quartz island countertop, with a decorative patterned tile backsplash.",
    },
    description: {
      "es-US":
        "El salpicadero en mosaico de patrón geométrico gris y azul cubre la pared detrás de la estufa, mientras que la isla se remató en cuarzo blanco con vetas suaves. Una ventana de vidrio en bloque deja pasar luz natural sin sacrificar privacidad, en una cocina con gabinetes blancos de línea shaker.",
      "en-US":
        "A gray-and-blue geometric patterned mosaic backsplash covers the wall behind the range, while the island was finished in white quartz with soft veining. A glass block window lets natural light in without giving up privacy, in a kitchen finished with white shaker cabinetry.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-mosaico-patron-01.jpg", orientation: "horizontal" },
    gallery: [
      { file: "cocina-mosaico-patron-01.jpg", orientation: "horizontal" },
      { file: "cocina-mosaico-patron-antes.jpg", orientation: "horizontal" },
    ],
    featuredOnHome: false,
    beforeAfterId: "cocina-mosaico-patron",
    scope: {
      "es-US": ["Retiro del respaldo y la isla anteriores", "Encimera de cuarzo blanco en isla", "Salpicadero en mosaico patrón"],
      "en-US": ["Removal of the previous backsplash and island", "White quartz island countertop", "Patterned mosaic backsplash"],
    },
    workCompleted: {
      "es-US": ["Encimera de cuarzo", "Mosaico decorativo"],
      "en-US": ["Quartz countertop", "Decorative mosaic"],
    },
    result: {
      "es-US": "La isla quedó con encimera de cuarzo blanco y, detrás, un salpicadero en mosaico patrón, sobre los mismos gabinetes blancos.",
      "en-US": "The island was finished with a white quartz countertop, backed by a patterned mosaic backsplash, over the same white cabinetry.",
    },
  },
  {
    id: "kitchen-gray-shaker",
    slugs: { "es-US": "cocina-shaker-gris", "en-US": "gray-shaker-kitchen" },
    category: "kitchens",
    status: "completed",
    title: { "es-US": "Cocina con gabinetes estilo shaker", "en-US": "Kitchen with shaker-style cabinetry" },
    excerpt: {
      "es-US": "Gabinetes estilo shaker en gris con encimera de cuarzo a juego.",
      "en-US": "Gray shaker-style cabinetry with a matching quartz countertop.",
    },
    description: {
      "es-US":
        "Los gabinetes estilo shaker, en un tono claro, se combinan con una encimera de cuarzo gris y blanco que recorre toda la cocina en L. La obra se documenta con la instalación eléctrica de pared aún expuesta, antes del remate final de la pintura y los herrajes.",
      "en-US":
        "Shaker-style cabinetry in a light tone pairs with a gray-and-white quartz countertop running the full length of the L-shaped kitchen. The project is documented with the wall electrical still exposed, ahead of the final paint and hardware finish.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-shaker-gris-01.jpg", orientation: "horizontal" },
    gallery: [{ file: "cocina-shaker-gris-01.jpg", orientation: "horizontal" }],
    featuredOnHome: false,
    scope: {
      "es-US": ["Gabinetes estilo shaker en gris", "Encimera de cuarzo gris y blanco"],
      "en-US": ["Gray shaker-style cabinetry", "Gray-and-white quartz countertop"],
    },
    workCompleted: {
      "es-US": ["Gabinetes shaker", "Encimera de cuarzo"],
      "en-US": ["Shaker cabinetry", "Quartz countertop"],
    },
    result: {
      "es-US": "Cocina con gabinetes estilo shaker en gris y encimera de cuarzo a juego.",
      "en-US": "Kitchen finished with gray shaker-style cabinetry and a matching quartz countertop.",
    },
  },
  {
    id: "kitchen-waterfall-cascade-island",
    slugs: { "es-US": "cocina-isla-cascada-cuarzo", "en-US": "waterfall-quartz-island-kitchen" },
    category: "kitchens",
    status: "completed",
    title: { "es-US": "Cocina con isla en cascada de cuarzo", "en-US": "Kitchen with waterfall quartz island" },
    excerpt: {
      "es-US": "Encimera e isla de cuarzo blanco con veta continua, terminada en cascada a ambos lados.",
      "en-US": "White quartz countertop and island with continuous veining, finished waterfall-style on both sides.",
    },
    description: {
      "es-US":
        "La misma veta de cuarzo blanco corre desde el salpicadero, que sube hasta el gabinete alto, hasta el panel lateral de la isla, terminado en cascada. Los gabinetes en madera clara y la iluminación bajo gabinete completan una cocina donde la piedra es la protagonista.",
      "en-US":
        "The same white quartz veining runs from the backsplash — which climbs up to the upper cabinet — down the island's waterfall side panel. Light wood cabinetry and under-cabinet lighting round out a kitchen where the stone does the talking.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-cascada-cuarzo-01.jpg", orientation: "horizontal" },
    gallery: [
      { file: "cocina-cascada-cuarzo-01.jpg", orientation: "horizontal" },
      { file: "cocina-cascada-cuarzo-02.jpg", orientation: "vertical" },
      { file: "cocina-cascada-cuarzo-03.jpg", orientation: "horizontal" },
      { file: "cocina-cascada-cuarzo-04.jpg", orientation: "vertical" },
      { file: "cocina-cascada-cuarzo-05.jpg", orientation: "horizontal" },
    ],
    featuredOnHome: false,
    scope: {
      "es-US": ["Encimera de cuarzo blanco con veta continua", "Isla con panel lateral en cascada", "Salpicadero de cuarzo a juego, de encimera a gabinete alto"],
      "en-US": ["White quartz countertop with continuous veining", "Island with a waterfall side panel", "Matching quartz backsplash, from counter to upper cabinet"],
    },
    workCompleted: {
      "es-US": ["Encimera de cuarzo", "Isla en cascada", "Salpicadero de cuarzo"],
      "en-US": ["Quartz countertop", "Waterfall island", "Quartz backsplash"],
    },
    result: {
      "es-US": "La cocina quedó con la misma veta de cuarzo corriendo desde el salpicadero hasta el panel en cascada de la isla, sobre gabinetes en madera clara.",
      "en-US": "The kitchen was finished with the same quartz veining running from the backsplash down the island's waterfall panel, over light wood cabinetry.",
    },
  },
  {
    id: "kitchen-dark-stone-sage-cabinets",
    slugs: { "es-US": "cocina-granito-gabinetes-salvia", "en-US": "dark-stone-sage-cabinet-kitchen" },
    category: "kitchens",
    status: "completed",
    title: { "es-US": "Cocina con encimera oscura y gabinetes verde salvia", "en-US": "Kitchen with dark countertop and sage cabinetry" },
    excerpt: {
      "es-US": "Encimera de piedra oscura con veta clara, salpicadero en madera y gabinetes verde salvia, abierta a la sala.",
      "en-US": "Dark stone countertop with light veining, wood-look backsplash and sage cabinetry, open to the living area.",
    },
    description: {
      "es-US":
        "Gabinetes en verde salvia con grifería en negro mate se combinan con una encimera de piedra oscura de veta clara y un salpicadero en azulejo tipo madera. El fregadero doble en acero y la iluminación bajo gabinete completan una cocina abierta hacia la sala, en tonos cálidos y naturales.",
      "en-US":
        "Sage-green cabinetry with matte black fixtures pairs with a dark stone countertop threaded with light veining and a wood-look tile backsplash. A stainless double sink and under-cabinet lighting complete a kitchen that opens onto the living area, in warm, natural tones.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cocina-granito-salvia-01.jpg", orientation: "horizontal" },
    gallery: [
      { file: "cocina-granito-salvia-01.jpg", orientation: "horizontal" },
      { file: "cocina-granito-salvia-02.jpg", orientation: "vertical" },
    ],
    featuredOnHome: false,
    scope: {
      "es-US": ["Encimera de piedra oscura con veta clara", "Salpicadero en azulejo tipo madera", "Gabinetes verde salvia con grifería negro mate", "Fregadero doble en acero"],
      "en-US": ["Dark stone countertop with light veining", "Wood-look tile backsplash", "Sage cabinetry with matte black fixtures", "Stainless double sink"],
    },
    workCompleted: {
      "es-US": ["Encimera de piedra", "Salpicadero", "Gabinetes"],
      "en-US": ["Stone countertop", "Backsplash", "Cabinetry"],
    },
    result: {
      "es-US": "Cocina abierta a la sala, con encimera de piedra oscura, salpicadero en azulejo tipo madera y gabinetes verde salvia.",
      "en-US": "The kitchen opens onto the living area, finished with a dark stone countertop, wood-look tile backsplash and sage cabinetry.",
    },
  },
  {
    id: "carport-new-build",
    slugs: { "es-US": "cochera-nueva-construccion", "en-US": "new-carport-build" },
    category: "structures",
    status: "completed",
    title: { "es-US": "Cochera de madera — construcción nueva", "en-US": "Wood carport — new build" },
    excerpt: {
      "es-US": "Cochera independiente en estructura de madera, con techo a dos aguas y tejas asfálticas.",
      "en-US": "Freestanding wood-frame carport, with a gable roof and asphalt shingles.",
    },
    description: {
      "es-US":
        "La cochera se construyó como estructura independiente de madera, con el techo a dos aguas ya cerrado en teja asfáltica que combina con el tejado de la casa. Se ve terminada y despejada, ubicada sobre la entrada de concreto, junto al buzón de la vivienda.",
      "en-US":
        "The carport was built as a freestanding wood structure, its gable roof already closed in with asphalt shingles matching the house's own roofline. It's shown finished and clear, set over the concrete driveway right next to the home's mailbox.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cochera-nueva-01.jpg", orientation: "vertical" },
    gallery: [
      { file: "cochera-nueva-01.jpg", orientation: "vertical" },
      { file: "cochera-nueva-02.jpg", orientation: "horizontal" },
    ],
    featuredOnHome: false,
    scope: {
      "es-US": ["Estructura de madera con techo a dos aguas", "Tejas asfálticas a juego con la vivienda"],
      "en-US": ["Wood-frame structure with a gable roof", "Asphalt shingles matching the house"],
    },
    workCompleted: {
      "es-US": ["Estructura de madera", "Techado"],
      "en-US": ["Wood framing", "Roofing"],
    },
    result: {
      "es-US": "Cochera terminada junto a la entrada de la vivienda, con el mismo tejado asfáltico de la casa.",
      "en-US": "The carport was finished beside the driveway, roofed with shingles matching the house.",
    },
  },
  {
    id: "carport-arched-window-house",
    slugs: { "es-US": "cochera-fachada-arcos", "en-US": "carport-arched-window-facade" },
    category: "structures",
    status: "completed",
    title: { "es-US": "Cochera con techo a dos aguas", "en-US": "Gable-roof carport" },
    excerpt: {
      "es-US": "Cochera de madera con techo a dos aguas junto a fachada de ladrillo con ventanas en arco.",
      "en-US": "Wood-frame gable-roof carport beside a brick facade with arched windows.",
    },
    description: {
      "es-US":
        "Junto a una fachada de ladrillo con ventana en arco, se levantó una cochera de madera con techo a dos aguas y teja asfáltica ya terminada. El área bajo cubierta, ya en uso con plantas del propietario, muestra la estructura integrada a la entrada de la vivienda.",
      "en-US":
        "Beside a brick facade with an arched window, a wood-frame carport went up with a finished gable roof and asphalt shingles. The covered area, already put to use with the owner's plants, shows the structure folded right into the home's entrance.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "cochera-arcos-01.jpg", orientation: "vertical" },
    gallery: [
      { file: "cochera-arcos-01.jpg", orientation: "vertical" },
      { file: "cochera-arcos-02.jpg", orientation: "vertical" },
      { file: "cochera-arcos-03.jpg", orientation: "horizontal" },
    ],
    featuredOnHome: false,
    scope: {
      "es-US": ["Estructura de madera con techo a dos aguas", "Tejas asfálticas", "Área cubierta lista para plantas y estar"],
      "en-US": ["Wood-frame structure with a gable roof", "Asphalt shingles", "Covered area ready for plants and seating"],
    },
    workCompleted: {
      "es-US": ["Estructura de madera", "Techado"],
      "en-US": ["Wood framing", "Roofing"],
    },
    result: {
      "es-US": "Cochera terminada con área cubierta junto a la fachada, ya en uso con plantas del propietario.",
      "en-US": "The finished carport left a covered area beside the facade, already in use with the owner's plants.",
    },
  },
  {
    id: "aloha-beauty-lounge-reception",
    slugs: { "es-US": "mostrador-aloha-beauty-lounge", "en-US": "aloha-beauty-lounge-reception-desk" },
    category: "interiors",
    status: "completed",
    title: {
      "es-US": "Mostrador de recepción — Aloha Beauty Lounge",
      "en-US": "Reception desk — Aloha Beauty Lounge",
    },
    excerpt: {
      "es-US": "Mostrador de recepción en cuarzo con veta y panel lateral dorado, para un local comercial.",
      "en-US": "Veined quartz reception desk with a gold side panel, for a commercial space.",
    },
    description: {
      "es-US":
        "El mostrador de recepción se fabricó en cuarzo blanco con veta continua, sobre una base recta rematada con un panel lateral en acabado dorado. Se instaló frente al rótulo iluminado del local, en un espacio comercial pintado en tono rosa palo.",
      "en-US":
        "The reception desk was built in continuous-veined white quartz, on a straight base finished with a gold side panel. It sits facing the shop's lit-up sign, in a commercial space painted in a soft blush pink.",
    },
    location: "Houston, TX",
    coverPhoto: { file: "aloha-recepcion-despues.jpg", orientation: "horizontal" },
    gallery: [
      { file: "aloha-recepcion-despues.jpg", orientation: "horizontal" },
      { file: "aloha-recepcion-antes.jpg", orientation: "horizontal" },
    ],
    featuredOnHome: false,
    beforeAfterId: "aloha-recepcion",
    scope: {
      "es-US": ["Mostrador de recepción en cuarzo con veta", "Panel lateral en acabado dorado"],
      "en-US": ["Veined quartz reception desk", "Gold-finish side panel"],
    },
    workCompleted: {
      "es-US": ["Mostrador de cuarzo", "Panel dorado"],
      "en-US": ["Quartz desk", "Gold panel"],
    },
    result: {
      "es-US": "El mostrador quedó terminado en cuarzo con veta continua y el panel lateral dorado ya fijado, frente al rótulo del local.",
      "en-US": "The desk was finished in continuous-veined quartz with the gold side panel fixed in place, facing the shop's sign.",
    },
  },
];

export function getFeaturedProjects(): Project[] {
  return PROJECTS.filter((p) => p.featuredOnHome);
}

export function getProjectBySlug(locale: AppLocale, slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slugs[locale] === slug);
}

export function getProjectsByCategory(category: ProjectCategory | "all"): Project[] {
  if (category === "all") return PROJECTS;
  return PROJECTS.filter((p) => p.category === category);
}
