import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, LOCALE_PREFIXES, type AppLocale } from "@/i18n/routing";
import { BRAND } from "@/lib/site";
import ServiceArea from "@/components/ServiceArea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { V7Contact } from "@/components/home/V7EditorialSections";
import { getV7EditorialCopy } from "@/lib/v7-editorial-copy";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale: locale as Locale, namespace: "Contact" });
  const path = (l: AppLocale) => `${LOCALE_PREFIXES[l]}${l === "es-US" ? "/contacto" : "/contact"}`;

  return {
    title:
      locale === "es-US"
        ? `Contacte a ${BRAND.name} | Houston, TX`
        : `Contact ${BRAND.name} | Houston, TX`,
    description: t("metaDescription"),
    alternates: {
      canonical: path(locale as AppLocale),
      languages: { "es-US": path("es-US"), "en-US": path("en-US") },
    },
    openGraph: { type: "website", title: t("heading"), url: path(locale as AppLocale) },
  };
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const editorialCopy = await getV7EditorialCopy();

  return (
    <>
      <Header />
      <main id="contenido" tabIndex={-1}>
        <V7Contact copy={editorialCopy} page />
        <ServiceArea />
      </main>
      <Footer />
    </>
  );
}
