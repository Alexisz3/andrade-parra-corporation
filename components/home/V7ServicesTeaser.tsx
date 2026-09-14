import { Link } from "@/i18n/navigation";

export interface ServicesTeaserCopy {
  eyebrow: string;
  title: string;
  body: string;
  action: string;
  rows: [
    { title: string; body: string },
    { title: string; body: string },
    { title: string; body: string },
  ];
}

/** Trazos lineales — mismo grosor y caja que el resto de iconos del sitio. */
const ROW_ICONS = [
  // Construcción: casa/estructura.
  <path key="build" d="M4 20V10l8-6 8 6v10M9 20v-6h6v6" />,
  // Remodelación: flechas en ciclo (transformar lo existente).
  <g key="remodel">
    <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
    <path d="M20.5 4v5h-5" />
  </g>,
  // Interiores y exteriores: capas/ambientes distintos.
  <path key="layers" d="M12 3 3 7.5l9 4.5 9-4.5zM3 12.5 12 17l9-4.5M3 17 12 21.5l9-4.5" />,
];

/**
 * Servicios en el Home — TEASER, no el acordeón completo.
 *
 * Tres macro-categorías estáticas (no los 5 servicios individuales), fila
 * completa clicable hacia /servicios: sin estado, sin apertura, sin imagen
 * grande por fila. El Home solo debe generar curiosidad; la explicación de
 * cada servicio — con imagen, atributos y proyectos relacionados — vive en
 * la página de Servicios, no aquí. Por eso es un componente de servidor: no
 * hay nada que manejar en el cliente.
 */
export default function V7ServicesTeaser({ copy }: { copy: ServicesTeaserCopy }) {
  return (
    <section className="v8-svc-teaser v7-scroll-reveal" aria-labelledby="services-teaser-title">
      <div className="v7-container">
        <p className="v8-svc-teaser-eyebrow">
          {copy.eyebrow}
          <span className="v8-svc-teaser-eyebrow-line" aria-hidden="true" />
        </p>
        <h2 id="services-teaser-title" className="v8-svc-teaser-title">
          {copy.title.split("\n").flatMap((line, index) => (index === 0 ? line : [<br key={index} />, line]))}
        </h2>
        <p className="v8-svc-teaser-body">{copy.body}</p>

        <ul className="v8-svc-teaser-list">
          {copy.rows.map((row, index) => (
            <li key={row.title}>
              <Link href="/services" className="v8-svc-teaser-row">
                <svg className="v8-svc-teaser-icon" viewBox="0 0 24 24" aria-hidden="true">
                  {ROW_ICONS[index]}
                </svg>
                <span className="v8-svc-teaser-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="v8-svc-teaser-text">
                  <strong>{row.title}</strong>
                  <span>{row.body}</span>
                </span>
                <span className="v8-svc-teaser-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/services" className="v8-svc-teaser-cta">
          {copy.action}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
