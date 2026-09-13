"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Service, ServiceHighlightIcon } from "@/content/services";

export interface ServicesAccordionCopy {
  eyebrow: string;
  title: string;
  body: string;
  /** CTA final de la sección, si aplica — en la página de Servicios no hay
   *  a dónde más llevar (ya es el listado completo), así que se omite. */
  action?: string;
  /** CTA dentro de cada servicio abierto. */
  viewProjects: string;
  location: string;
  footerScope: string;
}

/**
 * Iconos de atributo. Trazo de 1.4 y caja de 14 px: a ese tamaño cualquier
 * relleno se convierte en una mancha, así que todos son lineales.
 */
const HIGHLIGHT_PATHS: Record<ServiceHighlightIcon, React.ReactNode> = {
  home: <path d="M3.5 10.5 12 4l8.5 6.5V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" />,
  key: (
    <>
      <circle cx="8" cy="8" r="3.5" />
      <path d="m10.6 10.6 8 8M16 16l2.5-2.5M18.6 18.6 21 16.2" />
    </>
  ),
  layers: <path d="M12 3 3 7.5l9 4.5 9-4.5zM3 12.5 12 17l9-4.5M3 17 12 21.5l9-4.5" />,
  ruler: (
    <>
      <rect x="2.5" y="8.5" width="19" height="7" rx="1" />
      <path d="M7 8.5v3M11 8.5v4.5M15 8.5v3M19 8.5v4.5" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1" />
    </>
  ),
  wrench: <path d="M15.5 3a5.5 5.5 0 0 0-5 7.7L3 18.2 5.8 21l7.5-7.5A5.5 5.5 0 1 0 15.5 3z" />,
  refresh: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
      <path d="M20.5 4v5h-5" />
    </>
  ),
};

