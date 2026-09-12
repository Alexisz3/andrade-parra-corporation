import Image from "next/image";
import { Link } from "@/i18n/navigation";

/**
 * Portada de Inicio: una sola fotografía a sangre, copy a la izquierda y
 * pie de datos abajo. La foto vive en `public/images/heroes/` como el resto
 * de portadas del sitio.
 *
 * El scrim NO oscurece la foto entera: pesa a la izquierda —donde va el
 * copy— y se disuelve antes de la mitad para que el patio, la piscina y los
 * árboles de la derecha se sigan leyendo. La franja superior la aporta el
 * propio Header (`.v7-header::after`), así que aquí no se repite.
 *
 * Sin estado ni efectos: es un componente de servidor.
 */

const HERO_IMAGE = "/images/heroes/hero-home-patio.jpg";

export interface V7HeroCopy {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  body: string;
  quote: string;
  projects: string;
  /** Pie del hero: ubicación y alcance. Ambos salen de copy ya aprobado. */
  metaLocation: string;
  metaScope: string;
}

export default function V7Hero({ copy }: { copy: V7HeroCopy }) {
  return (
    <section className="v7-hero" aria-labelledby="home-hero-title">
      <div className="v7-hero-media" aria-hidden="true">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          preload
          loading="eager"
          sizes="100vw"
          className="v7-hero-image"
        />
      </div>
      <div className="v7-hero-overlay" aria-hidden="true" />

      <div className="v7-container v7-hero-inner">
        <div className="v7-hero-grid">
          <div className="v7-hero-copy v7-reveal-in">
            <p className="v7-eyebrow v7-eyebrow-light">{copy.eyebrow}</p>
            <h1 id="home-hero-title" className="v7-hero-title">
              {copy.titleLead}
              <br />
              <em>{copy.titleAccent}</em>
            </h1>
            <p className="v7-hero-lead">{copy.body}</p>
            <div className="v7-hero-ctas">
              <Link href="/quote" className="v7-button v7-button-amber v7-hero-cta-primary">
                {copy.quote} <span aria-hidden="true">→</span>
              </Link>
              <Link href="/projects" className="v7-button v7-button-ghost-light v7-hero-cta-secondary">
                {copy.projects} <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="v7-hero-meta">
          <span className="v7-hero-meta-rule" aria-hidden="true" />
          <ul>
            <li>{copy.metaLocation}</li>
            <li>{copy.metaScope}</li>
            <li>EN / ES</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
