/**
 * Contract + behavior tests for ChunkErrorBoundary
 * (design-system#411, lifted from Memorize's app shell, memorize#54).
 *
 * The contracts pinned here:
 * 1. The boundary is exported from the built views barrel
 *    (internal only — #438's final major removed the #411
 *    package-root export; that removal is pinned in
 *    test/packageExports.test.ts).
 * 2. Recovery is a FULL RELOAD, never a remount retry: React caches
 *    a rejected lazy import, so only `window.location.reload()`
 *    recovers from a stale-chunk 404. A caller-supplied `onReload`
 *    replaces the default, and with no recovery action the
 *    fallback renders no dead control.
 * 3. The fallback is the internal Alert (severity "error") alone —
 *    the "Reload the app" button renders inside the Alert as an
 *    Alert action, and only when a recovery action exists.
 *
 * Converted from source scans to runtime checks in #733
 * tranche 5: the behavior tests below already exercised the
 * built boundary directly, so the source scans were deleted —
 * the barrel export text (the built export is asserted at
 * runtime instead), the type-alias scan (types are enforced
 * by the TypeScript build, not a test — Stephen, 2026-11-20),
 * the guarded-reload source patterns (the default reload and
 * its no-window no-op are exercised at runtime below), and
 * the stories source scan (story coverage is not runtime-
 * observable from the built package).
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

// The boundary itself is a view (#470); the Alert and Button it
// composes are widgets, so the runtime surface spans both barrels.
const dist: Record<string, any> = {
  ...(await import("../../../dist/widgets/index.js")),
  ...(await import("../../../dist/views/index.js")),
};

test("ChunkErrorBoundary is exported from the built views barrel", () => {
  assert.equal(typeof dist.ChunkErrorBoundary, "function");
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
    onReload: () => { /* noop */ },
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

test("recovery is a full reload, replaceable by onReload", () => {
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
    webFallback.props.actions[0].onPress();
    assert.equal(reloads, 2, "the default Alert action reloads the page");
  } finally {
    delete (globalThis as any).window;
  }
  // Without onReload, the default reload is a no-op (and must not
  // throw) where there is no window to reload.
  const webLess = new dist.ChunkErrorBoundary({ children: "surface content" });
  webLess.handleReload();
});
