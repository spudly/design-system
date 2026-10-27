/**
 * Contract test for merging TagPill into Badge
 * (spudly/design-system#183).
 *
 * The contracts pinned here:
 * 1. Badge is exported from the package root (dist) and TagPill is no
 *    longer exported under its own name.
 * 2. Badge's `color` form carries TagPill's rendering contract: the
 *    surface is the resolved token color at `22` hex alpha, the label
 *    renders in the resolved color itself at the same xs/semibold
 *    type step as the status form, and `tone` is ignored while
 *    `color` is set. The `color`
 *    prop is the strict `TagColorName` token union (#207) — never a
 *    raw string — and resolution goes through the shared
 *    `useTagColorResolver` hook, exactly as TagPill did.
 * 3. No source file in src/ still imports TagPill.
 *
 * Run against the built output: `npm run build` first (the `test`
 * script does both).
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = await import("../dist/index.js");

test("Badge is exported and TagPill is gone (#183)", () => {
  assert.equal(typeof dist.Badge, "function", "Badge must be exported");
  assert.equal(dist.TagPill, undefined, "TagPill must not be exported");
});

test("Badge's color form keeps TagPill's tint and type contract", () => {
  const source = readFileSync(join(root, "src", "components", "Badge.tsx"), "utf8");
  assert.ok(
    source.includes("color?: TagColorName"),
    "Badge color must be the strict TagColorName token union, not a raw string",
  );
  assert.ok(
    source.includes("useTagColorResolver"),
    "Badge must resolve tag colors through the shared token resolver",
  );
  assert.ok(
    source.includes("{resolvedColor}22`"),
    "surface must be the resolved color at 22 hex alpha",
  );
  assert.ok(
    source.includes("fontSize: tokens.typography.fontSize.xs"),
    "tag label must use the extra-small type step, same as the status form",
  );
  assert.ok(
    source.includes("fontWeight: tokens.typography.fontWeight.semibold"),
    "tag label must use the semibold weight, same as the status form",
  );
  assert.ok(source.includes("borderWidth: 1"), "Badge must carry the 1px border (#174)");
  assert.ok(
    source.includes("borderColor={resolvedColor}"),
    "the color form's border must be the resolved tag color itself (#211)",
  );
  assert.ok(
    source.includes("borderColor={styles.text}"),
    "the tone form's border must match its text color (#174)",
  );
});

test("no source file still imports TagPill (#183)", () => {
  const offenders = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(ts|tsx)$/.test(entry.name) && readFileSync(path, "utf8").includes("TagPill.js"))
        offenders.push(path);
    }
  };
  walk(join(root, "src"));
  assert.deepEqual(offenders, [], `TagPill still imported in: ${offenders.join(", ")}`);
});
