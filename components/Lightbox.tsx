"use client";

import { useCallback, useEffect, useRef, ViewTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * Visor de imagen ampliada.
 *
 * Por qué existe: el propietario juzga una obra por el remate del azulejo, y
 * en la cuadrícula esa foto se ve a un tercio de ancho de columna. Sin poder
 * acercarse, la galería enseña que hubo obra pero no cómo quedó.
 *
 * Sobre la RESOLUCIÓN, que es la restricción real de este visor: las 29 fotos
 * actuales llegaron por WhatsApp y topan en 960 px de ancho — por eso
 * `next.config.mjs` corta ahí los `deviceSizes`. Ampliar más allá de ese
 * límite no añade detalle: añade emborronado y hace que el trabajo parezca
 * peor de lo que es. Por eso la caja del visor está limitada a 960 px en su
 * lado largo en lugar de ocupar toda la pantalla. La foto se ve tan grande
 * como el archivo permite y ni un píxel más. Los originales de cámara están
 * pendientes del cliente — punto 04 de docs/MATERIAL_PENDIENTE_CLIENTE.html;
 * cuando lleguen, basta con subir ese tope y el de `deviceSizes`.
 *
 * El patrón de foco es el mismo que ya resuelve `MobileMenu.tsx` —trampa de
 * tabulación, Escape, bloqueo de scroll compensando la barra y devolución del
 * foco al origen— porque duplicar ese comportamiento con otras decisiones es
 * cómo se acaba con dos diálogos que se comportan distinto en el mismo sitio.
 */

/** Lado largo máximo, en px. Ver la nota sobre resolución de arriba. */
export const MAX_PHOTO_PX = 960;

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Lightbox({
  src,
  alt,
  orientation,
  onClose,
  viewTransitionName,
}: {
  src: string;
  alt: string;
  orientation: "vertical" | "horizontal";
  /** Cierra el visor. Quien lo abrió es responsable de recuperar el foco. */
  onClose: () => void;
  /**
   * Mismo nombre que llevaba la miniatura que abrió el visor: la foto se
   * "entrega" del disparador al visor en vez de cortar de una a otra.
   * Quien lo pasa (ZoomableImage.tsx) es responsable de que la miniatura
   * DEJE de llevar ese nombre mientras el visor está abierto — dos
   * elementos con el mismo nombre a la vez rompe la transición. Ver
   * PLAN_MICROANIMACIONES.md 1.3.
   */
  viewTransitionName?: string;
}) {
  const t = useTranslations("Projects");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Bloquea el scroll del fondo compensando el ancho de la barra, para que
  // el contenido no dé un salto lateral al abrir.
  useEffect(() => {
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
  }, []);

  // El foco entra al botón de cierre al abrir: es la salida, y quien llega con
  // teclado necesita encontrarla sin tabular a ciegas.
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const vertical = orientation === "vertical";

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Fondo pulsable. Es un <button> y no un <div> con onClick para que
          también responda a teclado y lo anuncien los lectores de pantalla. */}
      <button
        type="button"
        aria-label={t("closeLightbox")}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-zoom-out bg-carbon/92"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 sm:p-8"
      >
        <figure
          className="pointer-events-auto relative w-full"
          style={{
            // Tope duro por el lado largo real del archivo: más allá, ampliar
            // solo emborrona. Ver MAX_PHOTO_PX.
            maxWidth: vertical
              ? `min(88vw, calc(88svh * 3 / 4), ${(MAX_PHOTO_PX * 3) / 4}px)`
              : `min(92vw, calc(84svh * 4 / 3), ${MAX_PHOTO_PX}px)`,
          }}
        >
          <div className={`relative w-full ${vertical ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
            {(() => {
              const image = (
                <Image
                  src={src}
                  alt={alt}
                  fill
                  // Mismo pipeline que el resto del sitio: AVIF/WebP negociados y
                  // sin ampliar por encima del original.
                  sizes={`(max-width: ${MAX_PHOTO_PX}px) 100vw, ${MAX_PHOTO_PX}px`}
                  className="object-contain"
                  priority
                />
              );
              return viewTransitionName ? (
                <ViewTransition name={viewTransitionName}>{image}</ViewTransition>
              ) : (
                image
              );
            })()}
          </div>
        </figure>

        {/*
          Cierre. 48 px de lado: por encima del mínimo táctil de 44 px de WCAG
          2.2, y separado del borde para que en móvil quede al alcance del
          pulgar sin competir con los gestos del sistema en el borde mismo.
        */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t("closeLightbox")}
          className="pointer-events-auto absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-carbon-raised text-bone transition-colors hover:bg-accent sm:right-6 sm:top-6"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
