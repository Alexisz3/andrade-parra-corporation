import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Herramientas locales pueden crear worktrees completos bajo `.claude`.
    // No forman parte de esta app y no deben entrar al lint del repositorio.
    // `public/admin/*.js` es el bundle de Decap CMS vendorizado tal cual
    // (scripts/vendor-decap-cms.mjs) — código de terceros, no se edita ni se
    // linta aquí.
    ignores: ["_fotos_originales/**", ".claude/**", ".next/**", "node_modules/**", "public/admin/**"],
  },
];

export default eslintConfig;
