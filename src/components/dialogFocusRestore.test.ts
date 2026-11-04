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
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "../..", "src", "components", "Dialog.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("Dialog is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await import("../../dist/components/index.js");
  assert.equal(
    typeof dist.Dialog,
    "function",
    "Dialog must be exported from the internal components barrel",
  );
});

test("the restore target is tracked from committed focusin events outside the dialog, web only (#385)", () => {
  assert.match(code, /const restoreTargetRef = useRef<HTMLElement \| null>\(null\);/);
  assert.match(code, /document\.addEventListener\("focusin", handleFocusIn\);/);
  assert.match(code, /document\.removeEventListener\("focusin", handleFocusIn\);/);
  assert.match(code, /if \(!target \|\| target === document\.body\) \{/);
  assert.match(code, /trackTarget\(document\.activeElement as HTMLElement \| null\);/);
  assert.match(code, /if \(openRef\.current\) \{\s+return;\s+\}/);
  // The restore mechanism itself uses no tabIndex — the single
  // tabIndex in the file is the #391 containment landing on the
  // content (tabIndex -1, web only, PR #392): it makes the
  // pull-back focus() land inside a dialog with no tabbable
  // content, and it cannot be tracked as a restore target
  // (targets inside the content are excluded below).
  assert.equal((code.match(/tabIndex/g) ?? []).length, 1);
  assert.match(code, /content\.contains\(target\)/);
  assert.match(code, /content\.closest\("dialog"\)/);
  assert.match(code, /target === frame \|\| frame\.contains\(target\)/);
  assert.match(code, /restoreTargetRef\.current = target;/);
  assert.match(
    code,
    /<StyledContent ref=\{setContentRef\} \{\.\.\.\(isWeb \? \{ tabIndex: -1 \} : \{\}\)\}>/,
  );
});

test("focus returns to the tracked element on the open -> closed transition, when it is still available (#385)", () => {
  assert.match(code, /const wasOpen = wasOpenRef\.current;/);
  assert.match(code, /wasOpenRef\.current = open;/);
  assert.match(code, /document\.contains\(restoreTarget\)/);
  assert.match(code, /typeof restoreTarget.focus !== "function"/);
  assert.match(code, /restoreTarget\.focus\(\);/);
  assert.match(code, /\}, \[open, restoreFocus\]\);/);
  // The target is cleared in exactly four places: when a restore
  // consumes it, when the focusout staleness check below retires
  // it after it loses focus to the body while closed, when an
  // opening commit consumes a recorded pre-open blur (same-task
  // blur + open, pinned by its own test below), and when the
  // focusin handler observes focus on the body after a nested
  // blur (pinned by its own test below).
  assert.equal((code.match(/restoreTargetRef\.current = null;/g) ?? []).length, 4);
});

test("a nested blur to the body clears the saved restore candidate (#385)", () => {
  // Focus moves A -> B and B's onFocus immediately calls B.blur():
  // the focusin handler observes document.activeElement === body,
  // and no control holds focus, so the previously tracked A must
  // not survive as a candidate — a later programmatic opening and
  // dismissal would otherwise restore A even though focus was on
  // the body when the dialog opened. Neither focusout guard sees
  // this sequence (A's focusout names B as relatedTarget; B's
  // focusout does not name the tracked target), so the clear
  // lives in the focusin handler itself (Copilot review on
  // PR #386, head 7ee1f4e).
  assert.match(
    code,
    /if \(currentTarget === document\.body\) \{\s+restoreTargetRef\.current = null;\s+\}\s+trackTarget\(currentTarget\);/,
  );
});

