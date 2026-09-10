"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Project, ProjectCategory } from "@/content/projects";
import type { Service } from "@/content/services";

interface PreviewCopy {
  eyebrow: string;
  title: string;
  body: string;
  action: string;
}

interface FeaturedCopy extends PreviewCopy {
  viewProject: string;
  previous: string;
  next: string;
  footer: string;
}

export function V7FeaturedProjects({
  projects,
  locale,
  category,
  copy,
}: {
  projects: Project[];
  locale: AppLocale;
  category: Record<ProjectCategory, string>;
  copy: FeaturedCopy;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = projects.slice(0, 3);

  if (!featured.length) return null;

  return (
    <section className="v8-editorial-featured" aria-labelledby="featured-preview-title">
      <div className="v8-featured-inner">
        <header className="v8-featured-head">
          <div className="v8-featured-head-top">
            <p className="v8-featured-eyebrow">
              {copy.eyebrow}
              <span className="v8-featured-eyebrow-line" aria-hidden="true" />
            </p>
            <Link href="/projects" className="v8-featured-viewall">
              {copy.action} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <h2 id="featured-preview-title" className="v8-featured-title">
            {copy.title.split("\n").flatMap((line, index) =>
              index === 0 ? line : [<br key={index} />, line]
            )}
          </h2>
          <p className="v8-featured-desc">{copy.body}</p>
        </header>

        <ul className="v8-featured-list">
          {featured.map((project, idx) => {
            const isActive = idx === activeIndex;
            return (
              <li key={project.id} className={`v8-featured-row${isActive ? " is-active" : ""}`}>
                <button
                  type="button"
                  className="v8-featured-trigger"
                  aria-expanded={isActive}
                  aria-controls={`v8-featured-panel-${project.id}`}
                  onClick={() => setActiveIndex((current) => (current === idx ? -1 : idx))}
                >
                  <span className="v8-featured-num">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="v8-featured-trigger-text">
                    <span className="v8-featured-cat">{category[project.category]}</span>
                    <span className="v8-featured-name">{project.title[locale]}</span>
                    <span className="v8-featured-loc">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {project.location}
                    </span>
                  </span>
                  <span className="v8-featured-icon" aria-hidden="true" />
                </button>

                <div id={`v8-featured-panel-${project.id}`} className="v8-featured-panel">
                  <div className="v8-featured-panel-inner">
                    <div className="v8-featured-media">
                      <Image
                        src={`/images/proyectos/${project.coverPhoto.file}`}
                        alt={project.title[locale]}
                        fill
                        priority={idx === 0}
                        sizes="(min-width: 1101px) 1152px, 100vw"
                        className="object-cover"
                      />
                      <Link
                        href={{ pathname: "/projects/[slug]", params: { slug: project.slugs[locale] } }}
                        className="v8-featured-media-link"
                      >
                        {copy.viewProject} <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <footer className="v8-editorial-featured-footer">
          <p>{copy.footer}</p>
        </footer>
      </div>
    </section>
  );
}

export function V7ServicesPreview({
  services,
  locale,
  copy,
}: {
  services: Service[];
  locale: AppLocale;
  copy: PreviewCopy;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeService = services[activeIndex];

  if (!activeService) return null;

  return (
    <section className="v8-editorial-services" aria-labelledby="services-preview-title">
      <div className="v8-editorial-services-container">
        <div className="v8-editorial-services-left">
          <p className="v8-editorial-eyebrow">
            {copy.eyebrow}
            <span className="v8-editorial-line"></span>
          </p>
          <h2 id="services-preview-title" className="v8-editorial-services-title">
            {copy.title}
          </h2>
          <p className="v8-editorial-services-desc">
            {copy.body}
          </p>
          
          <div className="v8-editorial-accordion">
            {services.map((service, index) => {
              const isActive = index === activeIndex;
              return (
                <div 
                  key={service.id} 
                  className={`v8-editorial-accordion-item ${isActive ? 'is-active' : ''}`}
                >
                  <button
                    className="v8-editorial-accordion-trigger"
                    onClick={() => setActiveIndex(index)}
                    aria-expanded={isActive}
                  >
                    <span className="v8-editorial-accordion-num">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="v8-editorial-accordion-line"></span>
                    <h3 className="v8-editorial-accordion-title">{service.title[locale]}</h3>
                    <span className="v8-editorial-accordion-icon" aria-hidden="true">
                      {isActive ? "−" : "+"}
                    </span>
                  </button>
                  {isActive && (
                    <div className="v8-editorial-accordion-content">
                      <p>{service.shortDescription[locale]}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Link href="/services" className="v8-editorial-services-cta">
            {copy.action}
          </Link>
        </div>

        <div className="v8-editorial-services-right">
          <div className="v8-editorial-services-image-wrapper">
            {services.map((service, index) => (
              <div 
                key={service.id}
                className={`v8-editorial-services-image ${index === activeIndex ? 'is-active' : ''}`}
                aria-hidden={index !== activeIndex}
              >
                <Image
                  src={`/images/proyectos/${service.heroImage}`}
                  alt={service.title[locale]}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <footer className="v8-editorial-services-footer">
            <div className="v8-editorial-services-footer-left">
              <span className="v8-editorial-services-footer-line"></span>
              <p>{locale === 'es-US' ? 'CONSTRUCCIÓN Y REMODELACIÓN EN HOUSTON' : 'CONSTRUCTION AND REMODELING IN HOUSTON'}</p>
            </div>
            <div className="v8-editorial-services-footer-right">
              <span className="v8-editorial-services-footer-line-wide"></span>
              <p>HOUSTON, TX</p>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}

export function V7AboutPreview({ copy }: { copy: PreviewCopy }) {
  return (
    <section className="v8-about-preview" aria-labelledby="about-preview-title">
      <Image src="/images/heroes/andrade-parra-hardhat-workbench.png" alt="" fill sizes="100vw" className="object-cover" />
      <div className="v8-about-overlay" aria-hidden="true" />
      <div className="v7-container v8-about-preview-grid">
        <div>
          <p className="v7-eyebrow v7-eyebrow-light">{copy.eyebrow}</p>
          <h2 id="about-preview-title" className="v7-preview-title">{copy.title}</h2>
          <p>{copy.body}</p>
          <Link href="/about" className="v7-text-link">{copy.action}<span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}


