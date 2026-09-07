"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Project, ProjectCategory } from "@/content/projects";
import ZoomButton from "@/components/ZoomButton";

const AUTOPLAY_MS = 9000;
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
  pause: string;
  resume: string;
  regionLabel: string;
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

function PlayPause({ paused }: { paused: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      {paused ? <path d="m9 7 8 5-8 5V7Z" /> : <path d="M9 6v12M15 6v12" />}
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
  const [inView, setInView] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
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
    const sync = () => {
      setMotionAllowed(!query.matches);
      if (query.matches) setUserPaused(true);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.intersectionRatio >= 0.2),
      { threshold: [0, 0.2, 0.5] }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const scrollTo = useCallback(
    (index: number, announce = true) => {
      const viewport = viewportRef.current;
      if (!viewport || visible.length === 0) return;
      const next = (index + visible.length) % visible.length;
      const item = viewport.querySelector<HTMLElement>(`[data-project-index="${next}"]`);
      if (!item) return;
      setActive(next);
      viewport.scrollTo({ left: item.offsetLeft, behavior: motionAllowed ? "smooth" : "auto" });
      if (announce) item.focus({ preventScroll: true });
    },
    [motionAllowed, visible.length]
  );

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

  const running =
    visible.length > 1 && motionAllowed && inView && documentVisible && !userPaused && !interacting;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => scrollTo(active + 1, false), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [active, running, scrollTo]);

  const chooseFilter = (next: Filter) => {
    setActive(0);
    setFilter(next);
    setInteracting(false);
    viewportRef.current?.scrollTo({ left: 0, behavior: "auto" });
  };

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
              {String(Math.min(active + 1, visible.length)).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
            </output>
            <button type="button" onClick={() => scrollTo(active - 1, false)} aria-label={copy.previous}>
              <Arrow left />
            </button>
            <button
              type="button"
              onClick={() => setUserPaused((value) => !value)}
              aria-label={userPaused ? copy.resume : copy.pause}
              aria-pressed={userPaused}
            >
              <PlayPause paused={userPaused} />
            </button>
            <button type="button" onClick={() => scrollTo(active + 1, false)} aria-label={copy.next}>
              <Arrow />
            </button>
          </div>
        </div>

        <div className="v7-library-progress" aria-hidden="true">
          <span
            key={`${filter}-${active}`}
            style={{
              animationDuration: `${AUTOPLAY_MS}ms`,
              animationPlayState: running ? "running" : "paused",
            }}
          />
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
              scrollTo(active - 1, false);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              scrollTo(active + 1, false);
            }
          }}
          onMouseEnter={() => setInteracting(true)}
          onMouseLeave={() => setInteracting(false)}
          onFocusCapture={() => setInteracting(true)}
          onBlurCapture={(event) => {
            if (!viewportRef.current?.contains(event.relatedTarget as Node | null)) setInteracting(false);
          }}
          onPointerDown={() => setInteracting(true)}
          onPointerUp={() => setInteracting(false)}
        >
          <ul className="v7-project-track">
            {visible.map((project, index) => (
              <li
                key={project.id}
                data-project-index={index}
                tabIndex={-1}
                aria-label={`${index + 1} / ${visible.length}: ${project.title[locale]}`}
                aria-roledescription="slide"
                className={index === 0 && filter === "all" ? "v7-project-slide v7-project-slide-featured" : "v7-project-slide"}
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
                        loading={index < 2 ? "eager" : "lazy"}
                        sizes="(min-width: 1100px) 46vw, (min-width: 700px) 60vw, 86vw"
                        className="object-cover"
                      />
                      <span className="v7-project-index">APC · {String(projects.indexOf(project) + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="v7-project-info">
                      <div>
                        <span className="v7-meta">
                          {copy.category[project.category]} · {project.location} · {project.status === "completed" ? copy.completed : copy.inProgress}
                        </span>
                        <h3>{project.title[locale]}</h3>
                        <p>{project.excerpt[locale]}</p>
                      </div>
                      <span className="v7-project-link">
                        {copy.viewProject}
                        <span aria-hidden="true">↗</span>
                      </span>
                    </div>
                  </Link>
                  <ZoomButton
                    src={`/images/proyectos/${project.coverPhoto.file}`}
                    alt={project.title[locale]}
                    orientation={project.coverPhoto.orientation}
                    className="absolute right-3 top-3 z-10"
                  />
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
