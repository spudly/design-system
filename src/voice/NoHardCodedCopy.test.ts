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

/**
 * Code fragments caught between a generic's ">" and the next
 * "<" (type declarations, ternaries, call arguments) are not
 * copy. They are identified by code context — leading closers,
 * operators, casts, dotted calls, unbalanced call parens — NOT
 * by blanket punctuation bans, so real copy carrying parens or
 * semicolons ("Save (optional)") still counts as a literal.
 */
function isCodeFragment(text: string) {
  if (/^[)\]};:,(`]/.test(text)) return true;
  if (/^case\s/.test(text)) return true;
  if (/^\d+\s*\?/.test(text)) return true;
  if (/^as\s/.test(text) || text.includes(" as ")) return true;
  if (text === "return" || text === "void") return true;
  if (/^(export|function|const|let|var|type|import|else|if|catch|switch|for|while)\b/.test(text))
    return true;
  // (A lone lowercase word is NOT excluded: copy split by
  // expressions leaves real fragments like the "of" in
  // `Round {n} of {count}` and the "items" in `{count} items`.
  // The baseline absorbs the rare identifier-shaped fragment.)
  if (text.includes("===") || text.includes("!==")) return true;
  if (text.includes("&&") || text.includes("||")) return true;
  if (text.includes("=>") || text.includes("?:")) return true;
  if (text.includes(");")) return true;
  // A semicolon alone does not make copy code ("Save; continue"
  // is copy) — but a declaration after one does: "; name:" or
  // "; export" is a type/statement fragment, never copy.
  if (/;\s*\w+:/.test(text) || /;\s*export/.test(text)) return true;
  // Straight quotes and template markers live in code strings
  // and import statements (`} from "…"; import {`), never in
  // rendered JSX copy.
  if (text.includes('"') || text.includes("$")) return true;
  if (/;\s*import/.test(text) || text.startsWith("from ")) return true;
  if (/\b\w+\.\w+\(/.test(text)) return true;
  if (text.includes("(") && !text.includes(")")) return true;
  if (text.includes("(") && text.includes(":")) return true;
  if (/[={}|]/.test(text)) return true;
  return false;
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

/**
 * JSX text segments in one source file, in every position copy
 * can sit: before a closing tag, before an expression
 * (`Hello {name}`), after an expression (`{count} items`), and
 * between two expressions (`{first}Hello {second}`).
 */
function extractJsxCopy(code: string): string[] {
  const segments = [
    ...code.matchAll(/>\s*([^<>{}]+?)\s*</g),
    ...code.matchAll(/>\s*([^<>{}]+?)\s*\{/g),
    ...code.matchAll(/\}\s*([^<>{}]+?)\s*</g),
    ...code.matchAll(/\}\s*([^<>{}]+?)\s*\{/g),
  ];
  const found = new Set<string>();
  for (const match of segments) {
    const text = match[1].replaceAll(/\s+/g, " ").trim();
    if (isCodeFragment(text)) continue;
    if (text.length >= 2 && /[A-Za-z]/.test(text)) found.add(text);
  }
  return [...found];
}

/** Copy attributes in every literal form: attr="…", attr='…', attr={"…"} / attr={'…'}. */
function extractAttributeCopy(code: string): string[] {
  const attrPattern = new RegExp(
    String.raw`(?:${COPY_ATTRIBUTES.join("|")})\s*=\s*(?:\{\s*)?["']([^"']*[A-Za-z][^"']*)["']`,
    "g",
  );
  const found = new Set<string>();
  for (const match of code.matchAll(attrPattern)) {
    const text = match[1].replaceAll(/\s+/g, " ").trim();
    if (text.length >= 2) found.add(text);
  }
  return [...found];
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
      for (const text of extractJsxCopy(code)) found.add(`${rel}|jsx|${text}`);
      for (const text of extractAttributeCopy(code)) found.add(`${rel}|attr|${text}`);
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

test("scanner regressions: copy beside and between expressions is detected", () => {
  assert.ok(extractJsxCopy("<Text>Hello {name}</Text>").includes("Hello"));
  assert.ok(extractJsxCopy("<Text>{count} items</Text>").includes("items"));
  assert.ok(extractJsxCopy("<Text>{first}Hello {second}</Text>").includes("Hello"));
});

test("scanner regressions: copy carrying parens or a semicolon still counts", () => {
  assert.ok(extractJsxCopy("<Text>Save (optional)</Text>").includes("Save (optional)"));
  assert.ok(extractJsxCopy("<Text>Save; continue</Text>").includes("Save; continue"));
  // …while the code fragments those characters appear in do not.
  assert.equal(isCodeFragment("string; renderItem: ListRenderItem"), true);
  assert.equal(isCodeFragment("as const; export type Props"), true);
});

test("scanner regressions: copy attributes in brace and single-quote forms are detected", () => {
  assert.ok(extractAttributeCopy('<Field label={"New label"} />').includes("New label"));
  assert.ok(extractAttributeCopy("<Field label='New label' />").includes("New label"));
  assert.ok(extractAttributeCopy('<Field label="New label" />').includes("New label"));
});

test("the baseline inventory is sorted and duplicate-free (keeps diffs reviewable)", () => {
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as string[];
  assert.deepEqual(baseline, [...new Set(baseline)].sort());
});
