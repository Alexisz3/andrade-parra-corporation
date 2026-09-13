import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Project, ProjectCategory } from "@/content/projects";

export interface FeaturedCopy {
  eyebrow: string;
  title: string;
  body: string;
  action: string;
  viewProject: string;
  footer: string;
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/**
 * Avance de proyectos en la portada — un TEASER, no una galería. Exactamente
 * dos obras: una protagonista y una secundaria más compacta, cada tarjeta un
 * único enlace directo al proyecto. El Home introduce; quien quiera ver más
 * obras va a /proyectos — por eso aquí no hay una tercera tarjeta ni un
 * acordeón: dos son suficientes para generar curiosidad sin sustituir la
 * página que sí demuestra el trabajo completo.
 *
 * No hay estado que mantener, así que el componente es de servidor y no
 * manda JavaScript al navegador. Las dos imágenes quedan por debajo del
 * pliegue (el hero ya precarga la suya), así que ninguna lleva `preload`.
 */
export default function V7FeaturedProjects({
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
  const featured = projects.slice(0, 2);

  if (!featured.length) return null;

  return (
    <section className="v8-editorial-featured" aria-labelledby="featured-preview-title">
      <div className="v8-featured-inner">
        <p className="v8-featured-eyebrow">
          {copy.eyebrow}
          <span className="v8-featured-eyebrow-line" aria-hidden="true" />
        </p>

        <h2 id="featured-preview-title" className="v8-featured-title">
          {copy.title.split("\n").flatMap((line, index) =>
            index === 0 ? line : [<br key={index} />, line]
          )}
        </h2>

        <p className="v8-featured-desc">{copy.body}</p>

        <ul className="v8-featured-grid">
          {featured.map((project, idx) => (
            <li key={project.id} className={`v8-featured-card${idx === 0 ? " is-lead" : ""}`}>
              <Link
                href={{ pathname: "/projects/[slug]", params: { slug: project.slugs[locale] } }}
                className="v8-featured-card-link"
              >
                <span className="v8-featured-card-media">
                  {/* `alt` vacío a propósito: el nombre de la obra ya viaja en
                      el texto del enlace, y repetirlo obligaría al lector de
                      pantalla a oírlo dos veces por tarjeta. */}
                  <Image
                    src={`/images/proyectos/${project.coverPhoto.file}`}
                    alt=""
                    fill
                    sizes={idx === 0 ? "(min-width: 1101px) 620px, 100vw" : "(min-width: 1101px) 540px, 100vw"}
                    className="object-cover"
                  />
                  <span className="v8-featured-card-index" aria-hidden="true">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </span>

                <span className="v8-featured-card-body">
                  <span className="v8-featured-card-cat">{category[project.category]}</span>
                  <span className="v8-featured-card-name">{project.title[locale]}</span>
                  <span className="v8-featured-card-loc">
                    <PinIcon />
                    {project.location}
                  </span>
                  <span className="v8-featured-card-go">
                    {copy.viewProject}
                    <i aria-hidden="true">→</i>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/projects" className="v8-featured-viewall">
          {copy.action}
          <span aria-hidden="true">→</span>
        </Link>

        <footer className="v8-editorial-featured-footer">
          <p>{copy.footer}</p>
        </footer>
      </div>
    </section>
  );
}
