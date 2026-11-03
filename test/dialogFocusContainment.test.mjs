/**
 * Contract test for Dialog focus containment with no focusable
 * content (spudly/design-system#391).
 *
 * The primitive's focus scope wraps Tab between the dialog's
 * focusable descendants, but a dialog with none (the WithoutActions
 * story: text only) left sequential navigation free to escape to
 * the opener behind the overlay — forward Tab reached it on every
 * second press, and a first Shift+Tab landed on it directly
 * (Manual Storybook QA on PR #386, verified pre-existing on heads
 * d2abcf5 and a385b68). The pins hold the fix in the Dialog
 * component itself: while open on web, a capture-phase keydown
 * listener swallows Tab only when the content holds no focusable
 * element, and pulls outside focus back onto the scope's landing
 * wrapper inside the dialog.
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
  // the modal registry (dialogModalRegistry.test.mjs, #394);
  // this scan covers FOREIGN native frames no DS layer records.
  // Portal frames mount in open order, so a frame followed in
  // document order by another dialog frame is covered.
  assert.match(code, /document\.querySelectorAll\("dialog"\)/);
  assert.match(code, /frame\.compareDocumentPosition\(other\) & Node\.DOCUMENT_POSITION_FOLLOWING/);
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
  // The mechanisms the registry replaced are gone: no
  // registration-order stack, no opener-derived host record.
  assert.doesNotMatch(code, /openDialogStack/);
  assert.doesNotMatch(code, /hostModalRef/);
  // What survives is the stand-down for a FOREIGN aria-modal
  // element only (CodeRabbit review on PR #398): a host-built
  // modal has no registry record and no native frame, so focus
  // remains its only signal — with DS layers exempt through
  // their registered roots instead of the old host record.
  assert.match(
    code,
    /const foreignModal = focusedElement\.closest\('\[role="dialog"\]\[aria-modal="true"\]'\)/,
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
