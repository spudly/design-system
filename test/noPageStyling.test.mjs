/**
 * Tests for the design-system/no-page-styling ESLint rule (#119,
 * simplified shape per #297): page components must not apply
 * styling directly — no direct Tamagui imports, no className, no
 * inline style prop.
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

test("direct Tamagui imports are banned in pages", () => {
  assert.deepEqual(messageIds(`import { YStack } from "tamagui";`), ["tamaguiImport"]);
  assert.deepEqual(messageIds(`import { View } from "@tamagui/core";`), ["tamaguiImport"]);
  assert.deepEqual(messageIds(`import "tamagui";`), ["tamaguiImport"]);
});

test("non-Tamagui imports are untouched", () => {
  assert.deepEqual(messageIds(`import { Alert } from "../../components";`), []);
  assert.deepEqual(messageIds(`import React from "react";`), []);
});

test("className and the inline style prop are banned in pages", () => {
  assert.deepEqual(messageIds(`<div className="x" />`), ["className"]);
  assert.deepEqual(messageIds(`<Text style={{ color: "red" }} />`), ["styleProp"]);
});

test("Tamagui styling props are no longer enumerated (#297 simplification)", () => {
  assert.deepEqual(messageIds(`<Text color="$primary" />`), []);
  assert.deepEqual(messageIds(`<Text fontSize={16} />`), []);
  assert.deepEqual(messageIds(`<Card hoverStyle={{ opacity: 0.8 }} />`), []);
  assert.deepEqual(messageIds(`<Card $gtSm={{ padding: 8 }} />`), []);
});

test("layout primitives, spreads and styled() are not policed on their own", () => {
  assert.deepEqual(messageIds(`<YStack gap="$2" />`), []);
  assert.deepEqual(messageIds(`<Button {...chipProps} />`), []);
  assert.deepEqual(messageIds(`const Box = styled(View, {});`), []);
});

test("semantic props, data and callbacks are untouched", () => {
  assert.deepEqual(messageIds(`<Alert intent="error" />`), []);
  assert.deepEqual(messageIds(`<Button variant="secondary" onPress={handler} disabled />`), []);
  assert.deepEqual(messageIds(`<RecipesPage items={items} onRecipePress={handler} />`), []);
});

test("the rule only applies where the config scopes it (src/pages/**)", () => {
  const messages = lintPage(`<div className="x" />`, "src/components/Example.tsx");
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
  const messages = linter.verify(`<div className="x" />`, config, {
    filename: "src/pages/ExamplePage.tsx",
  });
  const ruleReports = messages.filter(
    (message) => message.ruleId === "design-system/no-page-styling",
  );
  assert.deepEqual(ruleReports, []);
});
