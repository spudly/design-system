/**
 * Contract + behavior tests for LazySlot (#438 Part 5): the
 * internal view a page renders host-supplied lazy content
 * through, so hosts stop importing ChunkErrorBoundary.
 *
 * The contracts pinned here:
 * 1. LazySlot is exported from the views barrel only — views are
 *    internal (#438 Part 2), so it must NOT appear on the package
 *    root or the pages barrel (packageExports pins the root; this
 *    pins the barrels by name).
 * 2. Its props are a type alias (the repo-wide rule, #214) whose
 *    only required prop is `children`; `onReload` is the optional
 *    recovery override forwarded to the boundary.
 * 3. The composition is exactly the established one: the internal
 *    ChunkErrorBoundary (whose fallback — the error Alert plus
 *    the "Reload the app" recovery — is pinned by its own tests)
 *    around a Suspense whose fallback is the DS loading state (a
 *    large Spinner centered in the slot region). No new error or
 *    loading presentation is invented here.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Suspense } from "react";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const distViews: Record<string, any> = await import("../../dist/views/index.js");
const distComponents: Record<string, any> = await import("../../dist/components/index.js");

function codeOf(rel: string): string {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const slot = codeOf("src/views/LazySlot.tsx");
const stories = readFileSync(join(root, "src/views/LazySlot.stories.tsx"), "utf8");

test("LazySlot is exported from the views barrel and nowhere public", () => {
  const barrel = readFileSync(join(root, "src/views/index.ts"), "utf8");
  assert.match(barrel, /export \{ LazySlot, type LazySlotProps \} from "\.\/LazySlot\.js";/);
  assert.equal(typeof distViews.LazySlot, "function");
  const rootEntry = readFileSync(join(root, "src/index.ts"), "utf8");
  const pagesBarrel = readFileSync(join(root, "src/pages/index.ts"), "utf8");
  assert.doesNotMatch(rootEntry, /LazySlot/, "views stay internal — no root export");
  assert.doesNotMatch(pagesBarrel, /LazySlot/, "views stay internal — no pages-barrel export");
});

test("props are a type alias with children as the core prop", () => {
  assert.match(slot, /export type LazySlotProps = \{/);
  assert.match(slot, /children: ReactNode;/);
  assert.match(slot, /onReload\?: \(\) => void;/);
  assert.doesNotMatch(slot, /\binterface\s+LazySlotProps\b/);
});

test("the slot composes the internal boundary around a Suspense", () => {
  const element = distViews.LazySlot({ children: "surface content" });
  assert.equal(
    element.type,
    distComponents.ChunkErrorBoundary,
    "the outer element is the internal ChunkErrorBoundary — its fallback is the established one",
  );
  assert.equal(
    element.props.onReload,
    undefined,
    "no recovery override is forwarded when the caller supplies none",
  );
  const suspense = element.props.children;
  assert.equal(suspense.type, Suspense, "the boundary wraps a Suspense");
  assert.equal(suspense.props.children, "surface content", "the slotted content renders untouched");
  // The Suspense fallback is the DS loading state: a large
  // Spinner (accessible label "Loading", its default) centered in
  // the region.
  const fallback = suspense.props.fallback;
  assert.equal(fallback.type, distComponents.Center);
  const spinner = fallback.props.children;
  assert.equal(spinner.type, distComponents.Spinner);
  assert.equal(spinner.props.size, "large");
});

test("a caller-supplied onReload is forwarded to the boundary", () => {
  const onReload = () => {};
  const element = distViews.LazySlot({ children: "surface content", onReload });
  assert.equal(element.props.onReload, onReload);
});

test("stories cover the loaded, loading, and failed-to-load states", () => {
  assert.match(stories, /title: "Views\/LazySlot"/);
  assert.match(stories, /export const Loaded: Story/);
  assert.match(stories, /export const Loading: Story/);
  assert.match(stories, /export const FailedToLoad: Story/);
});
