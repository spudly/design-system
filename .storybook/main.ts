import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
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
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [...include],
      },
    };
  },
};

export default config;
