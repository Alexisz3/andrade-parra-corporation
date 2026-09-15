/**
 * Reparto de solicitudes entre los contactos de WhatsApp.
 * Sin runner externo: node puro.
 * Uso: npm run check:assignment
 *
 * Esta prueba existe por un fallo medido en producción: `lib/assignment.ts`
 * implementaba el reparto determinista y NO lo llamaba nadie. El formulario
 * hacía `whatsappTargets[0]`, así que el 100 % de las cotizaciones llegaba a
 * Jose Andrade y los demás contactos no recibían ninguna. Un módulo correcto
 * y huérfano no falla en ninguna prueba, por eso hace falta una que compruebe
 * el reparto de verdad y no solo la función aislada.
 */
import assert from "node:assert/strict";
import { pickContactIndex, quoteSeed } from "../lib/assignment.ts";

/** Los contactos reales, tal como los declara `lib/site.ts`. */
const CONTACTS = ["Jose Andrade", "Ramon Andrade", "Mario Parra"];

/* ─── Lote de solicitudes variadas ───────────────────────────────────────
 * Nombres, teléfonos y descripciones distintos, en los dos idiomas del
 * sitio y con acentos y eñes, que es donde un hash mal implementado sobre
 * `charCodeAt` se comporta distinto que sobre bytes UTF-8.
 */
const REQUESTS = [
  ["María Fernández", "8325550101", "Remodelación de cocina con isla"],
  ["John Smith", "7135550102", "Bathroom remodel, master suite"],
  ["Luis Peña", "2815550103", "Ampliación de cochera"],
  ["Sarah Johnson", "8325550104", "Kitchen countertops and backsplash"],
  ["Ramón Ortiz", "8325550105", "Techo y estructura de patio"],
  ["Emily Davis", "9365550106", "Full interior repaint and floors"],
  ["Ana Gómez", "8325550107", "Baño completo, azulejo hasta el techo"],
  ["Michael Brown", "7135550108", "Garage conversion to office"],
  ["Jorge Núñez", "8325550109", "Demolición y obra nueva en cocina"],
  ["Linda Wilson", "2815550110", "Deck and outdoor kitchen"],
  ["Carmen Ruiz", "8325550111", "Cambio de plomería en dos baños"],
  ["David Miller", "8325550112", "Roof structure repair after storm"],
  ["Pedro Salas", "7135550113", "Acabados interiores, piso y molduras"],
  ["Jessica Taylor", "8325550114", "New home build on family lot"],
  ["Óscar Vega", "8325550115", "Remodelación integral de casa"],
  ["Robert Garcia", "2815550116", "Quartz counters, kitchen only"],
  ["Sofía Márquez", "8325550117", "Closet a medida y pintura"],
  ["Karen Martinez", "9365550118", "Bathroom accessibility remodel"],
  ["Andrés Cruz", "8325550119", "Cerca perimetral y jardín"],
  ["Thomas Clark", "7135550120", "Commercial storefront finish-out"],
];

let failed = 0;
const fail = (msg) => {
  failed++;
  console.log("FALLA " + msg);
};

/* ─── 1. Todos los contactos reciben solicitudes ──────────────────────── */
const counts = CONTACTS.map(() => 0);
for (const [name, phone, description] of REQUESTS) {
  const seed = quoteSeed([name, phone, description]);
  counts[pickContactIndex(seed, CONTACTS.length)]++;
}

console.log(`Lote de ${REQUESTS.length} solicitudes:`);
CONTACTS.forEach((c, i) => console.log(`  ${c}: ${counts[i]}`));

if (counts.some((n) => n === 0)) {
  fail(`un contacto se queda sin ninguna solicitud (${counts.join(" / ")})`);
} else {
  console.log("OK    todos los contactos reciben solicitudes");
}

/*
 * Equilibrio. No se exige un reparto exacto a partes iguales —sería
 * casualidad, no corrección—, pero un contacto muy por debajo de su parte
 * proporcional (la mitad de "1 / cuántos contactos haya") ya no es "los
 * contactos son igualmente principales".
 */
const min = Math.min(...counts);
const fairShareFloor = (REQUESTS.length / CONTACTS.length) * 0.5;
if (min < fairShareFloor) {
  fail(`reparto desequilibrado: ${counts.join(" / ")} sobre ${REQUESTS.length}`);
} else {
  console.log(`OK    reparto equilibrado (${counts.join(" / ")})`);
}

/* ─── 2. Determinismo: la misma solicitud, el mismo contacto ─────────── */
{
  let stable = true;
  for (const [name, phone, description] of REQUESTS) {
    const seed = quoteSeed([name, phone, description]);
    const first = pickContactIndex(seed, CONTACTS.length);
    for (let i = 0; i < 50; i++) {
      if (pickContactIndex(seed, CONTACTS.length) !== first) stable = false;
    }
  }
  if (stable) console.log("OK    la misma semilla da siempre el mismo contacto");
  else fail("la misma semilla devuelve contactos distintos");
}

/*
 * Determinismo frente al ruido de escritura.
 *
 * Reintentar tras corregir un espacio, una mayúscula o el formato del
 * teléfono NO debe cambiar de destinatario: si cambiara, la misma solicitud
 * llegaría a más de un teléfono y varios contactos llamarían al mismo cliente.
 */
{
  const canonical = quoteSeed(["María Fernández", "8325550101", "Remodelación de cocina con isla"]);
  const noisy = [
    ["  maría fernández ", "8325550101", "Remodelación  de cocina con isla"],
    ["MARÍA FERNÁNDEZ", "8325550101", "remodelación de cocina con isla  "],
  ];
  for (const parts of noisy) {
    try {
      assert.equal(quoteSeed(parts), canonical);
    } catch {
      fail(`la normalización de la semilla no absorbe el ruido: ${JSON.stringify(parts)}`);
    }
  }
  if (!failed) console.log("OK    la semilla normaliza espacios y mayúsculas");
}

/* ─── 3. Guardias ────────────────────────────────────────────────────── */
try {
  assert.equal(pickContactIndex("cualquiera", 0), 0);
  console.log("OK    sin contactos devuelve 0 y no `undefined`");
} catch {
  fail("sin contactos no devuelve 0");
}

try {
  assert.ok(pickContactIndex("x", 1) === 0);
  console.log("OK    con un solo contacto siempre devuelve el único índice");
} catch {
  fail("con un solo contacto el índice se sale de rango");
}

/* ─── Informe ────────────────────────────────────────────────────────── */
if (failed) {
  console.log(`\n${failed} FALLO(S)`);
  process.exit(1);
}
console.log("\nReparto correcto.");
