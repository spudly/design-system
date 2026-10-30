/**
 * Contract test for MessageCard (spudly/design-system#119,
 * extracted for PublicRecipePage's adoption round): the
 * whole-screen message state — a surface-filled shell filling
 * its parent's height, centering a card that carries a heading
 * and one muted explanatory line, both centered.
 *
 * PublicRecipePage's not-found and unavailable states
 * hand-rolled this shell in the page (two styled YStacks plus
 * styling props on Text) — styling a page may not apply itself
 * under #119 — so the state is a component here and the page
 * adopts it. LoadingGate is the sibling full-screen state (the
 * same shell with a spinner); ScreenShell + Center + Card do
 * not compose to this treatment, because the centering layer
 * must also fill the shell's height or the card sits at the
 * top of the screen.
 *
 * The pins hold the state's identity: the contract is the two
 * caller strings, the shell is the LoadingGate shell plus the
 * 16px page padding, and the card carries the heading-variant
 * title over the gray6 message on the 8px separation.
 *
 * Source scan plus a dist export check, like the other
 * component contract tests. The dist import needs the
 * harness's react-native-svg stub registered first, so this
 * file imports registerSvgStub.mjs before anything else.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "MessageCard.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("MessageCard is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.MessageCard, "function", "MessageCard must be exported from @spudly/ui");
});

test("MessageCardProps is a type-only export from the built components barrel", () => {
  const barrel = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(barrel, /export \{[^}]*type MessageCardProps[^}]*\}/);
});

test("MessageCard's contract is its two strings, and its shell fills and centers", () => {
  assert.match(code, /export type MessageCardProps = \{\s+title: string;\s+message: string;\s+\};/);
  assert.match(
    code,
    /<YStack\s+flex=\{1\}\s+backgroundColor="\$surface"\s+alignItems="center"\s+justifyContent="center"\s+padding="\$4"\s*>/,
  );
  assert.ok(!/interface\s/.test(code), "type aliases only");
});

test("the card carries the centered heading over the centered muted line", () => {
  assert.match(code, /<Card>/);
  assert.match(code, /<YStack alignItems="center" gap="\$2">/);
  assert.match(code, /<Text variant="heading" textAlign="center">/);
  assert.match(code, /<Text color=\{tokens\.colors\.gray\.gray6\} textAlign="center">/);
});
