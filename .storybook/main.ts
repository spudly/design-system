import type { StorybookConfig } from "@storybook/react-vite";

// Tamagui reads a number of process.env.* flags that don't exist in the
// browser. esbuild only defines process.env.NODE_ENV, so without these the
// pre-bundled tamagui.js throws "ReferenceError: process is not defined".
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
      define: {
        ...config.define,
        ...tamaguiDefine,
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [...include],
        esbuildOptions: {
          ...config.optimizeDeps?.esbuildOptions,
          define: {
            ...config.optimizeDeps?.esbuildOptions?.define,
            ...tamaguiDefine,
          },
        },
      },
    };
  },
};

export default config;
