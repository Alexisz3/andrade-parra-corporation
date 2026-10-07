"use client";

import { track, type AnalyticsEvent } from "@/lib/analytics";

/**
 * Enlace de contacto instrumentado (`tel:`, `wa.me`, `mailto:`).
 *
 * Existe porque la página de Contacto es un componente de servidor y no puede
 * llevar un `onClick`. Es deliberadamente mínimo — un `<a>` con un manejador —
 * para que el coste en JavaScript de medir la conversión principal del negocio
 * sea de unos pocos cientos de bytes.
 *
 * No cambia el comportamiento del enlace: `track()` no bloquea ni difiere la
 * navegación, y si la analítica está desactivada no hace absolutamente nada,
 * así que el enlace funciona igual con o sin consentimiento de cookies.
 */
export default function TrackedContactLink({
  href,
  event,
  params,
  className,
  children,
  external = false,
  ariaLabel,
}: {
  href: string;
  event: AnalyticsEvent;
  params?: Record<string, string>;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
  /** Para enlaces que solo contienen un icono. */
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() => track(event, params)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
