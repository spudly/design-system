import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

describe("dialogFocusContainment", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, "../..", "src", "widgets", "Dialog.tsx"), "utf8");
  const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

  test("Dialog is exported from the built internal components barrel", async () => {
    const dist: Record<string, any> = await import("../../dist/widgets/index.js");
    assert.equal(
      typeof dist.Dialog,
      "function",
      "Dialog must be exported from the internal components barrel",
    );
  });

  test("an open web dialog registers a capture-phase Tab containment listener (#391)", () => {
    assert.match(code, /document\.addEventListener\("keydown", handleTabContainment, true\);/);
    assert.match(code, /document\.removeEventListener\("keydown", handleTabContainment, true\);/);
    assert.match(code, /if \(!open \|\| !isWeb \|\| typeof document === "undefined"\) \{/);
    assert.match(code, /if \(event\.key !== "Tab"\) \{/);
    assert.match(code, /\}, \[open\]\);/);
  });

  test("Tab is swallowed only when the dialog content holds no effectively tabbable element (#391)", () => {
    // Effective tabbability, not selector shape (Copilot + CodeRabbit
    // review on PR #392): hidden inputs, disabled controls,
    // negative-tabindex-only controls, and unrendered elements are
    // not Tab stops; summary and contenteditable elements are.
    assert.match(code, /content\.querySelectorAll\(/);
    assert.match(code, /a\[href\], area\[href\], button/);
    assert.match(code, /summary, iframe, audio\[controls\], video\[controls\]/);
    // Effective state beyond the element itself (Copilot +
    // CodeRabbit review on PR #392): inert ancestors remove Tab
    // stops; the :disabled pseudo-class carries fieldset semantics
    // (and never matches links, which a fieldset cannot disable);
    // an image-map area is a stop only when the image using its
    // map is rendered, and only after the negative-tabindex check.
    assert.match(code, /candidate\.closest\("\[inert\]"\)/);
    assert.match(code, /candidate\.matches\(":disabled"\)/);
    assert.doesNotMatch(code, /fieldset\[disabled\]/);
    assert.match(code, /candidate instanceof HTMLAreaElement/);
    assert.match(code, /content\.querySelectorAll\("img\[usemap\]"\)/);
    assert.match(code, /image\.getAttribute\("usemap"\) !== `#\$\{mapName\}`/);
    assert.match(code, /image\.closest\("\[inert\]"\)/);
    const areaIndex = code.indexOf("candidate instanceof HTMLAreaElement");
    const tabStopIndex = code.indexOf('candidate.getAttribute("tabindex")');
    assert.ok(
      tabStopIndex !== -1 && areaIndex !== -1 && tabStopIndex < areaIndex,
      "the negative-tabindex check must precede the image-map area exception",
    );
    // visibility: collapse removes a control from Tab order just
    // like hidden. Disabled means :disabled only: the disabled
    // attribute is inert on non-disableable elements (<a href
    // disabled>, <div tabindex="0" disabled> stay Tab stops), so
    // an attribute check would wrongly reject them (Copilot
    // review on PR #392, head 3bbf165).
    assert.match(code, /style\.visibility === "collapse"/);
    assert.doesNotMatch(code, /candidate\.hasAttribute\("disabled"\)/);
    // An explicitly editable element is its own editing host and
    // a Tab stop even inside a contenteditable="false" region —
    // the ancestor walk added at head a459ad8 was superseded by
    // the Copilot review on head 3bbf165.
    assert.doesNotMatch(code, /hostAttr/);
    assert.match(code, /\[contenteditable=""\], \[contenteditable="true"\]/);
    assert.doesNotMatch(code, /\[contenteditable\],/);
    assert.match(code, /candidate\.type === "hidden"/);
    assert.match(code, /candidate\.getAttribute\("tabindex"\)/);
    assert.match(code, /Number\.parseInt\(tabStopAttr, 10\) < 0/);
    assert.match(code, /style\.visibility === "hidden"/);
    assert.match(code, /candidate\.getClientRects\(\)\.length > 0/);
    assert.match(code, /if \(hasTabbable\) \{\s+return;\s+\}/);
    assert.match(code, /event\.preventDefault\(\);/);
    // Propagation is not stopped: an in-dialog control that
    // handles Tab itself must still receive the key.
    assert.doesNotMatch(code, /stopPropagation/);
  });

  test("only the topmost modal intercepts Tab — a covered dialog stands down (#391)", () => {
    // Stacked dialogs: a text-only dialog left open beneath a newer
    // modal must not swallow Tab for the dialog above it (Copilot +
    // CodeRabbit review on PR #392). DS layers are arbitrated by
    // the modal registry (dialogModalRegistry.test.ts, #394);
    // this scan covers FOREIGN native frames no DS layer records.
    // Portal frames mount in open order, so a frame followed in
    // document order by another dialog frame is covered.
    assert.match(code, /document\.querySelectorAll\("dialog"\)/);
    assert.match(
      code,
      /frame\.compareDocumentPosition\(other\) & Node\.DOCUMENT_POSITION_FOLLOWING/,
    );
    // Only a still-open modal covers: a closed dialog element later
    // in the document (or one nested inside this dialog) must not
    // disable containment (Copilot + CodeRabbit review on PR #392,
    // head 5f84f47).
    assert.match(code, /other\.getAttribute\("aria-modal"\) === "true" \|\| isNativeModal/);
    assert.match(code, /frame\.contains\(other\)/);
    assert.match(code, /other\.getClientRects\(\)\.length === 0/);
    assert.match(code, /if \(covered\) \{\s+return;\s+\}/);
  });

  test("focus outside the dialog is pulled back onto the landing wrapper inside it (#391)", () => {
    assert.match(code, /content\.closest\("dialog"\)/);
    assert.match(code, /frame\.querySelector\('\[tabindex="-1"\]'\)/);
    assert.match(code, /landing\.focus\(\)/);
  });

  test("a details with no summary child counts as a Tab stop, and the fallback landing is focusable (#391)", () => {
    // Copilot review on PR #392 (head fbf5aea): a details without
    // an explicit summary gets a UA fallback summary that is a
    // real Tab stop but not in the DOM, so the details element
    // itself must stand in for it; with an explicit summary child
    // the summary is the stop instead.
    assert.match(code, /details, summary, iframe/);
    assert.match(code, /candidate instanceof HTMLDetailsElement/);
    assert.match(code, /Array\.from\(candidate\.children\)/);
    assert.match(code, /child\.tagName === "SUMMARY"/);
    // CodeRabbit review on PR #392 (head fbf5aea): the fallback
    // landing is the content itself when the frame has no wrapper,
    // so the content must be focusable on web (tabIndex -1) or the
    // pull-back focus() is a no-op and focus stays behind the
    // overlay. A -1 tabindex never makes it a sequential Tab stop.
    assert.match(
      code,
      /<StyledContent ref=\{setContentRef\} \{\.\.\.\(isWeb \? \{ tabIndex: -1 \} : \{\}\)\}>/,
    );
  });

  test("a covered dialog stands down for the DS layer above it — the registry arbitrates, not focus (#394)", () => {
    // Issue #394 (Stephen's Option A ruling): which presented
    // DS layer is active is decided by the modal registry from
    // recorded presentation — ancestry and presentation order.
    // This test supersedes the PR #392 pins for the stand-down
    // as it applied between DS layers (Copilot review on
    // PR #392, heads f32fd7d and 646fe94): keying DS arbitration
    // on the focused element misjudged a Dialog mounted inside
    // a new StepOverlay (its host recorded before the overlay's
    // mount focus move) and a covering StepOverlay while focus
    // rested on the body, and the registration-order stack it
    // also replaced inverted simultaneously-open nested dialogs.
    assert.match(code, /registerModalLayer\(layerToken, parentLayerToken\)/);
    assert.match(code, /unregisterModalLayer\(layer\)/);
    assert.match(code, /const ownLayer = layerRef\.current;/);
    assert.match(code, /if \(ownLayer && !isActiveModalLayer\(ownLayer\)\) \{\s+return;\s+\}/);
    // The layer this dialog was composed inside is read from
    // context, and this dialog provides its own token to layers
    // composed inside it.
    assert.match(code, /useContext\(ModalLayerContext\)/);
    assert.match(code, /<ModalLayerContext\.Provider value=\{layerToken\}>/);
    // The registry layer re-syncs when the portal content
    // attaches, not only in the registration effect: an initially
    // open dialog can hydrate with its content mounted in a later
    // Portal update (CodeRabbit review on PR #392, head 646fe94).
    assert.match(code, /const setContentRef = useCallback\(/);
    assert.match(code, /contentRef\.current = node;/);
    assert.match(code, /layer\.root = content;/);
    // The mechanism the registry replaced is gone: no
    // registration-order stack.
    assert.doesNotMatch(code, /openDialogStack/);
    // What survives is the stand-down for a FOREIGN aria-modal
    // element only (CodeRabbit review on PR #398): a host-built
    // modal has no registry record and no native frame, so focus
    // remains its only signal — with DS layers exempt through
    // their registered roots, and the host this dialog was
    // opened FROM exempt through the opener record (PR #392,
    // head 646fe94 — a foreign host has no registered root, so
    // the record is its only exemption signal).
    assert.match(
      code,
      /const foreignModal = focusedElement\.closest\('\[role="dialog"\]\[aria-modal="true"\]'\)/,
    );
    assert.match(code, /foreignModal !== hostModalRef\.current/);
    assert.match(code, /const opener = restoreTargetRef\.current;/);
    assert.match(
      code,
      /hostModalRef\.current =[^;]*opener\.closest\('\[role="dialog"\]\[aria-modal="true"\]'\)/,
    );
    assert.match(code, /!foreignModal\.contains\(content\)/);
    assert.match(code, /!registeredModalRoots\(\)\.has\(foreignModal\)/);
  });

  test("the f0fd374 review round: invisible ARIA-only frames, editable details, stray summaries (#391)", () => {
    // Copilot review on PR #392 (head f0fd374), three findings:
    // (1) a later foreign <dialog aria-modal> with
    // visibility:hidden still has client rects but covers
    // nothing — the covered scan checks computed visibility for
    // ARIA-only frames, while a native :modal frame covers as
    // before.
    assert.match(code, /const isNativeModal = other\.matches\(":modal"\);/);
    assert.match(code, /window\.getComputedStyle\(other\)/);
    assert.match(code, /otherStyle\.visibility !== "hidden"/);
    assert.match(code, /otherStyle\.visibility !== "collapse"/);
    assert.match(code, /if \(isNativeModal\) \{\s+return true;\s+\}/);
    // (2) a <details contenteditable> is itself an editing host
    // and a Tab stop even with a summary child — the summary
    // exclusion applies only when the details is not editable.
    assert.match(code, /const editableHost = editableAttr !== null && editableAttr !== "false";/);
    assert.match(code, /if \(hasOwnSummary && !editableHost\) \{\s+return false;\s+\}/);
    // (3) a plain <summary> outside a <details> is not a
    // disclosure control or a Tab stop — it is excluded unless
    // editable or independently tabbable (tabindex handled
    // earlier in the candidate pass).
    assert.match(code, /if \(!\(parent instanceof HTMLDetailsElement\)\) \{\s+return false;\s+\}/);
  });

  test("summary and image-map stops follow the native rules (#391)", () => {
    // Copilot review on PR #392 (head 3bbf165): only the FIRST
    // summary child of a details is its disclosure control and a
    // native Tab stop; a later summary is plain content unless it
    // is an editing host or carries a nonnegative tabindex.
    assert.match(code, /candidate\.tagName === "SUMMARY"/);
    assert.match(code, /parent instanceof HTMLDetailsElement/);
    assert.match(code, /firstSummary !== candidate/);
    // A visibility-hidden/collapsed image still has client rects
    // but its map's areas are not Tab stops, so the image-map
    // exception checks the image's computed visibility too.
    assert.match(code, /imageStyle\.visibility === "hidden"/);
    assert.match(code, /imageStyle\.visibility === "collapse"/);
  });
});

describe("dialogFocusRestore", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, "../..", "src", "widgets", "Dialog.tsx"), "utf8");
  const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

  test("Dialog is exported from the built internal components barrel", async () => {
    const dist: Record<string, any> = await import("../../dist/widgets/index.js");
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
});

describe("dialogModalRegistry", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const strip = (source: string) =>
    source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  const read = (relative: any) => strip(readFileSync(join(here, "../..", relative), "utf8"));
  const registry = read("src/widgets/modalRegistry.ts");
  const dialog = read("src/widgets/Dialog.tsx");
  const overlay = read("src/widgets/StepOverlay.tsx");

  test("the modal registry is internal — not exported from the built internal components barrel (#394)", async () => {
    const dist: Record<string, any> = await import("../../dist/widgets/index.js");
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
    assert.match(
      registry,
      /export const ModalLayerContext = createContext<symbol \| null>\(null\);/,
    );
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
    const registry: Record<string, any> = await import("../../dist/widgets/modalRegistry.js");
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
    const registry: Record<string, any> = await import("../../dist/widgets/modalRegistry.js");
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
    const registry: Record<string, any> = await import("../../dist/widgets/modalRegistry.js");
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
});
