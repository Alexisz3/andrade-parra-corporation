import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, LOCALE_PREFIXES, type AppLocale } from "@/i18n/routing";
import { getPublishedServices } from "@/content/services";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import GlobalCta from "@/components/GlobalCta";
import V7Services from "@/components/home/V7Services";

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
  const [th, tv7] = await Promise.all([
    getTranslations("Home"),
    getTranslations("HomeV7"),
  ]);
  const services = getPublishedServices();

  return (
    <>
      <Header />
      <main id="contenido" tabIndex={-1}>
        <PageHero
          title={tn("services")}
          tagline={th("servicesIntro")}
          imageSrc="/images/proyectos/cocina-granito-01.jpeg"
          imageAlt={tn("services")}
          compact
        />

        <V7Services
          services={services}
          copy={{
            eyebrow: tv7("servicesEyebrow"),
            titleLead: tv7("servicesTitleLead"),
            titleAccent: tv7("servicesTitleAccent"),
            intro: tv7("servicesIntro"),
            detail: tv7("serviceDetail"),
            quote: tn("quote"),
          }}
        />

        <GlobalCta />
      </main>
      <Footer />
    </>
  );
}
