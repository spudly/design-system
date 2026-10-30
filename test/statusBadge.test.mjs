/**
 * Contract test for StatusBadge (spudly/design-system#119, the
 * dedupe PR): the status badge both recipe tranches coined
 * independently, shipped once.
 *
 * The pins hold Stephen's dedupe ruling: the caller passes the
 * tone AND the label — there is no DS-owned status vocabulary
 * (no status-string → tone/label map in the design system) —
 * and the rendering is Badge's.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "StatusBadge.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("StatusBadge is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.StatusBadge, "function", "StatusBadge must be exported from @spudly/ui");
});

test("the caller passes tone and label; no status vocabulary lives here", () => {
  assert.match(code, /<Badge tone=\{tone\}>\{label\}<\/Badge>/);
  assert.match(code, /tone: StatusBadgeTone;/);
  assert.match(code, /label: string;/);
  assert.ok(!/Record</.test(code), "no status map may be baked into the component");
});
