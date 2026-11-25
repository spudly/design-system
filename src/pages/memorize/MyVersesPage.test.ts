/**
 * Contract test for MyVersesPage (spudly/design-system#49).
 *
 * Converted from source scans to runtime checks in #733
 * tranche 6a: the page is called directly and the element
 * tree it returns is inspected — the "My verses" heading,
 * the empty state verbatim when the list is empty, the
 * verse list rendered through the shared BoundedList, and
 * each row's status badge (text = the status, tone from
 * the app's rule), optional next-review hint, Drill link
 * carrying the item's drill href, and Remove button
 * reporting the verse id ARE the rendered contract,
 * observable without reading source. The former prop-type
 * and status-union pins, the drillHref documentation scan
 * (documentation, not behavior), barrel-as-source-text,
 * and story pins were deleted: type shape is enforced by
 * the TypeScript build and story coverage by the
 * story-parity tests (Stephen, 2026-11-20). The dist
 * `.d.ts` read below is a built-artifact read, not a
 * source read, and stays.
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
  const shell: Record<string, any> = await import("../../../dist/widgets/content/BigFooter.js");
  const list: Record<string, any> = await import("../../../dist/pages/shared/BoundedList.js");
  const page: Record<string, any> = await import("../../../dist/pages/memorize/MyVersesPage.js");
  return { ...dist, BigFooterShell: shell.BigFooterShell, BoundedList: list.BoundedList, ...page };
}

function screenChildren(tree: any): any[] {
  const screen = tree.props.children;
  const children = screen.props.children;
  return Array.isArray(children) ? children : [children];
}

const VERSES = [
  {
    id: "v1",
    drillHref: "/drill/v1",
    reference: "Ether 12:27",
    text: "And if men come unto me",
    status: "memorized",
    nextReviewLabel: "Next review: Friday",
  },
  {
    id: "v2",
    drillHref: "/drill/v2",
    reference: "Moroni 10:4",
    text: "And when ye shall receive these things",
    status: "learning",
  },
];

function baseProps(overrides: Record<string, any> = {}) {
  return { verses: VERSES, onRemoveVerse: (_id: string) => {}, ...overrides };
}

function renderRow(tree: any, item: any) {
  const list = screenChildren(tree)[1];
  const rowElement = list.props.renderItem({ item });
  return rowElement.type(rowElement.props);
}

test("MyVersesPage is exported from the built pages barrel", async () => {
  const { MyVersesPage } = await loadPage();
  assert.equal(typeof MyVersesPage, "function");
  const types = readFileSync(join(here, "../../..", "dist", "pages", "index.d.ts"), "utf8");
  assert.match(types, /MyVersesPage/);
  assert.match(types, /type MyVersesPageProps/);
});

test("the heading is the app screen's own; the shell is the plain ScreenContainer", async () => {
  const { MyVersesPage, BigFooterShell, ScreenContainer, Text } = await loadPage();
  const tree = MyVersesPage(baseProps());
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
  assert.equal(heading.props.children, "My verses");
});

test("the empty branch carries the app's empty state verbatim; a non-empty list renders BoundedList", async () => {
  const { MyVersesPage, EmptyState, BoundedList } = await loadPage();
  const empty = screenChildren(MyVersesPage(baseProps({ verses: [] })))[1];
  assert.equal(empty.type, EmptyState);
  assert.equal(empty.props.title, "No verses yet");
  assert.equal(empty.props.body, "Find one in the Search tab to get started.");
  // #856: no host href -> no action; with searchHref the empty state
  // carries an icon and the link-form Search action.
  assert.equal(empty.props.actionHref, undefined);
  const withAction = screenChildren(
    MyVersesPage(baseProps({ verses: [], searchHref: "/search" })),
  )[1];
  assert.equal(withAction.props.actionLabel, "Search verses");
  assert.equal(withAction.props.actionHref, "/search");
  assert.ok(withAction.props.icon, "the empty state carries an icon");

  const list = screenChildren(MyVersesPage(baseProps()))[1];
  assert.equal(list.type, BoundedList, "the list renders through BoundedList (#119)");
  assert.equal(list.props.data, VERSES);
  assert.equal(list.props.keyExtractor(VERSES[0]), "v1", "rows key off the verse id");
});

test("a row's badge text is the status and its tone follows the app's rule", async () => {
  const { MyVersesPage, Card, Text, Badge } = await loadPage();
  const tree = MyVersesPage(baseProps());
  const memorized = renderRow(tree, VERSES[0]);
  assert.equal(memorized.type, Card, "a verse row is a card");
  const [reference, badge, text] = memorized.props.children;
  assert.equal(reference.type, Text);
  assert.equal(reference.props.variant, "subheading");
  assert.equal(reference.props.children, "Ether 12:27");
  assert.equal(badge.type, Badge);
  assert.equal(badge.props.children, "memorized", "the badge's text is the status itself");
  assert.equal(badge.props.tone, "mastery", "memorized maps to the mastery tone (#850)");
  assert.equal(text.props.variant, "verse");
  assert.equal(text.props.children, VERSES[0].text);

  const learning = renderRow(tree, VERSES[1]);
  const learningBadge = learning.props.children[1];
  assert.equal(learningBadge.props.children, "learning");
  assert.equal(learningBadge.props.tone, "info", "learning maps to the info tone");
});

test("the next-review line renders only when the app composed one", async () => {
  const { MyVersesPage, Text } = await loadPage();
  const tree = MyVersesPage(baseProps());
  const withLabel = renderRow(tree, VERSES[0]);
  const hint = withLabel.props.children[3];
  assert.equal(hint.type, Text);
  assert.equal(hint.props.variant, "hint");
  assert.equal(hint.props.children, "Next review: Friday");
  const withoutLabel = renderRow(tree, VERSES[1]);
  assert.equal(withoutLabel.props.children[3], null, "no label renders no hint line");
});

test("row controls split on the navigation rule: Drill is a link, Remove an intent", async () => {
  const { MyVersesPage, ButtonRow, Button } = await loadPage();
  const removed: string[] = [];
  const tree = MyVersesPage(
    baseProps({
      onRemoveVerse: (id: string) => removed.push(id),
    }),
  );
  const row = renderRow(tree, VERSES[0]);
  const actions = row.props.children[4];
  assert.equal(actions.type, ButtonRow);
  const [drill, remove] = actions.props.children;
  assert.equal(drill.type, Button);
  assert.equal(drill.props.children, "Drill");
  assert.equal(drill.props.size, "sm");
  assert.equal(
    drill.props.href,
    "/drill/v1",
    "Drill is Button's href form carrying the item's drill href (#248)",
  );
  assert.equal(drill.props.onPress, undefined, "Drill navigates — no drill press callback");
  assert.equal(remove.type, Button);
  assert.equal(remove.props.children, "Remove");
  assert.equal(remove.props.size, "sm");
  assert.equal(
    remove.props.variant,
    "secondary",
    "the Remove button mirrors the app's (small, secondary)",
  );
  remove.props.onPress();
  assert.deepEqual(removed, ["v1"], "Remove fires onRemoveVerse with the verse id");
});

test("the rendered tree has no loading state or render-slot content", async () => {
  const { MyVersesPage } = await loadPage();
  const tree = MyVersesPage(baseProps());
  const types: string[] = [];
  const walk = (node: any): void => {
    if (node == null || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node.type === "function") types.push(node.type.name);
    walk(node.props?.children);
  };
  walk(tree);
  walk(renderRow(tree, VERSES[0]));
  assert.ok(
    !types.includes("Spinner"),
    "no loading spinner renders — the app gates readiness above the tab",
  );
  assert.ok(!types.includes("FlatList"), "the page renders no FlatList of its own (#119)");
});
