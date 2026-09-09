"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Project, ProjectCategory } from "@/content/projects";

export default function V7FeaturedRail({ projects, locale, category }: {
  projects: Project[];
  locale: AppLocale;
  category: Record<ProjectCategory, string>;
}) {
  const t = useTranslations("Projects");
  const rail = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({ current: 1, start: true, end: false });

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maximum = element.scrollWidth - element.clientWidth;
        const start = element.scrollLeft <= 2;
        const end = element.scrollLeft >= maximum - 2;
        const bounds = element.getBoundingClientRect();
        const cards = Array.from(element.children);
        const nearest = cards.reduce((best, card, index) =>
          Math.abs(card.getBoundingClientRect().left - bounds.left) <
          Math.abs(cards[best].getBoundingClientRect().left - bounds.left) ? index : best, 0);
        setPosition({ current: end && !start ? projects.length : nearest + 1, start, end });
      });
    };
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    element.addEventListener("scroll", measure, { passive: true });
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      element.removeEventListener("scroll", measure);
    };
  }, [projects.length]);

  const move = (direction: -1 | 1 | "start" | "end") => {
    const element = rail.current;
    if (!element) return;
    const cards = Array.from(element.children);
    const bounds = element.getBoundingClientRect();
    const offsets = cards.map((card) => card.getBoundingClientRect().left - bounds.left + element.scrollLeft);
    const target = direction === "start" ? 0 : direction === "end" ? element.scrollWidth : direction === 1
      ? offsets.find((offset) => offset > element.scrollLeft + 4) ?? element.scrollWidth
      : offsets.findLast((offset) => offset < element.scrollLeft - 4) ?? 0;
    element.scrollTo({ left: target, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  if (!projects.length) return null;

  return (
    <div className="v7-featured-rail">
      <ul
        id="featured-project-rail"
        ref={rail}
        className="v7-featured-track"
        tabIndex={0}
        aria-labelledby="featured-preview-title"
        onKeyDown={(event) => {
          if (event.altKey || event.ctrlKey || event.metaKey) return;
          const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : event.key === "Home" ? "start" : event.key === "End" ? "end" : null;
          if (direction !== null) { event.preventDefault(); move(direction); }
        }}
      >
        {projects.map((project, index) => (
          <li key={project.id}>
            <Link href={{ pathname: "/projects/[slug]", params: { slug: project.slugs[locale] } }} className="v7-featured-card">
              <div className="v7-featured-media">
                <Image src={`/images/proyectos/${project.coverPhoto.file}`} alt={project.title[locale]} fill loading="lazy" sizes="(min-width: 1100px) 34vw, (min-width: 561px) 46vw, 84vw" className="object-cover" />
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="v7-featured-copy">
                <p className="v7-meta">{category[project.category]} · {project.location}</p>
                <h3>{project.title[locale]}</h3>
                <i aria-hidden="true">→</i>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="v7-featured-navigation">
        <span className="v7-meta" aria-live="polite" aria-atomic="true">{t("railPosition", { current: position.current, total: projects.length })}</span>
        <div>
          <button type="button" aria-label={t("previous")} aria-controls="featured-project-rail" disabled={position.start} onClick={() => move(-1)}>←</button>
          <button type="button" aria-label={t("next")} aria-controls="featured-project-rail" disabled={position.end} onClick={() => move(1)}>→</button>
        </div>
      </div>
    </div>
  );
}
