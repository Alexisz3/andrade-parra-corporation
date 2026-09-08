"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { type StaticPathname } from "@/i18n/routing";
import { BRAND } from "@/lib/site";
import BrandLogo from "./BrandLogo";
import LocaleSwitcher from "./LocaleSwitcher";
import MobileMenu from "./MobileMenu";

export type HeaderNavItem = {
  href: StaticPathname;
  key: "projects" | "services" | "about" | "faq" | "contact";
  hash?: string;
};

const NAV_LINKS: HeaderNavItem[] = [
  { href: "/projects", key: "projects" },
  { href: "/services", key: "services" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "faq", hash: "faq" },
  { href: "/contact", key: "contact" },
];

export default function Header() {
  const t = useTranslations("Nav");
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
          <Link href="/" className="v7-brand-link" aria-label={`${BRAND.name} — ${t("home")}`}>
            <BrandLogo variant="approved" decorative className="v7-header-logo" />
          </Link>

          <nav aria-label={t("menuTitle")} className="v7-desktop-nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={`${link.href}-${link.hash ?? "page"}`}
                href={link.hash ? { pathname: link.href, hash: link.hash } : link.href}
                aria-current={!link.hash && pathname === link.href ? "page" : undefined}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="v7-header-actions">
            <Suspense fallback={<div aria-hidden="true" className="v7-language-trigger" />}>
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
