/**
 * Contract tests for the shipped shell/heading components of
 * the #119 dedupe set: ScreenShell (the fixed-shell frame) and
 * SectionHeading (the canonical section heading). Each owns its
 * treatment outright — the pins hold the treatments and the
 * package-root exports.
 *
 * Toolbar — the recipedetail tranche's pinned bar — joins the
 * set in the #119 extraction round and is pinned here;
 * StatusMessage retired into CenteredText
 * (test/centeredText.test.mjs) in the dedupe.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function code(file) {
  return readFileSync(join(here, "..", "src", "components", file), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

test("the shell components are exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  for (const name of ["ScreenShell", "SectionHeading", "Toolbar"]) {
    assert.equal(typeof dist[name], "function", `${name} must be exported from @spudly/ui`);
  }
});

test("ScreenShell owns the fixed-shell frame", () => {
  const shell = code("ScreenShell.tsx");
  assert.match(shell, /styled\(YStack, \{\s+name: "ScreenShell",/);
  assert.match(shell, /flex: 1,\s+backgroundColor: "\$surface",/);
  assert.match(shell, /Omit<StyledScreenShellProps, "flex" \| "backgroundColor">/);
});

test("Toolbar owns the pinned bar's inset, gap, wrap, and hairline divider", () => {
  const toolbar = code("Toolbar.tsx");
  assert.match(toolbar, /styled\(XStack, \{\s+name: "Toolbar",/);
  assert.match(toolbar, /flexWrap: "wrap",\s+alignItems: "center",/);
  assert.match(toolbar, /gap: tokens\.spacing\[2\],/);
  assert.match(toolbar, /borderBottomWidth: 1,\s+borderBottomColor: tokens\.colors\.gray\.gray2,/);
  assert.match(
    toolbar,
    /paddingHorizontal: tokens\.spacing\[4\],\s+paddingVertical: tokens\.spacing\[3\],/,
  );
  for (const owned of [
    "flexWrap",
    "alignItems",
    "gap",
    "borderBottomWidth",
    "borderBottomColor",
    "paddingHorizontal",
    "paddingVertical",
  ]) {
    assert.match(
      toolbar,
      new RegExp(String.raw`\|\s*"${owned}"`),
      `ToolbarProps must omit the bar-owned ${owned}`,
    );
  }
  assert.match(toolbar, /export type ToolbarProps = Omit<\s+StyledToolbarProps,/);
});

test("SectionHeading is the subheading treatment with no baked-in padding", () => {
  const heading = code("SectionHeading.tsx");
  assert.match(heading, /<Text variant="subheading">\{children\}<\/Text>/);
  assert.doesNotMatch(
    heading,
    /padding/,
    "the heading carries no inset or offset — the parent owns separation (Stephen's dedupe ruling)",
  );
});
