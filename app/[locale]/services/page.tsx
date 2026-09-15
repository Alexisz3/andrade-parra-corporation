import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, LOCALE_PREFIXES, type AppLocale } from "@/i18n/routing";
import { getPublishedServices } from "@/content/services";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import V7EditorialCover from "@/components/home/V7EditorialCover";
import GlobalCta from "@/components/GlobalCta";
import V7ServicesAccordion from "@/components/home/V7ServicesAccordion";
import PageTransition from "@/components/PageTransition";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const ts = await getTranslations({ locale: locale as Locale, namespace: "Services" });
  const prefix = LOCALE_PREFIXES[locale as AppLocale];
  const path = locale === "es-US" ? "/servicios" : "/services";

  return {
    /* Título de buscador, no de pantalla. Ver content/services.ts, `seoTitle`. */
    title: ts("metaTitle"),
    description: ts("metaDescription"),
    alternates: {
      canonical: `${prefix}${path}`,
      languages: { "es-US": "/es/servicios", "en-US": "/en/services" },
    },
  };
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const tn = await getTranslations("Nav");
  const tv7 = await getTranslations("HomeV7");
  const ts = await getTranslations("Services");
  const services = getPublishedServices();

  return (
    <PageTransition>
      <Header />
      <main id="contenido" tabIndex={-1}>
        <V7EditorialCover
          count={services.length}
          imageSrc="/images/heroes/hero-servicios-moodboard.png"
          imageAlt={ts("heroCoverImageAlt")}
          imagePosition="90% 55%"
          imagePositionMobile="100% 75%"
          scrollHref="#servicios"
          copy={{
            kicker: ts("heroCoverKicker"),
            title: tn("services"),
            intro: ts("heroCoverIntro"),
            countLabel: ts("heroCoverServicesLabel"),
            // Mismo dato de lugar que la portada de Proyectos y las fichas
            // de obra: no es copy, es la ciudad donde se trabaja.
            location: "Houston, TX",
            scrollCueLabel: ts("heroScrollCue"),
            tagline: ts("heroCoverTagline"),
          }}
        />

        <V7ServicesAccordion
          services={services}
          locale={locale as AppLocale}
          copy={{
            eyebrow: tv7("servicesEyebrow"),
            title: `${tv7("servicesTitleLead")} ${tv7("servicesTitleAccent")}`,
            body: tv7("servicesIntro"),
            viewProjects: ts("viewRelatedProjects"),
            // Mismo dato de lugar que el resto del sitio.
            location: "Houston, TX",
            footerScope: tv7("servicesPreviewFooterScope"),
          }}
        />

        <GlobalCta eyebrow={tv7("ctaServicesEyebrow")} title={tv7("ctaServicesTitle")} />
      </main>
      <Footer />
    </PageTransition>
  );
}
