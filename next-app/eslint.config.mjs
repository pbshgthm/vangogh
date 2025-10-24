import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/static/**",
  ]),
  {
    rules: {
      "@next/next/no-img-element": "off",
      "@next/next/no-css-tags": "off",
      "@next/next/google-font-display": "off",
      "@next/next/no-page-custom-font": "off",
    },
  },
]);

export default eslintConfig;
