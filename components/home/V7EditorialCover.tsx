"use client";

import Image from "next/image";
import { useSmoothScrollTo } from "@/components/HeroScrollCue";

export interface V7EditorialCoverCopy {
  kicker: string;
  title: string;
  intro: string;
  scrollCueLabel: string;
  /** Cierre editorial de la esquina inferior derecha. */
  tagline: string;
  /** Sustantivo del contador: «proyectos», «servicios». Sólo con `count`. */
  countLabel?: string;
  location?: string;
  /** Link editorial bajo la descripción. Baja al mismo sitio que el indicador. */
  linkLabel?: string;
}

/**
 * Portada editorial de sección: sólo fotografía y jerarquía tipográfica.
 *
 * Es una PORTADA, no un índice: aquí no van tarjetas, filtros ni listados —
 * el contenido real de la sección empieza al hacer scroll, en `scrollHref`.
 * El gesto principal es el indicador inferior izquierdo, que baja con el
 * mismo descenso animado (`useSmoothScrollTo`) que comparte el resto del
 * sitio; `linkLabel` añade el mismo destino como link editorial.
 *
 * Dos formas de titular, según lo que pida la sección:
 *  - `word` (por defecto): una palabra en versales — PROYECTOS, SERVICIOS.
 *  - `phrase`: una frase en caja baja, más humana — Nosotros.
 *
 * La usan Proyectos, Servicios y Nosotros. Proceso y las fichas de servicio
 * siguen con PageHero, que tiene otra anatomía y no se toca.
 *
 * No se reutiliza el componente HeroScrollCue porque esta portada dibuja el
 * indicador con filete vertical y disco, y ese componente lo comparten las
 * otras portadas con otra forma.
 */
/**
 * Parte el titular de frase por su primera coma, que es donde respira:
 * «Dos apellidos, / una manera de trabajar», «Two names, / one way of
 * working». Dejarlo al navegador da tres líneas cojas —`balance` iguala
 * longitudes y parte «una manera / de trabajar»— y meter un <br> en el
 * diccionario mezclaría marcado con copy. Sin coma, una sola línea.
 */
function renderPhrase(title: string) {
  const cut = title.indexOf(",");
  if (cut === -1) return title;
  return (
    <>
      {title.slice(0, cut + 1)}
      <br />
      {title.slice(cut + 1).trim()}
    </>
  );
}

export default function V7EditorialCover({
  count,
  imageSrc,
  imageAlt,
  scrollHref,
  phrasing = "word",
  titleScale = "regular",
  copy,
}: {
  /** Conteo real del catálogo; con él se dibuja la línea de contexto. */
  count?: number;
  imageSrc: string;
  imageAlt: string;
  /** Ancla de la sección siguiente, p. ej. "#nosotros". */
  scrollHref: string;
  phrasing?: "word" | "phrase";
  /**
   * Cuerpo del titular de frase. Depende de la LONGITUD DE LÍNEA, no de la
   * página: «large» sólo cabe cuando la línea más larga es corta —«antes de
   * comenzar.»—; con líneas largas —«una manera de trabajar»— se comería el
   * ancho útil y taparía la fotografía.
   */
  titleScale?: "regular" | "large";
  copy: V7EditorialCoverCopy;
}) {
  const scrollToContent = useSmoothScrollTo(scrollHref);

  return (
    <section className="v7-cover" aria-label={copy.title}>
      <div className="v7-cover-bg">
        <Image src={imageSrc} alt={imageAlt} fill preload loading="eager" sizes="100vw" className="object-cover" />
      </div>
      <div className="v7-cover-overlay" aria-hidden="true" />

      <div className="v7-cover-inner">
        <div className="v7-cover-intro">
          <p className="v7-cover-kicker">{copy.kicker}</p>
          <h1
            className={`v7-cover-title${phrasing === "phrase" ? " is-phrase" : ""}${
              titleScale === "large" ? " is-large" : ""
            }`}
          >
            {phrasing === "phrase" ? renderPhrase(copy.title) : copy.title}
          </h1>
          <p className="v7-cover-desc">{copy.intro}</p>

          {count !== undefined && copy.countLabel ? (
            <p className="v7-cover-meta">
              {String(count).padStart(2, "0")} {copy.countLabel}
              <span className="v7-cover-meta-dot" aria-hidden="true" />
              {copy.location}
            </p>
          ) : null}

          {copy.linkLabel ? (
            <a href={scrollHref} className="v7-cover-link" onClick={scrollToContent}>
              {copy.linkLabel}
            </a>
          ) : null}
        </div>

        <a href={scrollHref} className="v7-cover-scroll" onClick={scrollToContent}>
          <span className="v7-cover-scroll-rule" aria-hidden="true" />
          <span className="v7-cover-scroll-row">
            <span className="v7-cover-scroll-disc" aria-hidden="true">
              <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M9 3v11m0 0 4.5-4.5M9 14l-4.5-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="v7-cover-scroll-label">{copy.scrollCueLabel}</span>
          </span>
        </a>

        <p className="v7-cover-tagline">
          <span className="v7-cover-tagline-rule" aria-hidden="true" />
          {/* El texto va en su propio bloque para que `text-wrap: balance`
              pueda repartir las líneas cuando no cabe en una (móvil). */}
          <span className="v7-cover-tagline-text">{copy.tagline}</span>
        </p>
      </div>
    </section>
  );
}
