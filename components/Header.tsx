"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALE_PREFIXES, type AppLocale, type StaticPathname } from "@/i18n/routing";
import { BRAND, WHATSAPP_CONTACTS } from "@/lib/site";
import BrandLogo from "./BrandLogo";
import LocaleSwitcher from "./LocaleSwitcher";
import MobileMenu from "./MobileMenu";

const NAV_LINKS: { href: StaticPathname; key: "projects" | "services" | "about" | "contact" }[] = [
  { href: "/projects", key: "projects" },
  { href: "/services", key: "services" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
];

export default function Header() {
  const t = useTranslations("Nav");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`v7-header ${solid ? "is-solid" : ""}`}>
        <div className="v7-container v7-header-inner">
          <Link href="/" className="v7-brand-link" aria-label={`${BRAND.name} — ${BRAND.descriptor}`}>
            <BrandLogo variant="horizontal" size={25} decorative />
          </Link>

          <nav aria-label={t("menuTitle")} className="v7-desktop-nav">
            <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>{t("home")}</Link>
            {NAV_LINKS.slice(0, 3).map((link) => (
              <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>
                {t(link.key)}
              </Link>
            ))}
            <a href={`${LOCALE_PREFIXES[locale]}#faq`}>{t("faq")}</a>
            <Link href="/contact" aria-current={pathname === "/contact" ? "page" : undefined}>{t("contact")}</Link>
          </nav>

          <div className="v7-header-actions">
            <a href={`tel:+${WHATSAPP_CONTACTS[0].phone}`} className="v7-phone-pill">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4Z" /></svg>
              {WHATSAPP_CONTACTS[0].phoneDisplay}
            </a>
            <Suspense fallback={<div aria-hidden="true" className="h-11 w-[6.5rem] rounded-full border border-bone/30" />}>
              <LocaleSwitcher />
            </Suspense>
            <Link href="/quote" className="v7-header-quote">{t("quote")}<span aria-hidden="true">→</span></Link>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("openMenu")}
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              className="v7-menu-trigger"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
        </div>
      </header>
      <div id="menu-movil">
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={NAV_LINKS} triggerRef={triggerRef} />
      </div>
    </>
  );
}
