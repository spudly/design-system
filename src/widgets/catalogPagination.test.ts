/**
 * Contract test for the shared catalog pagination pattern
 * (spudly/design-system#285): useCatalogPagination, used by both
 * catalog pages — RecipesPage and DiscoverPage.
 *
 * Background: VirtualizedList fires onEndReached once per
 * distinct content length (its _sentEndForContentLength
 * sentinel). When a fetched page adds no new visible rows and
 * nothing else changes the rendered height, the signal cannot
 * fire again and pagination stalls until the user scrolls away
 * and back, even though the host still has a continuation.
 * RecipesPage wired plain onEndReached={onLoadMore} (the stall
 * in full); DiscoverPage (#275) had a mounted-but-guarded
 * handler (no duplicates, no gate-induced stall) but the same
 * no-new-rows stall. The fix is ONE shared pattern, not two
 * local ones, so the catalogs cannot diverge:
 *
 * 1. Mount gate: the handler is undefined unless pagination may
 *    run (canPaginate + a host onLoadMore).
 * 2. Fetch guard: while isFetchingNextPage is set the handler
 *    stays mounted and swallows the request — no duplicate
 *    in-flight requests.
 * 3. Fetch-completion re-arm: on the isFetchingNextPage
 *    true-to-false edge, if the fetch began at the list's end
 *    and the item count is unchanged, onLoadMore fires once
 *    more — independent of any footer measurement, so
 *    consecutive no-new-rows pages paginate through with no
 *    scroll-away. A fetch that added rows clears the end latch
 *    (the list's own content-length change re-arms it).
 *
 * The source scans follow src/pages/DiscoverPage.test.ts: the repo
 * has no JS renderer for page components (they import
 * react-native), and the invariants are per-literal properties
 * of the source. Comments are stripped before scanning so prose
 * cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const pagesDir = join(root, "src", "pages");

function readCode(path: string) {
  return readFileSync(path, "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const hook = readCode(join(pagesDir, "useCatalogPagination.ts"));
const recipesPage = readCode(join(pagesDir, "RecipesPage.tsx"));
const discoverPage = readCode(join(pagesDir, "DiscoverPage.tsx"));
const boundedList = readCode(join(pagesDir, "BoundedList.tsx"));

test("the shared hook declares the catalog pagination contract", () => {
  assert.match(hook, /export type CatalogPaginationOptions = \{/);
  assert.match(hook, /onLoadMore\?: \(\(\) => void\) \| undefined;/);
  assert.match(hook, /isFetchingNextPage\?: boolean;/);
  assert.match(hook, /itemCount: number;/);
  assert.match(hook, /canPaginate\?: boolean;/);
  assert.match(hook, /canPaginate\?: boolean;/);
  assert.match(hook, /endReachedThreshold\?: number;/);
  assert.match(hook, /export type CatalogPagination = \{/);
  assert.match(hook, /onEndReached: \(\(\) => void\) \| undefined;/);
  assert.match(hook, /onScroll: \(event: NativeSyntheticEvent<NativeScrollEvent>\) => void;/);
  assert.match(hook, /onEndReachedThreshold: number;/);
  assert.match(hook, /onLayout: \(event: LayoutChangeEvent\) => void;/);
  assert.match(hook, /onContentSizeChange: \(width: number, height: number\) => void;/);
  assert.match(hook, /onScrollSignal: \(\) => void;/);
  assert.match(hook, /export function useCatalogPagination\(/);
  // Type aliases only (Stephen's code style, #214) — no interfaces.
  assert.ok(!/\binterface\b/.test(hook), "the hook must use type aliases, not interfaces");
});

test("the mount gate: the handler is undefined unless pagination may run", () => {
  assert.match(
    hook,
    /onEndReached: canPaginate && onLoadMore \? handleEndReached : undefined,/,
    "the returned handler must be gated on canPaginate and a host onLoadMore",
  );
});

test("the fetch guard: the mounted handler swallows requests during a fetch", () => {
  assert.match(
    hook,
    /const handleEndReached = \(\) => \{\s*if \(!paginationArmedRef\.current\) \{\s*suppressedEndRef\.current = true;\s*return;\s*\}\s*suppressedEndRef\.current = false;\s*fireEndReached\(\);\s*\};/,
    "the handler must record and swallow a pre-arming fire, then delegate an armed fire to the shared fire path",
  );
  assert.match(
    hook,
    /const fireEndReached = \(\) => \{\s*endReachedRef\.current = true;\s*if \(wasFetchingRef\.current && !isFetchingNextPage\) \{\s*completionClaimedRef\.current = true;\s*\}\s*if \(!isFetchingNextPage\) \{\s*onLoadMore\?\.\(\);\s*\}\s*\};/,
    "the shared fire must latch the end, claim an unprocessed completion (the web sentinel's recheck), and fire onLoadMore only when no fetch is in flight — so no duplicates while a fetch is in flight (#570 case c)",
  );
});

test("the re-arm: a no-new-rows fetch completion at the end re-fires onLoadMore", () => {
  // The fetch-start snapshot: the item count is captured on the
  // rising edge of isFetchingNextPage.
  assert.match(
    hook,
    /if \(isFetchingNextPage\) \{\s*if \(!wasFetchingRef\.current\) \{\s*countAtFetchStartRef\.current = itemCount;\s*\}\s*\}/,
    "the hook must snapshot the item count when a fetch begins",
  );
  // A fetch that changed the row count clears the end latch —
  // the list's own content-length change re-arms its signal.
  assert.match(
    hook,
    /if \(countAtFetchStart !== null && itemCount !== countAtFetchStart\) \{\s*endReachedRef\.current = false;\s*\}/,
    "a fetch that added rows must clear the end latch instead of chaining",
  );
  // The re-arm itself: same count, still latched at the end,
  // gate open — fire exactly once more via the latest callback.
  assert.match(
    hook,
    /else if \(\s*!completionClaimed &&\s*canPaginate &&\s*endReachedRef\.current &&\s*countAtFetchStart !== null\s*\) \{\s*onLoadMoreRef\.current\?\.\(\);\s*\}/,
    "a no-new-rows completion at the end must re-fire onLoadMore once — unless the web sentinel's recheck already claimed the completion",
  );
  // Edge bookkeeping: the previous-fetching ref is updated on
  // every pass so the edge fires once per completed fetch.
  assert.match(hook, /wasFetchingRef\.current = isFetchingNextPage;/);
});

test("the end latch is live: scroll metrics set and clear it with the shared threshold", () => {
  // The scroll handler recomputes the latch from the native
  // scroll metrics: distance from the end within the threshold
  // fraction of the visible length — the list's own test. A
  // scroll away during a fetch therefore clears the latch and
  // the completion does not chain in the background.
  assert.match(
    hook,
    /const handleScroll = \(event: NativeSyntheticEvent<NativeScrollEvent>\) => \{\s*const \{ contentOffset, contentSize, layoutMeasurement \} = event\.nativeEvent;\s*if \(contentOffset\.y > 0 \|\| contentSize\.height > layoutMeasurement\.height\) \{\s*paginationArmedRef\.current = true;\s*\}\s*const distanceFromEnd = contentSize\.height - contentOffset\.y - layoutMeasurement\.height;\s*endReachedRef\.current = distanceFromEnd <= endReachedThreshold \* layoutMeasurement\.height;\s*\};/,
    "the scroll handler must arm pagination on a real scroll (#570) and recompute the end latch from the scroll metrics",
  );
  // The callback ref is written inside the effect, never during
  // render, so a discarded render cannot leak its callback.
  assert.match(hook, /useEffect\(\(\) => \{\s*onLoadMoreRef\.current = onLoadMore;/);
  assert.equal(
    hook.match(/onLoadMoreRef\.current = onLoadMore;/g)?.length,
    1,
    "the callback ref must be assigned exactly once — inside the effect, never during render",
  );
});

// #547: the two catalogs are ONE page component — RecipesPage
// implements both modes and DiscoverPage delegates to it — so
// the per-page pins below run against RecipesPage's two modes,
// plus a delegation pin on the wrapper.
test("the unified catalog page calls the shared hook for both modes (#547)", () => {
  assert.match(
    recipesPage,
    /import \{ useCatalogPagination \} from "\.\/useCatalogPagination\.js";/,
    "RecipesPage must import the shared hook",
  );
  assert.match(
    recipesPage,
    /const \{\s*onEndReached,\s*onScroll,\s*onEndReachedThreshold,\s*onLayout: discoveryLayout,\s*onContentSizeChange: discoveryContentSizeChange,\s*onScrollSignal: discoveryScrollSignal,\s*\} = useCatalogPagination\(\{/,
    "the signed-in mode takes the hook's handlers and threshold (plus the #570 guard signals)",
  );
  assert.match(
    recipesPage,
    /const publicPagination = useCatalogPagination\(\{/,
    "the public mode calls the same shared hook (#547)",
  );
  assert.match(
    recipesPage,
    /const ownPagination = useCatalogPagination\(\{/,
    "the signed-in mode's own section runs its own instance of the same shared hook (#559)",
  );
  assert.match(
    recipesPage,
    /const handleListEndReached = \(\) => \{\s*onEndReached\?\.\(\);\s*ownPagination\.onEndReached\?\.\(\);\s*\};/,
    "the signed-in end-reached signal fans out to both instances (#559)",
  );
  assert.equal(
    recipesPage.match(/onLoadMore,\s*isFetchingNextPage,/g)?.length,
    2,
    "both modes pass onLoadMore and isFetchingNextPage to the hook",
  );
  assert.ok(
    !recipesPage.includes("handleEndReached"),
    "the page must not define a local end-reached handler — the pattern is shared (its fan-out handler is handleListEndReached, #559)",
  );
  assert.match(
    discoverPage,
    /<RecipesPage variant="public"/,
    "DiscoverPage delegates to the unified page's public variant (#547)",
  );
});

test("the unified page wires the hook's handlers to its lists and its web sentinel (#547)", () => {
  // Signed-in mode wires the COMBINED handlers (#559): the list
  // signal fans out to both sections' pagination instances.
  assert.match(recipesPage, /onEndReached=\{handleListEndReached\}/);
  assert.match(recipesPage, /onScroll=\{handleListScroll\}/);
  assert.match(recipesPage, /onEndReachedThreshold=\{onEndReachedThreshold\}/);
  assert.match(recipesPage, /onEndReached=\{publicPagination\.onEndReached\}/);
  assert.match(recipesPage, /onScroll=\{publicPagination\.onScroll\}/);
  // Web has no list: the scroll sentinel drives the same
  // guarded handler (#547, no windowing on web) — in signed-in
  // mode the combined handler, rechecked on either section's
  // fetch state (#559).
  // Per-section sentinel wiring (#559): the signed-in mode
  // passes each section's own handler and fetching flag; the
  // public mode passes its single section the same way.
  assert.match(
    recipesPage,
    /onVisible: onEndReached,\s*isFetchingNextPage/,
    "the discovery section passes its own handler and fetching flag to the sentinel",
  );
  assert.match(
    recipesPage,
    /onVisible: ownPagination\.onEndReached,\s*isFetchingNextPage: isFetchingNextOwnPage/,
    "the own section passes its own handler and fetching flag to the sentinel",
  );
  assert.match(
    recipesPage,
    /onVisible: publicPagination\.onEndReached,\s*isFetchingNextPage/,
    "the public mode passes its single section to the sentinel",
  );
  assert.ok(
    !recipesPage.includes("onVisible={handleListEndReached}"),
    "the web sentinel must not use the combined handler (#559)",
  );
});

test("each mode counts the rows its continuation extends", () => {
  // The public mode's continuation extends its one list; the
  // signed-in mode's continuations extend their own sections,
  // so each instance counts its own section's rows (#415, #559).
  assert.match(recipesPage, /itemCount: publicRecipes !== undefined \? publicRecipes\.length : 0,/);
  assert.match(
    recipesPage,
    /itemCount: discoveryRecipes !== undefined \? discoveryRecipes\.length : 0,/,
  );
  assert.match(recipesPage, /itemCount: ownRecipes\.length,/);
});

test("each mode's mount gate matches its states", () => {
  // Signed-in: the two instances gate on their OWN section's
  // states only (#559 decoupled the discovery gate from the
  // own section's first load).
  assert.match(
    recipesPage,
    /canPaginate:\s*hasDiscovery &&\s*!loadingDiscovery && !discoveryErrorMessage && !discoveryLoadMoreErrorMessage,\s*\}\);/,
  );
  assert.match(
    recipesPage,
    /canPaginate: !loadingOwn && !ownErrorMessage && !ownLoadMoreErrorMessage,\s*\}\);/,
  );
  assert.match(
    recipesPage,
    /canPaginate: variant === "public" && !publicLoading && !publicErrorMessage,/,
  );
});

test("RecipesPage no longer wires the plain stalling handler", () => {
  assert.ok(
    !recipesPage.includes("onEndReached={onLoadMore}"),
    "plain onEndReached={onLoadMore} is the #285 stall — it must not return",
  );
});

test("both modes keep the loading-more footer on isFetchingNextPage", () => {
  const footerPattern =
    /ListFooterComponent=\{isFetchingNextPage \? <LoadingDiscoveryRows \/> : undefined\}/g;
  assert.equal(
    recipesPage.match(footerPattern)?.length,
    1,
    "the public mode's list footer is the skeleton discovery rows, keyed off isFetchingNextPage (#278 tranche 4)",
  );
  // Signed-in mode: the skeleton own rows, suppressed while the
  // discovery load-more error row shows — the error wins over
  // the loading-more footer (#559).
  const signedInFooterPattern =
    /ListFooterComponent=\{\s*isFetchingNextPage && !discoveryLoadMoreErrorMessage \? <LoadingOwnRows \/> : undefined\s*\}/g;
  assert.equal(
    recipesPage.match(signedInFooterPattern)?.length,
    1,
    "the signed-in mode's list footer is the skeleton own rows, yielding to the discovery load-more error",
  );
});

test("the web sentinel rechecks when pagination opens and when a fetch completes (PR #556)", () => {
  // The sentinel tracks its own visibility: the observer's
  // verdict (and the fallback's near-bottom computation) lands
  // in a ref, because no new observer callback arrives while
  // the sentinel simply stays within the 400px margin.
  assert.match(recipesPage, /const visibleRef = useRef\(false\);/);
  assert.match(recipesPage, /visibleRef\.current = visible;/);
  assert.match(recipesPage, /visibleRef\.current = nearBottom;/);
  // Per-section recheck (#559): availability and fetching are
  // tracked per section, a fetching change clears only that
  // section's latch, and a transition rechecks only the
  // section that became available / whose fetch changed.
  assert.match(recipesPage, /const prevAvailableRefs = useRef<boolean\[\]>\(/);
  assert.match(recipesPage, /const prevFetchingRefs = useRef<boolean\[\]>\(/);
  assert.match(
    recipesPage,
    /const fetchingChanged = prevFetchingRefs\.current\[index\] !== fetching;/,
    "the recheck must track the previous fetching state per section so only real transitions fire",
  );
  assert.match(
    recipesPage,
    /const availableChanged = prevAvailableRefs\.current\[index\] !== available;/,
    "the recheck must track the previous availability per section",
  );
  assert.match(
    recipesPage,
    /if \(fetchingChanged\) \{\s*requestedRefs\.current\[index\] = false;\s*\}/,
    "a fetching change must clear only that section's latch",
  );
  assert.match(
    recipesPage,
    /if \(\s*\(fetchingChanged \|\| availableChanged\) &&\s*visibleRef\.current &&\s*hasScrolledRef\.current\s*\) \{\s*fireSection\(index\);\s*\}/,
    "the sentinel must recheck only the changed section on its transitions — and not on mount or before any scroll (#570)",
  );
  // Deduplication (round 2), per section: every notification
  // path shares each section's latched fire, so the fallback's
  // mount-time check and the recheck cannot both request the
  // same section's continuation before the host commits its
  // fetching flag — including hosts that omit the flag.
  assert.match(recipesPage, /const requestedRefs = useRef<boolean\[\]>\(\[\]\);/);
  assert.match(
    recipesPage,
    /const fireSection = \(index: number\) => \{\s*const handler = sectionsRef\.current\[index\]\?\.onVisible;\s*if \(!handler \|\| requestedRefs\.current\[index\]\) return;\s*requestedRefs\.current\[index\] = true;\s*handler\(\);\s*\};/,
    "the per-section latched fire must no-op without that section's handler (gated absence must not latch) and after that section's one request",
  );
  assert.match(
    recipesPage,
    /requestedRefs\.current = sectionsRef\.current\.map\(\(\) => false\);/,
    "leaving the margin clears every section's latch",
  );
  // Coordination: the hook carries the completion-claim ref the
  // handler sets and the re-arm consults, so a completion is
  // requested exactly once from either path.
  assert.match(hook, /const completionClaimedRef = useRef\(false\);/);
  assert.match(hook, /const completionClaimed = completionClaimedRef\.current;/);
  assert.match(hook, /completionClaimedRef\.current = false;/);
});

// #570: the initial-fire guard — a mount-time end-reached fire
// (zero/unknown layout, no scroll) must not fetch page two.
test("the initial-fire guard: no onLoadMore before any scroll or layout signal (#570a)", () => {
  assert.match(hook, /const paginationArmedRef = useRef\(false\);/);
  assert.match(
    hook,
    /const handleEndReached = \(\) => \{\s*if \(!paginationArmedRef\.current\) \{\s*suppressedEndRef\.current = true;\s*return;\s*\}/,
    "an end-reached fire before arming is swallowed before any latch or fetch (it is only remembered for a later layout arming, #570e)",
  );
  assert.ok(
    !/paginationArmedRef\.current = true;\s*endReachedRef/.test(hook),
    "the swallowed mount-time fire must not latch a fetch",
  );
});

test("arming: a real scroll or content exceeding the viewport arms pagination (#570b)", () => {
  assert.match(
    hook,
    /if \(contentOffset\.y > 0 \|\| contentSize\.height > layoutMeasurement\.height\) \{\s*paginationArmedRef\.current = true;\s*\}/,
    "the scroll handler arms on a non-zero offset or on content longer than the visible length",
  );
  assert.match(
    hook,
    /const armIfContentExceedsVisible = \(\) => \{\s*if \(visibleLengthRef\.current <= 0 \|\| contentLengthRef\.current <= visibleLengthRef\.current\) \{\s*return;\s*\}\s*paginationArmedRef\.current = true;/,
    "the layout signals arm only when laid-out content exceeds the visible length (zero/unknown layout never arms)",
  );
  assert.match(
    hook,
    /const handleLayout = \(event: LayoutChangeEvent\) => \{\s*visibleLengthRef\.current = event\.nativeEvent\.layout\.height;\s*armIfContentExceedsVisible\(\);\s*\};/,
  );
  assert.match(
    hook,
    /const handleContentSizeChange = \(_width: number, height: number\) => \{\s*contentLengthRef\.current = height;\s*armIfContentExceedsVisible\(\);\s*\};/,
  );
  assert.match(
    hook,
    /const handleScrollSignal = \(\) => \{\s*paginationArmedRef\.current = true;\s*\};/,
    "the web sentinel's real-scroll signal arms the same guard",
  );
  // Once armed, the handler fires exactly once per genuine
  // end-reached signal (the fetch guard test above pins the
  // single onLoadMore call inside the armed handler).
});

test("BoundedList forwards the layout signals to the hook (#570)", () => {
  assert.match(boundedList, /onLayout\?: \(\(event: LayoutChangeEvent\) => void\) \| undefined;/);
  assert.match(
    boundedList,
    /onContentSizeChange\?: \(\(width: number, height: number\) => void\) \| undefined;/,
  );
  assert.match(boundedList, /\.\.\.\(onLayout !== undefined \? \{ onLayout \} : null\)/);
  assert.match(
    boundedList,
    /\.\.\.\(onContentSizeChange !== undefined \? \{ onContentSizeChange \} : null\)/,
  );
});

test("the pages wire the guard signals through their lists and sentinel (#570)", () => {
  assert.match(
    recipesPage,
    /const handleListLayout = \(event: LayoutChangeEvent\) => \{\s*discoveryLayout\(event\);\s*ownPagination\.onLayout\(event\);\s*\};/,
    "the signed-in list's layout signal fans out to both instances",
  );
  assert.match(
    recipesPage,
    /const handleListContentSizeChange = \(width: number, height: number\) => \{\s*discoveryContentSizeChange\(width, height\);\s*ownPagination\.onContentSizeChange\(width, height\);\s*\};/,
  );
  assert.match(recipesPage, /onLayout=\{handleListLayout\}/);
  assert.match(recipesPage, /onContentSizeChange=\{handleListContentSizeChange\}/);
  assert.match(recipesPage, /onLayout=\{publicPagination\.onLayout\}/);
  assert.match(recipesPage, /onContentSizeChange=\{publicPagination\.onContentSizeChange\}/);
  assert.match(recipesPage, /onScrollSignal: publicPagination\.onScrollSignal,/);
  assert.match(recipesPage, /onScrollSignal: discoveryScrollSignal,/);
  assert.match(recipesPage, /onScrollSignal: ownPagination\.onScrollSignal,/);
});

test("the web sentinel distinguishes mount-time from post-scroll visibility (#570)", () => {
  assert.match(recipesPage, /const hasScrolledRef = useRef\(false\);/);
  assert.match(
    recipesPage,
    /const markScrolled = \(\) => \{\s*hasScrolledRef\.current = true;\s*sectionsRef\.current\.forEach\(\(section\) => \{\s*section\.onScrollSignal\?\.\(\);\s*\}\);\s*\};/,
    "a window scroll marks the sentinel scrolled and routes the signal into each section's hook guard",
  );
  assert.match(
    recipesPage,
    /if \(visible\) \{\s*if \(hasScrolledRef\.current\) \{\s*fireAllSections\(\);\s*\}\s*\}/,
    "the observer fires only on post-scroll visibility — mount-time visibility is not a request",
  );
  assert.match(
    recipesPage,
    /if \(window\.scrollY > 0\) \{\s*markScrolled\(\);\s*\}/,
    "the fallback's near-bottom check counts only a scrolled page (zero metrics on mount never fire)",
  );
});

test("a suppressed end signal is re-evaluated when layout arms pagination (#570e)", () => {
  // The list's sentinel records the content length it fired
  // for and may not fire again for that length: if content
  // first fits (fire swallowed) and the viewport later shrinks
  // so a layout signal arms pagination, the suppressed signal
  // must be re-evaluated through the shared fire path —
  // subject to the same fetch guards — or pagination sticks.
  assert.match(hook, /const suppressedEndRef = useRef\(false\);/);
  assert.match(
    hook,
    /if \(\s*suppressedEndRef\.current &&\s*canPaginate &&\s*onLoadMore &&\s*contentLengthRef\.current - visibleLengthRef\.current <=\s*endReachedThreshold \* visibleLengthRef\.current\s*\) \{\s*suppressedEndRef\.current = false;\s*fireEndReached\(\);\s*\}/,
    "the layout arming must re-evaluate a suppressed end signal exactly once, through the shared fire path — only while the mount gate is open and the laid-out end is still within the end threshold of the visible length",
  );
});

test("the no-new-rows re-arm is untouched by the guard: it still chains exactly once (#570d)", () => {
  // The re-arm effect carries no arming condition — an armed
  // end latch plus an unchanged count re-fires exactly once
  // per completion (the re-arm test above pins its shape).
  assert.ok(
    !/else if \(\s*!completionClaimed &&\s*canPaginate &&\s*paginationArmedRef/.test(hook),
    "the completion re-arm must not gain an arming condition",
  );
});
