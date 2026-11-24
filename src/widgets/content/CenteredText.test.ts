/**
 * Contract test for CenteredText (spudly/design-system#119, the
 * meals & planning tranche): a Text with centering baked in,
 * extracted from HomePage's subtitle and empty message — pages
 * render centered lines without setting textAlign (a styling
 * prop) themselves.
 *
 * Converted from source scans to runtime checks in #733
 * tranche 7a: the component is called directly and the element
 * it returns is inspected — textAlign center always, the muted
 * ink only through the semantic `muted` flag, and the rest of
 * Text's contract passing through ARE the rendered contract.
 * The former type-shape scan was deleted: the prop shape is
 * enforced by the TypeScript build, not a test (Stephen,
 * 2026-11-20). The dist `.d.ts` read below is a built-artifact
 * read, not a source read, and stays.
 */
import "../../../test/registerSvgStub.js";
import { loadInternalDist } from "../../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

test("CenteredText is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  assert.equal(
    typeof dist.CenteredText,
    "function",
    "CenteredText must be exported from the internal components barrel",
  );
});

test("CenteredTextProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "../..", "dist", "widgets", "index.d.ts"), "utf8");
  assert.match(types, /CenteredTextProps/);
});

test("centering is baked in and caller props pass through to Text", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  const element = dist.CenteredText({ children: "A subtitle", variant: "hint" });
  assert.equal(element.type, dist.Text);
  assert.equal(element.props.textAlign, "center");
  assert.equal(element.props.variant, "hint", "Text variants pass through");
  assert.equal(element.props.children, "A subtitle");
  assert.equal(element.props.color, undefined, "no muted ink without the muted flag");
});

test("the muted flag alone switches the ink to the muted token", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  const element = dist.CenteredText({ children: "Empty", muted: true });
  assert.equal(element.props.textAlign, "center");
  assert.equal(element.props.color, "$textMuted");
});
