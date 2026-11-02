/**
 * Contract test for Dialog focus restoration (spudly/design-system#385).
 *
 * The DS Dialog has no trigger element of its own — the host renders its
 * own trigger and flips the controlled `open` prop — and Tamagui cancels
 * its fallback focus restoration while trying to focus that missing
 * trigger, so a dismissed dialog left keyboard focus nowhere. The pins
 * hold the fix in the Dialog component itself: on web it captures the
 * element that held focus when the dialog opened and returns focus to
 * it on close (and on unmount while open), only while that element is
 * still in the document and focusable.
 *
 * The lifecycle is pinned to the primitive's autofocus events on
 * purpose (review round on PR #386): the FocusScope inside Tamagui's
 * Dialog dispatches `onOpenAutoFocus` from its committed mount effect,
 * after reading document.activeElement but before moving focus into
 * the dialog, and `onCloseAutoFocus` from its cleanup, which runs on
 * every close path and on unmount while open. Capturing during render
 * could leave a stale target from an abandoned render, and restoring
 * from this component's own mount-effect cleanup loses the opener to
 * a StrictMode effect replay — so the pins also forbid both of those
 * shapes.
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

test("the element focused at open is captured in the committed onOpenAutoFocus event, web only (#385)", () => {
  assert.match(code, /const previouslyFocusedRef = useRef<HTMLElement \| null>\(null\);/);
  assert.match(code, /const handleOpenAutoFocus = \(\) => \{/);
  assert.match(code, /if \(!isWeb \|\| typeof document === "undefined"\) \{\s+return;\s+\}/);
  assert.match(code, /const activeElement = document\.activeElement as HTMLElement \| null;/);
  assert.match(code, /activeElement !== document\.body/);
  assert.match(code, /previouslyFocusedRef\.current = activeElement;/);
  assert.match(code, /onOpenAutoFocus=\{handleOpenAutoFocus\}/);
});

test("focus returns to the captured element in onCloseAutoFocus, when it is still available (#385)", () => {
  assert.match(code, /const handleCloseAutoFocus = \(\) => \{/);
  assert.match(code, /document\.contains\(previouslyFocused\)/);
  assert.match(code, /typeof previouslyFocused\.focus === "function"/);
  assert.match(code, /previouslyFocused\.focus\(\);/);
  assert.match(code, /onCloseAutoFocus=\{handleCloseAutoFocus\}/);
  assert.equal((code.match(/previouslyFocusedRef\.current = null;/g) ?? []).length, 1);
});

test("no render-time capture and no own-effect restore: nothing can go stale or lose the opener to a StrictMode replay (#385)", () => {
  assert.doesNotMatch(code, /if \(isWeb && open/);
  assert.doesNotMatch(code, /useEffect/);
});