test("stale deferred retries are invalidated by newer restores, reopening, and intervening focus (#385)", () => {
  assert.match(code, /const restoreGenRef = useRef\(0\);/);
  assert.match(code, /const restoreGen = \+\+restoreGenRef\.current;/);
  assert.match(code, /if \(restoreGenRef\.current !== restoreGen\) \{/);
  assert.match(code, /const lastRestoreTargetRef = useRef<HTMLElement \| null>\(null\);/);
  assert.match(code, /currentTarget !== lastRestoreTargetRef\.current/);
});

test("the focusin tracker reads the current active element, not the possibly stale event target (#385)", () => {
  // If a host's onFocus for A synchronously focuses B, B's focusin
  // reaches the document listener first and A's original event then
  // resumes bubbling: trusting event.target ends the tracker on
  // stale A while focus actually rests on B, and a one-shot
  // redirect means reopening from still-focused B emits no new
  // focusin, so dismissal would restore A instead of B. The
  // handler therefore derives the tracked element from
  // document.activeElement at listener time (Copilot review on
  // PR #386, head d2abcf5).
  assert.match(code, /const currentTarget = document\.activeElement as HTMLElement \| null;/);
  assert.match(code, /trackTarget\(currentTarget\);/);
  assert.doesNotMatch(code, /trackTarget\(event\.target/);
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

test("an explicit blur to the body in the same task as an opening retires the target (#385)", () => {
  // The blur is recorded synchronously in the focusout handler,
  // before the deferred staleness check can be outraced by the
  // opening commit (Copilot review on PR #386, head 39e9223:
  // `button.blur(); setOpen(true)` left the blurred button saved,
  // and dismissal focused it even though focus was on the body
  // when the dialog opened).
  assert.match(code, /const blurredTargetRef = useRef<HTMLElement \| null>\(null\);/);
  assert.match(code, /const blurredTarget = restoreTargetRef\.current;/);
  assert.match(code, /blurredTargetRef\.current = blurredTarget;/);
  // The opening commit consumes the record: a recorded blur that
  // names the tracked target clears it, and the record itself is
  // reset for the next opening either way.
  assert.match(
    code,
    /blurredTargetRef\.current === restoreTargetRef\.current\s*\) \{\s+restoreTargetRef\.current = null;/,
  );
  // The record is reset in exactly three places: a fresh tracked
  // focus supersedes it, the deferred staleness check drops its
  // own record after running, and the opening commit consumes it.
  assert.equal((code.match(/blurredTargetRef\.current = null;/g) ?? []).length, 3);
});

test("unmount while open schedules a deferred restore that a StrictMode replay setup cancels (#385)", () => {
  assert.match(code, /pendingRestoreTimerRef\.current = setTimeout\(\(\) => \{/);
  assert.match(code, /clearTimeout\(pendingRestoreTimerRef\.current\);/);
  assert.match(code, /if \(!isWeb \|\| !wasOpenRef\.current\) \{/);
  // The unmount flag is set only inside the timer callback, when
  // the scheduled restore actually fires — never in the cleanup
  // itself. A cleanup-set flag survives the replay setup's timer
  // cancel, so the first real close would read fromUnmount, skip
  // its deferred re-asserts, and an overlay dismissal would strand
  // focus on the body (Copilot + CodeRabbit review on PR #386,
  // head 8ac05f4).
  assert.match(
    code,
    /pendingRestoreTimerRef\.current = setTimeout\(\(\) => \{\s+pendingRestoreTimerRef\.current = null;\s+unmountRestoreRef\.current = true;\s+restoreFocus\(\);/,
  );
  // The timer callback holds the ONLY assignment of the flag —
  // a second one in cleanup would reintroduce the replay bug
  // above (CodeRabbit review on PR #386, head 6d267f6).
  assert.equal((code.match(/unmountRestoreRef\.current = true;/g) ?? []).length, 1);
});

test("the restore re-asserts on a deferred tick only while focus sits on the body (#385)", () => {
  assert.match(code, /requestAnimationFrame\(reassert\);/);
  assert.match(code, /reassertTimerRef\.current = setTimeout\(\(\) => \{/);
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

test("closing-commit focus is retained even when the opener is missing or detached (#385)", () => {
  // The yield-to-host-placement retention must run before the
  // target-validity guard: a missing (null) or detached (no
  // longer contained) opener goes through that guard, and if it
  // returned first, the host's closing-commit control — whose
  // focusin was ignored while the dialog was open — would never
  // be retained, leaving a reopening from it targetless (Copilot
  // review on PR #386, head b298361).
  const retainIndex = code.indexOf("restoreTargetRef.current = activeElement;");
  const guardIndex = code.indexOf("!document.contains(restoreTarget)");
  assert.notEqual(retainIndex, -1);
  assert.notEqual(guardIndex, -1);
  assert.ok(
    retainIndex < guardIndex,
    "the closing-commit retention must precede the target-validity guard",
  );
});

test("the 350 ms retry does not reclaim an opener intentionally blurred after the frame retry (#385)", () => {
  // An intentional blur of the restored opener retires the target
  // through the staleness check; the long retry then has nothing
  // it may reclaim. The overlay's own focus reset still recovers:
  // the frame retry's refocus re-tracks the opener via focusin,
  // so the target matches again when the long retry runs (Copilot
  // review on PR #386, head b298361).
  assert.match(
    code,
    /reassertTimerRef\.current = setTimeout\(\(\) => \{\s+if \(restoreTargetRef\.current !== restoreTarget\) \{\s+return;\s+\}\s+reassert\(\);\s+\}, 350\);/,
  );
});

test("the restore retains its target before focusing, so a synchronous redirect supersedes it (#385)", () => {
  // Retention repopulates the tracker for the no-focusin case
  // (the opener already held focus), but it must be in place
  // before focus() runs: a host focus handler that synchronously
  // redirects focus to another control during the restore fires
  // that control's focusin mid-focus(), and the tracker must end
  // on the redirected control, not be overwritten back to the
  // opener (Copilot review on PR #386, head 47ca297).
  const retainIndex = code.indexOf("restoreTargetRef.current = restoreTarget;");
  const focusIndex = code.indexOf("restoreTarget.focus();");
  assert.notEqual(retainIndex, -1);
  assert.notEqual(focusIndex, -1);
  assert.ok(retainIndex < focusIndex, "retention must precede the restore focus() call");
});

test("rejected shapes stay out: no render-time capture, no autofocus-event handlers (#385)", () => {
  assert.doesNotMatch(code, /if \(isWeb && open/);
  assert.doesNotMatch(code, /onOpenAutoFocus/);
  assert.doesNotMatch(code, /onCloseAutoFocus/);
});
