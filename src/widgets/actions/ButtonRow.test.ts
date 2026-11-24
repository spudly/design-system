/**
 * Contract test for ButtonRow (spudly/design-system#119,
 * extracted for PublicRecipePage's adoption round): the
 * call-to-action bar whose buttons share the row's width
 * equally — flex 1 with a 40% minimum width, wrapping instead
 * of shrinking. EqualButtonRow carried that treatment until
 * #475 merged it into ButtonRow as the `equal` prop.
 *
 * Converted from source scans to runtime checks in #733
 * tranche 7a: the component is called directly with element
 * children and the returned tree is inspected — the equal
 * sizing it clones onto each button, the collision-free
 * generated keys, and the fragment re-keying ARE the rendered
 * contract. The styled row's own gap/wrap defaults and the
 * former type-shape scans were deleted: styled defaults are
 * not observable on the returned element, and the prop shape
 * is enforced by the TypeScript build, not a test (Stephen,
 * 2026-11-20). The dist `.d.ts` read below is a built-artifact
 * read, not a source read, and stays.
 */
import "../../../test/registerSvgStub.js";
import { loadInternalDist } from "../../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement, Fragment } from "react";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

test("ButtonRow is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  assert.equal(
    typeof dist.ButtonRow,
    "function",
    "ButtonRow must be exported from the internal components barrel",
  );
  assert.equal(
    typeof dist.EqualButtonRow,
    "undefined",
    "EqualButtonRow is gone: #475 merged it into ButtonRow",
  );
});

test("ButtonRowProps is a type-only export from the built components barrel", () => {
  const barrel = readFileSync(join(here, "../../..", "dist", "widgets", "index.d.ts"), "utf8");
  assert.match(barrel, /export \{[^}]*type ButtonRowProps[^}]*\}/);
  assert.ok(!barrel.includes("EqualButtonRow"), "the barrel no longer names EqualButtonRow");
});

test("without equal, children pass through unsized", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  const first = createElement("span", { key: "a" }, "One");
  const second = createElement("span", { key: "b" }, "Two");
  const element = dist.ButtonRow({ children: [first, second] });
  assert.deepEqual(element.props.children, [first, second]);
});

test("the equal row sizes its buttons itself: flex 1 with the 40% floor", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  const element = dist.ButtonRow({
    equal: true,
    children: [
      createElement("span", { key: "a" }, "One"),
      createElement("span", { key: "b" }, "Two"),
    ],
  });
  const items = element.props.children.flat();
  assert.equal(items.length, 2);
  for (const item of items) {
    assert.equal(item.props.flex, 1, "each button grows to an equal share");
    assert.equal(item.props.minWidth, "40%", "each button keeps the 40% floor");
  }
  assert.deepEqual(
    items.map((item: any) => item.key),
    ["a", "b"],
    "caller keys are preserved",
  );
});

test("generated keys are collision-free against caller-supplied keys", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  const element = dist.ButtonRow({
    equal: true,
    children: [
      createElement("span", { key: "button-1" }, "Keyed"),
      createElement("span", null, "Unkeyed"),
    ],
  });
  const keys = element.props.children.flat().map((item: any) => item.key);
  assert.equal(keys[0], "button-1");
  assert.notEqual(keys[1], "button-1", "the generated key must not collide with the caller key");
  assert.ok(keys[1], "the unkeyed button receives a generated key");
});

test("elements lifted out of a fragment are re-keyed under the fragment's scope", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  const element = dist.ButtonRow({
    equal: true,
    children: [
      createElement(Fragment, { key: "left" }, createElement("span", { key: "same" }, "L")),
      createElement(Fragment, { key: "right" }, createElement("span", { key: "same" }, "R")),
    ],
  });
  const keys = element.props.children.flat().map((item: any) => item.key);
  assert.deepEqual(
    keys,
    ["left:same", "right:same"],
    "same inner keys stay distinct per fragment scope",
  );
});

test("non-element children in an equal row are wrapped, not dropped", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  const element = dist.ButtonRow({ equal: true, children: ["Just text", null, false] });
  const items = element.props.children.flat().filter(Boolean);
  assert.equal(items.length, 1);
  assert.equal(items[0].type, Fragment);
  assert.equal(items[0].props.children, "Just text");
});
