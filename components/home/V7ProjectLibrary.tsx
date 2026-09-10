"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export interface V7ProjectLibraryCopy {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  intro: string;
  all: string;
  category: Record<ProjectCategory, string>;
  completed: string;
  inProgress: string;
  viewProject: string;
  previous: string;
  next: string;
  regionLabel: string;
  footerNote: string;
}

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
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(false);

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

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionAllowed(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const scrollTo = useCallback(
    (index: number, focusCard = false) => {
      const viewport = viewportRef.current;
      if (!viewport || visible.length === 0) return;
      const next = (index + visible.length) % visible.length;
      const item = viewport.querySelector<HTMLElement>(`[data-project-index="${next}"]`);
      if (!item) return;
      setActive(next);
      viewport.scrollTo({ left: item.offsetLeft, behavior: motionAllowed ? "smooth" : "auto" });
      if (focusCard) item.focus({ preventScroll: true });
    },
    [motionAllowed, visible.length]
  );

  // El proyecto "activo" (para el contador) es la tarjeta más cercana al borde
  // izquierdo del viewport mientras el usuario desplaza el rail.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const cards = Array.from(viewport.querySelectorAll<HTMLElement>("[data-project-index]"));
        if (!cards.length) return;
        let closest = 0;
        let distance = Number.POSITIVE_INFINITY;
        cards.forEach((card, index) => {
          const nextDistance = Math.abs(card.offsetLeft - viewport.scrollLeft);
          if (nextDistance < distance) {
            closest = index;
            distance = nextDistance;
          }
        });
        setActive(closest);
      });
    };
    viewport.addEventListener("scroll", sync, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("scroll", sync);
    };
  }, [visible.length]);

  const chooseFilter = (next: Filter) => {
    setActive(0);
    setFilter(next);
    viewportRef.current?.scrollTo({ left: 0, behavior: "auto" });
  };

  const count = visible.length;
  const position = Math.min(active + 1, count);
  const progress = count > 1 ? (active / (count - 1)) * 100 : 100;

  return (
    <section ref={sectionRef} id="proyectos" className="v7-section v7-projects" aria-labelledby="home-projects-title">
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
            <output aria-live="polite">
              {String(position).padStart(2, "0")} <i aria-hidden="true">/</i> {String(count).padStart(2, "0")}
            </output>
            <button type="button" onClick={() => scrollTo(active - 1)} aria-label={copy.previous}>
              <Arrow left />
            </button>
            <button type="button" onClick={() => scrollTo(active + 1)} aria-label={copy.next}>
              <Arrow />
            </button>
          </div>
        </div>

        <div
          ref={viewportRef}
          className="v7-project-viewport"
          role="region"
          aria-roledescription="carousel"
          aria-label={copy.regionLabel}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              scrollTo(active - 1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              scrollTo(active + 1);
            }
          }}
        >
          <ul className="v7-project-track">
            {visible.map((project, index) => (
              <li
                key={project.id}
                data-project-index={index}
                tabIndex={-1}
                aria-label={`${index + 1} / ${count}: ${project.title[locale]}`}
                aria-roledescription="slide"
                className="v7-project-slide"
              >
                <article className="v7-project-article">
                  <Link
                    href={{ pathname: "/projects/[slug]", params: { slug: project.slugs[locale] } }}
                    className="v7-project-card"
                  >
                    <div className="v7-project-media">
                      <Image
                        src={`/images/proyectos/${project.coverPhoto.file}`}
                        alt={project.title[locale]}
                        fill
                        loading={index < 3 ? "eager" : "lazy"}
                        sizes="(min-width: 1100px) 30vw, (min-width: 700px) 55vw, 84vw"
                        className="object-cover"
                      />
                      <span className="v7-project-index">APC · {String(projects.indexOf(project) + 1).padStart(2, "0")}</span>
                      <span className="v7-project-cta" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </span>
                    </div>
                    <div className="v7-project-info">
                      <span className="v7-meta">{copy.category[project.category]}</span>
                      <h3>{project.title[locale]}</h3>
                      <p className="v7-project-line">
                        {project.location}
                        <span aria-hidden="true"> · </span>
                        {project.status === "completed" ? copy.completed : copy.inProgress}
                      </p>
                    </div>
                  </Link>
                  <ZoomButton
                    src={`/images/proyectos/${project.coverPhoto.file}`}
                    alt={project.title[locale]}
                    orientation={project.coverPhoto.orientation}
                    className="v7-project-zoom"
                  />
                </article>
              </li>
            ))}
          </ul>
        </div>

        <div className="v7-rail-footer">
          <span className="v7-rail-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </span>
          <span className="v7-rail-index" aria-hidden="true">{String(position).padStart(2, "0")}</span>
          <span className="v7-rail-note">{copy.footerNote}</span>
        </div>
      </div>
    </section>
  );
}
