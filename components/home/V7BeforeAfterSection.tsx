import V7BeforeAfterCarousel from "@/components/home/V7BeforeAfterCarousel";
import ArrowRight from "@/components/icons/ArrowRight";
import { publishablePairs } from "@/content/before-after";

export interface V7BeforeAfterCopy {
  eyebrow: string;
  title: string;
  body: string;
  pending: string;
  pendingBody: string;
  before: string;
  after: string;
  slider: string;
  /** Navegación entre pares cuando hay más de uno confirmado. */
  previous: string;
  next: string;
  /** Plantilla "Proyecto {n} de {total}" — el carrusel sustituye {n}/{total}. */
  counter: string;
  /** Los 3 argumentos de confianza bajo la descripción. */
  trust1: string;
  trust2: string;
  trust3: string;
  /** CTA hacia el resto de la biblioteca de proyectos. */
  cta: string;
}

/** Trazos propios, mínimos — mismo estilo lineal que `components/home/TrustBar.tsx`. */
const TRUST_ICONS = [
  <path key="same-space" d="M4 20V10l8-6 8 6v10M9 20v-6h6v6" />,
  <g key="real-photos">
    <path d="M4 8h3l1.6-2h6.8L17 8h3v11H4Z" />
    <circle cx="12" cy="13.5" r="3.2" />
  </g>,
  <g key="real-clients">
    <circle cx="8.5" cy="9" r="2.4" />
    <circle cx="16" cy="9.3" r="2" />
    <path d="M3.6 19c.5-3 2.5-5 4.9-5s4.4 2 4.9 5M14 14.4c2.1.35 3.7 2 4.1 4.6" />
  </g>,
];

/**
 * Espacio permanente para transformaciones verificadas.
 *
 * No fabrica un "antes" con una obra y un "después" con otra. Mientras no
 * exista un par autorizado se muestra el diseño del módulo, claramente
 * identificado como próxima publicación, para que quede listo sin inducir a
 * error a un posible cliente.
 */
export default function V7BeforeAfterSection({ copy }: { copy: V7BeforeAfterCopy }) {
  const pairs = publishablePairs();
  const trustLabels = [copy.trust1, copy.trust2, copy.trust3];

  return (
    <section className="v7-section v7-transform" aria-labelledby="transform-title">
      <div className="v7-container">
        {pairs.length ? (
          <div className="v7-transform-layout">
            <div className="v7-transform-intro">
              <p className="v7-eyebrow">{copy.eyebrow}</p>
              <h2 id="transform-title" className="v7-transform-title">
                {copy.title}
              </h2>
              <p className="v7-transform-body">{copy.body}</p>
            </div>

            <ul className="v7-transform-trust">
              {trustLabels.map((label, i) => (
                <li key={label}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    {TRUST_ICONS[i]}
                  </svg>
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <a href="#proyectos" className="v7-transform-cta">
              {copy.cta}
              <ArrowRight className="h-4 w-4" />
            </a>

            <div className="v7-transform-visual">
              <V7BeforeAfterCarousel
                pairs={pairs}
                beforeLabel={copy.before}
                afterLabel={copy.after}
                sliderLabel={copy.slider}
                previousLabel={copy.previous}
                nextLabel={copy.next}
                counterLabel={copy.counter}
              />
            </div>
          </div>
        ) : (
          <div className="v7-transform-empty">
            <p className="v7-eyebrow">{copy.eyebrow}</p>
            <h2 id="transform-title" className="v7-transform-title">
              {copy.title}
            </h2>
            <p className="v7-transform-body">{copy.body}</p>
            <p className="v7-meta">{copy.pending}</p>
            <p className="v7-transform-body">{copy.pendingBody}</p>
          </div>
        )}
      </div>
    </section>
  );
}
