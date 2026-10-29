/**
 * Contract test for CompactCard (spudly/design-system#119, the
 * meals & planning tranche): the small surface card extracted
 * from TagsPage's rows — 12px padding, the medium radius, the
 * small shadow — for dense list rows and inline editors, where
 * Card's section treatment is too grand.
 *
 * The pins hold the treatment (the app view's row-card values,
 * unchanged) and that the card owns its surface only — no
 * internal gap or alignment: what goes inside is the caller's
 * composition.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "CompactCard.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("CompactCard is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.CompactCard, "function", "CompactCard must be exported from @spudly/ui");
});

test("the compact treatment: surface, medium radius, 12px padding, small shadow", () => {
  assert.match(code, /styled\(YStack, \{\s+name: "CompactCard",/);
  assert.match(code, /backgroundColor: "\$surface",/);
  assert.match(code, /borderRadius: tokens\.radii\.md,/);
  assert.match(code, /padding: tokens\.spacing\[3\],/);
  assert.match(code, /shadowColor: tokens\.shadows\.sm\.shadowColor,/);
  assert.match(code, /shadowRadius: tokens\.shadows\.sm\.shadowRadius,/);
});

test("the card owns its surface only — no internal rhythm", () => {
  assert.ok(!/gap:/.test(code), "CompactCard must not set a gap — content owns its rhythm");
  assert.ok(!/margin/.test(code), "CompactCard must not carry margins (#119)");
});
