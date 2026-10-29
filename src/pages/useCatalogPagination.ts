import { useEffect, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

/**
 * useCatalogPagination (#285): the shared pagination pattern for
 * the two catalog pages, RecipesPage and DiscoverPage. The two
 * catalogs deliberately share one pagination contract; this hook
 * is that contract, implemented once so the pages cannot drift.
 *
 * Why a hook at all: VirtualizedList fires `onEndReached` once
 * per distinct content length — it records the length when the
 * callback fires and suppresses later fires until the content
 * length changes (or the user scrolls out of the end threshold,
 * which resets the sentinel). When a fetched page adds NO new
 * visible rows (every item filtered out client-side, or all
 * duplicates) and nothing else changes the rendered height, the
 * end-reached signal cannot fire again: pagination stalls until
 * the user scrolls away and back, even though the host still
 * has a continuation. Neither catalog may rely on the footer
 * spinner's layout to re-arm the signal — a fetch can complete
 * before that temporary layout is ever reported.
 *
 * The pattern, in three parts:
 * 1. Mount gate: the returned `onEndReached` is undefined unless
 *    pagination may run at all (`canPaginate` and a host
 *    `onLoadMore`) — the first load and the error state render
 *    an empty data range that must not start a page request.
 * 2. Fetch guard: while a next-page fetch is in flight the
 *    handler STAYS mounted and swallows the request instead of
 *    unmounting. Unmounting would leave the list's sentinel
 *    holding the pre-footer content length, and a no-new-rows
 *    page completing would restore exactly that length and
 *    suppress the next fire. The guard is also what prevents
 *    duplicate in-flight requests.
 * 3. Fetch-completion re-arm: the hook watches the
 *    `isFetchingNextPage` true-to-false edge. If the fetch that
 *    just completed started at the list's end (the end-reached
 *    handler fired for it) and added no rows — the item count
 *    is exactly what it was when that fetch began — the
 *    continuation is re-evaluated immediately: `onLoadMore`
 *    fires once more, independent of any footer measurement.
 *    Each chained call is a fresh host fetch cycle, so the
 *    chain is bounded by the host: a host with no continuation
 *    simply does not set `isFetchingNextPage` again, and no
 *    further edge (and no further call) occurs. A fetch that
 *    DID add rows clears the end latch — the list's own
 *    content-length change re-arms its signal, and it re-fires
 *    (re-latching here) if the viewport is still at the end.
 *
 * The end latch is a live at-end state, not a one-shot flag:
 * the returned `onScroll` handler recomputes it from the
 * list's scroll metrics on every scroll event (within the
 * end threshold, using the same threshold the list's own
 * end-reached signal uses — the hook owns that value and
 * returns it for the list's `onEndReachedThreshold`). A user
 * who scrolls away from the end while a fetch is in flight
 * clears the latch, so a no-new-rows completion then does NOT
 * chain: lazy loading resumes only when the user returns to
 * the end and the list's own signal fires again.
 *
 * The contract's one fetch signal is `isFetchingNextPage`. A
 * host that omits it gets plain guarded end-reached semantics:
 * no duplicates while a fetch it does report is in flight, but
 * a no-new-rows page cannot re-arm on its own.
 */
export type CatalogPaginationOptions = {
  /** Pagination hook supplied by the host; absent means the
   * host has no continuation and the list never paginates. */
  onLoadMore?: (() => void) | undefined;
  /** Next page in flight — the pattern's only fetch signal. */
  isFetchingNextPage?: boolean;
  /** Rows currently rendered (the host's full item count, not
   * the loading-emptied list data). Compared across a fetch to
   * detect a page that added no new visible rows. */
  itemCount: number;
  /** Whether pagination may run at all right now: false during
   * the first load and (on DiscoverPage) while the error state
   * shows. Defaults to true. */
  canPaginate?: boolean;
  /** The list's end-reached threshold (a fraction of the
   * visible length), shared by the list's own signal and the
   * hook's scroll-metrics latch so the two can never disagree.
   * Defaults to 0.4, the value both catalogs have always used. */
  endReachedThreshold?: number;
};

export type CatalogPagination = {
  /** Wire to the list's `onEndReached`. Undefined while the
   * mount gate is closed. */
  onEndReached: (() => void) | undefined;
  /** Wire to the list's `onScroll`: keeps the hook's at-end
   * latch current as the user scrolls. */
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Wire to the list's `onEndReachedThreshold`: the threshold
   * the hook was configured with, so the list's signal and the
   * hook's latch share one value. */
  onEndReachedThreshold: number;
};

export function useCatalogPagination({
  onLoadMore,
  isFetchingNextPage = false,
  itemCount,
  canPaginate = true,
  endReachedThreshold = 0.4,
}: CatalogPaginationOptions): CatalogPagination {
  // Whether the viewport is currently at the list's end:
  // latched by the end-reached handler, kept current by the
  // scroll handler, cleared when a fetch completes having
  // added rows (the list re-arms itself then).
  const endReachedRef = useRef(false);
  const wasFetchingRef = useRef(false);
  // Item count captured when the in-flight fetch began; null
  // while no fetch is being tracked.
  const countAtFetchStartRef = useRef<number | null>(null);
  // The latest host callback, read by the re-arm effect so the
  // effect itself never has to subscribe to callback identity.
  // Written inside the effect, never during render: a discarded
  // render must not leak its callback into a committed effect.
  const onLoadMoreRef = useRef(onLoadMore);

  // Fetch-completion re-arm (pattern part 3). Runs after every
  // render; the refs make it act only on the true-to-false edge
  // of isFetchingNextPage, exactly once per completed fetch.
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
    if (isFetchingNextPage) {
      if (!wasFetchingRef.current) {
        countAtFetchStartRef.current = itemCount;
      }
    } else if (wasFetchingRef.current) {
      const countAtFetchStart = countAtFetchStartRef.current;
      countAtFetchStartRef.current = null;
      if (countAtFetchStart !== null && itemCount !== countAtFetchStart) {
        // The page added (or removed) rows: the list's content
        // length changed, its end-reached signal re-arms on its
        // own, and the latch's work is done.
        endReachedRef.current = false;
      } else if (canPaginate && endReachedRef.current && countAtFetchStart !== null) {
        // The page added no new visible rows and the viewport
        // is still at the end: re-evaluate the continuation
        // instead of waiting for a scroll-away that the list's
        // sentinel would need to fire again.
        onLoadMoreRef.current?.();
      }
    }
    wasFetchingRef.current = isFetchingNextPage;
  });

  const handleEndReached = () => {
    endReachedRef.current = true;
    if (!isFetchingNextPage) {
      onLoadMore?.();
    }
  };

  // The live at-end latch: recomputed from the scroll metrics
  // on every scroll event, with the same distance test the
  // list's own end-reached signal applies (distance from the
  // end within the threshold fraction of the visible length).
  // A ref write only — scrolling never re-renders the page.
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromEnd = contentSize.height - contentOffset.y - layoutMeasurement.height;
    endReachedRef.current = distanceFromEnd <= endReachedThreshold * layoutMeasurement.height;
  };

  return {
    onEndReached: canPaginate && onLoadMore ? handleEndReached : undefined,
    onScroll: handleScroll,
    onEndReachedThreshold: endReachedThreshold,
  };
}
