import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale, getMessages } from "next-intl/server";
import { Barlow_Condensed, Newsreader, Source_Sans_3 } from "next/font/google";
import { routing, LOCALE_PREFIXES, type AppLocale } from "@/i18n/routing";
import { SITE_URL, INDEXABLE, BRAND, OG_IMAGE } from "@/lib/site";
import SkipLink from "@/components/SkipLink";
import Analytics from "@/components/Analytics";
import MobileContactBar from "@/components/MobileContactBar";
import "../globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-newsreader",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale: locale as Locale, namespace: "Metadata" });
  const prefix = LOCALE_PREFIXES[locale as AppLocale];

  // hreflang recíproco: cada idioma apunta a la home de ambos idiomas.
  const languages: Record<string, string> = {};
  for (const [loc, pfx] of Object.entries(LOCALE_PREFIXES)) {
    languages[loc] = pfx;
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: prefix,
      languages: { ...languages, "x-default": "/" },
    },
    robots: INDEXABLE
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type: "website",
      siteName: BRAND.name,
      locale: locale.replace("-", "_"),
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => l.replace("-", "_")),
      url: prefix,
      title: t("title"),
      description: t("description"),
      /*
       * Tarjeta social. El sitio ya declaraba `summary_large_image` —es decir,
       * prometía tarjeta con imagen grande— y no daba ninguna imagen: el
       * enlace salía vacío en WhatsApp, que es por donde pasa TODO el embudo
       * de este negocio y donde la portada es la URL que se comparte.
       *
       * La ruta va relativa a propósito: `metadataBase`, unas líneas más
       * arriba, la convierte en absoluta con `SITE_URL`. Escribirla absoluta a
       * mano la congelaría en el dominio de hoy, que es provisional.
       *
       * Se hereda en las páginas que no declaran su propio `openGraph`. Las
       * fichas de proyecto y la cotización sí declaran el suyo, con su imagen.
       * Se genera con `npm run build:og`.
       */
      images: [
        {
          url: OG_IMAGE.home,
          width: 1200,
          height: 630,
          alt: `${BRAND.name} — ${BRAND.descriptor}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Habilita el renderizado estático: sin esto, next-intl fuerza dinámico.
  setRequestLocale(locale);

  /*
   * Solo viajan al navegador los espacios de nombres que usan Client
   * Components (Header, MobileMenu, LocaleSwitcher, ProjectCarousel,
   * ProjectFilters). `Home`, `Footer`, `Process`, `ServiceCards`, `Metadata`
   * y `NotFound` se renderizan en servidor y no tienen por qué pesar en el
   * bundle. La página de cotización añade `Quote` y `Services` con su propio
   * proveedor anidado, para no cargarlos en el resto del sitio.
   */
  const messages = await getMessages();
  const clientMessages = {
    Nav: messages.Nav,
    Contact: messages.Contact,
    Projects: messages.Projects,
  };

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${sourceSans.variable} ${newsreader.variable} ${barlowCondensed.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={clientMessages}>
          <SkipLink />
          {children}
          {/*
            Barra de contacto fija, solo en móvil. Va dentro del proveedor de
            i18n —es un componente de cliente y traduce sus etiquetas— y
            DESPUÉS de `children`, para que quede al final del documento: así
            un lector de pantalla la encuentra tras el contenido y no antes,
            que es donde estorba.
          */}
          <MobileContactBar />
        </NextIntlClientProvider>
        {/* Devuelve null mientras no exista un ID de GA4 configurado. */}
        <Analytics />
      </body>
    </html>
  );
}