function HighlightIcon({ icon }: { icon: ServiceHighlightIcon }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {HIGHLIGHT_PATHS[icon]}
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/**
 * Página de Servicios — acordeón vertical de apertura única, mobile-first.
 *
 * Sustituye a la lista horizontal con scroll-snap (`V7Services.tsx`, ya
 * retirada) que en móvil se comportaba como un carrusel sin avisar: título
 * cortado por `flex-basis`, servicio "activo" decidido por un
 * IntersectionObserver que reaccionaba al scroll en vez de al toque, y
 * ningún indicador de que había más contenido a los lados. Aquí no hay nada
 * que deslizar: la lista es vertical, cada fila es un `button` real, y el
 * usuario decide qué ve tocando, no arrastrando.
 *
 * Un solo estado, `activeId`, gobierna las dos composiciones: en móvil y
 * tablet abre el panel de la fila; en escritorio cambia la foto de la columna
 * derecha. Como `activeId` sólo puede valer un id, es imposible que haya dos
 * servicios abiertos a la vez — la regla no se vigila, se deriva.
 *
 * Arranca en `null`: al cargar, la lista está entera cerrada. En escritorio
 * eso dejaría el visor vacío, así que la vista previa cae al primer servicio
 * mientras no haya ninguno activo.
 *
 * Rendimiento: las fotos se montan a demanda. Sólo la del primer servicio
 * viaja en el HTML inicial —es la que ve un escritorio nada más llegar— y las
 * demás entran en `revealed` la primera vez que se abren o se sobrevuelan. En
 * móvil la columna derecha está en `display:none`, que el navegador nunca
 * descarga, así que la página no paga ninguna foto de servicio hasta que el
 * visitante toca una fila.
 */
export default function V7ServicesAccordion({
  services,
  locale,
  copy,
}: {
  services: Service[];
  locale: AppLocale;
  copy: ServicesAccordionCopy;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string[]>([]);
  const rowRefs = useRef(new Map<string, HTMLLIElement>());

  const firstId = services[0]?.id;
  const previewId = hoverId ?? activeId ?? firstId;

  const reveal = useCallback((id: string) => {
    setRevealed((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  /**
   * Scroll de cortesía tras abrir. Se espera a que el panel anterior termine
   * de plegarse (la transición dura 320 ms) porque hasta entonces todo lo que
   * hay debajo sigue moviéndose y el destino calculado antes sería falso.
   *
   * El encabezado es `position: fixed`, así que se mide en vivo en lugar de
   * dar por buena una altura: cambia entre móvil y escritorio.
   */
  const scrollRowIntoView = useCallback((id: string) => {
    if (typeof window === "undefined") return;
    // En escritorio el panel no empuja la página —la foto vive en la columna
    // derecha— y mover el scroll sería gratuito y molesto.
    if (!window.matchMedia("(max-width: 1100px)").matches) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.setTimeout(() => {
      const row = rowRefs.current.get(id);
      if (!row) return;
      const header = document.querySelector(".v7-header");
      const offset = (header?.getBoundingClientRect().height ?? 0) + 16;
      const target = row.getBoundingClientRect().top + window.scrollY - offset;
      if (Math.abs(target - window.scrollY) < 8) return;
      window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
    }, 340);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setActiveId((current) => (current === id ? null : id));
      reveal(id);
      if (activeId !== id) scrollRowIntoView(id);
    },
    [activeId, reveal, scrollRowIntoView]
  );

  if (!services.length) return null;

  return (
    <section id="servicios" className="v8-svc" aria-labelledby="services-preview-title">
      <div className="v8-svc-container">
        <div className="v8-svc-left">
          <p className="v8-svc-eyebrow">
            {copy.eyebrow}
            <span className="v8-svc-eyebrow-line" aria-hidden="true" />
          </p>
          <h2 id="services-preview-title" className="v8-svc-title">{copy.title}</h2>
          <p className="v8-svc-desc">{copy.body}</p>

          <ul className="v8-svc-list">
            {services.map((service, index) => {
              const isActive = service.id === activeId;
              const panelId = `v8-svc-panel-${service.id}`;
              return (
                <li
                  key={service.id}
                  className={`v8-svc-item${isActive ? " is-active" : ""}`}
                  ref={(node) => {
                    if (node) rowRefs.current.set(service.id, node);
                    else rowRefs.current.delete(service.id);
                  }}
                >
                  <h3 className="v8-svc-heading">
                    <button
                      type="button"
                      className="v8-svc-trigger"
                      aria-expanded={isActive}
                      aria-controls={panelId}
                      onClick={() => toggle(service.id)}
                      onMouseEnter={() => {
                        setHoverId(service.id);
                        reveal(service.id);
                      }}
                      onMouseLeave={() => setHoverId(null)}
                      onFocus={() => setHoverId(service.id)}
                      onBlur={() => setHoverId(null)}
                    >
                      <span className="v8-svc-num">{String(index + 1).padStart(2, "0")}</span>
                      <span className="v8-svc-rule" aria-hidden="true" />
                      <span className="v8-svc-name">{service.title[locale]}</span>
                      <span className="v8-svc-sign" aria-hidden="true" />
                    </button>
                  </h3>

                  <div id={panelId} className="v8-svc-panel" role="region" aria-label={service.title[locale]}>
                    <div className="v8-svc-panel-inner">
                      <div className="v8-svc-panel-media">
                        {revealed.includes(service.id) ? (
                          <Image
                            src={`/images/proyectos/${service.heroImage}`}
                            alt=""
                            fill
                            sizes="(min-width: 1101px) 0px, 100vw"
                            className="object-cover"
                          />
                        ) : null}
                      </div>

                      <p className="v8-svc-panel-desc">{service.introduction[locale]}</p>

                      <ul className="v8-svc-tags">
                        {service.highlights.map((highlight) => (
                          <li key={highlight.icon + highlight.label[locale]}>
                            <HighlightIcon icon={highlight.icon} />
                            {highlight.label[locale]}
                          </li>
                        ))}
                        <li className="v8-svc-tag-place">
                          <PinIcon />
                          {copy.location}
                        </li>
                      </ul>

                      <Link
                        href={{
                          pathname: "/services/[slug]",
                          params: { slug: service.slugs[locale] },
                          hash: "proyectos-relacionados",
                        }}
                        className="v8-svc-panel-link"
                      >
                        {copy.viewProjects}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {copy.action ? (
            <Link href="/services" className="v8-svc-cta">
              {copy.action}
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>

        <div className="v8-svc-right" aria-hidden="true">
          <div className="v8-svc-preview">
            {services.map((service) =>
              service.id === firstId || revealed.includes(service.id) ? (
                <div
                  key={service.id}
                  className={`v8-svc-preview-img${service.id === previewId ? " is-active" : ""}`}
                >
                  <Image
                    src={`/images/proyectos/${service.heroImage}`}
                    alt=""
                    fill
                    sizes="(min-width: 1101px) 55vw, 0px"
                    className="object-cover"
                  />
                </div>
              ) : null
            )}
          </div>

          <footer className="v8-svc-preview-footer">
            <div className="v8-svc-preview-footer-left">
              <span className="v8-svc-preview-footer-rule" />
              <p>{copy.footerScope}</p>
            </div>
            <div className="v8-svc-preview-footer-right">
              <span className="v8-svc-preview-footer-line" />
              <p>{copy.location}</p>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
