/**
 * Contract test for BigFooter's right-hand store/social column
 * (spudly/design-system#467, Stephen's 2026-11-05 Storybook review,
 * plan approved 2026-11-06).
 *
 * Pins: below the brand wordmark, the link columns sit on the left
 * of a wrapping row and the store links + social icons live in a
 * right-hand column of that same row — store links at the top,
 * socials pinned to the column's bottom via space-between — and
 * the column renders only when it has content (empty storeLinks
 * AND empty socialLinks render no column).
 *
 * Source scan like this repo's other contract tests (comments
 * stripped first, so the assertions pin the layout code itself).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readCode(rel: string) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const footer = readCode("src/widgets/BigFooter.tsx");

test("the side column renders after the link columns, inside the same row (#467)", () => {
  const columnsAt = footer.indexOf("columns.map((column)");
  const sideAt = footer.indexOf('testID="big-footer-side-column"');
  assert.ok(columnsAt >= 0, "link columns render");
  assert.ok(sideAt > columnsAt, "side column follows the link-columns region");
  const brandAt = footer.indexOf("<StyledBigFooterBrandAnchor");
  assert.ok(brandAt >= 0 && brandAt < columnsAt, "brand wordmark stays above the row");
});

test("store links sit above socials in the side column, socials pinned to its bottom (#467)", () => {
  const sideAt = footer.indexOf('testID="big-footer-side-column"');
  const sideBlock = footer.slice(sideAt);
  const storeAt = sideBlock.indexOf("<StyledBigFooterStoreAnchor");
  const socialAt = sideBlock.indexOf("<StyledBigFooterSocialAnchor");
  assert.ok(storeAt >= 0, "store links render inside the side column");
  assert.ok(socialAt > storeAt, "social row renders below the store links");
  const tagStart = footer.lastIndexOf("<YStack", sideAt);
  const openingTag = footer.slice(tagStart, footer.indexOf(">", sideAt));
  assert.ok(
    openingTag.includes('justifyContent="space-between"'),
    "the side column pins its social row to the bottom via space-between",
  );
});

test("the side column renders only when it has content (#467)", () => {
  assert.match(footer, /storeLinks\.length > 0 \|\| socialLinks\.length > 0 \?/);
});
