import Image from "next/image";

/** Controla la personalidad visual única de cada página. */
export type PageHeroVariant = "projects" | "services" | "about" | "process" | "service-detail";

interface PageHeroProps {
  title: string;
  tagline?: string;
  intro?: string;
  imageSrc: string;
  imageAlt: string;
  compact?: boolean;
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

// Mapa de configuración visual por variante
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
  plainTitle = false,
  variant,
  badge,
}: PageHeroProps) {
  const config = variant ? VARIANT_CONFIG[variant] : null;
  const align = config?.align ?? "center";
  const overlayStyle = config?.overlay ?? "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.88) 100%)";
  const decoration = config?.decoration ?? "none";

  const alignClass = align === "left"
    ? "v7-pagehero-left"
    : align === "right"
    ? "v7-pagehero-right"
    : "v7-pagehero-center";

  return (
    <section className="v7-hero-premium v7-hero-internal" aria-label={title}>
      {/* Fondo fotográfico */}
      <div className="v7-hero-premium-bg">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Overlay dinámico */}
      <div className="v7-hero-premium-overlay" style={{ background: overlayStyle }} />

      {/* Contenido */}
      <div className={`v7-hero-premium-content ${alignClass}`}>

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
          {tagline || title}
          {plainTitle ? null : <span className="text-accent">.</span>}
        </h1>
        {intro && <p className="v7-hero-premium-meta">{intro}</p>}
      </div>
    </section>
  );
}
