import { useEffect, useRef } from "react";

/**
 * Shared pagination re-arm for the catalog pages (#285):
 * RecipesPage and DiscoverPage paginate through this one hook so
 * the two catalogs keep a single pagination contract — the host
 * signals a next-page fetch with `isFetchingNextPage` and receives
 * page requests through `onLoadMore`.
 *
 * Why the re-arm exists. VirtualizedList fires `onEndReached`
 * once per distinct content length: it records
 * `_sentEndForContentLength` when the callback fires and
 * suppresses later fires until the content length changes (or the
 * user scrolls out of the end threshold, which resets the
 * sentinel). When a fetched page adds NO new visible rows — every
 * item filtered out client-side, or all duplicates — and nothing
 * else changes the rendered height, the end-reached signal cannot
 * fire again: pagination stalls until the user scrolls away and
 * back, even though the host still has a continuation.
 *
 * The pattern, in three halves:
 *
 * 1. Mount gate (at the call site, in the page's JSX): while the
 *    first load is in flight or an error state is showing, the
 *    list's data range is empty and no page request may start, so
 *    the callback is not mounted at all.
 * 2. Fetch guard: during a next-page fetch the callback STAYS
 *    mounted and the handler swallows the request instead of
 *    unmounting. Unmounting would break the sentinel bookkeeping —
 *    the footer spinner's mount grows the content length, and a
 *    mounted callback gets that inflated length recorded even
 *    when the request is swallowed, so the fetch completing (and
 *    the footer unmounting) leaves a length that differs from the
 *    sentinel and the next page is requested. The guard also
 *    means a page request is never duplicated while one is in
 *    flight.
 * 3. Re-arm: when a fetch completes and the row count is exactly
 *    what it was when the fetch was requested, the page added no
 *    rows and the sentinel will not fire again — so the hook
 *    issues the next page request itself, chaining through
 *    consecutive no-new-rows pages until a page adds rows (the
 *    sentinel takes over again from the new length) or the host
 *    stops fetching (no completion edge, no chain). The chain is
 *    bounded by the host's own fetch cycles: it advances one
 *    request per completed fetch, never in a loop of its own.
 *
 * Two deliberate simplifications. The chain fires on fetch
 * completion regardless of the current scroll position — if the
 * user scrolled away mid-fetch, the worst case is one page
 * prefetched early, the same request they would trigger on
 * return; tracking scroll metrics to suppress that costs more
 * machinery than the harm. And neither half tests the row count
 * as a gate on the end-reached request itself: an empty page
 * with a live continuation still paginates.
 *
 * Disarming: a fetch that adds rows disarms (the sentinel owns
 * the next fire from the new content length), and so does the
 * page leaving its paginating state (`enabled` going false — a
 * filter edit's reload, an error state), so a stale chain can
 * never fire against a new query's list.
 *
 * Why this lives in src/pages and is not exported: it is page
 * scaffolding shared by the catalog pages (the BoundedList
 * pattern), exercised through the pages that use it and through
 * the pure state machine below, which the contract tests drive
 * directly. The state machine is kept pure — transitions in,
 * `{ state, fire }` out — precisely so the chaining behavior is
 * testable without a renderer; the hook is a thin ref/effect
 * wiring over it.
 */
export type PaginationRearmState = {
  /** A page request is outstanding whose completion may chain. */
  armed: boolean;
  /** The fetch flag as of the last settle pass. */
  wasFetching: boolean;
  /** Row count captured when the outstanding request was made. */
  countAtFetchStart: number;
};

export const initialPaginationRearmState: PaginationRearmState = {
  armed: false,
  wasFetching: false,
  countAtFetchStart: 0,
};

export type PaginationRearmInput = {
  enabled: boolean;
  isFetchingNextPage: boolean;
  itemCount: number;
};

export type PaginationRearmResult = {
  state: PaginationRearmState;
  /** True when the page should issue a page request now. */
  fire: boolean;
};

/**
 * The end-reached transition (halves 1–2): swallow while the page
 * is not in its paginating state or a fetch is already in flight
 * (the swallowed fire still reaches the mounted callback, which
 * is what lets VirtualizedList record the footer-inflated
 * content length); otherwise arm the re-arm with the current row
 * count and fire.
 */
export function paginationEndReached(
  state: PaginationRearmState,
  input: PaginationRearmInput,
): PaginationRearmResult {
  if (!input.enabled || input.isFetchingNextPage) {
    return { state, fire: false };
  }
  return {
    state: {
      armed: true,
      wasFetching: state.wasFetching,
      countAtFetchStart: input.itemCount,
    },
    fire: true,
  };
}

/**
 * The fetch-settle transition (half 3): run on every render pass
 * of the inputs. A completion edge is the fetch flag going true
 * → false while armed. No rows added → fire the next request and
 * stay armed (the next completion edge decides again). Rows
 * added → disarm; the sentinel owns the next fire. Leaving the
 * paginating state disarms, so nothing chains against a new
 * query's list.
 */
export function paginationFetchSettled(
  state: PaginationRearmState,
  input: PaginationRearmInput,
): PaginationRearmResult {
  if (!input.enabled) {
    return {
      state: {
        armed: false,
        wasFetching: input.isFetchingNextPage,
        countAtFetchStart: state.countAtFetchStart,
      },
      fire: false,
    };
  }
  const completed = state.wasFetching && !input.isFetchingNextPage;
  const settled: PaginationRearmState = {
    armed: state.armed,
    wasFetching: input.isFetchingNextPage,
    countAtFetchStart: state.countAtFetchStart,
  };
  if (!completed || !state.armed) {
    return { state: settled, fire: false };
  }
  if (input.itemCount === state.countAtFetchStart) {
    return { state: settled, fire: true };
  }
  return { state: { ...settled, armed: false }, fire: false };
}

/**
 * The hook the catalog pages share. `enabled` is the page's
 * paginating state (not loading, no error showing); the caller
 * also keeps the JSX mount gate, so the callback unmounts exactly
 * where it did before this hook existed.
 */
export function usePaginationRearm(
  options: PaginationRearmInput & {
    onLoadMore?: (() => void) | undefined;
  },
): { handleEndReached: () => void } {
  const { enabled, isFetchingNextPage, itemCount, onLoadMore } = options;
  const stateRef = useRef<PaginationRearmState>(initialPaginationRearmState);

  const handleEndReached = () => {
    const result = paginationEndReached(stateRef.current, {
      enabled,
      isFetchingNextPage,
      itemCount,
    });
    stateRef.current = result.state;
    if (result.fire) {
      onLoadMore?.();
    }
  };

  useEffect(() => {
    const result = paginationFetchSettled(stateRef.current, {
      enabled,
      isFetchingNextPage,
      itemCount,
    });
    stateRef.current = result.state;
    if (result.fire) {
      onLoadMore?.();
    }
  }, [enabled, isFetchingNextPage, itemCount, onLoadMore]);

  return { handleEndReached };
}
