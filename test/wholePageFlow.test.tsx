/**
 * Negative controls for the shared #547 whole-page-flow detector
 * (test/wholePageFlow.ts): the detector the ScrollRegion and
 * ScreenShell contract tests assert with must itself be proven
 * to catch a scroller by each mechanism it claims to cover —
 * inline-style overflow and class-based overflow from a rendered
 * `<style>` block — and to stay silent on ordinary markup.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { verticalScrollers } from "./wholePageFlow.js";
test("verticalScrollers detects an inline-style scroller", () => {
  const html = `<div style="overflow-y: auto"><p>content</p></div>`;
  assert.equal(verticalScrollers(html).length, 1);
});
test("verticalScrollers detects a class-based scroller (negative control)", () => {
  const html =
    `<style>.bounded { overflow-y: scroll; }</style>` + `<div class="bounded"><p>content</p></div>`;
  assert.equal(verticalScrollers(html).length, 1);
});
test("verticalScrollers reads the overflow shorthand's vertical value", () => {
  assert.deepEqual(verticalScrollers(`<div style="overflow: auto hidden"></div>`), []);
  assert.equal(verticalScrollers(`<div style="overflow: hidden auto"></div>`).length, 1);
});
test("verticalScrollers ignores non-scrolling markup and hidden overflow", () => {
  const html =
    `<style>.clipped { overflow: hidden; }</style>` +
    `<div class="clipped" style="overflow-y: hidden"><p>content</p></div>`;
  assert.deepEqual(verticalScrollers(html), []);
});
