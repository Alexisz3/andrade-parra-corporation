import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Herramientas locales pueden crear worktrees completos bajo `.claude`.
    // No forman parte de esta app y no deben entrar al lint del repositorio.
    ignores: ["_fotos_originales/**", ".claude/**", ".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
