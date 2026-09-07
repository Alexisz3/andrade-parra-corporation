import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, LOCALE_PREFIXES, type AppLocale } from "@/i18n/routing";
import { PROJECTS, getProjectBySlug, CATEGORY_TO_SERVICE } from "@/content/projects";
import { SERVICES } from "@/content/services";
import { publishablePairs } from "@/content/before-after";
import { SITE_URL, BRAND } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import BeforeAfter from "@/components/BeforeAfter";
import ZoomableImage from "@/components/ZoomableImage";
import CtaBand from "@/components/CtaBand";
import { Link } from "@/i18n/navigation";
import ArrowRight from "@/components/icons/ArrowRight";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PROJECTS.map((p) => ({ locale, slug: p.slugs[locale as AppLocale] }))
  );
}

/** Etiqueta traducida de la categoría; reutiliza las claves de los filtros. */
const CATEGORY_KEY = {
  kitchens: "filterKitchens",
  bathrooms: "filterBathrooms",
  exteriors: "filterExteriors",
  structures: "filterStructures",
  interiors: "filterInteriors",
} as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const loc = locale as AppLocale;
  const project = getProjectBySlug(loc, slug);
  if (!project) return {};

  const t = await getTranslations({ locale: locale as Locale, namespace: "Projects" });
  const path = (l: AppLocale) =>
    `${LOCALE_PREFIXES[l]}${l === "es-US" ? "/proyectos/" : "/projects/"}${project.slugs[l]}`;

  return {
    title: `${project.title[loc]} | ${t("eyebrow")} | ${BRAND.name}`,
    description: project.excerpt[loc],
    alternates: {
      canonical: path(loc),
      // Recíprocos por ENTIDAD: cada idioma apunta a su propio slug.
      languages: { "es-US": path("es-US"), "en-US": path("en-US") },
    },
    openGraph: {
      type: "article",
      title: project.title[loc],
      description: project.excerpt[loc],
      url: path(loc),
      images: [{ url: `/images/proyectos/${project.coverPhoto.file}` }],
    },
  };
}

