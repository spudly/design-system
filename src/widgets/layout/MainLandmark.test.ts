/**
 * Contract test for MainLandmark (spudly/design-system#366,
 * #473), the `main` landmark region: a flex column carrying the
 * web-only `main` role through the shared accessibility
 * translation, so a page whose outermost frame it is (the public
 * recipe surface after #473 retired PublicPageFrame) composes
 * its landmark without rendering a layout primitive or
 * spreading a role prop itself (#119).
 *
 * Converted from source scans to runtime checks in #733
 * tranche 7a: the component is called directly and the element
 * it returns is inspected — in this (web) test environment it
 * is the growing column carrying the main role props. #746:
 * MainLandmark composes Col, so the inspection captures
 * through Col to the stack it renders — the prop-capture form
 * for a composed root (the column direction is the rendered
 * stack's own nature and no longer a passed prop). The
 * native branch (flex: 1) cannot be observed from the web
 * harness and its former literal pins were deleted with the
 * scan; the shared `mainRoleProps` translation is covered by
 * the accessibility tests. The former type-shape scan was
 * deleted: the prop shape is enforced by the TypeScript build,
 * not a test (Stephen, 2026-11-20). The dist `.d.ts` read
 * below is a built-artifact read, not a source read, and stays.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { loadInternalDist } from "../../../test/internalDist.js";

const here = dirname(fileURLToPath(import.meta.url));

test("MainLandmark is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  assert.equal(
    typeof dist.MainLandmark,
    "function",
    "MainLandmark must be exported from the internal components barrel",
  );
});

test("MainLandmarkProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "../../..", "dist", "widgets", "index.d.ts"), "utf8");
  assert.match(types, /MainLandmarkProps/);
});

test("MainLandmark renders the growing web column with the main role and its children", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  const element = dist.MainLandmark({ children: "Page content" });
  // Capture through the Col MainLandmark composes (#746) to the
  // stack it renders: the landmark's contract lives in the
  // resolved stack props.
  const stack = dist.Col(element.props);
  assert.equal(stack.props.flexGrow, 1, "the web column grows with its content (#547)");
  assert.equal(stack.props.flex, undefined, "web must not pin flex: 1's zero basis");
  assert.equal(stack.props.role, "main", "the web main role rides the shared translation");
  assert.equal(stack.props.children, "Page content");
});
