"use client";

import { useEffect, useRef } from "react";

/**
 * Hilo rojo fino, fijo en el borde superior de la ventana, que crece con el
 * scroll de la página — el "detalle de marca" pedido explícitamente
 * (mensaje del 2026-09-14, ver PLAN_MICROANIMACIONES.md sección 3). No es
 * una animación automática: la mueve el propio scroll del visitante, así
 * que no hay nada que silenciar con `prefers-reduced-motion` — el único
 * movimiento es el suavizado del ancho, y ese ya lo neutraliza el bloque
 * global de esa preferencia en globals.css.
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollable = doc.scrollHeight - doc.clientHeight;
        const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
        barRef.current?.style.setProperty(
          "--v7-scroll-progress",
          String(Math.min(1, Math.max(0, ratio)))
        );
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="v7-scroll-progress" aria-hidden="true">
      <div ref={barRef} className="v7-scroll-progress-bar" />
    </div>
  );
}
