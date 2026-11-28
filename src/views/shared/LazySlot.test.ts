/**
 * Contract + behavior tests for LazySlot (#438 Part 5): the
 * internal view a page renders host-supplied lazy content
 * through, so hosts stop importing ChunkErrorBoundary.
 *
 * The contracts pinned here:
 * 1. LazySlot is exported from the built views barrel only —
 *    views are internal (#438 Part 2), so it must NOT appear
 *    on the built package root (asserted against the built
 *    root's dist type surface — a built-artifact read).
 * 2. The composition is exactly the established one: the internal
 *    ChunkErrorBoundary (whose fallback — the error Alert plus
 *    the "Reload the app" recovery — is pinned by its own tests)
 *    around a Suspense whose fallback is the DS loading state
 *    (a skeleton panel of box and text bones filling the slot
 *    region — no Spinner).
 *
 * Converted from source scans to runtime checks in #733
 * tranche 5: the composition was already exercised against the
 * built view; the Suspense fallback's skeleton composition is
 * now asserted on the returned element tree (SkeletonPanel
 * holding BoxSkeleton / TextSkeleton children) instead of by
 * reading the source, and the barrel/root absence checks run
 * against the built modules. Deleted: the type-alias scan
 * (types are enforced by the TypeScript build, not a test —
 * Stephen, 2026-11-20) and the stories source scan (story
 * coverage is not runtime-observable from the built package).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { Suspense } from "react";

import "../../../test/registerSvgStub.js";

const distViews: Record<string, any> = await import("../../../dist/views/index.js");
const distWidgets: Record<string, any> = await import("../../../dist/widgets/index.js");
// The built root's type surface (a dist artifact, not source):
// views must not appear on it.
const rootTypes = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../..", "dist", "index.d.ts"),
  "utf8",
);

test("LazySlot is exported from the built views barrel and nowhere public", () => {
  assert.equal(typeof distViews.LazySlot, "function");
  assert.doesNotMatch(rootTypes, /LazySlot/, "views stay internal — no root export");
});

test("the slot composes the internal boundary around a Suspense", () => {
  const element = distViews.LazySlot({ children: "surface content" });
  assert.equal(
    element.type,
    distViews.ChunkErrorBoundary,
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
  // The Suspense fallback is the DS loading state (#278
  // tranche 3): a skeleton panel holding box and text bones
  // filling the slot region — the incoming component's shape
  // is unknown by definition, so the fallback mirrors no
  // particular layout, and it renders no Spinner.
  const fallback = suspense.props.fallback;
  assert.ok(fallback, "the Suspense carries a fallback");
  assert.equal(fallback.type, distWidgets.SkeletonPanel, "the fallback is a skeleton panel");
  const bones = fallback.props.children;
  const boneTypes = (Array.isArray(bones) ? bones : [bones]).map((b: any) => b?.type);
  assert.ok(boneTypes.includes(distWidgets.BoxSkeleton), "the fallback renders box skeletons");
  assert.ok(boneTypes.includes(distWidgets.TextSkeleton), "the fallback renders text skeletons");
  assert.ok(!boneTypes.includes(distWidgets.Spinner), "the fallback renders no spinner");
});

test("a caller-supplied onReload is forwarded to the boundary", () => {
  const onReload = () => { /* noop */ };
  const element = distViews.LazySlot({ children: "surface content", onReload });
  assert.equal(element.props.onReload, onReload);
});
