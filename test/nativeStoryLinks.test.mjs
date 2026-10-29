/**
 * Contract test for on-device Storybook story-link routing
 * (spudly/design-system#300).
 *
 * The problem: stories pass web-style app hrefs ("/recipes/...",
 * "/meal-plans/...") to the DS href-form components — as literals,
 * as view-model props, and through href factories like
 * createHref. On web those are ordinary root-relative anchors.
 * On native, Tamagui's Anchor forwards the href verbatim to React
 * Native's Linking.openURL (verified in the compiled
 * tamagui/dist Anchor.native.js: a property access on the Linking
 * object at press time), and a scheme-less URL has no handler —
 * openURL rejects ("Unable to open URL") and the press does
 * nothing. The component contract is correct (real native apps
 * pass scheme-bearing URLs), and the convention is suite-wide, so
 * the fix is a single seam in the native Storybook HOST, not
 * per-story edits:
 *
 * - apps/storybook/storyLinks.ts (pure, import-free) resolves a
 *   pressed href: scheme-bearing URLs unchanged; scheme-less app
 *   paths rewritten to the host's browse URL with the original
 *   path attached (<browse>?path=<original>). The browse URL is
 *   the host's parameter, built by expo-linking's createURL:
 *   spudlyds://browse in a native build, exp://<host>/--/browse
 *   in Expo Go — which registers no custom scheme, so a fixed
 *   spudlyds: URL would dead-end there exactly like the original
 *   href (CodeRabbit finding on PR #303, verified against
 *   expo-linking's createURL/parse sources and the app's
 *   dependency list: no expo-dev-client, so `expo start` targets
 *   Expo Go by default).
 * - App.tsx wraps RN's Linking.openURL with it at module scope,
 *   recognizes browse in both delivered shapes (hostname in a
 *   native build, path in Expo Go), and logs a routed press as
 *   `DS LINK <path>` when the browse URL comes back into the host.
 *
 * The contract pinned here:
 * 1. storyLinks.ts stays import-free (its purity is what lets
 *    this test execute it directly) and exports the resolver +
 *    the openURL wrapper factory, taking the browse URL as a
 *    parameter — never a hardcoded scheme.
 * 2. The resolver's behavior on the href shapes the suite
 *    actually carries (root-relative paths, relative paths,
 *    fragments, https/mailto/tel, the host's own schemes), under
 *    both browse-URL forms.
 * 3. The wrapper's promise semantics: pass-through URLs keep the
 *    original openURL's behavior exactly (rejections included);
 *    rewritten URLs are absorbed if the platform still refuses.
 * 4. App.tsx installs the wrap on react-native's Linking (the
 *    object Tamagui calls — NOT expo-linking, which App.tsx uses
 *    for parsing/incoming URLs), builds the browse URL via
 *    expo-linking's createURL, and logs routed presses.
 * 5. Web isolation: the web Storybook config never references
 *    the module — web behavior is untouched by construction.
 * 6. Premise: stories/fixtures still pass root-relative hrefs.
 *    If the suite ever moves to scheme-bearing story hrefs,
 *    revisit this seam instead of just editing this test.
 *
 * Source scans strip comments first, like the other contract
 * tests here, so prose cannot satisfy or trip the patterns.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { createJiti } from "jiti";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const storyLinks = readCode("apps/storybook/storyLinks.ts");
const app = readCode("apps/storybook/App.tsx");

test("storyLinks.ts is import-free and exports the resolver + wrapper factory (#300)", () => {
  assert.doesNotMatch(storyLinks, /^\s*import\s/m);
  assert.doesNotMatch(storyLinks, /require\(/);
  assert.match(
    storyLinks,
    /export function resolveStoryLink\(url: string, browseUrl: string\): string/,
  );
  assert.match(
    storyLinks,
    /export function createStoryLinkOpenURL\(openURL: OpenURL, browseUrl: string\): OpenURL/,
  );
  // The browse base is the host's parameter, never a hardcoded
  // scheme: which form reaches the host depends on how it was
  // started (native build vs Expo Go — see the App.tsx pins).
  assert.match(storyLinks, /browseUrl\.includes\("\?"\) \? "&" : "\?"/);
  assert.match(storyLinks, /path=\$\{encodeURIComponent\(url\)\}/);
});

test("App.tsx wraps react-native's Linking.openURL at module scope (#300)", () => {
  assert.match(app, /import \{ Linking as RNLinking, LogBox, View \} from "react-native";/);
  assert.match(app, /import \{ createStoryLinkOpenURL \} from "\.\/storyLinks";/);
  assert.match(
    app,
    /RNLinking\.openURL = createStoryLinkOpenURL\(\s*RNLinking\.openURL\.bind\(RNLinking\),\s*Linking\.createURL\("browse"\),\s*\);/,
  );
  // The host's pre-existing deep-link handling still owns what
  // browse/capture URLs mean; browse is recognized in both of
  // its delivered shapes — hostname (native build) and path
  // (Expo Go, whose parse nulls the hostname).
  assert.match(app, /parsed\.hostname === "capture"/);
  assert.match(app, /parsed\.hostname === "browse" \|\| parsed\.path === "browse"\) return null;/);
});

test("App.tsx logs a routed story press as DS LINK <path> (#300)", () => {
  assert.match(app, /function logStoryLink\(url: string\)/);
  assert.match(
    app,
    /const isBrowse = parsed\.hostname === "browse" \|\| parsed\.path === "browse";/,
  );
  assert.match(app, /console\.log\(`DS LINK \$\{path\}`\)/);
  // Both entry points (cold start + runtime event) log.
  assert.equal(app.match(/logStoryLink\(url\);/g)?.length, 2);
});

test("web Storybook never references the native link routing (#300)", () => {
  for (const rel of [".storybook/main.ts", ".storybook/preview.tsx"]) {
    assert.doesNotMatch(readCode(rel), /storyLinks/, `${rel} must not load storyLinks`);
  }
});

test("premise: fixtures and stories still pass root-relative hrefs (#300)", () => {
  const fixtures = readFileSync(join(root, "src/pages/fixtures.ts"), "utf8");
  assert.match(fixtures, /href: "\//);
  let storyFilesWithAppHrefs = 0;
  for (const dir of ["src/pages", "src/components"]) {
    for (const file of readdirSync(join(root, dir))) {
      if (!file.endsWith(".stories.tsx")) continue;
      const source = readFileSync(join(root, dir, file), "utf8");
      if (/(?:href|createHref)[=:]\s*\{?\s*"\//.test(source)) storyFilesWithAppHrefs += 1;
    }
  }
  assert.ok(
    storyFilesWithAppHrefs >= 5,
    `expected the root-relative convention across many story files, found ${storyFilesWithAppHrefs}`,
  );
});

// Behavioral checks execute the real module through jiti — its
// import-freedom (pinned above) is what makes that possible in
// plain node, with no react-native runtime present.
let modulePromise;
function loadStoryLinks() {
  modulePromise ??= createJiti(import.meta.url).import(join(root, "apps/storybook/storyLinks.ts"));
  return modulePromise;
}

// The two browse-URL shapes expo-linking's createURL("browse")
// produces for this host: the registered scheme in a native
// build, and the exp://…/--/ form in Expo Go (which registers no
// custom scheme, so a spudlyds: URL would have no handler there).
const NATIVE_BROWSE = "spudlyds://browse";
const EXPO_GO_BROWSE = "exp://192.168.1.10:8081/--/browse";

test("resolveStoryLink routes app-style paths to the browse URL (#300)", async () => {
  const { resolveStoryLink } = await loadStoryLinks();
  assert.equal(
    resolveStoryLink("/recipes/tuscan-chicken", NATIVE_BROWSE),
    "spudlyds://browse?path=%2Frecipes%2Ftuscan-chicken",
  );
  assert.equal(
    resolveStoryLink("/meal-plans/new", NATIVE_BROWSE),
    "spudlyds://browse?path=%2Fmeal-plans%2Fnew",
  );
  assert.equal(
    resolveStoryLink("recipes/relative", NATIVE_BROWSE),
    "spudlyds://browse?path=recipes%2Frelative",
  );
  assert.equal(resolveStoryLink("", NATIVE_BROWSE), "spudlyds://browse?path=");
  assert.equal(
    resolveStoryLink("#ingredients", NATIVE_BROWSE),
    "spudlyds://browse?path=%23ingredients",
  );
  // The whole original path survives round-trip as one parameter.
  assert.equal(
    resolveStoryLink("/recipes/a b?x=1&y=2", NATIVE_BROWSE),
    "spudlyds://browse?path=%2Frecipes%2Fa%20b%3Fx%3D1%26y%3D2",
  );
  // The Expo Go browse form takes the same parameter.
  assert.equal(
    resolveStoryLink("/recipes/tuscan-chicken", EXPO_GO_BROWSE),
    "exp://192.168.1.10:8081/--/browse?path=%2Frecipes%2Ftuscan-chicken",
  );
});

test("resolveStoryLink passes scheme-bearing URLs through untouched (#300)", async () => {
  const { resolveStoryLink } = await loadStoryLinks();
  for (const url of [
    "https://example.com/recipes/mushroom-stroganoff",
    "mailto:legal@example.com",
    "tel:+17705550100",
    "spudlyds://browse",
    "spudlyds://capture/pages-eciperay-recipespage--default?theme=light_warmHarvest",
  ]) {
    assert.equal(resolveStoryLink(url, NATIVE_BROWSE), url, url);
    assert.equal(resolveStoryLink(url, EXPO_GO_BROWSE), url, url);
  }
});

test("createStoryLinkOpenURL: pass-through keeps the original promise exactly (#300)", async () => {
  const { createStoryLinkOpenURL } = await loadStoryLinks();
  const seen = [];
  const sentinel = Promise.resolve();
  const wrapped = createStoryLinkOpenURL((url) => {
    seen.push(url);
    return sentinel;
  }, NATIVE_BROWSE);
  assert.equal(wrapped("https://example.com/x"), sentinel);
  assert.deepEqual(seen, ["https://example.com/x"]);

  const failing = createStoryLinkOpenURL(
    () => Promise.reject(new Error("no handler")),
    NATIVE_BROWSE,
  );
  await assert.rejects(failing("mailto:legal@example.com"), /no handler/);
});

test("createStoryLinkOpenURL: app paths open rewritten; a refusal is absorbed (#300)", async () => {
  const { createStoryLinkOpenURL } = await loadStoryLinks();
  const seen = [];
  const wrapped = createStoryLinkOpenURL((url) => {
    seen.push(url);
    return Promise.resolve();
  }, NATIVE_BROWSE);
  await wrapped("/recipes/tuscan-chicken");
  assert.deepEqual(seen, ["spudlyds://browse?path=%2Frecipes%2Ftuscan-chicken"]);

  const refusing = createStoryLinkOpenURL(
    () => Promise.reject(new Error("cannot open")),
    NATIVE_BROWSE,
  );
  const logs = [];
  // The absorb path reports through console.log; capture it to
  // prove the refusal was logged rather than thrown.
  // eslint-disable-next-line no-console, no-undef -- capturing the module's log output is the assertion
  const originalLog = console.log;
  // eslint-disable-next-line no-console, no-undef -- see above
  console.log = (...args) => logs.push(args.join(" "));
  try {
    await refusing("/meal-plans/new");
  } finally {
    // eslint-disable-next-line no-console, no-undef -- see above
    console.log = originalLog;
  }
  assert.deepEqual(logs, ["DS LINK unresolved /meal-plans/new"]);
});
