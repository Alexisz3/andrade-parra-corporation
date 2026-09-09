import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, LOCALE_PREFIXES, type AppLocale } from "@/i18n/routing";
import { SERVICES, getServiceBySlug } from "@/content/services";
import { PROJECTS } from "@/content/projects";
import { SITE_URL, BRAND } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Breadcrumb from "@/components/Breadcrumb";
import ProjectCard from "@/components/ProjectCard";
import GlobalCta from "@/components/GlobalCta";
import { Link } from "@/i18n/navigation";
import ArrowRight from "@/components/icons/ArrowRight";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SERVICES.filter((s) => s.published).map((s) => ({
      locale,
      slug: s.slugs[locale as AppLocale],
    }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/services/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const service = getServiceBySlug(locale as AppLocale, slug);
  if (!service) return {};

  const path = (l: AppLocale) =>
    `${LOCALE_PREFIXES[l]}${l === "es-US" ? "/servicios/" : "/services/"}${service.slugs[l]}`;

  const loc = locale as AppLocale;

  return {
    /*
     * En el buscador manda `seoTitle`, no el título de pantalla.
     *
     * «Cocinas y baños | Servicios | Andrade Parra Corporation» describe
     * dónde está la página dentro del sitio, que es información inútil para
     * quien todavía no ha entrado. Lo que busca esa persona es
     * «kitchen remodeling houston», y el título tiene que decir eso y la
     * ciudad. La marca va al final: identifica, no atrae.
     */
    title: `${service.seoTitle[loc]} | ${BRAND.name}`,
    description: service.seoDescription[loc],
    alternates: {
      canonical: path(locale as AppLocale),
      // Recíprocos y por ENTIDAD: cada idioma apunta al slug equivalente,
      // no a la misma cadena.
      languages: { "es-US": path("es-US"), "en-US": path("en-US") },
    },
    openGraph: {
      type: "article",
      title: service.seoTitle[loc],
      description: service.seoDescription[loc],
      url: path(locale as AppLocale),
    },
  };
}

export default async function ServiceDetail({ params }: PageProps<"/[locale]/services/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const loc = locale as AppLocale;
  const service = getServiceBySlug(loc, slug);
  // Slug inexistente o de otro idioma: 404, nunca contenido duplicado.
  if (!service) notFound();

  const tn = await getTranslations("Nav");
  const tp = await getTranslations("Projects");
  const th = await getTranslations("Home");

  const related = PROJECTS.filter((p) =>
    service.relatedProjectCategories.includes(p.category)
  ).slice(0, 3);

  /*
   * JSON-LD de tipo Service. Sin `offers`, sin `priceRange`, sin
   * `aggregateRating`: el cliente no ha confirmado precios ni reseñas y
   * Google penaliza el marcado inventado.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title[loc],
    description: service.shortDescription[loc],
    serviceType: service.title[loc],
    areaServed: { "@type": "City", name: "Houston" },
    provider: {
      "@type": "GeneralContractor",
      name: BRAND.name,
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main id="contenido" tabIndex={-1}>
        <PageHero
          title={service.title[loc]}
          tagline={service.shortDescription[loc]}
          imageSrc={`/images/proyectos/${service.heroImage}`}
          imageAlt={service.title[loc]}
          plainTitle
          variant="service-detail"
          badge={service.title[loc]}
        />

        <section className="v7-detail-body">
          <div className="v7-container">
            <Breadcrumb
              items={[
                { label: tn("services"), href: "/services" },
                { label: service.title[loc] },
              ]}
            />

            <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <p className="max-w-2xl text-pretty text-lg leading-relaxed text-ink">
                  {service.introduction[loc]}
                </p>

                <h2 className="mt-12 font-display text-xl font-semibold text-ink">
                  {loc === "es-US" ? "Alcance orientativo" : "Typical scope"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-muted">
                  {loc === "es-US"
                    ? "El alcance final se define después de revisar su proyecto."
                    : "Final scope is defined after we review your project."}
                </p>
                <ul className="mt-5 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
                  {service.scopeItems[loc].map((item) => (
                    <li key={item} className="bg-surface p-4 text-sm leading-relaxed text-ink">
                      {item}
                    </li>
                  ))}
                </ul>

                <h2 className="mt-12 font-display text-xl font-semibold text-ink">
                  {th("processEyebrow").charAt(0) + th("processEyebrow").slice(1).toLowerCase()}
                </h2>
                <ol className="mt-5 space-y-4">
                  {service.processSummary[loc].map((step, i) => (
                    <li key={step} className="flex gap-4">
                      <span className="font-mono text-sm text-accent" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="max-w-xl text-sm leading-relaxed text-ink">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* CTA con el servicio preseleccionado: el ID viaja en la URL,
                  la etiqueta visible se traduce. */}
              <aside className="v7-service-detail-cta h-fit bg-carbon p-6 text-bone lg:sticky lg:top-24">
                <h2 className="font-display text-lg font-semibold">{th("serviceCtaHeading")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-bone/75">{th("serviceCtaBody")}</p>
                <Link
                  href={{ pathname: "/quote", query: { servicio: service.id } }}
                  className="mt-5 inline-flex min-h-[48px] w-fit items-center gap-2 bg-accent px-5 text-sm font-medium text-bone transition-colors hover:bg-accent-hover"
                >
                  {tn("quote")}
                  <ArrowRight />
                </Link>
                <Link
                  href="/services"
                  className="mt-4 flex min-h-[44px] items-center gap-2 border-b border-bone/30 text-sm text-bone/85 transition-colors hover:border-bone"
                >
                  {tn("backToServices")}
                </Link>
              </aside>
            </div>

            {related.length > 0 ? (
              <div className="mt-16 border-t border-line pt-12">
                <span className="eyebrow text-accent">{tp("eyebrow")}</span>
                <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((project) => (
                    <ProjectCard key={project.id} project={project} compact />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <GlobalCta />
      </main>
      <Footer />
    </>
  );
}
