#!/usr/bin/env node
/*
 * Copia el bundle de Decap CMS (ya construido dentro de `node_modules/decap-cms/dist`)
 * a `public/admin/`, para servirlo desde el propio sitio en vez de un `<script>` a un
 * CDN externo — así no hace falta abrir la CSP del sitio (`lib/csp.mjs`) a un origen
 * de terceros solo para esta herramienta de un solo usuario.
 *
 * Volver a correr esto (`node scripts/vendor-decap-cms.mjs`) después de
 * `npm install decap-cms@<nueva-version>` para actualizar el CMS.
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "node_modules/decap-cms/dist");
const dest = join(root, "public/admin");

mkdirSync(dest, { recursive: true });

// Limpia lo que haya de una versión anterior (deja intactos index.html/config.yml,
// que no vienen de node_modules).
for (const name of readdirSync(dest)) {
  if (name === "index.html" || name === "config.yml") continue;
  rmSync(join(dest, name), { recursive: true, force: true });
}

const toCopy = readdirSync(src).filter((name) => {
  if (name.endsWith(".map")) return false; // solo para depurar, no se necesitan en producción
  // "cms.js"/"cms.js.LICENSE.txt" y sus fragmentos numerados ("N.cms.js") son
  // un alias duplicado de "decap-cms.js" — mismo bundle, otro nombre de entrada.
  if (name === "cms.js" || name === "cms.js.LICENSE.txt" || name.match(/^\d+\.cms\.js$/)) return false;
  return true;
});

for (const name of toCopy) {
  cpSync(join(src, name), join(dest, name === "cms.css" ? "decap-cms.css" : name));
}

const { version } = JSON.parse(readFileSync(join(root, "node_modules/decap-cms/package.json"), "utf8"));
console.log(`Vendorizados ${toCopy.length} archivos de decap-cms@${version} en public/admin/`);
