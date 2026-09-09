import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, LOCALE_PREFIXES, type AppLocale } from "@/i18n/routing";
import { BRAND } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { V7Faq } from "@/components/home/V7EditorialSections";
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

  return (
    <>
      <Header initialSolid />
      <main id="contenido" tabIndex={-1} className="v7-faq-page">
        <V7Faq copy={editorialCopy} headingLevel="h1" />
        <GlobalCta />
      </main>
      <Footer />
    </>
  );
}
