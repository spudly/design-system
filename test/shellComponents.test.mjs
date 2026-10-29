/**
 * Contract tests for the shell components of the #119
 * recipes-detail tranche: ScreenShell and Toolbar (the
 * fixed-shell chrome RecipeDetailPage composes), SectionHeading
 * (its bare section headings), and StatusMessage (its centered
 * status line). Each owns its treatment outright — the pins
 * hold the treatments and the package-root exports.
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
  for (const name of ["ScreenShell", "Toolbar", "SectionHeading", "StatusMessage"]) {
    assert.equal(typeof dist[name], "function", `${name} must be exported from @spudly/ui`);
  }
});

test("ScreenShell owns the fixed-shell frame", () => {
  const shell = code("ScreenShell.tsx");
  assert.match(shell, /styled\(YStack, \{\s+name: "ScreenShell",/);
  assert.match(shell, /flex: 1,\s+backgroundColor: "\$surface",/);
  assert.match(shell, /Omit<StyledScreenShellProps, "flex" \| "backgroundColor">/);
});

test("Toolbar owns the pinned bar's inset, gap, and divider", () => {
  const toolbar = code("Toolbar.tsx");
  assert.match(toolbar, /styled\(XStack, \{\s+name: "Toolbar",/);
  assert.match(toolbar, /flexWrap: "wrap",\s+alignItems: "center",/);
  assert.match(toolbar, /borderBottomWidth: 1,/);
  assert.match(toolbar, /paddingHorizontal: tokens\.spacing\[4\],/);
  assert.match(toolbar, /paddingVertical: tokens\.spacing\[3\],/);
});

test("SectionHeading owns the bare heading treatment", () => {
  const heading = code("SectionHeading.tsx");
  assert.match(heading, /fontSize=\{tokens\.typography\.fontSize\.lg\}/);
  assert.match(heading, /fontWeight=\{tokens\.typography\.fontWeight\.semibold\}/);
  assert.match(heading, /paddingHorizontal="\$4"/, "the heading aligns to the panel inset");
});

test("StatusMessage is a centered status line exposed as text", () => {
  const message = code("StatusMessage.tsx");
  assert.match(message, /accessibilityRole="text"/);
  assert.match(message, /textAlign="center"/);
  assert.match(message, /fontSize=\{tokens\.typography\.fontSize\.sm\}/);
});
