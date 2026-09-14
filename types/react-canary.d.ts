/**
 * Habilita los tipos del canal `canary` de React (p. ej. `ViewTransition`)
 * en todo el proyecto. Next.js 16 ya usa React canary por debajo para el
 * App Router — esto solo le da los tipos a TypeScript, no cambia nada en
 * runtime. Ver node_modules/@types/react/canary.d.ts para el porqué de
 * este patrón (import de solo efecto / referencia de tipos).
 */
/// <reference types="react/canary" />
