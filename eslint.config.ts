import { base, react, typescriptPendingIgnores } from "@spudly/eslint-config";

import pageStyling from "./eslintRules/noPageStyling.mjs";
import marginSpacing from "./eslintRules/noMarginSpacing.mjs";

// The repo-local design-system plugin: the #119 page-styling rule
// and the #209 margin-spacing rule, registered under one namespace
// (flat config cannot register the same namespace twice for one
// file with different plugin objects).
const designSystem = {
  rules: { ...pageStyling.rules, ...marginSpacing.rules },
};

// Shared config: @spudly/eslint-config (ported from Eciperay's
// eslint.config.ts). This repo is a library, not an app, so it composes
// only the subsets that match its code (see the package README's
// adoption notes): no `node` (no server), no `jest` (tests run on
// node --test), no `reactNative` (the app-screen rules don't fit
// library primitives), and no Tailwind.
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
  // typescript-eslint does not support TypeScript 7 yet (it caps
  // TypeScript at <6.1) and it was the only TS parser, so TS/TSX files
  // are not linted for now — `npm run typecheck` is the correctness
  // gate until typescript-eslint ships TS7 support and the package
  // gains a real typescript section (see the package README's restore
  // path). Plain JS files (.js/.mjs) are still linted.
  ...typescriptPendingIgnores,
  ...base,
  ...react,
  {
    // Node tooling (the visual-regression runner and helpers): these
    // run under Node, not in the library runtime, so Node globals
    // apply and console is their interface — the shared base's
    // app-code no-console / no-undef stance does not fit them.
    files: ["tools/**/*.mjs"],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    // Test files only (Stephen's decision, 2026-10-24): the file-length
    // cap is raised to 300 for tests — fixture tables and scenario
    // lists are naturally long, and splitting them purely to satisfy
    // the cap hurts readability. The base rule's other options are
    // preserved verbatim; only the max changes. src/ and tools/ keep
    // the shared 150, and max-lines-per-function is NOT relaxed
    // anywhere (the per-function findings stay warnings).
    files: ["test/**"],
    rules: {
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    // #119: page components must not apply styling directly — no
    // className, no inline style prop, no Tamagui styling props on any
    // element (not even a DS component's designed style props), no
    // layout primitives, no styling pass-through. Styling belongs in
    // reusable components under src/components, driven by semantic
    // props. DORMANT today: the typescriptPendingIgnores block above
    // ignores every .ts/.tsx file (typescript-eslint has no TS7 parser
    // yet), so this cannot fire until the TS lint restoration removes
    // that block — at which point it activates with no further change.
    // The pages are being fixed proactively from the audit on #119 so
    // activation is a non-event. Rule: eslintRules/noPageStyling.mjs.
    files: ["src/pages/**/*.tsx"],
    plugins: { "design-system": designSystem },
    rules: {
      "design-system/no-page-styling": "error",
      "design-system/no-margin-spacing": "error",
    },
  },
  {
    // #209: inter-item spacing is a parent-layout concern — parents
    // express it with gap (stacks) and padding (containers), so no
    // element in a component or a page carries a margin prop (or a
    // margin key in a style object) to create space between
    // siblings. DORMANT today, beside the #119 rule: the
    // typescriptPendingIgnores block above ignores every .ts/.tsx
    // file, so this cannot fire until the TS lint restoration —
    // at which point it activates with no further change. The
    // codebase was swept proactively on #209 so activation is a
    // non-event. Rule: eslintRules/noMarginSpacing.mjs.
    files: ["src/components/**/*.tsx"],
    plugins: { "design-system": designSystem },
    rules: { "design-system/no-margin-spacing": "error" },
  },
  {
    // Stories are Storybook scaffolding, not shipped page components:
    // they frame pages in demo viewports and spread fixture objects
    // onto them, which the page rule forbids for pages themselves.
    // The margin rule is off for the same reason: stories lay out
    // demo content, they are not shipped components or pages.
    files: ["src/pages/**/*.stories.tsx"],
    rules: {
      "design-system/no-page-styling": "off",
      "design-system/no-margin-spacing": "off",
    },
  },
  {
    files: ["src/components/**/*.stories.tsx"],
    rules: { "design-system/no-margin-spacing": "off" },
  },
  {
    // The storybook host app's Babel/Metro configs are CommonJS in
    // .js files. The shared base's CommonJS overrides only cover
    // *.cjs, so the same treatment is attached here for these files:
    // Node globals, and the ESM-only rules off.
    files: ["apps/storybook/*.js"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        console: "readonly",
        module: "writable",
        process: "readonly",
        require: "readonly",
      },
    },
    rules: {
      "import-x/no-commonjs": "off",
      "unicorn/prefer-module": "off",
    },
  },
];
