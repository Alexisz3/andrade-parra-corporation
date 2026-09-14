import { getTranslations } from "next-intl/server";
import { SERVICE_AREA } from "@/content/company";
import { BUSINESS, BRAND } from "@/lib/site";

/**
 * Zona de servicio, sede y mapa.
 *
 * El mapa se pidió explícitamente pese al costo que describía este mismo
 * comentario antes (peso, cookies de terceros, métrica de velocidad): ese
 * argumento sigue siendo cierto, pero la decisión de mostrarlo de todos
 * modos es del cliente, no mía. Para no pagar el coste completo:
 *
 *   · `loading="lazy"` — no descarga nada hasta que el mapa entra en
 *     viewport, así que no compite con el LCP de arriba.
 *   · URL de Google Maps SIN clave de API (`/maps?...&output=embed`): es el
 *     truco de embed clásico, funciona sin facturación ni consola de Google
 *     Cloud, a cambio de un iframe algo menos configurable que el Embed API
 *     oficial — aquí no hace falta más que mostrar una zona.
 *   · La consulta es "Houston, TX" a secas, NO la dirección real del
 *     negocio: `hasPublicOffice` es `false`, así que este mapa tampoco debe
 *     filtrar una ubicación exacta. Es la misma zona que ya describe el
 *     texto de al lado, solo que dibujada.
 *
 * La dirección aparece solo si `hasPublicOffice` es cierto. La lista de
 * municipios, solo si el cliente confirmó cuáles cubre.
 */
export default async function ServiceArea() {
  const tc = await getTranslations("Contact");

  const fullAddress = `${BUSINESS.streetAddress}, ${BUSINESS.city}, ${BUSINESS.region} ${BUSINESS.postalCode}`;
  // Formato universal: lo entienden Google Maps web, Android e iOS.
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${BRAND.name}, ${fullAddress}`
  )}`;

  return (
    <section className="border-t border-line bg-surface py-12 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* ── Cobertura ── */}
          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
              {tc("addressLabel")}
            </h2>
            <p className="mt-4 text-balance font-display text-2xl font-semibold leading-tight text-ink">
              {tc("address")}
            </p>
            <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted">
              {tc("serviceAreaHelp")}
            </p>

            {SERVICE_AREA.nearbyAreas.length > 0 ? (
              <ul className="mt-6 flex flex-wrap gap-2 border-t border-line pt-6">
                {SERVICE_AREA.nearbyAreas.map((area) => (
                  <li
                    key={area}
                    className="border border-line bg-paper px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted"
                  >
                    {area}
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Invitación a preguntar: convierte una zona no listada en una
                conversación, en vez de en un visitante que se va. */}
            <p className="mt-6 border-t border-line pt-6 text-sm text-muted">
              {tc("areaAsk")}
            </p>
          </div>

          {/* ── Sede: solo con local que recibe clientes ── */}
          {SERVICE_AREA.hasPublicOffice ? (
            <div className="lg:border-l lg:border-line lg:pl-10">
              <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                {tc("officeLabel")}
              </h2>
              <address className="mt-4 not-italic leading-relaxed text-ink">
                {BUSINESS.streetAddress}
                <br />
                {BUSINESS.city}, {BUSINESS.region} {BUSINESS.postalCode}
              </address>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-[48px] items-center gap-2 border border-ink px-5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                {tc("directions")}
              </a>
              <p className="mt-4 text-sm text-muted">{tc("visitNote")}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-10 grid gap-8 border-t border-line pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
              {tc("mapLabel")}
            </h2>
            <p className="mt-4 text-balance font-display text-2xl font-semibold leading-tight text-ink">
              {tc("mapHeading")}
            </p>
            <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted">
              {tc("mapBody")}
            </p>
          </div>

          {/* Más chico y a la derecha: es una referencia visual de la zona,
              no el protagonista de la sección — el texto ya cubre lo esencial. */}
          <div className="lg:ml-auto lg:w-full lg:max-w-[420px]">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-md border border-line">
              <iframe
                src="https://www.google.com/maps?q=Houston,Texas&z=10&output=embed"
                title={tc("mapTitle")}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
            <p className="mt-3 text-sm text-muted">{tc("mapCaption")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
