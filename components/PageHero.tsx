import Image from "next/image";
import HeroScrollCue from "./HeroScrollCue";

/** Controla la personalidad visual única de cada página. */
export type PageHeroVariant = "projects" | "services" | "about" | "process" | "service-detail";

/** Copy + fondo de la composición móvil alternativa (ver `mobileCover`). */
export interface MobileCoverContent {
  eyebrow: string;
  title: string;
  meta: string;
  category: string;
  location: string;
  scrollCueLabel: string;
  scrollCueHref: string;
  imageSrc: string;
  imageAlt: string;
}

interface PageHeroProps {
  title: string;
  tagline?: string;
  intro?: string;
  imageSrc: string;
  imageAlt: string;
  /** Portada a viewport completo (Header transparente encima). */
  cover?: boolean;
  /** Etiqueta del indicador de scroll (sólo portada). Sin ella no se muestra. */
  scrollCueLabel?: string;
  /** Ancla de la sección siguiente para el indicador, p. ej. "#proyectos". */
  scrollCueHref?: string;
  /**
   * Composición alternativa SOLO para ≤768px: fondo, copy y layout propios
   * (título a la izquierda + bloque informativo), en vez de reescalar la
   * portada de escritorio. Sin ella, `cover` se comporta igual en todos los
   * anchos. Pensada para una página a la vez (hoy sólo Proyectos); el resto
   * de consumidores de `cover` no la usan y no cambian.
   */
  mobileCover?: MobileCoverContent;
  plainTitle?: boolean;
  /** Variante que define alineación, gradiente y decoración única de la página. */
  variant?: PageHeroVariant;
  /** Etiqueta extra para la variante service-detail (nombre del servicio). */
  badge?: string;
}

// Iconos SVG inline por variante
const Icons = {
  projects: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="20" width="7" height="10" rx="1" fill="currentColor" opacity=".7"/>
      <rect x="12" y="13" width="7" height="17" rx="1" fill="currentColor" opacity=".85"/>
      <rect x="22" y="6" width="7" height="24" rx="1" fill="currentColor"/>
    </svg>
  ),
  services: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M6 26 L14 10 L22 18 L28 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="28" cy="6" r="3" fill="currentColor"/>
    </svg>
  ),
  about: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="10" r="5" stroke="currentColor" strokeWidth="2"/>
      <path d="M6 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  process: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M8 8h16M8 16h12M8 24h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
};

/**
 * Portada compartida (prop `cover`): Proyectos, Servicios y Nosotros.
 *
 * Degradado DIRECCIONAL, no viñeta de marco: un realce muy suave detrás del
 * título (radial acotado al centro) + un scrim vertical que sostiene cabecera
 * e indicador y deja el tercio medio casi limpio, para que la fotografía —y
 * sus bordes— sigan leyéndose. El `cover` ignora `align`/`overlay`/`decoration`
 * de la variante y usa esto, así las tres páginas comparten el mismo lenguaje.
 */
const COVER_OVERLAY =
  "radial-gradient(78% 62% at 50% 45%, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.10) 56%, rgba(0,0,0,0) 84%), linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.17) 15%, rgba(0,0,0,0.30) 44%, rgba(0,0,0,0.50) 72%, rgba(0,0,0,0.80) 100%)";

// Mapa de configuración visual por variante (páginas SIN `cover`).
const VARIANT_CONFIG: Record<PageHeroVariant, {
  align: "left" | "center" | "right";
  overlay: string;
  decoration: "line" | "icon" | "badge" | "estYear" | "none";
}> = {
  projects: {
    align: "left",
    overlay: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 25%), linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.1) 100%), linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 50%)",
    decoration: "line",
  },
  services: {
    align: "left",
    overlay: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 25%), linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.05) 100%), linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 50%)",
    decoration: "icon",
  },
  about: {
    align: "right",
    overlay: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 25%), linear-gradient(270deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.1) 100%), linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 50%)",
    decoration: "estYear",
  },
  process: {
    align: "center",
    overlay: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 25%), linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.92) 100%)",
    decoration: "icon",
  },
  "service-detail": {
    align: "left",
    overlay: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 25%), linear-gradient(120deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 55%, rgba(0,0,0,0.1) 100%), linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 50%)",
    decoration: "badge",
  },
};

