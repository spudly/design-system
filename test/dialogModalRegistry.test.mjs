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
  // the comparison walks that chain into a presentation path.
  // Registration order
  // (child effects before parent effects on a simultaneous
  // mount) therefore cannot invert the stacking.
  assert.match(registry, /parentToken: symbol \| null;/);
  assert.match(registry, /export const ModalLayerContext = createContext<symbol \| null>\(null\);/);
  // The comparison walks the ancestry chain into a full
  // presentation path (supersedes the pairwise descendant
  // test: CodeRabbit review on PR #398 showed pairwise
  // ancestry-then-stamps is non-transitive and can cycle —
  // see the behavioral cycle test below).
  assert.match(registry, /function presentationPath\(layer: ModalLayer\): number\[\] \{/);
  assert.match(registry, /path\.unshift\(current\.presentedAt\)/);
  assert.match(registry, /return pathA\.length > pathB\.length;/);
  assert.doesNotMatch(registry, /isDescendantLayer/);
});

test("unrelated layers stack in presentation order — focus is never consulted (#394 cases 2 and 3)", () => {
  // A layer presented later covers unrelated earlier layers:
  // the StepOverlay mounted over an open Dialog is above it
  // wherever focus happens to rest, the body included.
  assert.match(registry, /presentedAt: \+\+presentationCounter,/);
  // Unrelated layers differ at the first path level, where
  // the path elements ARE their own stamps — presentation
  // order falls out of the path comparison.
  assert.match(registry, /const stampA = pathA\[i\]!;/);
  assert.match(registry, /if \(stampA !== stampB\) \{\s+return stampA > stampB;\s+\}/);
  assert.match(registry, /export function isActiveModalLayer\(layer: ModalLayer\): boolean \{/);
  assert.doesNotMatch(registry, /activeElement/);
  assert.doesNotMatch(registry, /document\./);
});

test("Dialog registers while open and provides its layer token to its children (#394)", () => {
  // The registration carries the component's OWN layerToken —
  // the symbol it provides to descendants — so a nested layer
  // recording that token as its parent resolves to this layer
  // (CodeRabbit review on PR #398: a registration minting its
  // own symbol leaves ancestry unresolvable).
  assert.match(dialog, /registerModalLayer\(layerToken, parentLayerToken\)/);
  assert.match(dialog, /unregisterModalLayer\(layer\)/);
  assert.match(dialog, /useContext\(ModalLayerContext\)/);
  assert.match(dialog, /<ModalLayerContext\.Provider value=\{layerToken\}>/);
});

test("StepOverlay registers in the same registry and its Tab wrap stands down while covered (#394)", () => {
  assert.match(overlay, /registerModalLayer\(layerToken, parentLayerToken\)/);
  assert.match(overlay, /unregisterModalLayer\(layer\)/);
  assert.match(overlay, /<ModalLayerContext\.Provider value=\{layerToken\}>/);
  assert.match(overlay, /if \(ownLayer && !isActiveModalLayer\(ownLayer\)\) \{\s+return;\s+\}/);
  // …and the active overlay also contains Tab pressed from
  // OUTSIDE its shell (focus on the body) — the shell wrap
  // alone never sees that key (CodeRabbit review on PR #398).
  assert.match(overlay, /document\.addEventListener\("keydown", handleOutsideTab, true\);/);
  assert.match(overlay, /document\.removeEventListener\("keydown", handleOutsideTab, true\);/);
  assert.match(overlay, /if \(active && node\.contains\(active\)\) \{\s+return;\s+\}/);
  // …but it yields to a foreign modal holding focus, exactly
  // as Dialog's containment does (CodeRabbit review on
  // PR #398): no DS component pulls Tab out of a host-built
  // modal the user is in — including a native <dialog> shown
  // with showModal(), which carries neither role nor
  // aria-modal, hence the :modal arm of the selector.
  assert.match(overlay, /!registeredModalRoots\(\)\.has\(foreignModal\)/);
  assert.match(overlay, /'\[role="dialog"\]\[aria-modal="true"\], dialog:modal'/);
});

test("the foreign-frame scan skips the frames the registry already arbitrates (#394)", () => {
  assert.match(registry, /export function registeredModalFrames\(\): Set<Element> \{/);
  assert.match(dialog, /const dsFrames = registeredModalFrames\(\);/);
  // DS layer roots are likewise reported, so Dialog's retained
  // stand-down for foreign aria-modal elements can exempt DS
  // layers without an opener-derived host record.
  assert.match(registry, /export function registeredModalRoots\(\): Set<Element> \{/);
  assert.match(dialog, /!registeredModalRoots\(\)\.has\(foreignModal\)/);
});

// Behavioral pins against the built registry module: the
// source pins above hold the shape, these hold the arbitration
// itself — the token-identity break CodeRabbit caught on
// PR #398 (registrations minting their own symbols) passes
// every source pin and fails here.
test("registry behavior: simultaneously-open nested layers — the inner layer is active (#394 case 1)", async () => {
  const registry = await import("../dist/components/modalRegistry.js");
  const parentToken = Symbol("parent");
  const childToken = Symbol("child");
  // Child effects run before parent effects on a simultaneous
  // mount, so the child registers FIRST; ancestry must still
  // put it above the parent.
  const child = registry.registerModalLayer(childToken, parentToken);
  const parent = registry.registerModalLayer(parentToken, null);
  try {
    assert.equal(registry.isActiveModalLayer(child), true);
    assert.equal(registry.isActiveModalLayer(parent), false);
  } finally {
    registry.unregisterModalLayer(child);
    registry.unregisterModalLayer(parent);
  }
  // Registered in the opposite order (the child opened after
  // the parent), the child is still the active layer.
  const parent2 = registry.registerModalLayer(parentToken, null);
  const child2 = registry.registerModalLayer(childToken, parentToken);
  try {
    assert.equal(registry.isActiveModalLayer(child2), true);
    assert.equal(registry.isActiveModalLayer(parent2), false);
    // Once the child layer goes away, the parent is active again.
    registry.unregisterModalLayer(child2);
    assert.equal(registry.isActiveModalLayer(parent2), true);
  } finally {
    registry.unregisterModalLayer(child2);
    registry.unregisterModalLayer(parent2);
  }
});

test("registry behavior: a Dialog inside a StepOverlay is above it; a covering StepOverlay is above a Dialog (#394 cases A and B)", async () => {
  const registry = await import("../dist/components/modalRegistry.js");
  const overlayToken = Symbol("overlay");
  const dialogToken = Symbol("dialog");
  // Case A: the Dialog is composed inside the overlay and
  // registers before the overlay's own registration (child
  // effects first) — ancestry puts the Dialog on top.
  const dialog = registry.registerModalLayer(dialogToken, overlayToken);
  const overlay = registry.registerModalLayer(overlayToken, null);
  try {
    assert.equal(registry.isActiveModalLayer(dialog), true);
    assert.equal(registry.isActiveModalLayer(overlay), false);
  } finally {
    registry.unregisterModalLayer(dialog);
    registry.unregisterModalLayer(overlay);
  }
  // Case B: an unrelated overlay presented after an open
  // Dialog covers it — presentation order decides, wherever
  // focus rests.
  const dialog2 = registry.registerModalLayer(dialogToken, null);
  const overlay2 = registry.registerModalLayer(overlayToken, null);
  try {
    assert.equal(registry.isActiveModalLayer(overlay2), true);
    assert.equal(registry.isActiveModalLayer(dialog2), false);
  } finally {
    registry.unregisterModalLayer(dialog2);
    registry.unregisterModalLayer(overlay2);
  }
});

test("registry behavior: a re-presented ancestor cannot cycle the stacking order (CodeRabbit, PR #398)", async () => {
  const registry = await import("../dist/components/modalRegistry.js");
  const parentToken = Symbol("parent");
  const childToken = Symbol("child");
  const unrelatedToken = Symbol("unrelated");
  // The descendant registers first (child effects before the
  // parent's own registration), an unrelated layer is
  // presented next, and the ancestor is (re)presented last
  // with the freshest stamp — the registration sequence a
  // parent Dialog's close-and-reopen produces while a nested
  // layer stays registered. Pairwise ancestry-then-stamps
  // ordered these three in a cycle (descendant above ancestor
  // by ancestry, ancestor above unrelated by stamp, unrelated
  // above descendant by stamp) in which NO layer is active
  // and every containment stands down; the presentation-path
  // order is total, so exactly one layer — the descendant —
  // is active.
  const child = registry.registerModalLayer(childToken, parentToken);
  const unrelated = registry.registerModalLayer(unrelatedToken, null);
  const parent = registry.registerModalLayer(parentToken, null);
  try {
    assert.equal(registry.isAboveModalLayer(child, parent), true);
    assert.equal(registry.isAboveModalLayer(parent, unrelated), true);
    assert.equal(registry.isAboveModalLayer(child, unrelated), true);
    assert.equal(registry.isAboveModalLayer(parent, child), false);
    assert.equal(registry.isAboveModalLayer(unrelated, parent), false);
    assert.equal(registry.isAboveModalLayer(unrelated, child), false);
    assert.equal(registry.isActiveModalLayer(child), true);
    assert.equal(registry.isActiveModalLayer(parent), false);
    assert.equal(registry.isActiveModalLayer(unrelated), false);
    // Once the descendant goes away, the re-presented
    // ancestor is the active layer.
    registry.unregisterModalLayer(child);
    assert.equal(registry.isActiveModalLayer(parent), true);
    assert.equal(registry.isActiveModalLayer(unrelated), false);
  } finally {
    registry.unregisterModalLayer(child);
    registry.unregisterModalLayer(unrelated);
    registry.unregisterModalLayer(parent);
  }
});
