import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { PROJECTS, getFeaturedProjects, type ProjectCategory } from "@/content/projects";
import { getPublishedServices } from "@/content/services";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import TrustBar from "@/components/home/TrustBar";
import V7Hero from "@/components/home/V7Hero";
import V7ProjectLibrary from "@/components/home/V7ProjectLibrary";
import V7Services from "@/components/home/V7Services";
import { V7About, V7Contact, V7Craft, V7Faq } from "@/components/home/V7EditorialSections";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale: rawLocale } = await params;
  if (!hasLocale(routing.locales, rawLocale)) notFound();
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const [t, tn, tp] = await Promise.all([
    getTranslations("HomeV7"),
    getTranslations("Nav"),
    getTranslations("Projects"),
  ]);

  const category: Record<ProjectCategory, string> = {
    kitchens: tp("filterKitchens"),
    bathrooms: tp("filterBathrooms"),
    exteriors: tp("filterExteriors"),
    structures: tp("filterStructures"),
    interiors: tp("filterInteriors"),
  };

  const editorialCopy = {
    craftEyebrow: t("craftEyebrow"),
    craftTitle: t("craftTitle"),
    craftBody: t("craftBody"),
    craftCallouts: [t("craftCallout1"), t("craftCallout2"), t("craftCallout3")],
    aboutEyebrow: t("aboutEyebrow"),
    aboutTitle: t("aboutTitle"),
    aboutBody: t("aboutBody"),
    aboutPrinciples: [t("aboutPrinciple1"), t("aboutPrinciple2"), t("aboutPrinciple3")],
    faqEyebrow: t("faqEyebrow"),
    faqTitle: t("faqTitle"),
    faq: [1, 2, 3, 4].map((number) => ({
      question: t(`faqQ${number}`),
      answer: t(`faqA${number}`),
    })),
    contactEyebrow: t("contactEyebrow"),
    contactTitle: t("contactTitle"),
    contactBody: t("contactBody"),
    contactArea: t("contactArea"),
    quote: tn("quote"),
    call: tn("callShort"),
  };

  return (
    <>
      <StructuredData />
      <Header />
      <main id="contenido" tabIndex={-1}>
        <V7Hero
          projects={getFeaturedProjects()}
          copy={{
            eyebrow: t("heroEyebrow"),
            titleLead: t("heroTitleLead"),
            titleAccent: t("heroTitleAccent"),
            body: t("heroBody"),
            quote: tn("quote"),
            projects: tn("projects"),
            currentProject: t("currentProject"),
            viewProject: t("viewProject"),
            similar: t("similar"),
            directContact: t("directContact"),
            previous: t("previous"),
            next: t("next"),
            pause: t("pause"),
            resume: t("resume"),
            category,
          }}
        />
        <TrustBar />
        <V7ProjectLibrary
          projects={PROJECTS}
          copy={{
            eyebrow: t("projectsEyebrow"),
            titleLead: t("projectsTitleLead"),
            titleAccent: t("projectsTitleAccent"),
            intro: t("projectsIntro"),
            all: t("allProjects"),
            category,
            completed: t("statusCompleted"),
            inProgress: t("statusInProgress"),
            viewProject: t("viewProject"),
            previous: t("previous"),
            next: t("next"),
            pause: t("pause"),
            resume: t("resume"),
            regionLabel: t("carouselRegion"),
          }}
        />
        <V7Services
          services={getPublishedServices()}
          copy={{
            eyebrow: t("servicesEyebrow"),
            titleLead: t("servicesTitleLead"),
            titleAccent: t("servicesTitleAccent"),
            intro: t("servicesIntro"),
            detail: t("serviceDetail"),
            quote: tn("quote"),
          }}
        />
        <V7Craft copy={editorialCopy} />
        <V7About copy={editorialCopy} />
        <V7Faq copy={editorialCopy} />
        <V7Contact copy={editorialCopy} />
      </main>
      <Footer />
    </>
  );
}
