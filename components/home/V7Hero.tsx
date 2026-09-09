"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Project, ProjectCategory } from "@/content/projects";

const ROTATION_MS = 8000;

export interface V7HeroCopy {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  body: string;
  quote: string;
  projects: string;
  currentProject: string;
  viewProject: string;
  similar: string;
  directContact: string;
  previous: string;
  next: string;
  pause: string;
  resume: string;
  category: Record<ProjectCategory, string>;
}

function Chevron({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={direction === "left" ? "rotate-180" : ""}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function V7Hero({ projects, copy }: { projects: Project[]; copy: V7HeroCopy }) {
  const locale = useLocale() as AppLocale;
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState(0);
  const [inView, setInView] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [interacting, setInteracting] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);

  const total = projects.length;
  const current = projects[active];
  const previousProject = projects[previous];

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setMotionAllowed(!query.matches);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.intersectionRatio >= 0.35),
      { threshold: [0, 0.35, 0.7] }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    if (total < 2) return;
    const nextProject = projects[(active + 1) % total];
    const preloader = new window.Image();
    preloader.decoding = "async";
    preloader.src = `/images/proyectos/${nextProject.coverPhoto.file}`;
  }, [active, projects, total]);

  const goTo = useCallback(
    (index: number) => {
      if (!total) return;
      const nextIndex = (index + total) % total;
      setPrevious(active);
      setActive(nextIndex);
    },
    [active, total]
  );

  const running =
    total > 1 && motionAllowed && inView && documentVisible && !interacting;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => goTo(active + 1), ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [active, goTo, running]);

  if (!current) return null;

  return (
    <section ref={sectionRef} className="v7-hero" aria-labelledby="home-hero-title">
      <div className="v7-hero-media" aria-hidden="true">
        {previous !== active && previousProject ? (
          <Image
            src={`/images/proyectos/${previousProject.coverPhoto.file}`}
            alt=""
            fill
            sizes="100vw"
            className="v7-hero-image"
          />
        ) : null}
        <Image
          key={current.id}
          src={`/images/proyectos/${current.coverPhoto.file}`}
          alt=""
          fill
          preload={active === 0}
          loading="eager"
          sizes="100vw"
          className="v7-hero-image v7-hero-image-current"
        />
      </div>
      <div className="v7-hero-overlay" aria-hidden="true" />
      <div className="v7-hero-plan" aria-hidden="true" />

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
              <Link href="/quote" className="v7-button v7-button-amber">
                {copy.quote} <span aria-hidden="true">→</span>
              </Link>
              <Link href="/projects" className="v7-button v7-button-ghost-light">
                {copy.projects} <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          <article
            ref={cardRef}
            className="v7-hero-project"
            onMouseEnter={() => setInteracting(true)}
            onMouseLeave={() => setInteracting(false)}
            onFocusCapture={() => setInteracting(true)}
            onBlurCapture={(event) => {
              if (!cardRef.current?.contains(event.relatedTarget as Node | null)) setInteracting(false);
            }}
          >
            <div className="v7-hero-project-media">
              <Image
                key={`thumb-${current.id}`}
                src={`/images/proyectos/${current.coverPhoto.file}`}
                alt={current.title[locale]}
                fill
                sizes="(max-width: 700px) 5rem, 150px"
                className="object-cover"
              />
            </div>
            <div key={`project-copy-${current.id}`} className="v7-hero-project-details">
              <p className="v7-hero-project-top">
                {copy.currentProject} · {copy.category[current.category]}
              </p>
              <h2>{current.title[locale]}</h2>
              <Link
                href={{ pathname: "/projects/[slug]", params: { slug: current.slugs[locale] } }}
                className="v7-hero-project-link"
              >
                {copy.viewProject} <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div key={`project-navigation-${current.id}`} className="v7-hero-project-navigation">
              <b>
                {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </b>
              <div className="v7-carousel-controls">
                <button type="button" onClick={() => goTo(active - 1)} aria-label={copy.previous}>
                  <Chevron direction="left" />
                </button>
                <button type="button" onClick={() => goTo(active + 1)} aria-label={copy.next}>
                  <Chevron />
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {current.title[locale]}, {active + 1} / {total}
      </p>
    </section>
  );
}