export default async function ProjectDetail({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const loc = locale as AppLocale;
  const project = getProjectBySlug(loc, slug);
  if (!project) notFound();

  const t = await getTranslations("Projects");
  const tn = await getTranslations("Nav");

  const categoryLabel = t(CATEGORY_KEY[project.category]);
  const statusLabel = project.status === "completed" ? t("statusCompleted") : t("statusInProgress");

  // El servicio se DERIVA de la categoría; no es un dato inventado por obra.
  const service = SERVICES.find((s) => s.id === CATEGORY_TO_SERVICE[project.category]);

  // Antes/después: solo pares doblemente confirmados y ligados a ESTE proyecto.
  const pair = project.beforeAfterId
    ? publishablePairs().find((p) => p.id === project.beforeAfterId)
    : undefined;

  /*
   * La portada encabeza la página; la galería muestra el resto. Si la galería
   * repite la portada (varios proyectos tienen una sola foto), no se pinta dos
   * veces la misma imagen con distinto encuadre.
   */
  const galleryPhotos = project.gallery.filter((p) => p.file !== project.coverPhoto.file);

  /*
   * JSON-LD. Sin `datePublished` ni `award`: no hay fechas de obra
   * confirmadas. `CreativeWork` describe honestamente un trabajo mostrado.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title[loc],
    description: project.excerpt[loc],
    image: `${SITE_URL}/images/proyectos/${project.coverPhoto.file}`,
    locationCreated: { "@type": "Place", name: project.location },
    creator: { "@type": "GeneralContractor", name: BRAND.name, url: SITE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main id="contenido" tabIndex={-1}>
        {/* ── Encabezado ── */}
        <section className="v7-detail-hero">
          <div className="v7-container">
            <span className="eyebrow text-accent-ink">{statusLabel}</span>
            <h1>
              {project.title[loc]}
            </h1>
            <p>
              {categoryLabel} · {project.location}
            </p>
          </div>
        </section>

        {/* ── Fotografía principal: es el LCP, va con preload ── */}
        <section className="v7-project-cover">
          <div className="v7-container">
            {/* Ampliable: es la foto por la que se juzga la obra. El recorte
                del encuadre se conserva aquí; el visor muestra la foto
                completa, sin recortar. */}
            <ZoomableImage
              src={`/images/proyectos/${project.coverPhoto.file}`}
              alt={project.title[loc]}
              orientation={project.coverPhoto.orientation}
              eager
              preload
              sizes="(min-width: 1400px) 1340px, 100vw"
              className={`bg-carbon-raised ${
                project.coverPhoto.orientation === "vertical"
                  ? "aspect-[4/5] sm:aspect-[3/2]"
                  : "aspect-[4/3] sm:aspect-[16/9]"
              }`}
            />
          </div>
        </section>

        <section className="v7-detail-body">
          <div className="v7-container">
            <Breadcrumb
              items={[
                { label: tn("projects"), href: "/projects" },
                { label: project.title[loc] },
              ]}
            />

            <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
              {/* ── El proyecto ── */}
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">{t("theProject")}</h2>
                <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-ink">
                  {project.excerpt[loc]}
                </p>

                {/* Alcance: solo si el cliente lo confirmó. */}
                {project.scope ? (
                  <>
                    <h2 className="mt-12 font-display text-xl font-semibold text-ink">
                      {t("scopeHeading")}
                    </h2>
                    <ul className="mt-5 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
                      {project.scope[loc].map((item) => (
                        <li key={item} className="bg-surface p-4 text-sm leading-relaxed text-ink">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {/* Trabajos realizados: NUNCA deducidos de las fotos. */}
                {project.workCompleted ? (
                  <>
                    <h2 className="mt-12 font-display text-xl font-semibold text-ink">
                      {t("workCompletedHeading")}
                    </h2>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {project.workCompleted[loc].map((item) => (
                        <li
                          key={item}
                          className="border border-line bg-surface px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>

              {/* ── Ficha: solo campos con dato real ── */}
              <aside className="v7-detail-aside h-fit border border-line bg-surface p-6 lg:sticky lg:top-24">
                <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                  {t("detailsHeading")}
                </h2>
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="text-muted">{t("detailCategory")}</dt>
                    <dd className="mt-0.5 font-medium text-ink">{categoryLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">{t("detailLocation")}</dt>
                    <dd className="mt-0.5 font-medium text-ink">{project.location}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">{t("detailStatus")}</dt>
                    <dd className="mt-0.5 font-medium text-ink">{statusLabel}</dd>
                  </div>
                  {service ? (
                    <div>
                      <dt className="text-muted">{t("detailService")}</dt>
                      <dd>
                        {/* `inline-flex` con altura mínima: como enlace en
                            línea medía 103×18 px, por debajo del objetivo
                            táctil de 44 px de WCAG 2.2. */}
                        <Link
                          href={{ pathname: "/services/[slug]", params: { slug: service.slugs[loc] } }}
                          className="inline-flex min-h-[44px] items-center font-medium text-accent underline-offset-4 hover:underline"
                        >
                          {service.title[loc]}
                        </Link>
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <Link
                  href="/projects"
                  className="mt-6 flex min-h-[44px] items-center border-t border-line pt-4 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-accent"
                >
                  {t("backToProjects")}
                </Link>
              </aside>
            </div>
          </div>
        </section>

        {/* ── Antes / después: solo con par confirmado ── */}
        {pair ? (
          <section className="bg-paper pb-12 lg:pb-20">
            <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
              {/* Las etiquetas llegan como props: el comparador es un
                  componente de cliente y no puede traducir por sí mismo. */}
              <BeforeAfter
                pair={pair}
                beforeLabel={t("beforeLabel")}
                afterLabel={t("afterLabel")}
                sliderLabel={t("compareLabel")}
              />
            </div>
          </section>
        ) : null}

        {/* ── Galería ── */}
        {galleryPhotos.length > 0 ? (
          <section className="bg-paper pb-12 lg:pb-20">
            <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
              <h2 className="font-display text-xl font-semibold text-ink">
                {t("galleryHeading")}
              </h2>
              {/*
                Rejilla editorial: las verticales ocupan una columna, las
                horizontales dos en escritorio. Evita recortar en cuadrado
                fotos que no lo admiten.
              */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {galleryPhotos.map((photo, i) => (
                  <ZoomableImage
                    key={photo.file}
                    src={`/images/proyectos/${photo.file}`}
                    alt={`${project.title[loc]} — ${i + 2}`}
                    orientation={photo.orientation}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={`bg-carbon ${
                      photo.orientation === "vertical"
                        ? "aspect-[3/4]"
                        : "aspect-[4/3] lg:col-span-2"
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── El resultado: solo si el cliente lo describió ── */}
        {project.result ? (
          <section className="bg-paper pb-16 lg:pb-24">
            <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
              <h2 className="font-display text-xl font-semibold text-ink">{t("resultHeading")}</h2>
              <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-ink">
                {project.result[loc]}
              </p>
            </div>
          </section>
        ) : null}

        {/* ── CTA contextual ── */}
        <section className="v7-context-cta">
          <div className="v7-container flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-balance font-display text-2xl font-semibold text-ink">
                {t("similarHeading")}
              </h2>
              <p className="mt-2 max-w-lg text-pretty leading-relaxed text-muted">
                {t("similarBody")}
              </p>
            </div>
            <Link
              href={{ pathname: "/quote", query: service ? { servicio: service.id } : {} }}
              className="inline-flex min-h-[48px] w-fit flex-none items-center gap-2 bg-accent px-6 text-sm font-medium text-bone transition-colors hover:bg-accent-hover"
            >
              {tn("quote")}
              <ArrowRight />
            </Link>
          </div>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
