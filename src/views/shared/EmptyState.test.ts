/**
 * Behavior tests for EmptyState's recovery actions (#856): the
 * component is called directly and the element tree it returns is
 * inspected — the icon glyph element, the callback action, and the
 * link-form action are observable without reading source.
 */
import "../../../test/registerSvgStub.js";
import { loadInternalDist } from "../../../test/internalDist.js";
import assert from "node:assert/strict";
import { test } from "node:test";

async function load() {
  const dist: Record<string, any> = await loadInternalDist();
  const view: Record<string, any> = await import("../../../dist/views/shared/EmptyState.js");
  const icons: Record<string, any> = await import("../../../dist/icons/iconRegistry.js");
  return { ...dist, ...view, iconsByName: icons.iconsByName };
}

function childrenOf(tree: any): any[] {
  const children = tree.props.children;
  return (Array.isArray(children) ? children : [children]).filter((c) => c !== null && c !== false);
}

test("EmptyState renders its icon glyph above the title (#856)", async () => {
  const { EmptyState, iconsByName } = await load();
  const tree = EmptyState({ title: "Nothing due", body: "Nice work.", icon: "success" });
  const children = childrenOf(tree);
  assert.equal(children[0].type, iconsByName.success, "the icon resolves through the registry");
  const bare = EmptyState({ title: "Nothing due" });
  assert.equal(childrenOf(bare).length, 1, "no icon prop renders no glyph");
});

test("EmptyState's link-form action renders Button with href; callback form with onPress (#856)", async () => {
  const { EmptyState, Button } = await load();
  const linkTree = EmptyState({
    title: "No verses yet",
    actionLabel: "Search verses",
    actionHref: "/search",
  });
  const linkAction = childrenOf(linkTree).at(-1);
  assert.equal(linkAction.type, Button);
  assert.equal(linkAction.props.href, "/search");
  assert.equal(linkAction.props.onPress, undefined);

  let presses = 0;
  const callbackTree = EmptyState({
    title: "No results",
    actionLabel: "Clear search",
    onAction: () => (presses += 1),
  });
  const callbackAction = childrenOf(callbackTree).at(-1);
  assert.equal(callbackAction.type, Button);
  assert.equal(callbackAction.props.href, undefined);
  callbackAction.props.onPress();
  assert.equal(presses, 1);
});
