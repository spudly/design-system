/**
 * Contract test for VerseSearchPage (spudly/design-system#49).
 *
 * Converted from source scans to runtime checks in #733
 * tranche 6a: the page is called directly and the element
 * tree it returns is inspected — the "Search verses"
 * heading, the demo-mode notice verbatim above the search
 * row, the controlled SearchField whose placeholder example
 * is mode-aware (#276) with submit and the Search button
 * both firing onSearch under the app's disabled rule, the
 * error alert, the busy spinner above a results list that
 * stays mounted, the no-results empty state scoped to a
 * completed fruitless search (#287), and result rows whose
 * add action reports the verse id (or the disabled "Added"
 * confirmation, #242) ARE the rendered contract, observable
 * without reading source. The former prop-type pins,
 * barrel-as-source-text, and story pins were deleted: type
 * shape is enforced by the TypeScript build and story
 * coverage by the story-parity tests (Stephen, 2026-11-20).
 * The dist `.d.ts` read below is a built-artifact read, not
 * a source read, and stays.
 */
import "../../../test/registerSvgStub.js";
import { loadInternalDist } from "../../../test/internalDist.js";
import assert from "node:assert/strict";
import { register } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// BoundedList imports react-native, whose Flow-typed source
// plain Node cannot parse; redirect the bare specifier to an
// inert stub before the page module is imported. The tests
// inspect the BoundedList element's props and call its
// renderItem — they never render the FlatList itself.
const reactNativeStubUrl =
  "data:text/javascript,export%20function%20FlatList()%7Breturn%20null%3B%7D%0Aexport%20function%20View()%7Breturn%20null%3B%7D%0A";
register(
  "data:text/javascript," +
    encodeURIComponent(
      `export async function resolve(specifier, context, nextResolve) {\n` +
        `  if (specifier === "react-native") return { shortCircuit: true, url: ${JSON.stringify(reactNativeStubUrl)} };\n` +
        `  return nextResolve(specifier, context);\n` +
        `}`,
    ),
);

async function loadPage() {
  const dist: Record<string, any> = await loadInternalDist();
  const shell: Record<string, any> = await import("../../../dist/widgets/BigFooter.js");
  const list: Record<string, any> = await import("../../../dist/pages/shared/BoundedList.js");
  const page: Record<string, any> = await import("../../../dist/pages/memorize/VerseSearchPage.js");
  return { ...dist, BigFooterShell: shell.BigFooterShell, BoundedList: list.BoundedList, ...page };
}

function screenChildren(tree: any): any[] {
  const screen = tree.props.children;
  const children = screen.props.children;
  return Array.isArray(children) ? children : [children];
}

