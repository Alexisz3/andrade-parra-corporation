"use client";

import { Suspense, useCallback, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LOCALE_PREFIXES, type AppLocale, type StaticPathname } from "@/i18n/routing";
import { WHATSAPP_CONTACTS } from "@/lib/site";
import BrandLogo from "./BrandLogo";
import LocaleSwitcher from "./LocaleSwitcher";

type NavKey = "services" | "projects" | "process" | "about" | "contact";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: { href: StaticPathname; key: NavKey }[];
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function MobileMenu({ open, onClose, links, triggerRef }: MobileMenuProps) {
  const t = useTranslations("Nav");
  const locale = useLocale() as AppLocale;
  const tc = useTranslations("Contact");
  const panelRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  // Bloquea el scroll del fondo compensando el ancho de la barra, para que
  // el contenido no dé un salto lateral al abrir.
  useEffect(() => {
    if (!open) return;
    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [open]);

  // El foco entra al panel al abrir y vuelve al disparador al cerrar.
  //
  // `hasOpened` evita el bug clásico: sin él, el efecto se ejecuta también en
  // el montaje inicial (con open=false) y llama a focus() sobre el botón de
  // menú, robándole el foco al usuario nada más cargar la página. El foco solo
  // debe devolverse si el panel llegó a abrirse antes.
  const hasOpened = useRef(false);

  useEffect(() => {
    if (open) {
      hasOpened.current = true;
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    } else if (hasOpened.current) {
      triggerRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <button
        type="button"
        aria-label={t("closeMenu")}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-carbon/70"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("menuTitle")}
        // El panel puede desbordar en pantallas bajas; hacerlo alcanzable por
        // teclado permite desplazarlo con las flechas sin salir del diálogo.
        tabIndex={0}
        className="absolute inset-x-0 top-0 max-h-full overflow-y-auto bg-carbon px-6 pb-8 pt-4 text-bone"
      >
        <div className="flex items-center justify-between">
          {/* Variante compacta: en la cabecera del panel el espacio es
              estrecho y compite con el botón de cierre. Sin `decorative`, el
              propio componente aporta el nombre accesible — no hace falta un
              sr-only adicional, que lo anunciaría dos veces. */}
          <BrandLogo variant="compact" size={24} />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeMenu")}
            className="-mr-3 flex h-11 w-11 items-center justify-center"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav aria-label={t("menuTitle")} className="mt-8">
          <ul className="divide-y divide-bone/15 border-y border-bone/15">
            <li>
              <Link href="/" onClick={onClose} className="flex min-h-[56px] items-center font-display text-xl">
                {t("home")}
              </Link>
            </li>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex min-h-[56px] items-center font-display text-xl"
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={`${LOCALE_PREFIXES[locale]}#faq`}
                onClick={onClose}
                className="flex min-h-[56px] items-center font-display text-xl"
              >
                {t("faq")}
              </a>
            </li>
          </ul>
        </nav>

        <Link
          href="/quote"
          onClick={onClose}
          className="mt-8 flex min-h-[52px] items-center justify-center bg-accent px-5 text-sm font-medium text-bone"
        >
          {t("quote")}
        </Link>

        <div className="mt-5 flex items-center justify-between border-y border-bone/15 py-3">
          <span className="font-mono text-xs uppercase tracking-wider text-bone/55">{t("languageSwitcherLabel")}</span>
          <Suspense fallback={<div aria-hidden="true" className="h-11 w-[6.5rem] rounded-full border border-bone/30" />}>
            <LocaleSwitcher />
          </Suspense>
        </div>

        <ul className="mt-6 space-y-1">
          {WHATSAPP_CONTACTS.map((contact) => (
            <li key={contact.phone}>
              <a
                href={`tel:+${contact.phone}`}
                className="flex min-h-[48px] items-center justify-between text-sm text-bone/85"
              >
                <span>{contact.name}</span>
                <span className="font-mono">{contact.phoneDisplay}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-2 font-mono text-xs text-bone/50">{tc("callLabel")}</p>
      </div>
    </div>
  );
}
