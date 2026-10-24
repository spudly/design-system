import { base, react, typescriptPendingIgnores } from "@spudly/eslint-config";

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
    // This repo names files in kebab-case alongside PascalCase
    // (components) and camelCase. The shared config's filename-case
    // only allows camel/Pascal, which fights the repo-wide convention,
    // so kebab-case is allowed here too. The ignore list mirrors the
    // shared config's own.
    files: ["**/*.{ts,tsx,js,jsx,cjs,mjs}"],
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          cases: { camelCase: true, pascalCase: true, kebabCase: true },
          ignore: [/^react-native\.config\.(?:js|cjs)$/u, /^(?:__tests__|__mocks__|mcp-server)$/u],
        },
      ],
    },
  },
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
