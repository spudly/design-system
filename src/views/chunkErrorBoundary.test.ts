/**
 * Contract + behavior tests for ChunkErrorBoundary
 * (design-system#411, lifted from Memorize's app shell, memorize#54).
 *
 * The contracts pinned here:
 * 1. The boundary is exported from the views barrel (and, per
 *    #411, from the package root — pinned in
 *    test/packageExports.test.ts).
 * 2. Its props/state are type aliases, not interfaces (the repo-wide
 *    rule, #214), and its only required prop is `children` — callers
 *    key the boundary by the active surface to clear the error.
 * 3. Recovery is a FULL RELOAD, never a remount retry: React caches
 *    a rejected lazy import, so only `window.location.reload()`
 *    recovers from a stale-chunk 404. The web reload is guarded
 *    (`isWeb` + `typeof window`) so non-web renders never touch
 *    `window`; a caller-supplied `onReload` replaces the default.
 * 4. The fallback is the internal Alert (severity "error") alone —
 *    no styling props, no app-domain concepts. The "Reload the app"
 *    button renders inside the Alert as an Alert action (content
 *    width, never a full-width sibling under the Alert; #471), and
 *    only when a recovery action exists (the web reload or a
 *    caller-supplied `onReload`); a no-op control is never shown.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
// The boundary itself is a view (#470); the Alert and Button it
// composes are widgets, so the runtime surface spans both barrels.
const dist: Record<string, any> = {
  ...(await import("../../dist/widgets/index.js")),
  ...(await import("../../dist/views/index.js")),
};

function codeOf(rel: string): string {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const boundary = codeOf("src/views/ChunkErrorBoundary.tsx");
const stories = readFileSync(join(root, "src/views/ChunkErrorBoundary.stories.tsx"), "utf8");

test("ChunkErrorBoundary is exported from the views barrel", () => {
  const barrel = readFileSync(join(root, "src/views/index.ts"), "utf8");
  assert.match(
    barrel,
    /export \{\s*ChunkErrorBoundary,\s*type ChunkErrorBoundaryProps,\s*type ChunkErrorBoundaryState,\s*\} from "\.\/ChunkErrorBoundary\.js";/,
  );
  assert.equal(typeof dist.ChunkErrorBoundary, "function");
});

test("props and state are type aliases with children as the core prop", () => {
  assert.match(boundary, /export type ChunkErrorBoundaryProps = \{/);
  assert.match(boundary, /export type ChunkErrorBoundaryState = \{/);
  assert.match(boundary, /children: ReactNode;/);
  assert.doesNotMatch(
    boundary,
    /\binterface\s+(ChunkErrorBoundaryProps|ChunkErrorBoundaryState)\b/,
  );
});

test("a rejected chunk flips the boundary into its failed state", () => {
  assert.deepEqual(dist.ChunkErrorBoundary.getDerivedStateFromError(new Error("chunk 404")), {
    failed: true,
  });
  // A caller-supplied recovery action stands in for the web
  // reload here, so the fallback renders its Alert action in
  // any environment (see the no-action test below).
  const instance = new dist.ChunkErrorBoundary({
    children: "surface content",
    onReload: () => {},
  });
  assert.equal(instance.render(), "surface content", "children render untouched before a failure");
  instance.state = { failed: true };
  const fallback = instance.render();
  assert.equal(fallback.type, dist.Alert);
  assert.equal(fallback.props.severity, "error");
  assert.equal(fallback.props.children, "This section failed to load.");
  assert.equal(fallback.props.actions.length, 1);
  assert.equal(fallback.props.actions[0].label, "Reload the app");
  assert.equal(typeof fallback.props.actions[0].onPress, "function");
});

test("no reload button renders when no recovery action exists", () => {
  // The test environment has no `window` (and no caller-supplied
  // onReload here), so there is nothing for a reload button to
  // do: the fallback is the Alert alone, never a dead control.
  const instance = new dist.ChunkErrorBoundary({ children: "surface content" });
  instance.state = { failed: true };
  const fallback = instance.render();
  assert.equal(fallback.type, dist.Alert);
  assert.equal(fallback.props.actions, undefined);
});

test("recovery is a guarded full reload, replaceable by onReload", () => {
  assert.match(boundary, /window\.location\.reload\(\)/);
  assert.match(boundary, /isWeb && typeof window !== "undefined"/);
  // No remount/setState retry: clearing the failed flag in place
  // would re-render the same rejected lazy import.
  assert.doesNotMatch(boundary, /setState\(\{\s*failed: false/);
  let calls = 0;
  const instance = new dist.ChunkErrorBoundary({
    children: "surface content",
    onReload: () => {
      calls += 1;
    },
  });
  instance.state = { failed: true };
  const fallback = instance.render();
  fallback.props.actions[0].onPress();
  assert.equal(calls, 1, "a caller-supplied onReload replaces the default reload");
  // The default path: with a web `window` present, handleReload
  // calls window.location.reload() exactly once.
  let reloads = 0;
  (globalThis as any).window = {
    location: {
      reload: () => {
        reloads += 1;
      },
    },
  };
  try {
    const webDefault = new dist.ChunkErrorBoundary({ children: "surface content" });
    webDefault.handleReload();
    assert.equal(reloads, 1, "the default recovery is window.location.reload()");
    // With a window present, the fallback offers the button too.
    webDefault.state = { failed: true };
    const webFallback = webDefault.render();
    assert.equal(webFallback.props.actions[0].label, "Reload the app");
  } finally {
    delete (globalThis as any).window;
  }
  // Without onReload, the default reload is a no-op (and must not
  // throw) where there is no window to reload.
  const webLess = new dist.ChunkErrorBoundary({ children: "surface content" });
  webLess.handleReload();
});

test("stories cover the loaded and failed-to-load states", () => {
  assert.match(stories, /title: "Views\/ChunkErrorBoundary"/);
  assert.match(stories, /export const Loaded: Story/);
  assert.match(stories, /export const FailedToLoad: Story/);
});
