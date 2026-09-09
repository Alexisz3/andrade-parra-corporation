import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, LOCALE_PREFIXES, type AppLocale } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProcessTimeline from "@/components/ProcessTimeline";
import GlobalCta from "@/components/GlobalCta";
import { BRAND } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/process">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale: locale as Locale, namespace: "Process" });
  const path = (l: AppLocale) => `${LOCALE_PREFIXES[l]}${l === "es-US" ? "/proceso" : "/process"}`;

  return {
    title:
      locale === "es-US"
        ? `Cómo trabajamos | ${BRAND.name}`
        : `How We Work in Houston | ${BRAND.name}`,
    description: t("intro"),
    alternates: {
      canonical: path(locale as AppLocale),
      languages: { "es-US": path("es-US"), "en-US": path("en-US") },
    },
    openGraph: { type: "website", title: t("heading"), url: path(locale as AppLocale) },
  };
}

export default async function ProcessPage({ params }: PageProps<"/[locale]/process">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const tn = await getTranslations("Nav");
  const th = await getTranslations("Home");

  return (
    <>
      <Header />
      <main id="contenido" tabIndex={-1}>
        <PageHero
          title={tn("process")}
          tagline={th("processHeading")}
          imageSrc="/images/heroes/hero-proceso.jpg"
          imageAlt={th("processHeading")}
          variant="process"
        />

        <section className="v7-process-section">
          <div className="v7-container">
            <ProcessTimeline />
          </div>
        </section>

        <GlobalCta />
      </main>
      <Footer />
    </>
  );
}
