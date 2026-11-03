/**
 * Contract test for the DS modal registry
 * (spudly/design-system#394).
 *
 * Issue #394: modal activation inferred from focus or from
 * registration order fails whenever focus is not the carrier.
 * Three recorded cases, one root cause:
 *
 * 1. Simultaneously-open nested Dialogs register
 *    child-before-parent (React effect order) while presenting
 *    parent-below-child, so the registration-order stack
 *    treated the covered parent as the active layer and its
 *    containment swallowed Tab away from the nested dialog.
 * 2. An initially-open Dialog mounted inside a new StepOverlay
 *    recorded its host before the overlay's mount effect
 *    focused its shell, so the focus-keyed stand-down treated
 *    the covered overlay as active and Tab never reached the
 *    Dialog.
 * 3. A StepOverlay opening above an empty Dialog with focus
 *    later landing on the body: the stand-down keyed off the
 *    focused element, so with focus on the body the covered
 *    Dialog pulled focus back into itself.
 *
 * The registry (Stephen's Option A ruling on #394) records
 * presentation instead: ancestry from composition
 * (ModalLayerContext) and a monotonic presentation stamp.
 * These pins hold that shape: arbitration consults ancestry
 * and stamps only — never the focused element, never effect
 * order — Dialog and StepOverlay both register in it, and the
 * registry stays internal to the package (no public API
 * change).
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const strip = (source) =>
  source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const read = (relative) => strip(readFileSync(join(here, "..", relative), "utf8"));
const registry = read("src/components/modalRegistry.ts");
const dialog = read("src/components/Dialog.tsx");
const overlay = read("src/components/StepOverlay.tsx");

test("the modal registry is internal — not exported from the built package root (#394)", async () => {
  const dist = await import("../dist/index.js");
  assert.equal("registerModalLayer" in dist, false, "the registry must not be public API");
  assert.equal("ModalLayerContext" in dist, false, "the layer context must not be public API");
  assert.equal("isActiveModalLayer" in dist, false, "arbitration must not be public API");
});

test("a layer presented from within another is above it, regardless of stamps (#394 case 1)", () => {
  // Ancestry is recorded from composition: each layer carries
  // the token of the layer it was presented from within, and
  // the descendant test walks that chain. Registration order
  // (child effects before parent effects on a simultaneous
  // mount) therefore cannot invert the stacking.
  assert.match(registry, /parentToken: symbol \| null;/);
  assert.match(registry, /export const ModalLayerContext = createContext<symbol \| null>\(null\);/);
  assert.match(
    registry,
    /function isDescendantLayer\(candidate: ModalLayer, other: ModalLayer\): boolean \{/,
  );
  assert.match(registry, /if \(isDescendantLayer\(a, b\)\) \{\s+return true;\s+\}/);
  assert.match(registry, /if \(isDescendantLayer\(b, a\)\) \{\s+return false;\s+\}/);
});

test("unrelated layers stack in presentation order — focus is never consulted (#394 cases 2 and 3)", () => {
  // A layer presented later covers unrelated earlier layers:
  // the StepOverlay mounted over an open Dialog is above it
  // wherever focus happens to rest, the body included.
  assert.match(registry, /presentedAt: \+\+presentationCounter,/);
  assert.match(registry, /return a\.presentedAt > b\.presentedAt;/);
  assert.match(registry, /export function isActiveModalLayer\(layer: ModalLayer\): boolean \{/);
  assert.doesNotMatch(registry, /activeElement/);
  assert.doesNotMatch(registry, /document\./);
});

test("Dialog registers while open and provides its layer token to its children (#394)", () => {
  assert.match(dialog, /registerModalLayer\(parentLayerToken\)/);
  assert.match(dialog, /unregisterModalLayer\(layer\)/);
  assert.match(dialog, /useContext\(ModalLayerContext\)/);
  assert.match(dialog, /<ModalLayerContext\.Provider value=\{layerToken\}>/);
});

test("StepOverlay registers in the same registry and its Tab wrap stands down while covered (#394)", () => {
  assert.match(overlay, /registerModalLayer\(parentLayerToken\)/);
  assert.match(overlay, /unregisterModalLayer\(layer\)/);
  assert.match(overlay, /<ModalLayerContext\.Provider value=\{layerToken\}>/);
  assert.match(overlay, /if \(ownLayer && !isActiveModalLayer\(ownLayer\)\) \{\s+return;\s+\}/);
});

test("the foreign-frame scan skips the frames the registry already arbitrates (#394)", () => {
  assert.match(registry, /export function registeredModalFrames\(\): Set<Element> \{/);
  assert.match(dialog, /const dsFrames = registeredModalFrames\(\);/);
});