function textOf(element: any): string {
  const children = element?.props?.children;
  return (Array.isArray(children) ? children : [children])
    .map((c) => (typeof c === "string" ? c : ""))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

const RESULTS = [
  { id: "v1", reference: "Ether 12:27", text: "And if men come unto me" },
  {
    id: "v2",
    reference: "Moroni 10:4",
    text: "And when ye shall receive these things",
    added: true,
  },
];

function baseProps(overrides: Record<string, any> = {}) {
  return {
    query: "weakness",
    onQueryChange: (_v: string) => {},
    onSearch: () => {},
    isSearching: false,
    usingDemo: false,
    errorMessage: null,
    results: RESULTS,
    onAddVerse: (_id: string) => {},
    ...overrides,
  };
}

function renderRow(tree: any, item: any) {
  const list = screenChildren(tree).at(-1);
  const rowElement = list.props.renderItem({ item });
  return rowElement.type(rowElement.props);
}

test("VerseSearchPage is exported from the built pages barrel", async () => {
  const { VerseSearchPage } = await loadPage();
  assert.equal(typeof VerseSearchPage, "function");
  const types = readFileSync(join(here, "../../..", "dist", "pages", "index.d.ts"), "utf8");
  assert.match(types, /VerseSearchPage/);
  assert.match(types, /type VerseSearchPageProps/);
});

test("the heading is the app screen's own; the shell is the plain ScreenContainer", async () => {
  const { VerseSearchPage, BigFooterShell, ScreenContainer, Text } = await loadPage();
  const tree = VerseSearchPage(baseProps());
  assert.equal(tree.type, BigFooterShell);
  assert.equal(tree.props.scrollMode, "content");
  assert.equal(
    tree.props.children.type,
    ScreenContainer,
    "the shell is the plain ScreenContainer (#547)",
  );
  const heading = screenChildren(tree)[0];
  assert.equal(heading.type, Text);
  assert.equal(heading.props.variant, "heading");
  assert.equal(heading.props.children, "Search verses");
});

test("the demo-mode notice carries the app's text verbatim, above the search row", async () => {
  const { VerseSearchPage, Alert, FieldRow } = await loadPage();
  const children = screenChildren(VerseSearchPage(baseProps({ usingDemo: true })));
  const notice = children[1];
  assert.equal(notice.type, Alert);
  assert.equal(notice.props.severity, "info");
  assert.equal(
    textOf(notice),
    "Searching the built-in demo set. Add a gospel-engine API key in Settings for full-library search.",
    "the demo notice text is the app's, verbatim",
  );
  assert.equal(children[2].type, FieldRow, "the notice renders above the search row");
  const noDemo = screenChildren(VerseSearchPage(baseProps({ usingDemo: false })));
  assert.equal(noDemo[1], null, "no demo notice renders outside demo mode");
});

test("the search row wires the field and the button to the one search callback", async () => {
  const { VerseSearchPage, SearchField, Button } = await loadPage();
  let searches = 0;
  const onSearch = () => {
    searches += 1;
  };
  const onQueryChange = (_v: string) => {};
  const tree = VerseSearchPage(baseProps({ onSearch, onQueryChange }));
  const [field, button] = screenChildren(tree)[2].props.children;
  assert.equal(field.type, SearchField, "the search row renders the DS SearchField");
  assert.equal(field.props.value, "weakness", "the field is controlled by the query props");
  assert.equal(field.props.onChangeText, onQueryChange);
  assert.equal(field.props.onSubmitEditing, onSearch, "submitting the field fires onSearch");
  assert.equal(field.props.grow, true, "the field takes the row's remaining width");
  assert.equal(
    field.props.placeholder,
    "e.g. Ether 12:27 or “charity”",
    "full-library mode keeps the charity placeholder (#276)",
  );
  assert.equal(button.type, Button);
  assert.equal(button.props.children, "Search");
  assert.equal(button.props.disabled, false, "a non-blank idle query enables Search");
  button.props.onPress();
  assert.equal(searches, 1, "the Search button fires the same onSearch");

  const demoTree = VerseSearchPage(baseProps({ usingDemo: true }));
  const demoField = screenChildren(demoTree)[2].props.children[0];
  assert.equal(
    demoField.props.placeholder,
    "e.g. Ether 12:27 or “weakness”",
    "demo mode selects the weakness placeholder (#276)",
  );

  const blankBtn = screenChildren(VerseSearchPage(baseProps({ query: "   " })))[2].props
    .children[1];
  assert.equal(blankBtn.props.disabled, true, "a blank query disables Search, as the app's does");
  const busyBtn = screenChildren(VerseSearchPage(baseProps({ isSearching: true })))[2].props
    .children[1];
  assert.equal(busyBtn.props.disabled, true, "searching disables Search, as the app's does");
});

test("the error alert carries the app-composed message", async () => {
  const { VerseSearchPage, Alert } = await loadPage();
  const children = screenChildren(VerseSearchPage(baseProps({ errorMessage: "Search failed" })));
  const alert = children[3];
  assert.equal(alert.type, Alert);
  assert.equal(alert.props.severity, "error");
  assert.equal(alert.props.children, "Search failed", "the error message renders verbatim");
  const noError = screenChildren(VerseSearchPage(baseProps()));
  assert.equal(noError[3], null, "no error renders no alert");
});

test("the busy spinner renders above a results list that stays mounted", async () => {
  const { VerseSearchPage, Spinner, BoundedList } = await loadPage();
  const children = screenChildren(VerseSearchPage(baseProps({ isSearching: true })));
  const spinner = children[4];
  assert.equal(spinner.type, Spinner, "the spinner renders while a search is in flight");
  assert.equal(spinner.props.label, "Loading");
  const list = children[5];
  assert.equal(list.type, BoundedList, "the list stays mounted while searching");
  assert.equal(list.props.data, RESULTS, "the previous results stay in the list — no blanking");
  const idle = screenChildren(VerseSearchPage(baseProps()));
  assert.equal(idle[4], null, "no spinner renders when idle");
  assert.equal(idle[5].type, BoundedList);
  assert.equal(idle[5].props.keyExtractor(RESULTS[0]), "v1", "rows key off the verse id");
});

test("a completed search with no results renders the empty state; the pre-search state does not (#287)", async () => {
  const { VerseSearchPage, EmptyState, BoundedList } = await loadPage();
  const fruitless = screenChildren(
    VerseSearchPage(baseProps({ results: [], hasSearched: true })),
  ).at(-1);
  assert.equal(fruitless.type, EmptyState);
  assert.equal(fruitless.props.title, "No results");
  assert.equal(fruitless.props.body, "Try a different word or reference.");
  assert.equal(fruitless.props.announce, true, "the empty state announces the search outcome");

  const preSearch = screenChildren(VerseSearchPage(baseProps({ results: [] }))).at(-1);
  assert.equal(
    preSearch.type,
    BoundedList,
    "before the first search there is deliberately no message",
  );
  const searching = screenChildren(
    VerseSearchPage(baseProps({ results: [], hasSearched: true, isSearching: true })),
  ).at(-1);
  assert.equal(
    searching.type,
    BoundedList,
    "while searching the spinner, not the empty state, is the feedback",
  );
  const errored = screenChildren(
    VerseSearchPage(baseProps({ results: [], hasSearched: true, errorMessage: "boom" })),
  ).at(-1);
  assert.equal(
    errored.type,
    BoundedList,
    "when the search failed the error alert, not the empty state, is the feedback",
  );
});

test("result rows mirror the app card and the add action reports the verse id", async () => {
  const { VerseSearchPage, Card, Text, Button } = await loadPage();
  const added: string[] = [];
  const tree = VerseSearchPage(baseProps({ onAddVerse: (id: string) => added.push(id) }));
  const row = renderRow(tree, RESULTS[0]);
  assert.equal(row.type, Card, "a result row is a card");
  const [reference, text, button] = row.props.children;
  assert.equal(reference.type, Text);
  assert.equal(reference.props.variant, "subheading");
  assert.equal(reference.props.children, "Ether 12:27");
  assert.equal(text.props.variant, "verse");
  assert.equal(text.props.children, RESULTS[0].text);
  assert.equal(button.type, Button);
  assert.equal(button.props.children, "Add to memorize list", "the row button is the app's");
  assert.equal(button.props.size, "sm");
  button.props.onPress();
  assert.deepEqual(added, ["v1"], "the add action fires onAddVerse with the verse id");
});

test("an added result renders the disabled Added confirmation, not the Add button (#242)", async () => {
  const { VerseSearchPage } = await loadPage();
  const tree = VerseSearchPage(baseProps());
  const row = renderRow(tree, RESULTS[1]);
  const button = row.props.children[2];
  assert.equal(button.props.children, "Added");
  assert.equal(button.props.size, "sm");
  assert.equal(button.props.variant, "secondary");
  assert.equal(button.props.disabled, true, "the Added confirmation is disabled");
});
