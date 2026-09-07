"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { routing, LOCALE_CODES, type AppLocale } from "@/i18n/routing";
import { resolveLocalizedDestination } from "@/i18n/localized-destination";

/**
 * Cambia de idioma traduciendo el LUGAR actual, no volviendo al inicio.
 *
 * Preserva: la página equivalente, la misma entidad dinámica (con su slug
 * traducido), los filtros de la query string y el hash. La lógica vive en
 * `i18n/localized-destination.ts`; aquí solo se navega.
 */
export default function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  // `usePathname()` devuelve el PATRÓN (`/projects/[slug]`), no la ruta
  // resuelta: el slug real hay que sacarlo de los params de la ruta.
  const routeParams = useParams();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const switchTo = (target: AppLocale) => {
    if (target === locale) return;
    setOpen(false);

    const rawSlug = routeParams?.slug;
    const currentSlug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const dest = resolveLocalizedDestination(
      pathname,
      locale,
      target,
      new URLSearchParams(searchParams.toString()),
      hash,
      currentSlug
    );

    // Sin equivalente en el idioma destino: se deja al visitante donde está
    // en vez de mandarlo al inicio sin avisar o construir un slug que da 404.
    if (dest.kind === "unavailable") return;

    const options = { locale: target, scroll: false } as const;

    if (dest.kind === "dynamic") {
      router.replace(
        { pathname: dest.pathname, params: { slug: dest.slug }, query: dest.query },
        options
      );
    } else {
      router.replace(
        // El pathname viene de `usePathname()`, así que ya es una ruta válida
        // del registro; el tipo genérico de `replace` no puede inferirlo.
        { pathname: dest.pathname as "/", query: dest.query },
        options
      );
    }

    // El hash no viaja en el router tipado; se reaplica tras navegar.
    if (dest.hash && typeof window !== "undefined") {
      window.setTimeout(() => {
        window.location.hash = dest.hash;
      }, 0);
    }
  };

  return (
    <div ref={rootRef} className={`v7-language ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="v7-language-trigger"
        aria-label={t("languageSwitcherLabel")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true" className={`v7-language-flag ${locale === "es-US" ? "is-es" : "is-en"}`} />
        <span>{LOCALE_CODES[locale].toUpperCase()}</span>
        <svg viewBox="0 0 14 14" aria-hidden="true">
          <path d="M3 5.25 7 9l4-3.75" />
        </svg>
      </button>
      <div role="menu" aria-label={t("languageSwitcherLabel")} className="v7-language-menu">
        {routing.locales.map((l) => {
          const isCurrent = l === locale;
          return (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={isCurrent}
              onClick={() => switchTo(l)}
            >
              <span><span aria-hidden="true" className={`v7-language-flag ${l === "es-US" ? "is-es" : "is-en"}`} />{LOCALE_CODES[l].toUpperCase()}</span>
              <i aria-hidden="true">{isCurrent ? "✓" : ""}</i>
            </button>
          );
        })}
      </div>
    </div>
  );
}
