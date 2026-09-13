/**
 * Pares «antes / después».
 *
 * REGLA INNEGOCIABLE: aquí solo entran pares que el cliente haya CONFIRMADO
 * como el mismo espacio, con consentimiento del propietario. Está prohibido
 * emparejar dos fotos porque «parecen» del mismo sitio: el Agente D identificó
 * agrupaciones plausibles en el material actual, pero ninguna está confirmada.
 *
 * Mientras esta lista esté vacía, la sección pública NO se renderiza.
 * No se muestra una sección vacía ni un marcador de posición.
 */

export interface BeforeAfterPair {
  id: string;
  /** Nombre del proyecto tal y como lo confirme el cliente. */
  project: string;
  beforeFile: string;
  afterFile: string;
  beforeAlt: string;
  afterAlt: string;
  /** Posición inicial del divisor, en porcentaje. */
  initialPosition: number;
  /** El cliente confirma que ambas fotos son el mismo espacio. */
  sameSpaceConfirmed: boolean;
  /** Consentimiento del propietario para publicar la obra. */
  consentConfirmed: boolean;
}

/**
 * Identificado visualmente en `public/images/proyectos/` (lote
 * IMG_3468–IMG_3515, entregado por el cliente sin catalogar): mismos
 * armarios, mismo fregadero, mismo refrigerador de acero y misma puerta al
 * fondo en las dos fotos.
 *
 * Mismo espacio y consentimiento de publicación confirmados por el cliente
 * el 2026-09-12 — de ahí que las dos banderas estén en `true`.
 */
export const BEFORE_AFTER_PAIRS: BeforeAfterPair[] = [
  {
    id: "cocina-isla-cuarzo",
    project: "Isla de cocina — encimera de cuarzo",
    beforeFile: "cocina-isla-cuarzo-antes.jpg",
    afterFile: "cocina-isla-cuarzo-despues.jpg",
    beforeAlt: "Isla de cocina con plantilla de cartón antes de instalar la encimera",
    afterAlt: "Isla de cocina con encimera de cuarzo blanco y veta gris ya instalada",
    initialPosition: 50,
    sameSpaceConfirmed: true,
    consentConfirmed: true,
  },

  // Mismos armarios, misma ventana con rejas, mismo fregadero de la cocina
  // ya publicada como "renovacion-de-cocina" — esto parece ser el tramo de
  // salpicadero de ESA MISMA obra, no una casa distinta.
  //
  // Mismo espacio y consentimiento de publicación confirmados por el
  // cliente el 2026-09-12 — de ahí que las dos banderas estén en `true`.
  {
    id: "cocina-metro-blanco",
    project: "Cocina — salpicadero de azulejo tipo metro",
    beforeFile: "cocina-metro-blanco-antes.jpg",
    afterFile: "cocina-metro-blanco-despues.jpg",
    beforeAlt: "Azulejo tipo metro a medio instalar, con crucetas de nivelación",
    afterAlt: "Salpicadero de azulejo tipo metro terminado, con encimera de cuarzo blanco",
    initialPosition: 50,
    sameSpaceConfirmed: true,
    consentConfirmed: true,
  },

  // Misma chimenea de ladrillo pintado de blanco, mismas ventanas altas —
  // antes con el piso cubierto de papel protector verde durante la
  // instalación, después con el piso de madera técnica ya colocado.
  //
  // Mismo espacio y consentimiento de publicación confirmados por el
  // cliente el 2026-09-12 — de ahí que las dos banderas estén en `true`.
  {
    id: "sala-piso-chimenea",
    project: "Sala — piso de madera técnica",
    beforeFile: "sala-piso-chimenea-antes.jpg",
    afterFile: "sala-piso-chimenea-despues.jpg",
    beforeAlt: "Sala con el piso original cubierto de papel protector durante la obra",
    afterAlt: "Sala con piso de madera técnica nuevo, junto a la chimenea de ladrillo blanco",
    initialPosition: 50,
    sameSpaceConfirmed: true,
    consentConfirmed: true,
  },

  // Mismos gabinetes color cerezo, misma campana extractora, mismo hueco de
  // microondas — antes con el respaldo arrancado hasta el muro (adhesivo
  // naranja a la vista) y sin encimera; después con encimera de cuarzo
  // blanco instalada y los mismos gabinetes ya pintados.
  //
  // Mismo espacio y consentimiento de publicación confirmados por el
  // cliente el 2026-09-12 — de ahí que las dos banderas estén en `true`.
  {
    id: "cocina-remodelacion",
    project: "Cocina — remodelación completa",
    beforeFile: "cocina-remodelacion-antes.jpg",
    afterFile: "cocina-remodelacion-despues.jpg",
    beforeAlt: "Cocina con el respaldo de pared retirado, sin encimera, antes de la remodelación",
    afterAlt: "Misma cocina con encimera de cuarzo blanco y gabinetes terminados",
    initialPosition: 50,
    sameSpaceConfirmed: true,
    consentConfirmed: true,
  },

  // Mismos gabinetes blancos, misma isla, mismo microondas empotrado y misma
  // ventana al fondo — antes con el respaldo retirado hasta el aislante rosa
  // y la isla en obra gris sin encimera; después con salpicadero en mosaico
  // patrón y encimera de cuarzo blanco ya instalados. La foto "después" ya
  // formaba parte de la ficha "kitchen-patterned-tile-island".
  //
  // Mismo espacio y consentimiento de publicación confirmados por el
  // cliente el 2026-09-12 — de ahí que las dos banderas estén en `true`.
  {
    id: "cocina-mosaico-patron",
    project: "Cocina — isla y salpicadero en mosaico",
    beforeFile: "cocina-mosaico-patron-antes.jpg",
    afterFile: "cocina-mosaico-patron-01.jpg",
    beforeAlt: "Cocina con el respaldo de pared retirado hasta el aislante y la isla en obra gris, sin encimera",
    afterAlt: "Misma cocina con encimera de cuarzo blanco, isla terminada y salpicadero en mosaico patrón",
    initialPosition: 50,
    sameSpaceConfirmed: true,
    consentConfirmed: true,
  },

  // Mismo mostrador de recepción, mismo rótulo "Aloha Beauty Lounge" en la
  // pared, mismo veteado de la piedra — antes con el panel dorado lateral
  // suelto y el sustrato de contrachapado a la vista; después con el panel
  // ya fijado y el mostrador terminado.
  //
  // Mismo espacio y consentimiento de publicación confirmados por el
  // cliente el 2026-09-12 — de ahí que las dos banderas estén en `true`.
  {
    id: "aloha-recepcion",
    project: "Aloha Beauty Lounge — mostrador de recepción",
    beforeFile: "aloha-recepcion-antes.jpg",
    afterFile: "aloha-recepcion-despues.jpg",
    beforeAlt: "Mostrador de recepción con el panel dorado suelto y el contrachapado a la vista, antes de terminar",
    afterAlt: "Mismo mostrador de recepción ya terminado, con el rótulo Aloha Beauty Lounge al fondo",
    initialPosition: 50,
    sameSpaceConfirmed: true,
    consentConfirmed: true,
  },
];

/**
 * Solo se publican los pares doblemente confirmados. Un par a medias
 * no se muestra: es preferible no tener sección a publicar algo sin permiso.
 */
export function publishablePairs(): BeforeAfterPair[] {
  return BEFORE_AFTER_PAIRS.filter((p) => p.sameSpaceConfirmed && p.consentConfirmed);
}
