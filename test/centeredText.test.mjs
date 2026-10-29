/**
 * Contract test for CenteredText (spudly/design-system#119, the
 * meals & planning tranche): a Text with centering baked in,
 * extracted from HomePage's subtitle and empty message — pages
 * render centered lines without setting textAlign (a styling
 * prop) themselves.
 *
 * The pins hold the treatment: textAlign center always, the
 * muted ink only through the semantic `muted` flag, and the
 * rest of Text's contract (variants included) passing through.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "CenteredText.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("CenteredText is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.CenteredText,
    "function",
    "CenteredText must be exported from @spudly/ui",
  );
});

test("centering is baked in; muted is a semantic flag, not a color prop", () => {
  assert.match(code, /<Text textAlign="center"/);
  assert.match(code, /muted \? \{ color: "\$textMuted" \} : \{\}/);
  assert.match(code, /export type CenteredTextProps = TextProps & \{/);
});
