"use client";

import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { BeforeAfterPair } from "@/content/before-after";

interface BeforeAfterProps {
  pair: BeforeAfterPair;
  beforeLabel: string;
  afterLabel: string;
  sliderLabel: string;
}

const KEYBOARD_STEP = 5;

/**
 * Comparador antes/después.
 *
 * El arrastre se maneja a mano con Pointer Events sobre el contenedor, NO
 * dejándoselo al gesto nativo de `input[type=range]`. Se probó lo segundo
 * primero (pista estirada sobre toda la foto) y en escritorio funcionaba,
 * pero en un iPhone real arrastrar no hacía nada: Safari en iOS solo iniciA
 * el arrastre nativo de un range si el dedo TOCA el thumb, y aquí el thumb
 * estaba reducido a 1x1px (invisible a propósito, ver CSS) — sin superficie
 * que tocar, no hay drag posible, solo el salto de `onChange` si el toque
 * caía justo encima de esos 1x1px. Con Pointer Events el contenedor entero
 * es la superficie de arrastre en cualquier dispositivo con puntero.
 *
 * El `input[type=range]` se conserva SOLO para teclado: sigue siendo
 * focusable (Tab no depende de `pointer-events`) y accesible por lectores de
 * pantalla, pero `pointer-events:none` en su CSS le quita el manejo del
 * puntero — así nunca compite con el `onPointerDown` de aquí abajo.
 */
export default function BeforeAfter({
  pair,
  beforeLabel,
  afterLabel,
  sliderLabel,
}: BeforeAfterProps) {
  const [position, setPosition] = useState(pair.initialPosition);
  const sliderId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, ratio)));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    // En ratón, solo el botón principal arrastra; táctil y lápiz no tienen
    // "botón" (event.button llega en 0 de todos modos) así que no se filtran.
    if (event.pointerType === "mouse" && event.button !== 0) return;
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateFromClientX(event.clientX);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition((current) => Math.max(0, current - KEYBOARD_STEP));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition((current) => Math.min(100, current + KEYBOARD_STEP));
    }
  };

  return (
    <div
      ref={containerRef}
      className="v7-compare"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <Image
        src={`/images/proyectos/${pair.afterFile}`}
        alt={pair.afterAlt}
        fill
        priority
        className="v7-compare-image"
        sizes="(min-width: 1024px) 62vw, 100vw"
      />

      {/* La foto «antes» se recorta según la posición del divisor. */}
      <div
        className="v7-compare-before"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={`/images/proyectos/${pair.beforeFile}`}
          alt={pair.beforeAlt}
          fill
          priority
          className="v7-compare-image"
          sizes="(min-width: 1024px) 62vw, 100vw"
        />
      </div>

      <div className="v7-compare-divider" style={{ left: `${position}%` }} aria-hidden="true" />
      <div className="v7-compare-handle" style={{ left: `${position}%` }} aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" /></svg>
        <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      </div>

      <span className="v7-compare-tag is-before">{beforeLabel}</span>
      <span className="v7-compare-tag is-after">{afterLabel}</span>

      <label htmlFor={sliderId} className="sr-only">
        {sliderLabel}
      </label>
      <input
        id={sliderId}
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(position)}
        onChange={(event) => setPosition(Number(event.target.value))}
        onKeyDown={handleKeyDown}
        className="v7-compare-input"
        aria-valuetext={`${Math.round(position)}%`}
      />
    </div>
  );
}
