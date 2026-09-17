"use client";

import Image from "next/image";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  ViewTransition,
} from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Project, ProjectCategory } from "@/content/projects";
import ZoomButton from "@/components/ZoomButton";

const CATEGORY_ORDER: ProjectCategory[] = [
  "exteriors",
  "kitchens",
  "bathrooms",
  "structures",
  "interiors",
];

type Filter = ProjectCategory | "all";

/*
 * Recuerda filtro + posición de scroll entre visitas a la misma pestaña.
 *
 * El riel es scroll nativo de un `<div>`, no del `<html>`: Next.js restaura
 * el scroll de la VENTANA al volver atrás, pero no el `scrollLeft` interno
 * de un contenedor — así que sin esto, volver desde la ficha de un proyecto
 * siempre reaparecía en la primera tarjeta, sin importar cuál se estaba
 * viendo. `sessionStorage` (no `useState`) porque sobrevive al desmontaje
 * completo de la página entre una navegación y la siguiente.
 */
const SCROLL_STORAGE_KEY = "v7-project-library-state";

function readStoredState(): { filter: Filter; scrollLeft: number } | null {
  try {
    const raw = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.scrollLeft !== "number" || typeof parsed?.filter !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

/*
 * `useSyncExternalStore`, no `useEffect` + `setState`, para leer el filtro
 * guardado. `sessionStorage` no existe durante el render en servidor, así
 * que el valor inicial del cliente tiene que poder diferir del HTML que
 * mandó el servidor — exactamente el caso que este hook resuelve sin el
 * parpadeo ni la re-renderización en cascada de sincronizar con un efecto
 * (regla `react-hooks/set-state-in-effect`). No hay nada a lo que
 * suscribirse de verdad (no cambia entre un render y el siguiente dentro de
 * la misma pestaña), así que `subscribe` no hace nada y nunca notifica.
 */
function subscribeToNothing() {
  return () => {};
}

function getServerFilterSnapshot(): Filter {
  return "all";
}

function getClientFilterSnapshot(): Filter {
  return readStoredState()?.filter ?? "all";
}

function writeStoredState(state: { filter: Filter; scrollLeft: number }) {
  try {
    sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Privado/deshabilitado: se pierde el recuerdo de posición, no la navegación.
  }
}

export interface V7ProjectLibraryCopy {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  intro: string;
  all: string;
  category: Record<ProjectCategory, string>;
  viewProject: string;
  previousGroup: string;
  nextGroup: string;
  groupStatus: string;
  regionLabel: string;
  footerNote: string;
}

/**
 * Cada "slide" es una cuadrícula de `slideCols` columnas × `SLIDE_ROWS`
 * filas — no una fila única. Pedido del cliente, 2026-09-16 (con imagen de
 * referencia tipo moodboard 2×2): con 28 proyectos, deslizar tarjeta por
 * tarjeta se sentía interminable, y quería grupos visualmente completos
 * que quepan enteros en pantalla — deslizar revela el siguiente bloque de
 * golpe, sin asomo parcial. Las tarjetas siguen sin apilarse verticalmente
 * de forma indefinida (requisito del 2026-09-14): la cuadrícula tiene un
 * número FIJO de filas, no una lista larga.
 *
 * Columnas por slide, responsivo (móvil: 2, escritorio desde 768px: 4 —
 * mismo corte que `SLIDE_BREAKPOINT` abajo y su gemela en globals.css): 3
 * columnas en un teléfono angosto dejaría cada tarjeta en ~110px, demasiado
 * estrecha para el detalle de azulejo o encimera que es el punto fuerte de
 * estas fotos. Filas por slide NO es responsivo — 2 en ambos casos — así
 * que un slide muestra 4 tarjetas en móvil (2×2) y 8 en escritorio (4×2).
 */
const SLIDE_COLS_MOBILE = 2;
const SLIDE_COLS_DESKTOP = 4;
const SLIDE_ROWS = 2;
const SLIDE_BREAKPOINT = "(min-width: 768px)";

function Arrow({ left = false }: { left?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={left ? "rotate-180" : ""}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function V7ProjectLibrary({
  projects,
  copy,
}: {
  projects: Project[];
  copy: V7ProjectLibraryCopy;
}) {
  const locale = useLocale() as AppLocale;
  const viewportRef = useRef<HTMLDivElement>(null);
  // El filtro con el que arranca la visita: "all" en el servidor, el
  // guardado en `sessionStorage` una vez hidrata en el cliente (ver el
  // comentario de `getClientFilterSnapshot` más arriba).
  const restoredFilter = useSyncExternalStore(
    subscribeToNothing,
    getClientFilterSnapshot,
    getServerFilterSnapshot
  );
  // Una vez el visitante toca un filtro, esa elección manda sobre el
  // restaurado — null significa "todavía no ha elegido nada esta visita".
  const [filterOverride, setFilterOverride] = useState<Filter | null>(null);
  const filter = filterOverride ?? restoredFilter;
  const [activeSlide, setActiveSlide] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(false);
  // Arranca en el valor de móvil porque es también el valor por defecto
  // (sin media query) de `.v7-stack-slide` en globals.css — coincide con
  // lo que el servidor ya envió antes de que este efecto pueda correr.
  const [slideCols, setSlideCols] = useState(SLIDE_COLS_MOBILE);
  const slideSize = slideCols * SLIDE_ROWS;
  const restoredScrollRef = useRef(false);

  const counts = useMemo(() => {
    const result = Object.fromEntries(CATEGORY_ORDER.map((category) => [category, 0])) as Record<
      ProjectCategory,
      number
    >;
    projects.forEach((project) => {
      result[project.category] += 1;
    });
    return result;
  }, [projects]);

  const filters = useMemo(
    () => CATEGORY_ORDER.filter((category) => counts[category] > 0),
    [counts]
  );
  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((project) => project.category === filter)),
    [filter, projects]
  );
  // Agrupa en bloques de `slideSize` — cada bloque es un slide (cuadrícula
  // completa), no una tarjeta suelta. Recalcula si cambia el filtro o el
  // punto de corte responsivo.
  const slides = useMemo(() => {
    const groups: Project[][] = [];
    for (let i = 0; i < visible.length; i += slideSize) {
      groups.push(visible.slice(i, i + slideSize));
    }
    return groups;
  }, [visible, slideSize]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionAllowed(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Mismo corte que la media query gemela en globals.css — ver el
  // comentario de `SLIDE_BREAKPOINT` arriba.
  useEffect(() => {
    const query = window.matchMedia(SLIDE_BREAKPOINT);
    const sync = () => setSlideCols(query.matches ? SLIDE_COLS_DESKTOP : SLIDE_COLS_MOBILE);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /*
   * Scroll NATIVO, no arrastre simulado con Pointer Events.
   *
   * La primera versión de esto reimplementaba el arrastre a mano (como
   * `BeforeAfter.tsx`), y capturaba el puntero para poder animar la tarjeta
   * mientras se arrastra. Eso rompía el toque normal (el clic quedaba
   * atrapado por la captura) y, verificado con pruebas automatizadas
   * reales, además provocaba que el navegador cancelara el gesto a mitad de
   * camino en vez de completarlo. Probado en un dispositivo real, el
   * deslizar táctil tampoco quedaba fiable.
   *
   * El scroll nativo del navegador no tiene ninguno de esos problemas: es
   * el mismo gesto que ya usa cualquier lista o carrusel del teléfono, así
   * que siempre "se siente" táctil sin código propio que lo intente
   * imitar. `scroll-snap-type: x proximity` (en globals.css) es la misma
   * solución que ya se aplicó en esta sesión para el riel de Inicio.
   * `scrollTo` con `behavior: "smooth"` es lo que le da su animación de
   * desplazamiento a los botones ‹ › y al teclado.
   */
  const scrollToSlide = useCallback(
    (index: number) => {
      const viewport = viewportRef.current;
      if (!viewport || slides.length === 0) return;
      const next = ((index % slides.length) + slides.length) % slides.length;
      const slideEl = viewport.querySelector<HTMLElement>(`[data-slide-index="${next}"]`);
      if (!slideEl) return;
      setActiveSlide(next);
      viewport.scrollTo({ left: slideEl.offsetLeft, behavior: motionAllowed ? "smooth" : "auto" });
    },
    [motionAllowed, slides.length]
  );

  /**
   * Botones ‹ ›, flechas de teclado — el deslizar táctil ya llega al mismo
   * sitio por su cuenta: cada slide ocupa exactamente el ancho del riel
   * (ver `.v7-stack-slide` en globals.css), así que un solo gesto de
   * deslizar ya revela el siguiente bloque completo sin asomo parcial.
   */
  const goToGroup = useCallback(
    (direction: 1 | -1) => {
      scrollToSlide(activeSlide + direction);
    },
    [activeSlide, scrollToSlide]
  );

  // El slide "activo" (para el contador) es el bloque más cercano al borde
  // izquierdo del viewport mientras el usuario desliza el riel.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    // Salto de posición (sin animación) al recuperar una visita anterior.
    // Espera a que `filter` ya sea el guardado —si todavía no lo es, el
    // efecto de arriba está a punto de cambiarlo y este mismo efecto se
    // repetirá con la lista correcta— para no saltar sobre las tarjetas
    // equivocadas.
    if (!restoredScrollRef.current) {
      const saved = readStoredState();
      if (!saved) {
        restoredScrollRef.current = true;
      } else if (saved.filter === filter) {
        viewport.scrollLeft = saved.scrollLeft;
        restoredScrollRef.current = true;
      }
    }

    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const slideEls = Array.from(viewport.querySelectorAll<HTMLElement>("[data-slide-index]"));
        if (!slideEls.length) return;
        let closest = 0;
        let distance = Number.POSITIVE_INFINITY;
        slideEls.forEach((slideEl, index) => {
          const nextDistance = Math.abs(slideEl.offsetLeft - viewport.scrollLeft);
          if (nextDistance < distance) {
            closest = index;
            distance = nextDistance;
          }
        });
        setActiveSlide(closest);
        writeStoredState({ filter, scrollLeft: viewport.scrollLeft });
      });
    };
    viewport.addEventListener("scroll", sync, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("scroll", sync);
    };
  }, [slides.length, filter]);

  const chooseFilter = (next: Filter) => {
    // `startTransition` es lo que activa el crossfade: un `setState` normal
    // no dispara `<ViewTransition>` (ver PLAN_MICROANIMACIONES.md 1.2 y la
    // guía de Next citada ahí — "Regular setState calls do not trigger them").
    startTransition(() => {
      setActiveSlide(0);
      setFilterOverride(next);
    });
    viewportRef.current?.scrollTo({ left: 0, behavior: "auto" });
    // Un cambio de filtro manual es una decisión nueva del visitante: pisa
    // cualquier posición recordada de una visita anterior, en vez de que el
    // próximo montaje intente restaurar una posición de OTRO filtro.
    writeStoredState({ filter: next, scrollLeft: 0 });
  };

  const count = visible.length;
  const slideCount = slides.length;
  const progress = slideCount > 1 ? (activeSlide / (slideCount - 1)) * 100 : 100;
  // Rango de proyectos que muestra el slide activo (para el contador
  // "01–04 / 28" en móvil, "01–06 / 28" en escritorio).
  const groupStart = activeSlide * slideSize;
  const groupFrom = count === 0 ? 0 : groupStart + 1;
  const groupTo = Math.min(groupStart + slideSize, count);

  return (
    <section id="proyectos" className="v7-section v7-projects" aria-labelledby="home-projects-title">
      <div className="v7-container">
        <div className="v7-projects-heading">
          <div>
            <p className="v7-eyebrow">{copy.eyebrow}</p>
            <h2 id="home-projects-title" className="v7-section-title">
              {copy.titleLead}
              <br />
              <em>{copy.titleAccent}</em>
            </h2>
          </div>
          <p>{copy.intro}</p>
        </div>

        <div className="v7-library-toolbar">
          <div className="v7-project-filters" role="group" aria-label={copy.eyebrow}>
            <button type="button" aria-pressed={filter === "all"} onClick={() => chooseFilter("all")}>
              <span>{copy.all}</span>
              <sup>{String(projects.length).padStart(2, "0")}</sup>
            </button>
            {filters.map((category) => (
              <button
                type="button"
                key={category}
                aria-pressed={filter === category}
                onClick={() => chooseFilter(category)}
              >
                <span>{copy.category[category]}</span>
                <sup>{String(counts[category]).padStart(2, "0")}</sup>
              </button>
            ))}
          </div>

          <div className="v7-library-controls">
            {/* Visual: rango numérico del grupo, decorativo. El anuncio real
                para lectores de pantalla es el párrafo aria-live de abajo,
                que sí dice "proyectos X a Y de Z" en vez de solo cifras. */}
            <output aria-hidden="true">
              {String(groupFrom).padStart(2, "0")}
              <i aria-hidden="true">–</i>
              {String(groupTo).padStart(2, "0")} <i aria-hidden="true">/</i> {String(count).padStart(2, "0")}
            </output>
            <button type="button" onClick={() => goToGroup(-1)} aria-label={copy.previousGroup}>
              <Arrow left />
            </button>
            <button type="button" onClick={() => goToGroup(1)} aria-label={copy.nextGroup}>
              <Arrow />
            </button>
          </div>
        </div>

        {/* Anuncio real para lectores de pantalla — ver comentario junto al
            `<output>` de arriba. */}
        <p aria-live="polite" className="sr-only">
          {copy.groupStatus
            .replace("{from}", String(groupFrom))
            .replace("{to}", String(groupTo))
            .replace("{total}", String(count))}
        </p>

        {/* Cambiar de filtro no navega a otra página, así que sin esto se
            vería un corte seco entre una lista de tarjetas y la otra — un
            crossfade avisa "mismo lugar, contenido distinto" en vez de
            "algo se rompió". Ver PLAN_MICROANIMACIONES.md 1.2. */}
        <ViewTransition key={filter} name="v7-project-library" share="auto" enter="auto" default="none">
          <div
            ref={viewportRef}
            className="v7-stack"
            role="region"
            aria-roledescription="carousel"
            aria-label={copy.regionLabel}
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                goToGroup(-1);
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                goToGroup(1);
              }
            }}
          >
            <div className="v7-stack-track">
              {slides.map((slide, slideIndex) => (
                <div key={slideIndex} data-slide-index={slideIndex} className="v7-stack-slide">
                  {slide.map((project, itemIndex) => {
                    const globalIndex = slideIndex * slideSize + itemIndex;
                    return (
                      <article className="v7-project-article" key={project.id}>
                        <Link
                          href={{ pathname: "/projects/[slug]", params: { slug: project.slugs[locale] } }}
                          className="v7-project-card"
                          aria-label={`${copy.category[project.category]}: ${project.title[locale]}`}
                        >
                          <div className="v7-project-media">
                            {/* Mismo nombre que la portada de la ficha del
                                proyecto (projects/[slug]/page.tsx): la
                                tarjeta se transforma en la foto grande en vez
                                de cortar en seco. Ver
                                PLAN_MICROANIMACIONES.md 1.3. */}
                            <ViewTransition name={`project-photo-${project.id}`}>
                              <Image
                                src={`/images/proyectos/${project.coverPhoto.file}`}
                                alt={project.title[locale]}
                                fill
                                loading={globalIndex < 6 ? "eager" : "lazy"}
                                sizes="(min-width: 700px) 21rem, 45vw"
                                className="object-cover"
                              />
                            </ViewTransition>
                            <span className="v7-project-index">
                              APC · {String(globalIndex + 1).padStart(2, "0")}
                            </span>
                            <div className="v7-stack-scrim" aria-hidden="true" />
                            <div className="v7-stack-info">
                              <span className="v7-meta">{copy.category[project.category]}</span>
                              <h3>{project.title[locale]}</h3>
                            </div>
                            <span className="v7-project-cta" aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </span>
                          </div>
                        </Link>
                        <ZoomButton
                          src={`/images/proyectos/${project.coverPhoto.file}`}
                          alt={project.title[locale]}
                          orientation={project.coverPhoto.orientation}
                          className="v7-project-zoom"
                        />
                      </article>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </ViewTransition>

        <div className="v7-rail-footer">
          <span className="v7-rail-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </span>
          <span className="v7-rail-index" aria-hidden="true">{String(groupFrom).padStart(2, "0")}</span>
          <span className="v7-rail-note">{copy.footerNote}</span>
        </div>
      </div>
    </section>
  );
}
