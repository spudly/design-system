/**
 * Tests for the design-system/no-page-styling ESLint rule (#119):
 * page components must not apply styling directly.
 *
 * Two layers:
 *
 * - Rule behaviour, driven through ESLint's Linter with espree (the
 *   default parser) on plain-JSX snippets: espree cannot parse
 *   TypeScript syntax, but the rule operates purely on JSX nodes, so
 *   JSX snippets exercise it fully. The config below mirrors the
 *   src/pages/** block in eslint.config.ts.
 * - Dormancy, driven through the repo's REAL eslint.config.ts (loaded
 *   with jiti): typescriptPendingIgnores currently ignores every
 *   .ts/.tsx file (typescript-eslint has no TypeScript 7 parser), so
 *   the rule must produce zero reports today — and the wiring that
 *   activates it at the TS lint restoration must be in place.
 */
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { Linter } from "eslint";
import { createJiti } from "jiti";

import plugin from "../eslintRules/noPageStyling.mjs";
import { styleProps } from "../eslintRules/styleProps.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const linter = new Linter();

const pagesConfig = [
  {
    files: ["src/pages/**/*.tsx"],
    plugins: { "design-system": plugin },
    languageOptions: {
      parserOptions: { ecmaVersion: 2022, ecmaFeatures: { jsx: true } },
    },
    rules: { "design-system/no-page-styling": "error" },
  },
];

function lintPage(code, filename = "src/pages/ExamplePage.tsx") {
  return linter.verify(code, pagesConfig, { filename });
}

function messageIds(code, filename) {
  return lintPage(code, filename).map((message) => message.messageId);
}

test("the style-prop list covers the Tamagui surface but not semantic/data props", () => {
  for (const name of ["color", "fontSize", "backgroundColor", "padding", "gap", "flex"]) {
    assert.ok(styleProps.has(name), `${name} must count as a styling prop`);
  }
  for (const name of ["intent", "variant", "tone", "onPress", "items", "accessibilityLabel"]) {
    assert.ok(!styleProps.has(name), `${name} must NOT count as a styling prop`);
  }
});

test("className and the inline style prop are banned in pages", () => {
  assert.deepEqual(messageIds(`<div className="x" />`), ["className"]);
  assert.deepEqual(messageIds(`<Text style={{ color: "red" }} />`), ["styleProp"]);
});

test("Tamagui styling props are banned on any element — no designed-prop exception", () => {
  assert.deepEqual(messageIds(`<Text color="$primary" />`), ["stylingProp"]);
  assert.deepEqual(messageIds(`<Text fontSize={16} />`), ["stylingProp"]);
  assert.deepEqual(messageIds(`<Button backgroundColor="red" />`), ["stylingProp"]);
  assert.deepEqual(messageIds(`<Card hoverStyle={{ opacity: 0.8 }} />`), ["stylingProp"]);
  assert.deepEqual(messageIds(`<Card $gtSm={{ padding: 8 }} />`), ["stylingProp"]);
});

test("layout primitives are banned in pages, with or without props", () => {
  assert.deepEqual(messageIds(`<YStack />`), ["layoutPrimitive"]);
  assert.deepEqual(messageIds(`<View width={430} />`), ["layoutPrimitive", "stylingProp"]);
  assert.deepEqual(messageIds(`<XStack gap="$2" />`), ["layoutPrimitive", "stylingProp"]);
});

test("semantic props, data and callbacks are untouched", () => {
  assert.deepEqual(messageIds(`<Alert intent="error" />`), []);
  assert.deepEqual(messageIds(`<Button variant="secondary" onPress={handler} disabled />`), []);
  assert.deepEqual(messageIds(`<RecipesPage items={items} onRecipePress={handler} />`), []);
});

test("styling pass-through via spread is banned; semantic conditional spreads are not", () => {
  assert.deepEqual(messageIds(`<Button {...chipProps} />`), ["spreadOpaque"]);
  assert.deepEqual(messageIds(`<Text {...(active ? { color: "red" } : {})} />`), ["spreadStyling"]);
  assert.deepEqual(messageIds(`<ScreenContainer {...(variant ? { variant } : {})} />`), []);
});

test("styled() definitions are banned in pages", () => {
  assert.deepEqual(messageIds(`const Box = styled(View, {});`), ["styledCall"]);
});

test("the rule only applies where the config scopes it (src/pages/**)", () => {
  const messages = lintPage(`<Text color="red" />`, "src/components/Example.tsx");
  const ruleReports = messages.filter(
    (message) => message.ruleId === "design-system/no-page-styling",
  );
  assert.deepEqual(ruleReports, []);
});

test("eslint.config.ts wires the rule at error for pages, off for stories", async () => {
  const jiti = createJiti(import.meta.url);
  const config = await jiti.import(join(repoRoot, "eslint.config.ts"));
  const pagesBlock = config.find(
    (block) => block.files?.includes("src/pages/**/*.tsx") && block.rules,
  );
  assert.ok(pagesBlock, "a config block must target src/pages/**/*.tsx");
  assert.equal(pagesBlock.rules["design-system/no-page-styling"], "error");
  assert.ok(pagesBlock.plugins?.["design-system"], "the design-system plugin must be registered");
  const storiesBlock = config.find(
    (block) => block.files?.includes("src/pages/**/*.stories.tsx") && block.rules,
  );
  assert.ok(storiesBlock, "a config block must target src/pages/**/*.stories.tsx");
  assert.equal(storiesBlock.rules["design-system/no-page-styling"], "off");
});

test("dormant today: the real config reports nothing for a violating page", async () => {
  const jiti = createJiti(import.meta.url);
  const config = await jiti.import(join(repoRoot, "eslint.config.ts"));
  const messages = linter.verify(`<Text color="red" />`, config, {
    filename: "src/pages/ExamplePage.tsx",
  });
  const ruleReports = messages.filter(
    (message) => message.ruleId === "design-system/no-page-styling",
  );
  assert.deepEqual(ruleReports, []);
});
