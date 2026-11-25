/**
 * Contract test for MemorizeReviewPage (spudly/design-system#49).
 *
 * Converted from source scans to runtime checks in #733
 * tranche 6a: the page is called directly and the element
 * tree it returns is inspected — the heading composing the
 * due count from the list itself, the nothing-due empty
 * state verbatim, the due list rendered through the shared
 * BoundedList with the rows' two outcome buttons reporting
 * the verse id ARE the rendered contract, observable
 * without reading source. Absences that are rendered
 * behavior (no invented dashboard stats, no Drill/Remove
 * actions, no status badge, no loading spinner) are
 * asserted on the returned tree and on the rows the list
 * renders. The former prop-type pins, barrel-as-source-
 * text, and story pins were deleted: type shape is enforced
 * by the TypeScript build and story coverage by the
 * story-parity tests (Stephen, 2026-11-20). The dist `.d.ts`
 * read below is a built-artifact read, not a source read,
 * and stays.
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
  const page: Record<string, any> =
    await import("../../../dist/pages/memorize/MemorizeReviewPage.js");
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
    .join("");
}

const VERSES = [
  { id: "v1", reference: "Ether 12:27", text: "And if men come unto me" },
  { id: "v2", reference: "Moroni 10:4", text: "And when ye shall receive these things" },
];

function baseProps(overrides: Record<string, any> = {}) {
  return {
    verses: VERSES,
    onRememberedPress: (_id: string) => {},
    onForgotPress: (_id: string) => {},
    ...overrides,
  };
}

test("MemorizeReviewPage is exported from the built pages barrel", async () => {
  const { MemorizeReviewPage } = await loadPage();
  assert.equal(typeof MemorizeReviewPage, "function");
  const types = readFileSync(join(here, "../../..", "dist", "pages", "index.d.ts"), "utf8");
  assert.match(types, /MemorizeReviewPage/);
  assert.match(types, /type MemorizeReviewPageProps/);
});

test("the heading carries the due count from the list; the empty state matches the app verbatim", async () => {
  const { MemorizeReviewPage, Text, EmptyState } = await loadPage();
  const [heading, list] = screenChildren(MemorizeReviewPage(baseProps()));
  assert.equal(heading.type, Text);
  assert.equal(heading.props.variant, "heading");
  assert.equal(textOf(heading), "Review (2 due)", "the heading composes the due count");
  assert.equal(typeof list.props.renderItem, "function", "a non-empty list renders rows");

  const [emptyHeading, emptyState] = screenChildren(MemorizeReviewPage(baseProps({ verses: [] })));
  assert.equal(textOf(emptyHeading), "Review", "the empty branch renders the bare heading");
  assert.equal(emptyState.type, EmptyState);
  assert.equal(emptyState.props.title, "Nothing due");
  assert.equal(
    emptyState.props.body,
    "Nice work.",
    "the nothing-due copy matches the app verbatim",
  );
});

test("the due list renders through the shared BoundedList in the plain shell", async () => {
  const { MemorizeReviewPage, BigFooterShell, ScreenContainer, BoundedList } = await loadPage();
  const tree = MemorizeReviewPage(baseProps());
  assert.equal(tree.type, BigFooterShell);
  assert.equal(tree.props.scrollMode, "content");
  assert.equal(tree.props.children.type, ScreenContainer, "the tab screens share the app's shell");
  const list = screenChildren(tree)[1];
  assert.equal(list.type, BoundedList, "the due list renders through BoundedList (#119, #547)");
  assert.equal(list.props.data, VERSES, "the list data is the verses as-is");
  assert.equal(list.props.keyExtractor(VERSES[0]), "v1", "rows key off the verse id");
});

test("row actions are exactly the two review outcomes, reporting the verse id", async () => {
  const { MemorizeReviewPage, Card, Text, ButtonRow, Button } = await loadPage();
  const remembered: string[] = [];
  const forgot: string[] = [];
  const tree = MemorizeReviewPage(
    baseProps({
      onRememberedPress: (id: string) => remembered.push(id),
      onForgotPress: (id: string) => forgot.push(id),
    }),
  );
  const list = screenChildren(tree)[1];
  const rowElement = list.props.renderItem({ item: VERSES[1] });
  const row = rowElement.type(rowElement.props);
  assert.equal(row.type, Card, "a due row is a card");
  const [reference, text, actions] = row.props.children;
  assert.equal(reference.type, Text);
  assert.equal(reference.props.variant, "subheading");
  assert.equal(reference.props.children, "Moroni 10:4");
  assert.equal(text.props.variant, "verse");
  assert.equal(text.props.children, VERSES[1].text);
  assert.equal(actions.type, ButtonRow);
  const [rememberedBtn, forgotBtn] = actions.props.children;
  assert.equal(rememberedBtn.type, Button);
  assert.equal(
    rememberedBtn.props.children,
    "I remembered it",
    "the primary outcome matches the app's",
  );
  assert.equal(rememberedBtn.props.size, "sm");
  rememberedBtn.props.onPress();
  assert.deepEqual(remembered, ["v2"], "remembered reports the row's verse id");
  assert.equal(forgotBtn.type, Button);
  assert.equal(forgotBtn.props.children, "I forgot it", "the secondary outcome matches the app's");
  assert.equal(forgotBtn.props.variant, "secondary");
  forgotBtn.props.onPress();
  assert.deepEqual(forgot, ["v2"], "forgot reports the row's verse id");
});

test("the rendered tree has no invented dashboard, extra actions, badge, or loading state", async () => {
  const { MemorizeReviewPage } = await loadPage();
  const tree = MemorizeReviewPage(baseProps());
  const list = screenChildren(tree)[1];
  const rowElement = list.props.renderItem({ item: VERSES[0] });
  const types: string[] = [];
  const labels: string[] = [];
  const walk = (node: any): void => {
    if (node == null || typeof node !== "object") {
      if (typeof node === "string") labels.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node.type === "function") types.push(node.type.name);
    walk(node.props?.children);
  };
  walk(tree);
  walk(rowElement.type(rowElement.props));
  for (const banned of ["StatCard", "ProgressBar", "Badge", "Spinner", "FlatList"]) {
    assert.ok(!types.includes(banned), `the review page must not render a ${banned}`);
  }
  for (const bannedLabel of ["Drill", "Remove"]) {
    assert.ok(
      !labels.includes(bannedLabel),
      `"${bannedLabel}" is the Verses screen's action, not this screen's`,
    );
  }
});
