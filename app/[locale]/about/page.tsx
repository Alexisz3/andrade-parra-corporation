import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, LOCALE_PREFIXES, type AppLocale } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import V7EditorialCover from "@/components/home/V7EditorialCover";
import GlobalCta from "@/components/GlobalCta";
import { V7About, V7Craft, V7Team } from "@/components/home/V7EditorialSections";
import { getV7EditorialCopy } from "@/lib/v7-editorial-copy";
import { BRAND } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale: locale as Locale, namespace: "About" });
  const path = (l: AppLocale) => `${LOCALE_PREFIXES[l]}${l === "es-US" ? "/nosotros" : "/about"}`;

  return {
    title:
      locale === "es-US"
        ? `Sobre ${BRAND.name} | Houston, TX`
        : `About ${BRAND.name} | Houston, TX`,
    description: t("metaDescription"),
    alternates: {
      canonical: path(locale as AppLocale),
      languages: { "es-US": path("es-US"), "en-US": path("en-US") },
    },
    openGraph: { type: "website", title: t("heading"), url: path(locale as AppLocale) },
  };
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const ta = await getTranslations("About");
  const th = await getTranslations("Home");
  const editorialCopy = await getV7EditorialCopy();

  return (
    <>
      <Header />
      <main id="contenido" tabIndex={-1}>
        <V7EditorialCover
          imageSrc="/images/heroes/hero-nosotros-fachada.jpg"
          imageAlt={ta("heroCoverImageAlt")}
          scrollHref="#nosotros"
          // Titular en frase, no una palabra en versales: aquí la portada
          // presenta a dos personas, no a un catálogo.
          phrasing="phrase"
          copy={{
            kicker: ta("eyebrow"),
            title: ta("heading"),
            intro: th("valuesBody4"),
            scrollCueLabel: ta("heroCoverScrollCue"),
            linkLabel: ta("heroScrollCue"),
            tagline: ta("heroCoverTagline"),
          }}
        />

        <V7About copy={editorialCopy} />
        <V7Team copy={editorialCopy} />
        <V7Craft copy={editorialCopy} />

        <GlobalCta />
      </main>
      <Footer />
    </>
  );
}
