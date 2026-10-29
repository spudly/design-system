import { useEffect, useRef } from "react";

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
};

export type CatalogPagination = {
  /** Wire to the list's `onEndReached`. Undefined while the
   * mount gate is closed. */
  onEndReached: (() => void) | undefined;
};

export function useCatalogPagination({
  onLoadMore,
  isFetchingNextPage = false,
  itemCount,
  canPaginate = true,
}: CatalogPaginationOptions): CatalogPagination {
  // Whether the list's end was reached for the current content:
  // latched by the end-reached handler, cleared when a fetch
  // completes having added rows (the list re-arms itself then).
  const endReachedRef = useRef(false);
  const wasFetchingRef = useRef(false);
  // Item count captured when the in-flight fetch began; null
  // while no fetch is being tracked.
  const countAtFetchStartRef = useRef<number | null>(null);
  // The latest host callback, read by the re-arm effect so the
  // effect itself never has to subscribe to callback identity.
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  // Fetch-completion re-arm (pattern part 3). Runs after every
  // render; the refs make it act only on the true-to-false edge
  // of isFetchingNextPage, exactly once per completed fetch.
  useEffect(() => {
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

  return {
    onEndReached: canPaginate && onLoadMore ? handleEndReached : undefined,
  };
}
