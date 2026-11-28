/**
 * Tests for the design-system/no-direct-stacks ESLint rule
 * (#746): layout composes through Row/Col/Spacer, never through
 * Tamagui's raw XStack/YStack.
 *
 * Two layers, mirroring eslintRules/noMarginSpacing.test.ts:
 *
 * - Rule behaviour, driven through ESLint's Linter with espree on
 *   plain-JSX snippets: espree cannot parse TypeScript syntax, but
 *   the rule operates purely on JSX elements and styled() calls,
 *   so JSX/JS snippets exercise it fully. The config below mirrors
 *   the blocks eslint.config.ts wires.
 * - Dormancy, driven through the repo's REAL eslint.config.ts
 *   (loaded with jiti): typescriptPendingIgnores currently ignores
 *   every .ts/.tsx file (typescript-eslint has no TypeScript 7
 *   parser), so the rule must produce zero reports today — and the
 *   wiring that activates it at the TS lint restoration must be
 *   in place, including the recorded allowlist.
 */
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { Linter } from "eslint";
import { createJiti } from "jiti";

import plugin, { stackNames } from "./noDirectStacks.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const linter = new Linter();

const stacksConfig: Linter.Config[] = [
  {
    files: [
      "src/widgets/**/*.tsx",
      "src/views/**/*.tsx",
      "src/pages/**/*.tsx",
      "src/icons/**/*.tsx",
    ],
    plugins: { "design-system": plugin },
    languageOptions: {
      parserOptions: { ecmaVersion: 2022, ecmaFeatures: { jsx: true } },
    },
    rules: { "design-system/no-direct-stacks": "error" },
  },
];

function messageIds(code: string, filename = "src/widgets/Example.tsx") {
  return linter.verify(code, stacksConfig, { filename }).map((message) => message.messageId);
}

test("the stack set is exactly XStack and YStack", () => {
  assert.deepEqual([...stackNames].sort(), ["XStack", "YStack"]);
});

test("direct stack elements are banned", () => {
  assert.deepEqual(messageIds(`<XStack gap="$2" />`), ["stackElement"]);
  assert.deepEqual(messageIds(`<YStack padding="$3" />`), ["stackElement"]);
  assert.deepEqual(messageIds(`<Tamagui.XStack />`), ["stackElement"]);
  assert.deepEqual(messageIds(`<YStack><XStack /></YStack>`), ["stackElement", "stackElement"]);
});

test("styled() derivations from a stack are banned", () => {
  assert.deepEqual(messageIds(`const A = styled(XStack, { gap: 8 });`), ["stackStyled"]);
  assert.deepEqual(messageIds(`const B = styled(YStack, { name: "B" });`), ["stackStyled"]);
});

test("the Row/Col/Spacer primitives and other components are untouched", () => {
  assert.deepEqual(messageIds(`<Row gap="s" middle />`), []);
  assert.deepEqual(messageIds(`<Col p="m" />`), []);
  assert.deepEqual(messageIds(`<Spacer y="m" />`), []);
  assert.deepEqual(messageIds(`<View style={{ flex: 1 }} />`), []);
  assert.deepEqual(messageIds(`<Card variant="elevated" />`), []);
});

test("styled() derivations from non-stack primitives stay legal", () => {
  assert.deepEqual(messageIds(`const A = styled(Anchor, { color: "$link" });`), []);
  assert.deepEqual(messageIds(`const B = styled(View, { flex: 1 });`), []);
  assert.deepEqual(messageIds(`const C = styled(Input, { borderWidth: 1 });`), []);
});

test("imports alone are out of sight by design (Card's GetProps derivation)", () => {
  // The rule inspects JSX and styled() calls, not imports or type
  // positions: Card imports YStack only to derive its props type
  // (GetProps<typeof YStack>), which renders no stack. (Espree
  // cannot parse the TS type syntax itself, so the snippet pins
  // the import-level sight limit the type derivation rides on.)
  assert.deepEqual(messageIds(`import { YStack } from "tamagui"; const el = <Row />;`), []);
});

test("the rule only applies where the config scopes it", () => {
  for (const filename of ["src/tokens/example.tsx", "tools/example.tsx"]) {
    const messages = linter.verify(`<YStack />`, stacksConfig, { filename });
    const ruleReports = messages.filter(
      (message) => message.ruleId === "design-system/no-direct-stacks",
    );
    assert.deepEqual(ruleReports, []);
  }
});

test("eslint.config.ts wires the rule at error, with the recorded allowlist off", async () => {
  const jiti = createJiti(import.meta.url);
  const config = await jiti.import<Linter.Config[]>(join(repoRoot, "eslint.config.ts"));
  const componentsBlock = config.find(
    (block: any) =>
      block.files?.includes("src/widgets/**/*.tsx") &&
      block.rules?.["design-system/no-direct-stacks"] !== undefined,
  );
  assert.ok(componentsBlock, "a config block must target src/widgets/**/*.tsx");
  assert.equal(componentsBlock.rules!["design-system/no-direct-stacks"], "error");
  assert.ok(
    componentsBlock.plugins?.["design-system"],
    "the design-system plugin must be registered",
  );
  // The allowlist: Row/Col themselves (the primitives render the
  // raw stacks after resolving the subset), SearchField's
  // retained StyledContainer (Option B — the focus-within ring
  // needs styled()-only pseudo-styles) are off. MasonryGrid left
  // the allowlist in #844 (its gap became a t-shirt size).
  for (const allowlisted of [
    "src/widgets/layout/Row.tsx",
    "src/widgets/layout/Col.tsx",
    "src/widgets/form/SearchField.tsx",
  ]) {
    const allowBlock = config.find(
      (block: any) => block.files?.includes(allowlisted) && block.rules,
    );
    assert.ok(allowBlock, `a config block must allowlist ${allowlisted}`);
    assert.equal(allowBlock.rules!["design-system/no-direct-stacks"], "off");
  }
});

test("dormant today: the real config reports nothing for violating components", async () => {
  const jiti = createJiti(import.meta.url);
  const config = await jiti.import<Linter.Config[]>(join(repoRoot, "eslint.config.ts"));
  for (const filename of ["src/widgets/Example.tsx", "src/views/Example.tsx"]) {
    const messages = linter.verify(`<YStack gap="$3" />`, config, { filename });
    const ruleReports = messages.filter(
      (message) => message.ruleId === "design-system/no-direct-stacks",
    );
    assert.deepEqual(ruleReports, []);
  }
});
