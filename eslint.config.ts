import { base, react, typescript } from "@spudly/eslint-config";

import pageStyling from "./eslintRules/noPageStyling.mjs";
import marginSpacing from "./eslintRules/noMarginSpacing.mjs";
import sourceReadsInTests from "./eslintRules/noSourceReadsInTests.mjs";
import directStacks from "./eslintRules/noDirectStacks.mjs";

// The repo-local design-system plugin: the #119 page-styling rule
// and the #209 margin-spacing rule, registered under one namespace
// (flat config cannot register the same namespace twice for one
// file with different plugin objects).
const designSystem = {
  rules: {
    ...pageStyling.rules,
    ...marginSpacing.rules,
    ...sourceReadsInTests.rules,
    ...directStacks.rules,
  },
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
      "**/test-dist/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/.expo/**",
      "**/coverage/**",
      "**/storybook-static/**",
    ],
  },
  // TypeScript linting restored (#902) under the side-by-side shape
  // (eslint-config #67, @spudly/eslint-config 0.8.0): typescript-eslint
  // resolves the `typescript` alias (@typescript/typescript6, the TS 6
  // API it supports) while builds/typecheck run the TS 7 compiler from
  // the `typescript7` alias by path. TS/TSX files are linted again,
  // including the type-aware rules.
  ...typescript,
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
    files: ["test/**", "src/**/*.test.ts", "eslintRules/*.test.ts"],
    rules: {
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    // #119 (simplified shape per #297): page components must not
    // apply styling directly — no direct Tamagui imports, no
    // className, no inline style prop. Styling belongs in
    // reusable components under src/widgets, driven by semantic
    // props. The pages were fixed proactively from the audit on #119
    // so the TS lint restoration (#902) activated this as a non-event.
    // Rule: eslintRules/noPageStyling.mjs.
    // #698 extends the same rule to views: only widgets add styling,
    // so views compose data and callbacks exactly like pages. The
    // violating views are being fixed proactively from the #698
    // audit (leaf form controls move to src/widgets under its
    // Option B), so activation is a non-event for views too.
    files: ["src/pages/**/*.tsx", "src/views/**/*.tsx"],
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
    // siblings. The codebase was swept proactively on #209 so the
    // TS lint restoration (#902) activated this as a non-event.
    // Rule: eslintRules/noMarginSpacing.mjs.
    files: ["src/widgets/**/*.tsx", "src/views/**/*.tsx"],
    plugins: { "design-system": designSystem },
    rules: { "design-system/no-margin-spacing": "error" },
  },
  {
    // #746: layout composes through Row/Col/Spacer — no direct
    // XStack/YStack elements and no styled() derivations from
    // them anywhere in shipped components, views, pages, or
    // icons. The conversion tranches (#820–#827) rebuilt every
    // surface, so the TS lint restoration (#902) activated this
    // as a non-event. Rule: eslintRules/noDirectStacks.mjs.
    files: [
      "src/widgets/**/*.tsx",
      "src/views/**/*.tsx",
      "src/pages/**/*.tsx",
      "src/icons/**/*.tsx",
    ],
    plugins: { "design-system": designSystem },
    rules: { "design-system/no-direct-stacks": "error" },
  },
  {
    // The #746 allowlist (recorded on the issue and in the rule's
    // header): the only files that keep a raw stack.
    // - Row.tsx / Col.tsx: the primitives' own implementations —
    //   Row renders an XStack and Col a YStack after resolving
    //   the subset props; they are the one sanctioned place a
    //   raw stack renders, because they ARE the enforcement.
    // - SearchField: Option B allowlist #1 — the search
    //   container's focus-within ring needs pseudo-style props
    //   this Tamagui version accepts only in styled() configs,
    //   so its StyledContainer (styled XStack) is retained under
    //   Stephen's Option B ruling (2026-11-24).
    files: [
      "src/widgets/layout/Row.tsx",
      "src/widgets/layout/Col.tsx",
      "src/widgets/form/SearchField.tsx",
    ],
    rules: { "design-system/no-direct-stacks": "off" },
  },
  {
    // #772 (split from #733): test files must not read JS/TS source
    // files — source-string pins protect spelling, not behavior.
    // Adopted WARN-first; promotion to error waits until #733's
    // conversion tranches burn the warnings down. Reads of dist
    // output, declaration files, and data files stay allowed (the
    // audit's LEGIT class). Active since the TS lint restoration
    // (#902). Rule:
    // eslintRules/noSourceReadsInTests.mjs.
    files: ["src/**/*.test.ts", "src/**/*.test.tsx", "test/**/*.ts", "test/**/*.tsx"],
    plugins: { "design-system": designSystem },
    rules: { "design-system/no-source-reads-in-tests": "warn" },
  },
  {
    // Stories are Storybook scaffolding, not shipped page components:
    // they frame pages in demo viewports and spread fixture objects
    // onto them, which the page rule forbids for pages themselves.
    // The margin rule is off for the same reason: stories lay out
    // demo content, they are not shipped components or pages.
    files: ["src/pages/**/*.stories.tsx", "src/views/**/*.stories.tsx"],
    rules: {
      "design-system/no-page-styling": "off",
      "design-system/no-margin-spacing": "off",
      "design-system/no-direct-stacks": "off",
    },
  },
  {
    files: [
      "src/widgets/**/*.stories.tsx",
      "src/views/**/*.stories.tsx",
      "src/icons/**/*.stories.tsx",
    ],
    rules: {
      "design-system/no-margin-spacing": "off",
      "design-system/no-direct-stacks": "off",
    },
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
