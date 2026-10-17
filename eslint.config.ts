import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";

// typescript-eslint is temporarily removed: it does not support
// TypeScript 7 yet (it caps TypeScript at <6.1). It provided both the
// TS parser and the @typescript-eslint/* rules, so until it supports
// TS7, ESLint has no way to parse TS/TSX sources and lint is disabled
// (see the "lint" script in package.json). This config remains valid
// for any plain JS files. Restore typescript-eslint (and spread its
// recommended config here) once it supports TypeScript 7.
export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/.expo/**",
      "**/coverage/**",
      "**/storybook-static/**",
    ],
  },
  js.configs.recommended,
  prettierConfig,
];
