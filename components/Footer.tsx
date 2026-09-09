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
    <footer className="v8-editorial-footer">
      <div className="v7-container v8-editorial-footer-inner">
        <div className="v8-editorial-footer-grid">
          {/* ── Marca ── */}
          <div className="v8-editorial-footer-brand">
            <BrandLogo variant="approved" tone="light" className="v8-editorial-footer-logo" />
            <p className="v8-editorial-footer-tagline">
              Construcción y remodelación en Houston, TX.
            </p>
            <div className="v8-editorial-footer-accent"></div>
            <p className="v8-editorial-footer-statement">
              ESPACIOS QUE INSPIRAN<br/>MEJORES HISTORIAS.
            </p>
          </div>

          {/* ── Servicios ── */}
          <nav className="v8-editorial-footer-column" aria-label={t("servicesHeading")}>
            <h2>SERVICIOS</h2>
            <ul>
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    href={{ pathname: "/services/[slug]", params: { slug: s.slugs[locale] } }}
                    className="v8-editorial-footer-link"
                  >
                    {s.title[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Empresa ── */}
          <nav className="v8-editorial-footer-column" aria-label={t("companyHeading")}>
            <h2>EMPRESA</h2>
            <ul>
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="v8-editorial-footer-link"
                  >
                    {tn(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Contacto ── */}
          <div className="v8-editorial-footer-column v8-editorial-footer-contact">
            <h2>CONTACTO</h2>
            <ul>
              <li>
                <a href="tel:+18327940720" className="v8-editorial-footer-link">
                  <span className="v8-editorial-footer-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </span>
                  (832) 794-0720 <span className="v8-editorial-footer-contact-name">Jose</span>
                </a>
              </li>
              <li>
                <a href="tel:+18326524660" className="v8-editorial-footer-link">
                  <span className="v8-editorial-footer-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </span>
                  (832) 652-4660 <span className="v8-editorial-footer-contact-name">Mario</span>
                </a>
              </li>
              <li>
                <a href="mailto:contacto@ampargo.com" className="v8-editorial-footer-link">
                  <span className="v8-editorial-footer-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </span>
                  contacto@ampargo.com
                </a>
              </li>
              <li>
                <span className="v8-editorial-footer-link is-static">
                  <span className="v8-editorial-footer-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </span>
                  Houston y alrededores, TX
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="v8-editorial-footer-bottom">
          <div className="v8-editorial-footer-bottom-left">
            <p>
              &copy; {year} {BRAND.name}. Todos los derechos reservados.
            </p>
          </div>
          <div className="v8-editorial-footer-bottom-right">
            <p className="v8-editorial-footer-slogan">CONSTRUYENDO UN MEJOR MAÑANA</p>
            <div className="v8-editorial-footer-socials">
              <a href="#" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" aria-label="TikTok">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
