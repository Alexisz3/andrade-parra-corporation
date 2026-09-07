import type { AppLocale } from "@/i18n/routing";
import type { ProjectCategory } from "./projects";

/**
 * Servicios — fuente única.
 *
 * REGLA DE CONTENIDO: aquí solo entra lo que el cliente confirmó en el
 * formulario de levantamiento, redactado en términos generales. Está
 * PROHIBIDO afirmar licencias, permisos, certificaciones, años, número de
 * obras, garantías, precios, plazos fijos o disponibilidad. El alcance se
 * describe como orientativo porque cada obra es distinta y el cliente no ha
 * validado alcances concretos por servicio.
 */
export interface Service {
  /** Estable e independiente del idioma. Se usa para emparejar slugs y para
   *  preseleccionar el servicio en el formulario de cotización. */
  id: string;
  slugs: Record<AppLocale, string>;
  title: Record<AppLocale, string>;
  shortDescription: Record<AppLocale, string>;
  introduction: Record<AppLocale, string>;
  scopeItems: Record<AppLocale, string[]>;
  processSummary: Record<AppLocale, string[]>;
  /**
   * Título de buscador. Distinto del `title` de pantalla a propósito.
   *
   * En pantalla, dentro de la página de servicios, «Cocinas y baños» basta y
   * sobra: el contexto lo pone la página. En un resultado de Google no hay
   * contexto — compite con otros veinte enlaces— y hace falta decir qué es y
   * dónde: «Remodelación de cocinas y baños en Houston, TX».
   *
   * REGLA DE CONTENIDO: aquí tampoco entran licencias, años, garantías ni
   * superlativos. Un título de buscador es una promesa que se lee antes de
   * entrar; falsearlo sale más caro que en cualquier otro sitio del sitio.
   */
  seoTitle: Record<AppLocale, string>;
  /** Descripción de buscador, ~155 caracteres. Se corta a partir de ahí. */
  seoDescription: Record<AppLocale, string>;
  relatedProjectCategories: ProjectCategory[];
  heroImage: string;
  published: boolean;
}

