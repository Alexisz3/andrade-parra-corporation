import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, LOCALE_PREFIXES, type AppLocale } from "@/i18n/routing";
import { BRAND } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { V7Faq } from "@/components/home/V7EditorialSections";
import V7EditorialCover from "@/components/home/V7EditorialCover";
import { getV7EditorialCopy } from "@/lib/v7-editorial-copy";
import GlobalCta from "@/components/GlobalCta";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/faq">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale: locale as Locale, namespace: "Faq" });
  const path = (l: AppLocale) => `${LOCALE_PREFIXES[l]}${l === "es-US" ? "/preguntas" : "/faq"}`;

  return {
    title:
      locale === "es-US"
        ? `Preguntas frecuentes | ${BRAND.name}`
        : `FAQ | ${BRAND.name}`,
    description: t("metaDescription"),
    alternates: {
      canonical: path(locale as AppLocale),
      languages: { "es-US": path("es-US"), "en-US": path("en-US") },
    },
    openGraph: { type: "website", title: t("heading"), url: path(locale as AppLocale) },
  };
}

export default async function FaqPage({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const editorialCopy = await getV7EditorialCopy();
  const tf = await getTranslations("Faq");

  return (
    <>
      <Header />
      <main id="contenido" tabIndex={-1}>
        {/* La portada toma el encabezado que antes abría V7Faq (eyebrow,
            titular y frase de instrucción): ahí abajo sólo queda la lista,
            para no repetir los mismos tres textos en pantalla y media. */}
        <V7EditorialCover
          imageSrc="/images/heroes/hero-preguntas-escritorio.jpg"
          imageAlt={tf("heroCoverImageAlt")}
          scrollHref="#faq"
          phrasing="phrase"
          // Líneas cortas: aquí el titular aguanta el cuerpo mayor.
          titleScale="large"
          copy={{
            kicker: editorialCopy.faqEyebrow,
            title: editorialCopy.faqTitle,
            intro: editorialCopy.faqPrompt,
            scrollCueLabel: tf("heroCoverScrollCue"),
            tagline: tf("heroCoverTagline"),
          }}
        />

        <V7Faq copy={editorialCopy} />
        <GlobalCta />
      </main>
      <Footer />
    </>
  );
}
