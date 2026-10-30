/**
 * Contract test for Card's `compact` variant (spudly/design-system
 * #119, the meals & planning tranche; Stephen's ruling
 * 2026-10-29): the small surface card — 12px padding, the medium
 * radius, the small shadow — for dense list rows and inline
 * editors shipped briefly as a separate CompactCard component.
 * Stephen's case ruling folded it into Card as
 * `variant="compact"`: a surface treatment difference is a
 * variant of Card, not a separate component, and no tranche PR
 * adds components. The pins hold the treatment (the app view's
 * row-card values, unchanged), that CompactCard no longer
 * exists in the package, and that the treatment's consumers
 * (TagsPage's editor card, BadgeCardRow) compose Card's compact
 * variant.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const source = readFileSync(join(root, "src", "components", "Card.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("CompactCard is gone — the treatment lives on Card as a variant", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.Card, "function", "Card must be exported from @spudly/ui");
  assert.equal(
    dist.CompactCard,
    undefined,
    "CompactCard must not survive as a separate component — it is Card's compact variant now",
  );
  assert.ok(
    !existsSync(join(root, "src", "components", "CompactCard.tsx")),
    "src/components/CompactCard.tsx must not exist",
  );
});

test("the compact variant: surface, medium radius, 12px padding, small shadow, no border", () => {
  assert.match(
    code,
    /compact: \{\s+borderWidth: 0,\s+borderRadius: tokens\.radii\.md,\s+padding: tokens\.spacing\[3\],\s+shadowColor: tokens\.shadows\.sm\.shadowColor,/,
  );
  assert.match(code, /shadowRadius: tokens\.shadows\.sm\.shadowRadius,/);
  assert.match(code, /variant\?: "default" \| "bordered" \| "muted" \| "elevated" \| "compact";/);
});

test("the treatment's consumers compose Card's compact variant", () => {
  const tagsPage = readFileSync(join(root, "src", "pages", "TagsPage.tsx"), "utf8");
  const badgeCardRow = readFileSync(join(root, "src", "components", "BadgeCardRow.tsx"), "utf8");
  assert.match(tagsPage, /<Card key=\{tag\.id\} variant="compact">/);
  assert.match(badgeCardRow, /<Card variant="compact">/);
});
