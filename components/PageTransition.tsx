import { ViewTransition } from "react";

/**
 * Envuelve el contenido de cada página para que la navegación entre
 * secciones anime en vez de cortar en seco. Una sola dirección (no hay
 * jerarquía "adelante/atrás" real entre Inicio/Proyectos/Servicios/...),
 * ver PLAN_MICROANIMACIONES.md sección 1.1.
 *
 * Tiene que ir en cada `page.tsx`, no en `layout.tsx`: los layouts no se
 * desmontan entre navegaciones, así que `enter`/`exit` nunca dispararían ahí.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="v7-page-in" exit="v7-page-out" default="none">
      {children}
    </ViewTransition>
  );
}
