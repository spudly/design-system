/**
 * Tests for the design-system/no-margin-spacing ESLint rule
 * (#209): inter-item spacing belongs to the parent (gap/padding),
 * not to margins on individual elements.
 *
 * Two layers, mirroring test/noPageStyling.test.mjs:
 *
 * - Rule behaviour, driven through ESLint's Linter with espree on
 *   plain-JSX snippets: espree cannot parse TypeScript syntax, but
 *   the rule operates purely on JSX nodes, so JSX snippets exercise
 *   it fully. The config below mirrors the src/components/** and
 *   src/pages/** blocks in eslint.config.ts.
 * - Dormancy, driven through the repo's REAL eslint.config.ts
 *   (loaded with jiti): typescriptPendingIgnores currently ignores
 *   every .ts/.tsx file (typescript-eslint has no TypeScript 7
 *   parser), so the rule must produce zero reports today — and the
 *   wiring that activates it at the TS lint restoration must be
 *   in place for both components and pages.
 */
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { Linter } from "eslint";
import { createJiti } from "jiti";

import plugin, { marginProps } from "../eslintRules/noMarginSpacing.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const linter = new Linter();

const spacingConfig = [
  {
    files: ["src/components/**/*.tsx", "src/pages/**/*.tsx"],
    plugins: { "design-system": plugin },
    languageOptions: {
      parserOptions: { ecmaVersion: 2022, ecmaFeatures: { jsx: true } },
    },
    rules: { "design-system/no-margin-spacing": "error" },
  },
];

function messageIds(code, filename = "src/components/Example.tsx") {
  return linter.verify(code, spacingConfig, { filename }).map((message) => message.messageId);
}

test("the margin-prop set covers the full margin family but not padding/gap/offsets", () => {
  for (const name of [
    "margin",
    "marginTop",
    "marginBottom",
    "marginLeft",
    "marginRight",
    "marginHorizontal",
    "marginVertical",
    "marginStart",
    "marginEnd",
    "marginInline",
    "marginInlineStart",
    "marginInlineEnd",
    "marginBlock",
    "marginBlockStart",
    "marginBlockEnd",
  ]) {
    assert.ok(marginProps.has(name), `${name} must count as a margin prop`);
  }
  for (const name of [
    "padding",
    "paddingTop",
    "paddingBlockEnd",
    "gap",
    "top",
    "right",
    "scrollMargin",
    "scrollMarginTop",
  ]) {
    assert.ok(!marginProps.has(name), `${name} must NOT count as a margin prop`);
  }
});

test("margin props are banned on any element, token values included", () => {
  assert.deepEqual(messageIds(`<YStack marginBottom="$4" />`), ["marginProp"]);
  assert.deepEqual(messageIds(`<Text marginTop={8} />`), ["marginProp"]);
  assert.deepEqual(messageIds(`<Card marginBlockEnd="$3" />`), ["marginProp"]);
  assert.deepEqual(messageIds(`<XStack marginInlineStart="$3" />`), ["marginProp"]);
  assert.deepEqual(messageIds(`<YStack marginStart="$8" />`), ["marginProp"]);
  assert.deepEqual(messageIds(`<YStack marginVertical="$4" />`), ["marginProp"]);
});

test("margin keys inside style objects are banned", () => {
  assert.deepEqual(messageIds(`<Image style={{ marginBottom: 16, height: 192 }} />`), [
    "marginKey",
  ]);
  assert.deepEqual(messageIds(`<View style={cond ? { marginTop: 8 } : {}} />`), ["marginKey"]);
  assert.deepEqual(messageIds(`<View style={{ margin: 4, marginTop: 2 }} />`), [
    "marginKey",
    "marginKey",
  ]);
});

test("margin keys inside media, variant and pseudo style objects are banned", () => {
  assert.deepEqual(messageIds(`<View $gtSm={{ marginTop: 8 }} />`), ["marginKey"]);
  assert.deepEqual(messageIds(`<Card hoverStyle={{ margin: 4 }} />`), ["marginKey"]);
  assert.deepEqual(messageIds(`<View pressStyle={{ opacity: 0.8 }} />`), []);
});

test("margin keys in spread objects are banned; unseen objects are out of sight", () => {
  assert.deepEqual(messageIds(`<View {...{ marginTop: 8 }} />`), ["marginKey"]);
  assert.deepEqual(messageIds(`<View {...(cond ? { marginBlockEnd: 4 } : {})} />`), ["marginKey"]);
  assert.deepEqual(messageIds(`<View {...spacingProps} />`), []);
  assert.deepEqual(messageIds(`<View style={sharedStyle} />`), []);
});

test("gap, padding and positioning offsets are untouched", () => {
  assert.deepEqual(messageIds(`<YStack gap="$3" padding="$4" />`), []);
  assert.deepEqual(messageIds(`<YStack paddingBlockEnd="$3" />`), []);
  assert.deepEqual(messageIds(`<View position="absolute" top={8} right={8} />`), []);
  assert.deepEqual(messageIds(`<Text variant="heading" color="$primary" />`), []);
});

test("the rule only applies where the config scopes it (components and pages)", () => {
  for (const filename of ["src/tokens/example.tsx", "src/icons/example.tsx"]) {
    const messages = linter.verify(`<YStack marginTop="$4" />`, spacingConfig, { filename });
    const ruleReports = messages.filter(
      (message) => message.ruleId === "design-system/no-margin-spacing",
    );
    assert.deepEqual(ruleReports, []);
  }
});

test("eslint.config.ts wires the rule at error for components and pages, off for stories", async () => {
  const jiti = createJiti(import.meta.url);
  const config = await jiti.import(join(repoRoot, "eslint.config.ts"));
  const componentsBlock = config.find(
    (block) => block.files?.includes("src/components/**/*.tsx") && block.rules,
  );
  assert.ok(componentsBlock, "a config block must target src/components/**/*.tsx");
  assert.equal(componentsBlock.rules["design-system/no-margin-spacing"], "error");
  assert.ok(
    componentsBlock.plugins?.["design-system"],
    "the design-system plugin must be registered",
  );
  const pagesBlock = config.find(
    (block) => block.files?.includes("src/pages/**/*.tsx") && block.rules,
  );
  assert.ok(pagesBlock, "a config block must target src/pages/**/*.tsx");
  assert.equal(pagesBlock.rules["design-system/no-margin-spacing"], "error");
  for (const storiesGlob of ["src/pages/**/*.stories.tsx", "src/components/**/*.stories.tsx"]) {
    const storiesBlock = config.find((block) => block.files?.includes(storiesGlob) && block.rules);
    assert.ok(storiesBlock, `a config block must target ${storiesGlob}`);
    assert.equal(storiesBlock.rules["design-system/no-margin-spacing"], "off");
  }
});

test("dormant today: the real config reports nothing for violating components or pages", async () => {
  const jiti = createJiti(import.meta.url);
  const config = await jiti.import(join(repoRoot, "eslint.config.ts"));
  for (const filename of ["src/components/Example.tsx", "src/pages/ExamplePage.tsx"]) {
    const messages = linter.verify(`<YStack marginTop="$4" />`, config, { filename });
    const ruleReports = messages.filter(
      (message) => message.ruleId === "design-system/no-margin-spacing",
    );
    assert.deepEqual(ruleReports, []);
  }
});
