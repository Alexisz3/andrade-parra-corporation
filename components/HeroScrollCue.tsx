"use client";

import { useCallback, useRef } from "react";

/**
 * Indicador de scroll del hero de portada: etiqueta + filete + galón (sin
 * círculo). El estilo vive en `.v7-hero-scrollcue*` de app/globals.css.
 *
 * El desplazamiento es una animación propia con requestAnimationFrame y
 * easing, no el `scroll-behavior: smooth` del navegador: así se ve fluido de
 * forma consistente (algunos motores lo saltan) y se controla el ritmo. Es un
 * descenso lento y deliberado (~1,4–2,2 s) hasta la biblioteca de proyectos.
 * Respeta `prefers-reduced-motion` y se cancela si el usuario toca la rueda,
 * la pantalla o el teclado. Sin JS —o antes de hidratar— el `href` hace el
 * salto nativo como respaldo.
 */

// Descenso lento y deliberado hasta la biblioteca. Se escala un poco con la
// distancia para que se sienta parejo en cualquier viewport.
const MIN_DURATION_MS = 1400;
const MAX_DURATION_MS = 2200;
const MS_PER_PX = 2.4;

// easeInOutSine: la curva más suave: entra y sale sin tirones y sin un tramo
// central rápido, así que se percibe como un deslizamiento continuo y calmado.
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

interface HeroScrollCueProps {
  label: string;
  /** Ancla de la sección siguiente, p. ej. "#proyectos". */
  href: string;
}

/**
 * El `onClick` que hace el descenso animado hasta `href` ("#id"), extraído
 * aparte del indicador de texto de este archivo por si otro elemento de
 * portada necesita el mismo descenso animado sin duplicar la lógica.
 */
export function useSmoothScrollTo(href: string) {
  const rafRef = useRef(0);

  return useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Respeta abrir en pestaña nueva / con modificadores.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const targetId = href.replace(/^#/, "");
      const target = document.getElementById(targetId);
      if (!target) return; // respaldo: salto nativo del <a>

      event.preventDefault();
      cancelAnimationFrame(rafRef.current);

      const scrollPad =
        parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const startY = window.scrollY;
      const endY = Math.max(
        0,
        Math.round(startY + target.getBoundingClientRect().top - scrollPad)
      );
      const distance = endY - startY;

      const settle = () => {
        history.replaceState(null, "", `#${targetId}`);
        // Continúa la navegación por teclado desde la sección de destino.
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      };

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReduced || Math.abs(distance) < 8) {
        window.scrollTo(0, endY);
        settle();
        return;
      }

      let cancelled = false;
      const cancel = () => {
        cancelled = true;
      };
      const listenerOpts = { passive: true, once: true } as const;
      window.addEventListener("wheel", cancel, listenerOpts);
      window.addEventListener("touchstart", cancel, listenerOpts);
      window.addEventListener("keydown", cancel, listenerOpts);

      const cleanup = () => {
        window.removeEventListener("wheel", cancel);
        window.removeEventListener("touchstart", cancel);
        window.removeEventListener("keydown", cancel);
      };

      const durationMs = Math.min(
        MAX_DURATION_MS,
        Math.max(MIN_DURATION_MS, Math.abs(distance) * MS_PER_PX)
      );
      const startTime = performance.now();
      const tick = (now: number) => {
        if (cancelled) {
          cleanup();
          return;
        }
        const progress = Math.min((now - startTime) / durationMs, 1);
        window.scrollTo(0, startY + distance * easeInOutSine(progress));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          cleanup();
          settle();
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [href]
  );
}

export default function HeroScrollCue({ label, href }: HeroScrollCueProps) {
  const handleClick = useSmoothScrollTo(href);

  return (
    <a className="v7-hero-scrollcue" href={href} onClick={handleClick}>
      <span className="v7-hero-scrollcue-label">{label}</span>
      <span className="v7-hero-scrollcue-line" aria-hidden="true" />
      <svg
        className="v7-hero-scrollcue-arrow"
        viewBox="0 0 18 11"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M1 1.5 9 9l8-7.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
