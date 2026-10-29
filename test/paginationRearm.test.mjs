/**
 * Contract test for the shared catalog pagination re-arm
 * (spudly/design-system#285): RecipesPage and DiscoverPage
 * paginate through the one state machine in
 * src/pages/usePaginationRearm.ts, so the two catalogs keep a
 * single pagination contract.
 *
 * The behavior pinned here, against the pure transitions the
 * hook wires to useRef/useEffect:
 * 1. An end-reached fire arms the re-arm with the row count at
 *    request time; a fire during a fetch or while the page is
 *    out of its paginating state is swallowed and never
 *    re-baselines — no duplicate in-flight requests.
 * 2. A fetch completing with NO rows added chains: the machine
 *    fires the next page request itself and stays armed, so
 *    consecutive no-new-rows pages paginate through without a
 *    scroll-away.
 * 3. A fetch completing WITH rows added disarms — the list's
 *    own end-reached sentinel owns the next fire from the new
 *    content length.
 * 4. Leaving the paginating state (a filter reload, an error)
 *    disarms, so no chain can fire against a new query's list.
 * 5. Both pages consume the machine through the hook with the
 *    shared call shape (source pins; each page's own suite also
 *    pins its wiring).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const pagesDir = join(root, "src", "pages");

function readCode(path) {
  return readFileSync(path, "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const { initialPaginationRearmState, paginationEndReached, paginationFetchSettled } =
  await import("../dist/pages/usePaginationRearm.js");

const on = { enabled: true, isFetchingNextPage: false, itemCount: 20 };
const fetching = { enabled: true, isFetchingNextPage: true, itemCount: 20 };

/** Thread a settle pass the way the hook's effect does. */
function settle(state, input) {
  return paginationFetchSettled(state, input);
}

test("end-reached fires and arms with the row count at request time", () => {
  const result = paginationEndReached(initialPaginationRearmState, on);
  assert.equal(result.fire, true);
  assert.deepEqual(result.state, {
    armed: true,
    wasFetching: false,
    countAtFetchStart: 20,
  });
});

test("end-reached during a fetch is swallowed and never re-baselines", () => {
  const armed = paginationEndReached(initialPaginationRearmState, on).state;
  const swallowed = paginationEndReached(armed, {
    enabled: true,
    isFetchingNextPage: true,
    itemCount: 24,
  });
  assert.equal(swallowed.fire, false);
  assert.equal(swallowed.state, armed, "a swallowed fire leaves the machine untouched");
});

test("end-reached while out of the paginating state is swallowed", () => {
  const result = paginationEndReached(initialPaginationRearmState, {
    enabled: false,
    isFetchingNextPage: false,
    itemCount: 20,
  });
  assert.equal(result.fire, false);
  assert.equal(result.state.armed, false);
});

test("a fetch completing with no rows added chains the next request, repeatedly", () => {
  let state = paginationEndReached(initialPaginationRearmState, on).state;
  // First empty page: fetch starts, completes, count unchanged.
  state = settle(state, fetching).state;
  let result = settle(state, on);
  assert.equal(result.fire, true, "the completion of a no-new-rows page must chain");
  assert.equal(result.state.armed, true, "the chain stays armed for the next completion");
  // Second consecutive empty page chains again.
  state = settle(result.state, fetching).state;
  result = settle(state, on);
  assert.equal(result.fire, true, "consecutive empty pages keep paginating");
  assert.equal(result.state.armed, true);
});

test("a fetch completing with rows added disarms and does not chain", () => {
  let state = paginationEndReached(initialPaginationRearmState, on).state;
  state = settle(state, fetching).state;
  const result = settle(state, { enabled: true, isFetchingNextPage: false, itemCount: 28 });
  assert.equal(result.fire, false);
  assert.equal(result.state.armed, false, "rows added: the sentinel owns the next fire");
  // And an unarmed completion later never fires.
  const later = settle(
    settle(result.state, { enabled: true, isFetchingNextPage: true, itemCount: 28 }).state,
    { enabled: true, isFetchingNextPage: false, itemCount: 28 },
  );
  assert.equal(later.fire, false);
});

test("a completion with no outstanding request never fires", () => {
  const started = settle(initialPaginationRearmState, fetching);
  assert.equal(started.fire, false);
  const completed = settle(started.state, on);
  assert.equal(completed.fire, false);
});

test("leaving the paginating state disarms a pending chain", () => {
  let state = paginationEndReached(initialPaginationRearmState, on).state;
  state = settle(state, fetching).state;
  // The page leaves its paginating state mid-fetch (filter
  // reload / error), then comes back as the fetch completes.
  state = settle(state, { enabled: false, isFetchingNextPage: true, itemCount: 0 }).state;
  assert.equal(state.armed, false);
  const result = settle(state, { enabled: true, isFetchingNextPage: false, itemCount: 0 });
  assert.equal(result.fire, false, "no stale chain against the new list");
});

test("settle passes without a completion edge never fire", () => {
  let state = paginationEndReached(initialPaginationRearmState, on).state;
  assert.equal(settle(state, on).fire, false, "flag stayed false");
  state = settle(state, fetching).state;
  assert.equal(settle(state, fetching).fire, false, "flag stayed true");
});

test("both catalog pages wire the shared hook, and neither keeps a private handler", () => {
  const hook = readCode(join(pagesDir, "usePaginationRearm.ts"));
  assert.match(hook, /useRef<PaginationRearmState>\(initialPaginationRearmState\)/);
  assert.match(hook, /paginationEndReached\(stateRef\.current/);
  assert.match(hook, /paginationFetchSettled\(stateRef\.current/);
  for (const name of ["RecipesPage", "DiscoverPage"]) {
    const page = readCode(join(pagesDir, `${name}.tsx`));
    assert.match(
      page,
      /import \{ usePaginationRearm \} from "\.\/usePaginationRearm\.js";/,
      `${name} must import the shared re-arm hook`,
    );
    assert.match(
      page,
      /usePaginationRearm\(\{\s*itemCount: recipes\.length,\s*isFetchingNextPage,\s*onLoadMore,/,
      `${name} must call the hook with the shared inputs`,
    );
    assert.doesNotMatch(
      page,
      /if \(!isFetchingNextPage\) \{\s*onLoadMore\?\.\(\);/,
      `${name} must not keep a private end-reached handler — the guard lives in the shared machine`,
    );
  }
});
