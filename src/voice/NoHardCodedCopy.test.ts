/**
 * No-new-hard-coded-copy guardrail (#539 tranche 4).
 *
 * The voice tranches (T1–T3) moved shared copy in src/pages,
 * src/views and src/widgets into the app-supplied voice object.
 * This repo-local check (standing in until eslint-config #42's
 * jsx-no-literals rule is consumable) keeps that from rotting:
 * it inventories the JSX text literals and copy-bearing
 * attribute literals that remain today — page-unique copy that
 * legitimately arrives as data, fixture-shaped strings, and the
 * like — in hardCodedCopyBaseline.json, and fails when a NEW
 * literal appears that is not in the baseline. Removing a
 * literal is always fine (the baseline may only shrink on that
 * side); adding one requires either routing the string through
 * the voice object / props, or a deliberate baseline update in
 * the same PR that a reviewer can see.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(here, "..");
const baselinePath = join(here, "hardCodedCopyBaseline.json");

const COPY_ATTRIBUTES = [
  "placeholder",
  "label",
  "title",
  "aria-label",
  "accessibilityLabel",
  "emptyMessage",
  "errorMessage",
];

function stripComments(text: string) {
  return text
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

function inventory(): string[] {
  const found = new Set<string>();
  for (const area of ["pages", "views", "widgets"]) {
    for (const file of walk(join(srcRoot, area))) {
      if (!file.endsWith(".tsx")) continue;
      if (file.includes(".test.") || file.includes(".stories.")) continue;
      if (file.endsWith("fixtures.ts") || file.endsWith("storyFixtures.ts")) continue;
      const rel = relative(srcRoot, file).replaceAll("\\", "/");
      const code = stripComments(readFileSync(file, "utf8"));
      for (const match of code.matchAll(/>\s*([^<>{}]+?)\s*</g)) {
        const text = match[1].replaceAll(/\s+/g, " ").trim();
        // Code fragments caught between a generic's ">" and the
        // next "<" (type declarations, ternaries) are not copy:
        // they carry code punctuation real copy never does.
        if (/[;={}|(]/.test(text) || text.includes("=>") || text.includes("?:")) continue;
        if (text.length >= 2 && /[A-Za-z]/.test(text)) found.add(`${rel}|jsx|${text}`);
      }
      const attrPattern = new RegExp(
        String.raw`(?:${COPY_ATTRIBUTES.join("|")})="([^"]*[A-Za-z][^"]*)"`,
        "g",
      );
      for (const match of code.matchAll(attrPattern)) {
        const text = match[1].replaceAll(/\s+/g, " ").trim();
        if (text.length >= 2) found.add(`${rel}|attr|${text}`);
      }
    }
  }
  return [...found].sort();
}

test("no new hard-coded copy literals in src/pages, src/views or src/widgets", () => {
  const baseline = new Set(JSON.parse(readFileSync(baselinePath, "utf8")) as string[]);
  const current = inventory();
  const added = current.filter((entry) => !baseline.has(entry));
  assert.deepEqual(
    added,
    [],
    `new hard-coded copy literal(s) — route shared copy through the voice object or props, or update hardCodedCopyBaseline.json deliberately in this PR:\n${added.join("\n")}`,
  );
});

test("the baseline inventory is sorted and duplicate-free (keeps diffs reviewable)", () => {
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as string[];
  assert.deepEqual(baseline, [...new Set(baseline)].sort());
});
