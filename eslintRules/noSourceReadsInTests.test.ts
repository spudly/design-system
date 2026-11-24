/**
 * Tests for the design-system/no-source-reads-in-tests ESLint rule
 * (#772, split from #733): test files must not read JS/TS source
 * files — source-string pins protect spelling, not behavior.
 *
 * Rule behaviour is driven through ESLint's Linter with espree on
 * plain-JS snippets: espree cannot parse TypeScript syntax, but the
 * rule operates purely on call expressions and string literals, so
 * JS snippets exercise it fully. The config below mirrors the test
 * files block in eslint.config.ts (warn-first adoption).
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import { Linter } from "eslint";

import plugin from "./noSourceReadsInTests.mjs";

const linter = new Linter();

const testConfig: Linter.Config[] = [
  {
    files: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    plugins: { "design-system": plugin },
    languageOptions: { parserOptions: { ecmaVersion: 2022, sourceType: "module" } },
    rules: { "design-system/no-source-reads-in-tests": "warn" as const },
  },
];

function messageIds(code: string): (string | undefined)[] {
  return linter
    .verify(code, testConfig, { filename: "src/widgets/Example.test.ts" })
    .map((message) => message.messageId);
}

test("direct source reads are flagged", () => {
  assert.deepEqual(messageIds(`readFileSync("src/widgets/data/Badge.tsx", "utf8");`), ["sourceRead"]);
  assert.deepEqual(messageIds(`readFileSync(join(root, "src", "pages", "index.ts"), "utf8");`), [
    "sourceRead",
  ]);
  assert.deepEqual(messageIds("readFileSync(join(here, `${name}.tsx`), \"utf8\");"), ["sourceRead"]);
  assert.deepEqual(messageIds(`fs.readFileSync("src/views/index.ts", "utf8");`), ["sourceRead"]);
  assert.deepEqual(messageIds(`existsSync("src/widgets/Retired.tsx");`), ["sourceRead"]);
});

test("variable-held source paths are flagged", () => {
  const code = [
    `const path = join(root, "src/widgets/data/Badge.tsx");`,
    `const src = readFileSync(path, "utf8");`,
  ].join("\n");
  assert.deepEqual(messageIds(code), ["sourceRead"]);
});

test("enumerate-then-read over a source directory is flagged", () => {
  const code = [
    `const files = readdirSync(join(root, "src", "widgets"));`,
    `for (const file of files) { readFileSync(join(dir, file), "utf8"); }`,
  ].join("\n");
  assert.deepEqual(messageIds(code), ["dynamicSourceRead", "dynamicSourceRead"]);
});

test("source-read helper call sites are flagged where the path is known", () => {
  const code = [
    `function readCode(rel) { return readFileSync(join(root, rel), "utf8"); }`,
    `const pages = [["Badge", "src/widgets/data/Badge.tsx"]];`,
    `for (const [name, rel] of pages) { const code = readCode(rel); }`,
    `const pkg = readCode("package.json");`,
  ].join("\n");
  assert.deepEqual(messageIds(code), ["dynamicSourceRead"]);
});

test("legitimate reads are not flagged: dist output, declarations, data files", () => {
  assert.deepEqual(
    messageIds(`readFileSync(join(here, "../..", "dist", "widgets", "index.d.ts"), "utf8");`),
    [],
  );
  assert.deepEqual(messageIds(`readFileSync(join(root, "src/widgets/index.d.ts"), "utf8");`), []);
  assert.deepEqual(messageIds(`readFileSync("package.json", "utf8");`), []);
  assert.deepEqual(messageIds(`readFileSync(join(here, "baseline.json"), "utf8");`), []);
  assert.deepEqual(messageIds(`readFileSync(join(here, ".storybook", "preview-head.html"), "utf8");`), []);
  assert.deepEqual(messageIds(`readFileSync(join(root, "docs", "manual-tests.md"), "utf8");`), []);
});

test("non-read calls and reads of runtime values are untouched", () => {
  assert.deepEqual(messageIds(`writeFileSync("src/widgets/data/Badge.tsx", "x");`), []);
  assert.deepEqual(messageIds(`readFileSync(0, "utf8");`), []);
  assert.deepEqual(messageIds(`const text = readFileSync(file, "utf8");`), []);
});
