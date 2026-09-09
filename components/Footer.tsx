import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { StaticPathname, AppLocale } from "@/i18n/routing";
import { SERVICES } from "@/content/services";
import { SERVICE_AREA } from "@/content/company";
import { WHATSAPP_CONTACTS, BUSINESS_EMAIL, BUSINESS, BRAND } from "@/lib/site";
import BrandLogo from "./BrandLogo";

const COMPANY_LINKS: {
  href: StaticPathname;
  key: "about" | "projects" | "process" | "faq" | "contact";
}[] = [
  { href: "/about", key: "about" },
  { href: "/projects", key: "projects" },
  { href: "/process", key: "process" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
];

/**
 * Pie corporativo.
 *
 * Antes era una sola fila de cinco enlaces. Ahora agrupa por intención —
 * servicios, empresa, contacto — que es como un visitante busca al final de
 * la página: o quiere un servicio concreto, o quiere saber quién es la
 * empresa, o quiere llamar.
 *
 * El correo solo aparece si existe de verdad. El año es dinámico: un pie con
 * el año congelado es la señal más barata de que un sitio está abandonado.
 */
export default async function Footer() {
  const t = await getTranslations("Footer");
  const tn = await getTranslations("Nav");
  const tc = await getTranslations("Contact");
  const locale = (await getLocale()) as AppLocale;
  const year = new Date().getFullYear();

  const services = SERVICES.filter((s) => s.published);

  return (
    <footer className="v8-footer">
      <div className="v7-container v8-footer-inner">
        <div className="v8-footer-grid">
          {/* ── Marca ── */}
          <div className="v8-footer-brand">
            <BrandLogo variant="approved" tone="light" className="v8-footer-logo" />
            <p>
              {t("tagline")}
            </p>
          </div>

          {/* ── Servicios ── */}
          <nav className="v8-footer-column" aria-label={t("servicesHeading")}>
            <h2>
              {t("servicesHeading")}
            </h2>
            <ul>
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    href={{ pathname: "/services/[slug]", params: { slug: s.slugs[locale] } }}
                    className="v8-footer-link"
                  >
                    {s.title[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Empresa ── */}
          <nav className="v8-footer-column" aria-label={t("companyHeading")}>
            <h2>
              {t("companyHeading")}
            </h2>
            <ul>
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="v8-footer-link"
                  >
                    {tn(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Contacto ── */}
          <div className="v8-footer-column v8-footer-contact">
            <h2>
              {t("contactHeading")}
            </h2>
            <ul>
              {WHATSAPP_CONTACTS.map((c) => (
                <li key={c.phone}>
                  <a
                    href={`tel:+${c.phone}`}
                    className="v8-footer-link"
                  >
                    {c.phoneDisplay}
                  </a>
                </li>
              ))}
              {BUSINESS_EMAIL ? (
                <li>
                  <a
                    href={`mailto:${BUSINESS_EMAIL}`}
                    className="v8-footer-link"
                  >
                    {BUSINESS_EMAIL}
                  </a>
                </li>
              ) : null}
            </ul>
            {/* Con oficina que recibe clientes se publica la dirección: es un
                factor fuerte de SEO local y un dato que el visitante busca en
                el pie. Sin local visitable se afirma solo la zona. */}
            {SERVICE_AREA.hasPublicOffice ? (
              <address>
                {BUSINESS.streetAddress}
                <br />
                {BUSINESS.city}, {BUSINESS.region} {BUSINESS.postalCode}
              </address>
            ) : (
              <p>{tc("address")}</p>
            )}
          </div>
        </div>

        <div className="v8-footer-bottom">
          <p>
            &copy; {year} {BRAND.name}. {t("rights")}
          </p>
          {/*
            Los enlaces legales existen como rutas pero permanecen fuera de la
            navegación pública hasta que el contenido sea revisado por el
            cliente. Ver AUDITORIA_Y_PLAN_AMPARGO.md §13.
          */}
        </div>
      </div>
    </footer>
  );
}
