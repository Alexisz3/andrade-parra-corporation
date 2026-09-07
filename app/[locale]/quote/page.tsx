import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider, type Locale } from "next-intl";
import { getTranslations, setRequestLocale, getMessages } from "next-intl/server";
import { routing, LOCALE_PREFIXES, type AppLocale } from "@/i18n/routing";
import { getPublishedServices } from "@/content/services";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteShell from "@/components/quote/QuoteShell";
import { BRAND, WHATSAPP_CONTACTS, BUSINESS_EMAIL, OG_IMAGE } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/quote">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale: locale as Locale, namespace: "Quote" });
  const path = (l: AppLocale) =>
    `${LOCALE_PREFIXES[l]}${l === "es-US" ? "/cotizacion" : "/quote"}`;

  return {
    title:
      locale === "es-US"
        ? `Solicite su cotización sin costo | ${BRAND.name}`
        : `Request a Free Estimate | ${BRAND.name}`,
    description: t("intro"),
    alternates: {
      canonical: path(locale as AppLocale),
      languages: { "es-US": path("es-US"), "en-US": path("en-US") },
    },
    openGraph: {
      type: "website",
      title: t("heading"),
      url: path(locale as AppLocale),
      /* Declarar `summary_large_image` sin imagen deja la tarjeta vacía; ver
         la nota de app/[locale]/layout.tsx. Relativa: la resuelve
         `metadataBase` contra SITE_URL. */
      images: [{ url: OG_IMAGE.quote, width: 1200, height: 630, alt: t("heading") }],
    },
  };
}

export default async function QuotePage({ params, searchParams }: PageProps<"/[locale]/quote">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const loc = locale as AppLocale;

  // Las etiquetas se resuelven en servidor: al cliente solo viaja
  // {id, label} en el idioma actual, no ambos diccionarios de servicios.
  const serviceOptions = getPublishedServices().map((s) => ({
    id: s.id,
    label: s.title[loc],
  }));

  // `?servicio=` trae un ID estable. Se valida contra el catálogo real:
  // un valor inventado se ignora en vez de preseleccionar basura.
  const sp = await searchParams;
  const rawService = typeof sp.servicio === "string" ? sp.servicio : undefined;
  const initialServiceId = serviceOptions.some((s) => s.id === rawService)
    ? rawService
    : undefined;

  const tq = await getTranslations("Quote");

  // Proveedor anidado: `Quote` y `Services` solo se envían al navegador en
  // esta página, no en todo el sitio.
  const messages = await getMessages();
  const quoteMessages = { Quote: messages.Quote, Services: messages.Services };

  return (
    <>
      <Header />
      <main id="contenido" tabIndex={-1}>
        {/* Cabecera oscura compacta: la cotización no necesita hero fotográfico
            a pantalla completa, necesita que el formulario empiece pronto. */}
        <section className="v7-quote-intro">
          <div className="v7-container v7-quote-heading">
            <div>
              <span className="v7-eyebrow v7-eyebrow-light">{tq("eyebrow")}</span>
              <h1>{tq("headingLead")}<br /><em>{tq("headingAccent")}</em></h1>
            </div>
            <p>{tq("headingBody")}</p>
          </div>
        </section>

        <NextIntlClientProvider messages={quoteMessages}>
          {/* Los contactos viajan como props: `lib/site` lee variables de
              entorno que no existen en el navegador, así que importarlo desde
              un componente de cliente arrastraría valores indefinidos. */}
          <QuoteShell
            services={serviceOptions}
            initialServiceId={initialServiceId}
            whatsappTargets={WHATSAPP_CONTACTS.map((c) => ({
              phone: c.phone,
              name: c.name,
              phoneDisplay: c.phoneDisplay,
            }))}
            businessEmail={BUSINESS_EMAIL}
          />
        </NextIntlClientProvider>
      </main>
      <Footer />
    </>
  );
}
