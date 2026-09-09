import V7FeaturedRail from "./V7FeaturedRail";
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

        <V7FeaturedRail projects={projects.slice(0, 6)} locale={locale} category={category} />
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
    <section className="v7-home-preview v7-services-preview" aria-labelledby="services-preview-title">
      <div className="v7-container v7-services-preview-grid">
        <div className="v7-services-preview-intro">
          <p className="v7-eyebrow v7-eyebrow-light">{copy.eyebrow}</p>
          <h2 id="services-preview-title" className="v7-preview-title v7-section-title-light">{copy.title}</h2>
          <p>{copy.body}</p>
          <Link href="/services" className="v7-button v7-button-amber">{copy.action}<span aria-hidden="true">→</span></Link>
        </div>
        <ol className="v7-services-preview-list">
          {services.slice(0, 4).map((service, index) => (
            <li key={service.id}>
              <Link href={{ pathname: "/services/[slug]", params: { slug: service.slugs[locale] } }}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{service.title[locale]}</h3>
                  <p>{service.shortDescription[locale]}</p>
                </div>
                <i aria-hidden="true">→</i>
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
    <section className="v7-home-preview v7-about-preview" aria-labelledby="about-preview-title">
      <div className="v7-container v7-about-preview-grid">
        <p className="v7-eyebrow">{copy.eyebrow}</p>
        <div>
          <h2 id="about-preview-title" className="v7-preview-title">{copy.title}</h2>
          <p>{copy.body}</p>
          <Link href="/about" className="v7-text-link">{copy.action}<span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}


