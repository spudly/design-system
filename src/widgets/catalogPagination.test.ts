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
    /const handleEndReached = \(\) => \{\s*endReachedRef\.current = true;\s*if \(wasFetchingRef\.current && !isFetchingNextPage\) \{\s*completionClaimedRef\.current = true;\s*\}\s*if \(!isFetchingNextPage\) \{\s*onLoadMore\?\.\(\);\s*\}\s*\};/,
    "the handler must latch the end, claim an unprocessed completion (the web sentinel's recheck), and fire onLoadMore only when no fetch is in flight",
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
    /const handleScroll = \(event: NativeSyntheticEvent<NativeScrollEvent>\) => \{\s*const \{ contentOffset, contentSize, layoutMeasurement \} = event\.nativeEvent;\s*const distanceFromEnd = contentSize\.height - contentOffset\.y - layoutMeasurement\.height;\s*endReachedRef\.current = distanceFromEnd <= endReachedThreshold \* layoutMeasurement\.height;\s*\};/,
    "the scroll handler must recompute the end latch from the scroll metrics",
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
    /const \{ onEndReached, onScroll, onEndReachedThreshold \} = useCatalogPagination\(\{/,
    "the signed-in mode takes the hook's handlers and threshold",
  );
  assert.match(
    recipesPage,
    /const publicPagination = useCatalogPagination\(\{/,
    "the public mode calls the same shared hook (#547)",
  );
  assert.equal(
    recipesPage.match(/onLoadMore,\s*isFetchingNextPage,/g)?.length,
    2,
    "both modes pass onLoadMore and isFetchingNextPage to the hook",
  );
  assert.ok(
    !recipesPage.includes("handleEndReached"),
    "the page must not define a local end-reached handler — the pattern is shared",
  );
  assert.match(
    discoverPage,
    /<RecipesPage variant="public"/,
    "DiscoverPage delegates to the unified page's public variant (#547)",
  );
});

test("the unified page wires the hook's handlers to its lists and its web sentinel (#547)", () => {
  assert.match(recipesPage, /onEndReached=\{onEndReached\}/);
  assert.match(recipesPage, /onScroll=\{onScroll\}/);
  assert.match(recipesPage, /onEndReachedThreshold=\{onEndReachedThreshold\}/);
  assert.match(recipesPage, /onEndReached=\{publicPagination\.onEndReached\}/);
  assert.match(recipesPage, /onScroll=\{publicPagination\.onScroll\}/);
  // Web has no list: the scroll sentinel drives the same
  // guarded handler (#547, no windowing on web).
  assert.match(
    recipesPage,
    /<WebScrollSentinel\s+isFetchingNextPage=\{isFetchingNextPage\}\s+onVisible=\{onEndReached\}\s*\/>/,
  );
  assert.match(
    recipesPage,
    /<WebScrollSentinel\s+isFetchingNextPage=\{isFetchingNextPage\}\s+onVisible=\{publicPagination\.onEndReached\}\s*\/>/,
  );
});

test("each mode counts the rows its continuation extends", () => {
  // The public mode's continuation extends its one list; the
  // signed-in mode's continuation is its discovery section's,
  // so it counts the discovery rows (#415).
  assert.match(recipesPage, /itemCount: publicRecipes !== undefined \? publicRecipes\.length : 0,/);
  assert.match(
    recipesPage,
    /itemCount: discoveryRecipes !== undefined \? discoveryRecipes\.length : 0,/,
  );
});

test("each mode's mount gate matches its states", () => {
  assert.match(
    recipesPage,
    /canPaginate:\s*hasDiscovery && !loadingOwn && !loadingDiscovery && !discoveryErrorMessage,\s*\}\);/,
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
    /ListFooterComponent=\{\s*isFetchingNextPage \? \(\s*<Center>\s*<Spinner label="Loading" \/>\s*<\/Center>\s*\) : undefined\s*\}/g;
  assert.equal(
    recipesPage.match(footerPattern)?.length,
    2,
    "both native modes' list footers are the shared Center + Spinner composition, keyed off isFetchingNextPage",
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
  // The recheck fires the latest handler once per transition:
  // pagination becoming available (handler absent -> present)
  // and a fetch completing (isFetchingNextPage falling).
  assert.match(recipesPage, /const paginationAvailable = onVisible !== undefined;/);
  assert.match(
    recipesPage,
    /const fetchingChanged = prevFetchingRef\.current !== isFetchingNextPage;/,
    "the recheck must track the previous fetching state so only real transitions fire",
  );
  assert.match(
    recipesPage,
    /if \(\(fetchingChanged \|\| availableChanged\) && visibleRef\.current\) \{\s*fire\(\);\s*\}/,
    "the sentinel must recheck its visibility on pagination-available and fetch-completion transitions — and not on mount",
  );
  // Deduplication (round 2): every notification path shares
  // ONE latched fire, so the fallback's mount-time check and
  // the recheck cannot both request the same continuation
  // before the host commits isFetchingNextPage — including
  // hosts that omit the fetching flag entirely.
  assert.match(recipesPage, /const requestedRef = useRef\(false\);/);
  assert.match(
    recipesPage,
    /const fire = \(\) => \{\s*if \(!callbackRef\.current \|\| requestedRef\.current\) return;\s*requestedRef\.current = true;\s*callbackRef\.current\(\);\s*\};/,
    "the latched fire must no-op without a handler (gated absence must not latch) and after this episode's one request",
  );
  assert.match(
    recipesPage,
    /if \(fetchingChanged\) \{\s*requestedRef\.current = false;\s*\}/,
    "the latch must clear when the fetch state changes",
  );
  assert.equal(
    recipesPage.match(/\} else \{\s*requestedRef\.current = false;\s*\}/g)?.length,
    2,
    "the latch must clear when the sentinel leaves the margin (observer and fallback paths)",
  );
  // Coordination: the hook carries the completion-claim ref the
  // handler sets and the re-arm consults, so a completion is
  // requested exactly once from either path.
  assert.match(hook, /const completionClaimedRef = useRef\(false\);/);
  assert.match(hook, /const completionClaimed = completionClaimedRef\.current;/);
  assert.match(hook, /completionClaimedRef\.current = false;/);
});
