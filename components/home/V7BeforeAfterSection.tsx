import BeforeAfter from "@/components/BeforeAfter";
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
}

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

  return (
    <section className="v7-section v7-transform" aria-labelledby="transform-title">
      <div className="v7-container">
        <div className="v7-transform-head">
          <div>
            <p className="v7-eyebrow v7-eyebrow-light">{copy.eyebrow}</p>
            <h2 id="transform-title" className="v7-section-title v7-section-title-light">
              {copy.title}
            </h2>
          </div>
          <p>{copy.body}</p>
        </div>

        {pairs.length ? (
          <div className="v7-transform-pairs">
            {pairs.map((pair) => (
              <BeforeAfter
                key={pair.id}
                pair={pair}
                beforeLabel={copy.before}
                afterLabel={copy.after}
                sliderLabel={copy.slider}
              />
            ))}
          </div>
        ) : (
          <div className="v7-transform-empty">
            <div className="v7-transform-blueprint" aria-hidden="true">
              <span>{copy.before}</span>
              <i />
              <span>{copy.after}</span>
            </div>
            <div>
              <p className="v7-meta">{copy.pending}</p>
              <p>{copy.pendingBody}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
