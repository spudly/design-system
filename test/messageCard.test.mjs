/**
 * Contract test for MessageCard (spudly/design-system#119), the
 * full-screen message state: a centered card carrying a heading
 * and one explanatory line on a surface-filled shell.
 *
 * PublicRecipePage rendered this card inline for both of its
 * error states — styling a page may not apply itself under #119
 * — so the state is a component here and the page passes only
 * its DS-owned title/message copy.
 *
 * Source scan plus a dist export check, like the other component
 * contract tests. The dist import needs the harness's
 * react-native-svg stub registered first, so this file imports
 * registerSvgStub.mjs before anything else.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "src", "components");
const cardSource = readFileSync(join(componentsDir, "MessageCard.tsx"), "utf8");

const cardCode = cardSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("MessageCard is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.MessageCard, "function", "MessageCard must be exported from @spudly/ui");
});

test("MessageCardProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /MessageCardProps/);
});

test("MessageCard's contract is title + message on a centered surface shell", () => {
  assert.match(cardCode, /title: string;/);
  assert.match(cardCode, /message: string;/);
  assert.match(cardCode, /backgroundColor="\$surface"/);
  assert.match(cardCode, /alignItems="center"/);
  assert.match(cardCode, /justifyContent="center"/);
  assert.match(cardCode, /<Text variant="heading" textAlign="center">/);
  assert.ok(!cardCode.includes("lineHeight"), "the card must not set lineHeight");
});
