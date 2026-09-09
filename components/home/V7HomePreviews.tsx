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
  copy,
}: {
  projects: Project[];
  locale: AppLocale;
  category: Record<ProjectCategory, string>;
  copy: PreviewCopy;
}) {
  return (
    <section className="v7-home-preview v7-featured-preview" aria-labelledby="featured-preview-title">
      <div className="v7-container">
        <header className="v7-preview-heading">
          <div>
            <p className="v7-eyebrow">{copy.eyebrow}</p>
            <h2 id="featured-preview-title" className="v7-preview-title">{copy.title}</h2>
          </div>
          <div>
            <p>{copy.body}</p>
            <Link href="/projects" className="v7-text-link">{copy.action}<span aria-hidden="true">→</span></Link>
          </div>
        </header>

        <ul className="v8-featured-rail">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={{ pathname: "/projects/[slug]", params: { slug: project.slugs[locale] } }}
                className="v7-featured-card"
              >
                <div className="v7-featured-media">
                  <Image
                    src={`/images/proyectos/${project.coverPhoto.file}`}
                    alt={project.title[locale]}
                    fill
                    loading="lazy"
                    sizes="(min-width: 900px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="v7-featured-copy">
                  <h3>{project.title[locale]}</h3>
                  <p>{category[project.category]} · {project.location}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
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
  return (
    <section className="v8-services-preview" aria-labelledby="services-preview-title">
      <div className="v7-container v8-services-preview-grid">
        <div className="v7-services-preview-intro">
          <p className="v7-eyebrow">{copy.eyebrow}</p>
          <h2 id="services-preview-title" className="v7-preview-title">{copy.title}</h2>
          <p>{copy.body}</p>
          <Link href="/services" className="v8-outline-button">{copy.action}<span aria-hidden="true">→</span></Link>
        </div>
        <div className="v8-services-image">
          <Image
            src={`/images/proyectos/${services[1]?.heroImage ?? services[0]?.heroImage}`}
            alt=""
            fill
            sizes="(max-width: 900px) calc(100vw - 3rem), 25rem"
            className="object-cover"
          />
        </div>
        <ol className="v7-services-preview-list">
          {services.map((service, index) => (
            <li key={service.id}>
              <Link href={{ pathname: "/services/[slug]", params: { slug: service.slugs[locale] } }}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{service.title[locale]}</h3>
                </div>
              </Link>
            </li>
          ))}
        </ol>
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


