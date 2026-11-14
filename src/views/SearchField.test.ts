/**
 * Contract tests for spudly/design-system#562: `SearchField`
 * forwarded a caller's `onSubmitEditing` straight through its
 * rest props to the Tamagui Input, whose web build fires
 * `onSubmitEditing` from its Enter keydown handler without
 * checking IME composition — so a CJK user confirming a
 * composition candidate with Enter submitted the search
 * mid-typing (the AppShellPage header search, via AppTopBar,
 * and VerseSearchPage both pass a submit handler to this
 * field).
 *
 * The contract now mirrors TextField's shipped guard:
 * 1. `onSubmitEditing`, `onCompositionStart`, and
 *    `onCompositionEnd` are destructured OUT of the rest props,
 *    so none of them can reach the input unwrapped.
 * 2. On web, submit-editing is held while a composition is
 *    active AND for a 100 ms grace window after
 *    `compositionend` (Safari fires `compositionend` before the
 *    confirming Enter keydown, and Tamagui's submit event
 *    carries no isComposing to check). The window is measured
 *    on the monotonic `performance.now()` clock, seeded at
 *    -Infinity so no submit is held before any composition.
 * 3. The caller's own composition handlers are always invoked;
 *    on native they are forwarded unchanged and
 *    `onSubmitEditing` is wired to the same wrapper, whose
 *    guard condition is web-only (composition events do not
 *    exist on native).
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

const searchField = readCode("src/views/SearchField.tsx");
// The guard itself lives in the shared hook since the #587
// phase-2 dedupe; the field files only wire its handlers in.
const guard = readCode("src/views/useImeCompositionGuard.ts");

test("SearchField destructures the submit/composition handlers out of rest (#562)", () => {
  assert.match(searchField, /\n {4}onSubmitEditing,/);
  assert.match(searchField, /\n {4}onCompositionStart,/);
  assert.match(searchField, /\n {4}onCompositionEnd,/);
  assert.match(searchField, /from "tamagui"/);
  assert.match(searchField, /\bisWeb\b/, "the guard is gated on the web platform flag");
});

test("SearchField tracks composition state with a monotonic grace window (#562)", () => {
  assert.match(guard, /composingRef = useRef\(false\)/);
  assert.match(
    guard,
    /compositionEndedAtRef = useRef\(Number\.NEGATIVE_INFINITY\)/,
    "the grace clock must start at -Infinity so early submits are not held",
  );
  assert.match(
    guard,
    /compositionEndedAtRef\.current = performance\.now\(\)/,
    "composition end stamps the monotonic clock",
  );
});

test("the submit wrapper suppresses only while composing or inside the grace window (#562)", () => {
  assert.match(
    guard,
    /isWeb &&\s*\(composingRef\.current \|\| performance\.now\(\) - compositionEndedAtRef\.current < 100\)/,
    "web-only suppression: composing flag OR <100 ms since compositionend",
  );
  assert.match(
    guard,
    /onSubmitEditing\?\.\(event\)/,
    "an ordinary Enter (no composition, outside the window) still reaches the caller",
  );
});

test("the caller's composition handlers are always invoked (#562)", () => {
  assert.match(guard, /onCompositionStart\?\.\(event\)/);
  assert.match(guard, /onCompositionEnd\?\.\(event\)/);
});

test("the guarded handlers are wired onto the inner input (#562)", () => {
  assert.match(
    searchField,
    /onSubmitEditing \? \{ onSubmitEditing: handleSubmitEditing \}/,
    "a caller-supplied submit handler is replaced by the guarded wrapper",
  );
  assert.match(
    searchField,
    /isWeb[\s\S]*?onCompositionStart: handleCompositionStart[\s\S]*?onCompositionEnd: handleCompositionEnd/,
    "on web the input gets the tracking composition handlers",
  );
  assert.match(
    searchField,
    /\.\.\.\(onCompositionStart \? \{ onCompositionStart \} : \{\}\)/,
    "on native the caller's composition handlers forward unchanged",
  );
  assert.match(
    searchField,
    /\.\.\.\(onCompositionEnd \? \{ onCompositionEnd \} : \{\}\)/,
    "on native the caller's composition handlers forward unchanged",
  );
});

test("SearchField passes its callbacks to the shared guard hook and binds the returned handlers (#587)", () => {
  assert.match(
    searchField,
    /const \{ handleCompositionStart, handleCompositionEnd, handleSubmitEditing \} =\s*useImeCompositionGuard\(\{ onCompositionStart, onCompositionEnd, onSubmitEditing \}\);/,
    "the field's own callbacks go into the hook and the guarded handlers come back out",
  );
});