export default function PageHero({
  title,
  tagline,
  intro,
  imageSrc,
  imageAlt,
  cover = false,
  scrollCueLabel,
  scrollCueHref,
  mobileCover,
  plainTitle = false,
  variant,
  badge,
}: PageHeroProps) {
  const config = variant ? VARIANT_CONFIG[variant] : null;
  // La portada (`cover`) unifica las tres páginas: centrado + scrim direccional.
  // El filete de marca lo dibuja el CSS del kicker (::before del eyebrow), así
  // que la decoración por variante no se renderiza en modo portada.
  const align = cover ? "center" : (config?.align ?? "center");
  const overlayStyle = cover
    ? COVER_OVERLAY
    : (config?.overlay ?? "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.88) 100%)");
  const decoration = cover ? "none" : (config?.decoration ?? "none");

  const alignClass = align === "left"
    ? "v7-pagehero-left"
    : align === "right"
    ? "v7-pagehero-right"
    : "v7-pagehero-center";

  return (
    <section
      className={`v7-hero-premium v7-hero-internal${cover ? " v7-hero-cover" : ""}${mobileCover ? " v7-hero-has-mobile-cover" : ""}`}
      aria-label={title}
    >
      {/* Fondo fotográfico. Con `mobileCover`, dos fotos reales (una por
          rango): la de escritorio se oculta ≤768px y viceversa por CSS
          (`v7-hero-bg-*-only` en globals.css); ninguna se recorta con
          object-position ajena a su propia composición. */}
      <div className="v7-hero-premium-bg">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
          className={mobileCover ? "v7-hero-bg-desktop-only" : undefined}
        />
        {mobileCover && (
          <Image
            src={mobileCover.imageSrc}
            alt={mobileCover.imageAlt}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "68% 56%" }}
            className="v7-hero-bg-mobile-only"
          />
        )}
      </div>

      {/* Overlay dinámico. En ≤768px con `mobileCover`, globals.css sustituye
          este mismo degradado por uno pensado para copy a la izquierda. */}
      <div className="v7-hero-premium-overlay" style={{ background: overlayStyle }} />

      {/* Contenido de escritorio (portada centrada). Con `mobileCover` se
          oculta ≤768px; sin ella, es idéntico en todos los anchos. */}
      <div className={`v7-hero-premium-content ${alignClass}${mobileCover ? " v7-hero-content-desktop-only" : ""}`}>

        {/* Decoración única por variante */}
        {decoration === "line" && (
          <div className="v7-pagehero-deco-line" aria-hidden="true" />
        )}
        {decoration === "icon" && variant && Icons[variant as keyof typeof Icons] && (
          <div className="v7-pagehero-deco-icon" aria-hidden="true">
            {Icons[variant as keyof typeof Icons]}
          </div>
        )}
        {decoration === "estYear" && (
          <div className="v7-pagehero-deco-year" aria-hidden="true">Houston, TX</div>
        )}
        {decoration === "badge" && badge && (
          <div className="v7-pagehero-deco-badge">{badge}</div>
        )}

        <p className="v7-hero-premium-eyebrow">{title}</p>
        <h1 className="v7-hero-premium-title">
          {/* Un "\n" en el copy fuerza el salto de línea aprobado sin
              hardcodear el idioma; sin "\n" queda un único fragmento. */}
          {(tagline || title).split("\n").flatMap((line, index) =>
            index === 0 ? [line] : [<br key={index} />, line]
          )}
          {plainTitle ? null : <span className="text-accent">.</span>}
        </h1>
        {intro && <p className="v7-hero-premium-meta">{intro}</p>}
      </div>

      {/* Composición móvil alternativa (≤768px, sólo si se pasa `mobileCover`):
          título a la izquierda + bloque informativo secundario. Un único
          <h1> queda expuesto a la vez — el otro pasa a display:none por CSS,
          así que no hay doble encabezado para lectores de pantalla. */}
      {mobileCover && (
        <div className="v7-hero-mobile-cover">
          <p className="v7-hero-mobile-eyebrow">{mobileCover.eyebrow}</p>
          <h1 className="v7-hero-mobile-title">{mobileCover.title}</h1>
          <p className="v7-hero-mobile-meta">{mobileCover.meta}</p>
          <div className="v7-hero-mobile-secondary">
            <span>{mobileCover.category}</span>
            <span className="v7-hero-mobile-secondary-dot" aria-hidden="true" />
            <span>{mobileCover.location}</span>
          </div>
        </div>
      )}

      {/* Indicador de scroll a la sección siguiente (sólo portada). El
          desplazamiento animado y el respaldo nativo viven en HeroScrollCue.
          Con `mobileCover`, cada rango usa su propio texto/ancla. */}
      {cover && scrollCueLabel && scrollCueHref && (
        <div className={mobileCover ? "v7-hero-cue-desktop-only" : undefined}>
          <HeroScrollCue label={scrollCueLabel} href={scrollCueHref} />
        </div>
      )}
      {mobileCover && (
        <div className="v7-hero-cue-mobile-only">
          <HeroScrollCue label={mobileCover.scrollCueLabel} href={mobileCover.scrollCueHref} />
        </div>
      )}
    </section>
  );
}
