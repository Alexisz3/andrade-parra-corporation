import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, LOCALE_PREFIXES, type AppLocale } from "@/i18n/routing";
import { PROJECTS, type ProjectCategory } from "@/content/projects";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import V7ProjectLibrary from "@/components/home/V7ProjectLibrary";
import GlobalCta from "@/components/GlobalCta";
import V7BeforeAfterSection from "@/components/home/V7BeforeAfterSection";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale: locale as Locale, namespace: "Projects" });
  const prefix = LOCALE_PREFIXES[locale as AppLocale];
  const path = locale === "es-US" ? "/proyectos" : "/projects";

  return {
    /* Título de buscador, no de pantalla: «PROYECTOS» a secas no compite con
       nada en un resultado de Google. Ver content/services.ts, `seoTitle`. */
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      // Las vistas filtradas canonicalizan al índice limpio: no son páginas
      // distintas, son la misma lista con un subconjunto.
      canonical: `${prefix}${path}`,
      languages: { "es-US": "/es/proyectos", "en-US": "/en/projects" },
    },
  };
}

export default async function ProjectsPage({ params }: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, tv7] = await Promise.all([
    getTranslations("Projects"),
    getTranslations("HomeV7"),
  ]);
  const category: Record<ProjectCategory, string> = {
    kitchens: t("filterKitchens"),
    bathrooms: t("filterBathrooms"),
    exteriors: t("filterExteriors"),
    structures: t("filterStructures"),
    interiors: t("filterInteriors"),
  };

  return (
    <>
      <Header />
      <main id="contenido" tabIndex={-1}>
        <PageHero
          title={t("eyebrow")}
          tagline={t("heading")}
          intro={t("intro")}
          imageSrc="/images/proyectos/exterior-lujo-01.jpeg"
          imageAlt={t("heading")}
          compact
        />

        <V7ProjectLibrary
          projects={PROJECTS}
          copy={{
            eyebrow: tv7("projectsEyebrow"),
            titleLead: tv7("projectsTitleLead"),
            titleAccent: tv7("projectsTitleAccent"),
            intro: tv7("projectsIntro"),
            all: tv7("allProjects"),
            category,
            completed: tv7("statusCompleted"),
            inProgress: tv7("statusInProgress"),
            viewProject: tv7("viewProject"),
            previous: tv7("previous"),
            next: tv7("next"),
            pause: tv7("pause"),
            resume: tv7("resume"),
            regionLabel: tv7("carouselRegion"),
          }}
        />

        <V7BeforeAfterSection
          copy={{
            eyebrow: tv7("beforeAfterEyebrow"),
            title: tv7("beforeAfterTitle"),
            body: tv7("beforeAfterBody"),
            pending: tv7("beforeAfterPending"),
            pendingBody: tv7("beforeAfterPendingBody"),
            before: tv7("beforeLabel"),
            after: tv7("afterLabel"),
            slider: t("compareLabel"),
          }}
        />

        <GlobalCta />
      </main>
      <Footer />
    </>
  );
}