export const SERVICES: Service[] = [
  {
    id: "custom-construction",
    slugs: { "es-US": "construccion-personalizada", "en-US": "custom-construction" },
    title: { "es-US": "Construcción personalizada", "en-US": "Custom construction" },
    shortDescription: {
      "es-US": "Casas nuevas a medida con atención al detalle y ejecución precisa.",
      "en-US": "Custom new homes with attention to detail and precise execution.",
    },
    introduction: {
      "es-US":
        "Construimos viviendas nuevas desde la planificación hasta la entrega. Cada proyecto parte de lo que usted necesita: el terreno, la distribución que busca y cómo quiere vivir el espacio. El alcance se define después de revisar el proyecto en conjunto.",
      "en-US":
        "We build new homes from planning through handover. Every project starts from what you need: the lot, the layout you're after, and how you want to live in the space. Scope is defined after we review the project together.",
    },
    scopeItems: {
      "es-US": [
        "Revisión del proyecto y del terreno antes de definir alcance",
        "Planificación de obra: tiempos, materiales y equipo",
        "Estructura y cerramientos",
        "Instalaciones eléctricas y sanitarias",
        "Acabados interiores y exteriores",
        "Coordinación con arquitectos o ingenieros cuando el proyecto lo requiere",
      ],
      "en-US": [
        "Project and lot review before defining scope",
        "Job planning: schedule, materials, and crew",
        "Structure and envelope",
        "Electrical and plumbing",
        "Interior and exterior finishes",
        "Coordination with architects or engineers when the project calls for it",
      ],
    },
    processSummary: {
      "es-US": [
        "Conversamos sobre el proyecto y visitamos el terreno.",
        "Definimos alcance, materiales y cronograma.",
        "Ejecutamos la obra documentando cada etapa con fotografías.",
        "Revisamos el resultado con usted antes de entregar.",
      ],
      "en-US": [
        "We talk through the project and visit the site.",
        "We define scope, materials, and schedule.",
        "We build, documenting each stage with photographs.",
        "We review the result with you before handover.",
      ],
    },
    seoTitle: {
      "es-US": "Construcción de casas a medida en Houston, TX",
      "en-US": "Custom Home Construction in Houston, TX",
    },
    seoDescription: {
      "es-US":
        "Construimos viviendas nuevas en Houston y alrededores, de la planificación a la entrega. Revisamos el terreno y el proyecto antes de definir el alcance.",
      "en-US":
        "We build new homes in Houston and nearby areas, from planning through handover. We review the lot and the project before defining scope.",
    },
    relatedProjectCategories: ["structures", "exteriors"],
    heroImage: "estructura-02.jpeg",
    published: true,
  },

  {
    id: "remodeling",
    slugs: { "es-US": "remodelaciones", "en-US": "remodeling" },
    title: { "es-US": "Remodelaciones", "en-US": "Remodeling" },
    shortDescription: {
      "es-US": "Transformamos espacios existentes para adaptarlos a su estilo de vida.",
      "en-US": "We transform existing spaces to fit your lifestyle.",
    },
    introduction: {
      "es-US":
        "Renovamos espacios que ya existen: desde una habitación hasta una vivienda completa. Antes de proponer nada revisamos el estado real de lo que hay, porque en remodelación lo que se encuentra al abrir un muro cambia el alcance.",
      "en-US":
        "We renovate spaces that already exist — from a single room to a whole home. Before proposing anything we look at the real condition of what's there, because in remodeling what you find behind a wall changes the scope.",
    },
    scopeItems: {
      "es-US": [
        "Revisión del estado actual antes de definir alcance",
        "Demolición controlada y retiro de material",
        "Reparación de estructura y muros cuando se requiere",
        "Actualización de instalaciones eléctricas y sanitarias",
        "Pisos, paredes y acabados",
        "Adecuación de distribución y espacios",
      ],
      "en-US": [
        "Assessment of current condition before defining scope",
        "Controlled demolition and debris removal",
        "Structural and wall repair where needed",
        "Electrical and plumbing updates",
        "Flooring, walls, and finishes",
        "Layout and space reconfiguration",
      ],
    },
    processSummary: {
      "es-US": [
        "Visitamos el espacio y revisamos qué hay detrás de los acabados.",
        "Definimos alcance sobre lo que encontramos, no sobre supuestos.",
        "Ejecutamos y documentamos el proceso con fotografías.",
        "Revisamos el resultado con usted.",
      ],
      "en-US": [
        "We visit the space and check what's behind the finishes.",
        "We define scope from what we find, not from assumptions.",
        "We execute and document the process with photographs.",
        "We review the result with you.",
      ],
    },
    seoTitle: {
      "es-US": "Remodelación de viviendas en Houston, TX",
      "en-US": "Home Remodeling in Houston, TX",
    },
    seoDescription: {
      "es-US":
        "Remodelación de casas en Houston y alrededores: interiores, distribución y acabados. Cuéntenos qué quiere cambiar y revisamos el espacio con usted.",
      "en-US":
        "Home remodeling in Houston and nearby areas: interiors, layout and finishes. Tell us what you want to change and we'll look at the space with you.",
    },
    relatedProjectCategories: ["kitchens", "bathrooms", "interiors"],
    heroImage: "interior-01.jpeg",
    published: true,
  },

  {
    id: "kitchens-bathrooms",
    slugs: { "es-US": "cocinas-y-banos", "en-US": "kitchens-and-bathrooms" },
    title: { "es-US": "Cocinas y baños", "en-US": "Kitchens & bathrooms" },
    shortDescription: {
      "es-US": "Diseño y renovación con acabados de calidad y funcionalidad.",
      "en-US": "Design and renovation with quality finishes and function.",
    },
    introduction: {
      "es-US":
        "Cocinas y baños son los espacios donde más se nota el acabado y donde más instalaciones se cruzan. Trabajamos encimeras, salpicaderos, gabinetes, revestimientos y la plomería que hay detrás, coordinando cada etapa para que el resultado funcione además de verse bien.",
      "en-US":
        "Kitchens and bathrooms are where finishes show most and where the most systems overlap. We handle countertops, backsplashes, cabinetry, tile, and the plumbing behind it, coordinating each stage so the result works as well as it looks.",
    },
    scopeItems: {
      "es-US": [
        "Encimeras y salpicaderos en cuarzo, granito y otros materiales",
        "Instalación de gabinetes",
        "Revestimientos de pared y piso",
        "Plomería: desde la instalación oculta hasta la grifería",
        "Duchas, incluidas conversiones a ras de piso",
        "Iluminación y tomas asociadas al espacio",
      ],
      "en-US": [
        "Countertops and backsplashes in quartz, granite, and other materials",
        "Cabinet installation",
        "Wall and floor tile",
        "Plumbing: from rough-in through fixtures",
        "Showers, including curbless conversions",
        "Lighting and outlets tied to the space",
      ],
    },
    processSummary: {
      "es-US": [
        "Revisamos el espacio, las instalaciones existentes y sus preferencias.",
        "Definimos materiales y alcance.",
        "Ejecutamos coordinando plomería, revestimiento y acabado.",
        "Revisamos el resultado antes de dar por terminada la obra.",
      ],
      "en-US": [
        "We review the space, the existing systems, and your preferences.",
        "We define materials and scope.",
        "We execute, coordinating plumbing, tile, and finish work.",
        "We review the result before calling the job done.",
      ],
    },
    seoTitle: {
      "es-US": "Remodelación de cocinas y baños en Houston, TX",
      "en-US": "Kitchen & Bathroom Remodeling in Houston, TX",
    },
    seoDescription: {
      "es-US":
        "Cocinas y baños en Houston y alrededores: encimeras, alacenas, azulejo, plomería y acabados. Vemos el espacio antes de dar un número.",
      "en-US":
        "Kitchens and bathrooms in Houston and nearby areas: countertops, cabinets, tile, plumbing and finishes. We see the space before giving you a number.",
    },
    relatedProjectCategories: ["kitchens", "bathrooms"],
    heroImage: "cocina-granito-01.jpeg",
    published: true,
  },

  {
    id: "outdoor-spaces",
    slugs: { "es-US": "espacios-exteriores", "en-US": "outdoor-spaces" },
    title: { "es-US": "Espacios exteriores", "en-US": "Outdoor spaces" },
    shortDescription: {
      "es-US": "Patios, terrazas, cocinas exteriores y piscinas construidas para durar.",
      "en-US": "Patios, decks, outdoor kitchens, and pools built to last.",
    },
    introduction: {
      "es-US":
        "Construimos espacios exteriores pensados para el clima de Houston: terrazas, patios, cocinas al aire libre, cocheras y estructuras de sombra. El material y el drenaje pesan tanto como el diseño, y eso se decide sobre el terreno.",
      "en-US":
        "We build outdoor spaces made for Houston's climate: decks, patios, outdoor kitchens, carports, and shade structures. Material and drainage matter as much as design, and that gets decided on site.",
    },
    scopeItems: {
      "es-US": [
        "Terrazas y patios en piedra, concreto u otros materiales",
        "Cocheras y estructuras de sombra en madera",
        "Cocinas exteriores y áreas de estar",
        "Áreas de piscina y su entorno construido",
        "Drenaje y preparación del terreno",
        "Acabados exteriores y paisajismo asociado a la obra",
      ],
      "en-US": [
        "Decks and patios in stone, concrete, or other materials",
        "Carports and wood shade structures",
        "Outdoor kitchens and living areas",
        "Pool surrounds and adjacent hardscape",
        "Drainage and site preparation",
        "Exterior finishes and landscaping tied to the build",
      ],
    },
    processSummary: {
      "es-US": [
        "Visitamos el terreno y revisamos drenaje y accesos.",
        "Definimos materiales, estructura y alcance.",
        "Construimos documentando cada etapa.",
        "Revisamos el resultado con usted.",
      ],
      "en-US": [
        "We visit the site and review drainage and access.",
        "We define materials, structure, and scope.",
        "We build, documenting each stage.",
        "We review the result with you.",
      ],
    },
    seoTitle: {
      "es-US": "Patios y espacios exteriores en Houston, TX",
      "en-US": "Patio & Outdoor Living Construction in Houston, TX",
    },
    seoDescription: {
      "es-US":
        "Patios, terrazas, cocinas exteriores y piscinas en Houston y alrededores. Estructura, instalaciones y acabados con el mismo equipo.",
      "en-US":
        "Patios, decks, outdoor kitchens and pools in Houston and nearby areas. Structure, systems and finishes with the same crew.",
    },
    relatedProjectCategories: ["exteriors", "structures"],
    heroImage: "exterior-lujo-01.jpeg",
    published: true,
  },

  {
    id: "repairs-improvements",
    slugs: { "es-US": "reparaciones-y-mejoras", "en-US": "repairs-and-improvements" },
    title: { "es-US": "Reparaciones y mejoras", "en-US": "Repairs & improvements" },
    shortDescription: {
      "es-US": "Soluciones confiables para mantener y mejorar su propiedad.",
      "en-US": "Reliable solutions to maintain and improve your property.",
    },
    introduction: {
      "es-US":
        "No toda intervención es una obra completa. Atendemos reparaciones puntuales y mejoras: daños por humedad, muros deteriorados, instalaciones que fallan o espacios que necesitan una actualización. Revisamos primero para entender el origen del problema, no solo lo visible.",
      "en-US":
        "Not every job is a full build. We handle targeted repairs and upgrades: water damage, deteriorated walls, failing systems, or spaces that need updating. We assess first to understand the source of the problem, not just what's visible.",
    },
    scopeItems: {
      "es-US": [
        "Diagnóstico del origen del daño antes de reparar",
        "Reparación de muros, ladrillo y superficies",
        "Daños por humedad y su causa",
        "Reparación de instalaciones eléctricas y sanitarias",
        "Mantenimiento de obras entregadas",
        "Mejoras puntuales de espacios existentes",
      ],
      "en-US": [
        "Diagnosis of the source before repairing",
        "Wall, brick, and surface repair",
        "Water damage and its cause",
        "Electrical and plumbing repair",
        "Maintenance of completed work",
        "Targeted upgrades to existing spaces",
      ],
    },
    processSummary: {
      "es-US": [
        "Revisamos el problema y buscamos su origen.",
        "Explicamos qué encontramos y definimos el alcance.",
        "Reparamos documentando el estado inicial y el resultado.",
        "Revisamos el trabajo con usted.",
      ],
      "en-US": [
        "We assess the problem and look for its source.",
        "We explain what we found and define scope.",
        "We repair, documenting the initial state and the result.",
        "We review the work with you.",
      ],
    },
    seoTitle: {
      "es-US": "Reparaciones y mejoras del hogar en Houston, TX",
      "en-US": "Home Repairs & Improvements in Houston, TX",
    },
    seoDescription: {
      "es-US":
        "Reparaciones puntuales y mejoras en Houston y alrededores: humedades, muros, instalaciones y acabados. Buscamos el origen antes de reparar.",
      "en-US":
        "Targeted repairs and improvements in Houston and nearby areas: water damage, walls, systems and finishes. We find the cause before we repair.",
    },
    relatedProjectCategories: ["exteriors", "bathrooms"],
    heroImage: "exterior-jardin-01.jpeg",
    published: true,
  },
];

export function getPublishedServices(): Service[] {
  return SERVICES.filter((s) => s.published);
}

export function getServiceBySlug(locale: AppLocale, slug: string): Service | undefined {
  return SERVICES.find((s) => s.published && s.slugs[locale] === slug);
}

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.published && s.id === id);
}
