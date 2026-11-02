/**
 * Contract test for Dialog focus restoration (spudly/design-system#385).
 *
 * The DS Dialog has no trigger element of its own — the host renders its
 * own trigger and flips the controlled `open` prop — and Tamagui cancels
 * its fallback focus restoration while trying to focus that missing
 * trigger, so a dismissed dialog left keyboard focus nowhere. The pins
 * hold the fix in the Dialog component itself: on web it tracks the
 * element that most recently held focus outside the dialog and returns
 * focus to it on close (and on unmount while open), only while that
 * element is still in the document and focusable.
 *
 * The mechanism is pinned to this component's own focus tracking on
 * purpose (PR #386 review + QA rounds): capturing during render can
 * leave a stale target from an abandoned render; a mount-effect
 * cleanup restore loses the opener to a StrictMode effect replay; and
 * the primitive's autofocus events, tried in between, did not restore
 * focus at all in the shipped Storybook build (manual QA on head
 * 5888465 failed every dismissal path). So the pins hold: targets come
 * from committed `focusin` events outside the dialog's content,
 * restore happens in the open-transition effect, unmount restore is a
 * deferred schedule the effect setup cancels (StrictMode replay
 * safety), and none of the three rejected shapes come back.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "Dialog.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("Dialog is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.Dialog, "function", "Dialog must be exported from @spudly/ui");
});

test("the restore target is tracked from committed focusin events outside the dialog, web only (#385)", () => {
  assert.match(code, /const restoreTargetRef = useRef<HTMLElement \| null>\(null\);/);
  assert.match(code, /document\.addEventListener\("focusin", handleFocusIn\);/);
  assert.match(code, /document\.removeEventListener\("focusin", handleFocusIn\);/);
  assert.match(code, /if \(!target \|\| target === document\.body\) \{/);
  assert.match(code, /trackTarget\(document\.activeElement as HTMLElement \| null\);/);
  assert.match(code, /if \(openRef\.current\) \{\s+return;\s+\}/);
  assert.doesNotMatch(code, /tabIndex/);
  assert.match(code, /content\.contains\(target\)/);
  assert.match(code, /content\.closest\("dialog"\)/);
  assert.match(code, /target === frame \|\| frame\.contains\(target\)/);
  assert.match(code, /restoreTargetRef\.current = target;/);
  assert.match(code, /<StyledContent ref=\{contentRef\}>/);
});

test("focus returns to the tracked element on the open -> closed transition, when it is still available (#385)", () => {
  assert.match(code, /const wasOpen = wasOpenRef\.current;/);
  assert.match(code, /wasOpenRef\.current = open;/);
  assert.match(code, /document\.contains\(restoreTarget\)/);
  assert.match(code, /typeof restoreTarget.focus !== "function"/);
  assert.match(code, /restoreTarget\.focus\(\);/);
  assert.match(code, /\}, \[open, restoreFocus\]\);/);
  // The target is cleared in exactly two places: when a restore
  // consumes it, and when the focusout staleness check below
  // retires it after it loses focus to the body while closed.
  assert.equal((code.match(/restoreTargetRef\.current = null;/g) ?? []).length, 2);
});

test("stale deferred retries are invalidated by newer restores, reopening, and intervening focus (#385)", () => {
  assert.match(code, /const restoreGenRef = useRef\(0\);/);
  assert.match(code, /const restoreGen = \+\+restoreGenRef\.current;/);
  assert.match(code, /if \(restoreGenRef\.current !== restoreGen\) \{/);
  assert.match(code, /const lastRestoreTargetRef = useRef<HTMLElement \| null>\(null\);/);
  assert.match(code, /event\.target !== lastRestoreTargetRef\.current/);
});

test("a restore yields to focus a host placed outside the dialog in the closing commit (#385)", () => {
  assert.match(code, /const activeElement = document\.activeElement as HTMLElement \| null;/);
  assert.match(code, /activeElement !== document\.body && activeElement !== restoreTarget/);
  assert.match(code, /content\.contains\(activeElement\)/);
  assert.match(code, /frame\.contains\(activeElement\)/);
  assert.match(code, /if \(!insideOwnDialog\) \{/);
  // The yielded-to control is retained as the restore target, so a
  // later reopening from it (with no focus change to track) still
  // has somewhere to return to.
  assert.match(code, /restoreTargetRef\.current = activeElement;/);
});

test("a tracked target that loses focus to the body while closed stops being a candidate (#385)", () => {
  assert.match(code, /document\.addEventListener\("focusout", handleFocusOut\);/);
  assert.match(code, /document\.removeEventListener\("focusout", handleFocusOut\);/);
  assert.match(code, /event\.target !== restoreTargetRef\.current/);
  assert.match(code, /if \(event\.relatedTarget && event\.relatedTarget !== document\.body\) \{/);
  assert.match(code, /document\.activeElement === document\.body/);
  // Validating inside the open effect is the rejected shape: it
  // runs after focus has moved into the dialog and clears every
  // legitimate opener (manual QA on PR #386, head 4d775a8).
  assert.doesNotMatch(code, /target !== document\.activeElement/);
});

test("unmount while open schedules a deferred restore that a StrictMode replay setup cancels (#385)", () => {
  assert.match(code, /pendingRestoreTimerRef\.current = setTimeout\(\(\) => \{/);
  assert.match(code, /clearTimeout\(pendingRestoreTimerRef\.current\);/);
  assert.match(code, /if \(!isWeb \|\| !wasOpenRef\.current\) \{/);
});

test("the restore re-asserts on a deferred tick only while focus sits on the body (#385)", () => {
  assert.match(code, /requestAnimationFrame\(reassert\);/);
  assert.match(code, /setTimeout\(reassert, 350\);/);
  assert.match(
    code,
    /document\.activeElement === document\.body && document\.contains\(restoreTarget\)/,
  );
});

test("a successful restore retains its target, and unmount leaves no live retries behind (#385)", () => {
  // Retention: an already-focused opener emits no focusin when
  // focus() lands on it, so the tracker must be repopulated by the
  // restore itself (Copilot review on PR #386, head aeea1fb).
  assert.match(code, /restoreTargetRef\.current = restoreTarget;/);
  // Teardown cancels a close's pending re-asserts, and the
  // unmount-scheduled restore is flagged so it schedules none —
  // after unmount the invalidating focus listener is gone.
  assert.match(code, /clearTimeout\(reassertTimerRef\.current\);/);
  assert.match(code, /cancelAnimationFrame\(reassertRafRef\.current\);/);
  assert.match(code, /unmountRestoreRef\.current = true;/);
  assert.match(code, /if \(!fromUnmount\) \{/);
});

test("rejected shapes stay out: no render-time capture, no autofocus-event handlers (#385)", () => {
  assert.doesNotMatch(code, /if \(isWeb && open/);
  assert.doesNotMatch(code, /onOpenAutoFocus/);
  assert.doesNotMatch(code, /onCloseAutoFocus/);
});
