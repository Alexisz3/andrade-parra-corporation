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

export function V7FeaturedProjects({
  projects,
  locale,
  category,
}: {
  projects: Project[];
  locale: AppLocale;
  category: Record<ProjectCategory, string>;
  copy: PreviewCopy;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = projects.slice(0, 3);
  const activeProject = featured[activeIndex];

  const nextProject = () => setActiveIndex((prev) => (prev + 1) % featured.length);
  const prevProject = () => setActiveIndex((prev) => (prev - 1 + featured.length) % featured.length);

  if (!activeProject) return null;

  return (
    <section className="v8-editorial-featured" aria-labelledby="featured-preview-title">
      <div className="v8-editorial-container">
        <div className="v8-editorial-left">
          <div className="v8-editorial-image-wrapper">
            {featured.map((project, idx) => (
              <div 
                key={project.id} 
                className={`v8-editorial-image ${idx === activeIndex ? 'is-active' : ''}`}
                aria-hidden={idx !== activeIndex}
              >
                <Image
                  src={`/images/proyectos/${project.coverPhoto.file}`}
                  alt={project.title[locale]}
                  fill
                  priority={idx === 0}
                  loading={idx === 0 ? "eager" : "lazy"}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
            <div className="v8-editorial-overlay">
              <div className="v8-editorial-overlay-content">
                <p className="v8-editorial-meta">
                  {category[activeProject.category]} · {activeProject.location}
                </p>
                <h3 className="v8-editorial-overlay-title">{activeProject.title[locale]}</h3>
                <Link 
                  href={{ pathname: "/projects/[slug]", params: { slug: activeProject.slugs[locale] } }}
                  className="v8-editorial-link-white"
                >
                  Ver proyecto <span aria-hidden="true">→</span>
                </Link>
                <div className="v8-editorial-controls-row">
                  <span className="v8-editorial-counter">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}
                  </span>
                  <div className="v8-editorial-progress">
                    <div className="v8-editorial-progress-bar" style={{ width: `${((activeIndex + 1) / featured.length) * 100}%` }}></div>
                  </div>
                  <div className="v8-editorial-nav">
                    <button onClick={prevProject} aria-label="Anterior proyecto">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                    <button onClick={nextProject} aria-label="Siguiente proyecto">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="v8-editorial-right">
          <header className="v8-editorial-header">
            <div className="v8-editorial-header-top">
              <p className="v8-editorial-eyebrow">
                PROYECTOS DESTACADOS
              </p>
              <Link href="/projects" className="v8-editorial-view-all">
                Ver todos los proyectos <span aria-hidden="true">→</span>
              </Link>
            </div>
            <h2 id="featured-preview-title" className="v8-editorial-title">Proyectos<br/>seleccionados.</h2>
            <p className="v8-editorial-desc">
              Construcción, remodelación y mejoras que transforman espacios en hogares extraordinarios.
            </p>
          </header>

          <ol className="v8-editorial-list">
            {featured.map((project, idx) => {
              const isActive = idx === activeIndex;
              return (
                <li 
                  key={project.id} 
                  className={`v8-editorial-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveIndex(idx);
                    }
                  }}
                  aria-pressed={isActive}
                >
                  <span className="v8-editorial-num">{String(idx + 1).padStart(2, '0')}</span>
                  <div className="v8-editorial-item-content">
                    <p className="v8-editorial-item-cat">{category[project.category]}</p>
                    <h4 className="v8-editorial-item-title">{project.title[locale]}</h4>
                    <p className="v8-editorial-item-loc">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {project.location}
                    </p>
                  </div>
                  <div className="v8-editorial-item-arrow">
                    <span aria-hidden="true">→</span>
                  </div>
                </li>
              );
            })}
          </ol>

          <footer className="v8-editorial-footer">
            <p>Espacios mejores. Vidas más plenas.</p>
          </footer>
        </div>
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


