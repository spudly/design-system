import { join } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

// Absolute path (Storybook runs from the repo root): the alias below
// replaces the whole import specifier, so a relative replacement
// would be resolved against the importing file inside
// react-native-svg and miss.
const svgSoundModuleStub = join(process.cwd(), ".storybook", "svgSoundModuleStub.ts");
const assetsRegistryStub = join(process.cwd(), ".storybook", "assetsRegistryStub.ts");

// react-native-svg's three PEG.js parsers are CommonJS-only files
// (a single `module.exports = { parse, SyntaxError }`) inside its ESM
// module tree. The production bundler's CJS interop handles them, but
// Vite dev serves the package's files raw (it is excluded from
// pre-bundling — see optimizeDeps below), so the browser hits
// "does not provide an export named 'parse'". This serve-only plugin
// wraps those exact files with a local CommonJS shim and re-exports
// the parser as ESM. The build is untouched (apply: "serve").
const rnsvgPegParserPattern =
  /react-native-svg\/lib\/module\/(?:lib\/extract\/(?:transform|transformToRn)|filter-image\/extract\/extractFiltersString)\.js(?:\?.*)?$/;
const rnsvgPegCjsPlugin = {
  name: "rnsvg-peg-cjs-exports",
  apply: "serve" as const,
  transform(code: string, id: string) {
    if (!rnsvgPegParserPattern.test(id)) return null;
    return [
      "const module = { exports: {} };",
      code.replace('"use strict";', ""),
      "export const parse = module.exports.parse;",
      "export const SyntaxError = module.exports.SyntaxError;",
      "export default module.exports;",
    ].join("\n");
  },
};

// Tamagui reads a number of process.env.* flags that don't exist in the
// browser. Vite's dependency optimizer only defines process.env.NODE_ENV
// for pre-bundled deps, so without these the pre-bundled tamagui.js throws
// "ReferenceError: process is not defined".
// All of Tamagui's uses are string comparisons or truthiness checks, so
// empty string safely selects the default web behavior.
const tamaguiEnvVars = [
  "DEBUG",
  "IS_STATIC",
  "TAMAGUI_BAIL_AFTER_SCANNING_X_CSS_RULES",
  "TAMAGUI_CSS_LAYER",
  "TAMAGUI_CSS_VARIABLE_PREFIX",
  "TAMAGUI_DID_OUTPUT_CSS",
  "TAMAGUI_DISABLE_NO_THEME_WARNING",
  "TAMAGUI_DISABLE_SLIDER_INTERVAL",
  "TAMAGUI_DOES_SSR_CSS",
  "TAMAGUI_DYNAMIC_COLOR_IOS",
  "TAMAGUI_ENABLE_STYLE_TOKEN_PROVENANCE",
  "TAMAGUI_ENVIRONMENT",
  "TAMAGUI_HEADLESS",
  "TAMAGUI_INSERT_SELECTOR_TRIES",
  "TAMAGUI_LAYOUT_FRAME_SKIP",
  "TAMAGUI_MEMOIZE_STYLED_HOC",
  "TAMAGUI_ONLAYOUT_PRETRANSFORM",
  "TAMAGUI_RNGH_PRESS_DELAY",
  "TAMAGUI_RUNTIME",
  "TAMAGUI_STACK_Z_INDEX_GLOBAL",
  "TAMAGUI_STYLE_INSERTION_WARNING_LIMIT",
  "TAMAGUI_TOKEN_PREFIX",
  "TAMAGUI_USE_WINDOW_DIMENSIONS_MAX_UPDATE_MS",
  "TEST_NATIVE_PLATFORM",
];

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    const tamaguiDefine = Object.fromEntries(
      tamaguiEnvVars.map((name) => [`process.env.${name}`, JSON.stringify("")]),
    );
    // Force Vite to pre-bundle Storybook's own React runtime chunks.
    // Without this, Vite dev serves @storybook/react's prebuilt chunks with
    // bare "react" imports rewritten to the raw CJS /node_modules/react/index.js,
    // which has no ESM default export (React 19) -> blank Storybook with
    // "does not provide an export named 'default'".
    const include = new Set([
      ...(config.optimizeDeps?.include ?? []),
      "@storybook/react",
      "@storybook/react/preview",
      "@storybook/react-dom-shim",
      "react",
      "react-dom",
    ]);
    return {
      ...config,
      plugins: [...(config.plugins ?? []), rnsvgPegCjsPlugin],
      resolve: {
        ...config.resolve,
        // Platform extensions, web first: react-native-svg (the icons
        // module, @spudly/ui/icons) ships parallel .web.js builds of
        // its entry and element files; without this, Vite resolves the
        // native entry, whose fabric components import
        // codegenNativeComponent from "react-native" — which the
        // react-native-web alias below cannot provide, and the
        // Storybook build fails with MISSING_EXPORT errors.
        extensions: [
          ".web.tsx",
          ".web.ts",
          ".web.jsx",
          ".web.js",
          ".mjs",
          ".mts",
          ".tsx",
          ".ts",
          ".jsx",
          ".js",
          ".json",
        ],
        alias: [
          // react-native-svg's sound module is native-only and breaks
          // the web build (TurboModuleRegistry is not exported by
          // react-native-web) — see svgSoundModuleStub.ts. This entry
          // must precede the react-native alias below.
          { find: /^.*NativeSvgSoundModule(\.js)?$/, replacement: svgSoundModuleStub },
          // react-native-svg's web build imports
          // @react-native/assets-registry/registry, which is not in
          // this repo's dependency tree — see assetsRegistryStub.ts.
          { find: /^@react-native\/assets-registry\/registry$/, replacement: assetsRegistryStub },
          // Page components (#49) render React Native's FlatList;
          // the web Storybook resolves it to react-native-web, the
          // same substitution the apps' web builds make. Exact-name
          // alias only: subpath imports (react-native/...) are not
          // used in src and must not be rewritten.
          { find: /^react-native$/, replacement: "react-native-web" },
        ],
      },
      define: {
        ...config.define,
        ...tamaguiDefine,
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [...include],
        // react-native-svg must NOT be pre-bundled by the dev
        // optimizer: pre-bundling resolves its native entry, whose
        // fabric components import codegenNativeComponent from
        // "react-native" — which the react-native-web alias cannot
        // provide, and Storybook dev fails with MISSING_EXPORT
        // errors. Excluded, Vite serves it through the normal
        // pipeline, where the web-first extensions and aliases above
        // (the ones the production build uses) apply.
        exclude: [...(config.optimizeDeps?.exclude ?? []), "react-native-svg"],
        // Vite 8's dep optimizer runs on Rolldown: the deprecated
        // esbuildOptions.define maps to rolldownOptions.transform.define
        // (per the Vite 8 migration guide's automatic conversion table).
        rolldownOptions: {
          ...config.optimizeDeps?.rolldownOptions,
          transform: {
            ...config.optimizeDeps?.rolldownOptions?.transform,
            define: {
              ...config.optimizeDeps?.rolldownOptions?.transform?.define,
              ...tamaguiDefine,
            },
          },
        },
      },
    };
  },
};

export default config;
