/**
 * Contract test for PinnedHeaderShell (spudly/design-system#119,
 * the meals & planning tranche): the page shell extracted from
 * MealsHubPage's plans tab — a header pinned above a
 * self-scrolling content region.
 *
 * The pins hold the shell's shape: it paints the page
 * background (gray step 1) at full height, the header block
 * carries the page inset (16px sides and top, no bottom inset —
 * the content region owns its own top spacing), and the shell
 * renders no scroller of its own (the #188 constraint: the
 * content scrolls itself, never nested inside the shell's
 * scroll view). The root frame is platform-split (#705): the
 * bounded `flex: 1` frame is native-only — on web the root
 * only grows (`flexGrow: 1`), so content height is
 * content-driven inside a footer shell and the footer lands
 * below the last content item (#547).
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "../..", "src", "widgets", "PinnedHeaderShell.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("PinnedHeaderShell is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  assert.equal(
    typeof dist.PinnedHeaderShell,
    "function",
    "PinnedHeaderShell must be exported from the internal components barrel",
  );
});

test("the shell paints the page background and insets the header block", () => {
  assert.match(code, /backgroundColor=\{tokens\.colors\.gray\.gray1\}/);
  assert.match(code, /<YStack paddingHorizontal="\$4" paddingTop="\$4">/);
});

test("the bounded root frame is native-only — web grows in document flow (#705)", () => {
  assert.match(code, /isWeb \? \{ flexGrow: 1 \} : \{ flex: 1 \}/);
  assert.ok(
    !/<YStack\b[^>]*\bflex=\{1\}/.test(code),
    "the root must not carry an unconditional bounded flex: 1 frame",
  );
});

test("the shell renders no scroller — the content region scrolls itself (#188)", () => {
  assert.ok(!code.includes("ScrollView"), "PinnedHeaderShell must not render a ScrollView");
  assert.ok(!code.includes("ScrollRegion"), "PinnedHeaderShell must not nest a scroll region");
  assert.match(code, /header: ReactNode;/);
  assert.match(code, /children: ReactNode;/);
});

const storySource = readFileSync(join(here, "PinnedHeaderShell.stories.tsx"), "utf8");
const storyCode = storySource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("the story demonstrates the pinning: bound frame, overflowing content, header outside the scroller (#723)", () => {
  // The frame's height binds, so the content region has a
  // definite height to overflow.
  assert.match(storyCode, /height=\{480\}/);
  // The content decisively overflows the frame — with too few
  // lines nothing scrolls and the pinning is unobservable.
  const count = storyCode.match(/length: (\d+)/);
  assert.ok(count, "the story must generate its content lines from a length");
  assert.ok(
    Number(count[1]) >= 25,
    `the story's content must overflow the 480px frame (got ${count?.[1]} lines)`,
  );
  // The story composes a bounded scroller as the shell's
  // children — the self-scrolling page a real consumer
  // composes — while the header is passed as the shell's
  // header prop, outside that scroller.
  assert.match(storyCode, /<ScrollView flex=\{1\}>/);
  assert.ok(
    storyCode.indexOf("header={") < storyCode.indexOf("<ScrollView"),
    "the header must be composed outside the story's scroller",
  );
});
