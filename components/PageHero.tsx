import Image from "next/image";

interface PageHeroProps {
  /** Palabra monumental (PROYECTOS., SERVICIOS.) — el ADN del home en interiores. */
  title: string;
  tagline?: string;
  intro?: string;
  imageSrc: string;
  imageAlt: string;
  /** Altura reducida: para páginas donde el contenido debe empezar antes. */
  compact?: boolean;
  /**
   * Sin mayúsculas monumentales ni punto acento. Los títulos de servicio son
   * frases ("Cocinas y baños"), no una palabra-marca: tratarlos como
   * PROYECTOS. los volvía ilegibles y rompía el ritmo de la página.
   */
  plainTitle?: boolean;
}

/**
 * Hero de página interna: conserva el ADN del home (foto cinematográfica +
 * palabra monumental + punto acento) pero más bajo, para que el contenido
 * de la página empiece antes. Las referencias aprobadas lo muestran así.
 */
export default function PageHero({
  title,
  tagline,
  intro,
  imageSrc,
  imageAlt,
  compact = false,
  plainTitle = false,
}: PageHeroProps) {
  return (
    <section className={`v7-page-hero ${compact ? "v7-page-hero-compact" : ""}`}>
      {/* Es el elemento LCP de esta página. `priority` quedó obsoleto en
          Next 16 y dejó de emitir el preload; ver HomeHero. */}
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        preload
        loading="eager"
        sizes="100vw"
        className="v7-page-hero-image"
      />
      {/* Sin z-index negativo: enviaría los velos detrás de la foto. */}
      <div className="v7-page-hero-overlay" aria-hidden="true" />
      <div className="v7-page-hero-plan" aria-hidden="true" />

      <div
        className={`v7-page-hero-inner v7-container ${
          compact ? "pb-10 pt-28 lg:pb-14 lg:pt-36" : "pb-14 pt-32 lg:pb-20 lg:pt-44"
        }`}
      >
        <h1
          className={
            plainTitle
              ? "v7-page-hero-title v7-page-hero-title-plain"
              : "v7-page-hero-title"
          }
        >
          {title}
          {plainTitle ? null : <span className="text-accent">.</span>}
        </h1>
        {tagline ? (
          <p className="v7-page-hero-tagline">{tagline}</p>
        ) : null}
        {intro ? (
          <p className="v7-page-hero-intro">{intro}</p>
        ) : null}
      </div>
    </section>
  );
}
