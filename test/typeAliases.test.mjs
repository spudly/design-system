/**
 * Type aliases, not interfaces (#214): Stephen's rule (PR #205 review —
 * "We should always use type aliases, not interfaces") as a CI guard.
 *
 * Two layers:
 *
 * - The sweep guard: every `.ts` / `.tsx` file under `src/` is scanned
 *   for `interface` declarations; the scan must find exactly one — the
 *   allowlisted exception below. This runs today via `node --test`.
 *   When the TypeScript lint restoration lands (eslint-config #8),
 *   `@typescript-eslint/consistent-type-definitions` set to `'type'`
 *   supersedes this text scan with a parser-backed rule; until then
 *   this guard is the enforcement.
 *
 * - Detector behaviour: the scanner is exercised on synthetic snippets
 *   so its precision is pinned — declarations are caught in their real
 *   forms (plain, exported, generic, `extends`, `declare`), while the
 *   word "interface" in comments, strings, templates and property
 *   positions is not a declaration.
 *
 * The one exception: `TamaguiCustomConfig` in `src/tamagui.config.ts`
 * sits inside `declare module "tamagui"` and merges with @tamagui/web's
 * own `export interface TamaguiCustomConfig` — that merging is
 * Tamagui's documented config-typing contract, and a type alias cannot
 * merge (it would be a duplicate identifier). It stays an interface
 * deliberately; if it ever disappears, update the allowlist here.
 *
 * Scanner simplifications (documented, safe for declaration hunting):
 * comments and string/template literal spans are blanked before
 * matching. A declaration can only be missed if it sits inside a span
 * the blanker misreads as a literal (e.g. after an unbalanced quote in
 * JSX text) — and the exact-match assertion on the whole tree makes
 * any such drift fail loudly here rather than slip through quietly.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const blank = (ch) => (ch === "\n" ? "\n" : " ");

/** One step in code position: [emitted, nextIndex, nextMode]. */
function stepCode(ch, next) {
  switch (ch) {
    case "/": {
      if (next === "/") return ["  ", 2, "lineComment"];
      if (next === "*") return ["  ", 2, "blockComment"];
      return [ch, 1, "code"];
    }
    case "'": {
      return [" ", 1, "single"];
    }
    case '"': {
      return [" ", 1, "double"];
    }
    case "`": {
      return [" ", 1, "template"];
    }
    default: {
      return [ch, 1, "code"];
    }
  }
}

/** One step inside a quoted ('...' or "...") literal. */
function stepQuoted(ch, quote) {
  if (ch === "\\") return ["  ", 2, quote === "'" ? "single" : "double"];
  if (ch === quote || ch === "\n") return [blank(ch), 1, "code"];
  return [" ", 1, quote === "'" ? "single" : "double"];
}

/** One step in the current mode: [emitted, advance, nextMode]. */
function stepBlanker(mode, ch, next) {
  switch (mode) {
    case "code": {
      return stepCode(ch, next);
    }
    case "lineComment": {
      return ch === "\n" ? ["\n", 1, "code"] : [" ", 1, "lineComment"];
    }
    case "blockComment": {
      return ch === "*" && next === "/" ? ["  ", 2, "code"] : [blank(ch), 1, "blockComment"];
    }
    case "single": {
      return stepQuoted(ch, "'");
    }
    case "double": {
      return stepQuoted(ch, '"');
    }
    default: {
      // Template literal: expressions inside ${ } are expression
      // position — declarations cannot appear there — so the whole
      // span stays blanked; only the closing backtick ends the mode.
      if (ch === "\\") return ["  ", 2, "template"];
      return ch === "`" ? [" ", 1, "code"] : [blank(ch), 1, "template"];
    }
  }
}

/** Blank out comments and string/template literals, preserving newlines. */
export function blankNonCode(code) {
  let out = "";
  let mode = "code";
  let i = 0;
  while (i < code.length) {
    const [emitted, advance, nextMode] = stepBlanker(mode, code[i], code[i + 1] ?? "");
    out += emitted;
    i += advance;
    mode = nextMode;
  }
  return out;
}

const DECLARATION =
  /(?:^|[^\w$.])(?:export\s+)?(?:declare\s+)?(?:abstract\s+)?interface\s+([A-Za-z_$][\w$]*)(?:\s*<[^;{}]*>)?\s*(?:extends\b|[{])/gm;

/** Find interface declarations: [{ name, index }] over blanked code. */
export function findInterfaceDeclarations(code) {
  const blanked = blankNonCode(code);
  const found = [];
  for (const match of blanked.matchAll(DECLARATION)) {
    found.push({ name: match[1], index: match.index });
  }
  return found;
}

function* sourceFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(path);
    else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")) yield path;
  }
}

test("detector catches declarations in their real forms", () => {
  const cases = [
    ["interface Foo { a: string }", "Foo"],
    ["export interface Foo { a: string }", "Foo"],
    ["export interface Foo<T> extends Bar<T> { a: T }", "Foo"],
    ["interface Foo extends Bar, Baz { a: string }", "Foo"],
    ["declare interface Foo { a: string }", "Foo"],
    ["export declare interface Foo { a: string }", "Foo"],
    ["interface Foo extends Bar;", "Foo"],
    ["  interface Nested {\n  a: string;\n}", "Nested"],
  ];
  for (const [code, name] of cases) {
    assert.equal(findInterfaceDeclarations(code).length, 1, code);
    assert.equal(findInterfaceDeclarations(code)[0].name, name, code);
  }
});

test("detector ignores the word in comments, strings and property positions", () => {
  const cases = [
    "// interface Foo { a: string }",
    "/* interface Foo { a: string } */",
    'const label = "interface Foo { not a declaration }";',
    "const label = `interface Foo { not a declaration }`;",
    "type T = { interface: string };",
    "type T = { interface?: number };",
    "const x = obj.interface;",
    "type Foo = Bar & { a: string };",
    "export type Props = { onPress: () => void };",
  ];
  for (const code of cases) {
    assert.deepEqual(findInterfaceDeclarations(code), [], code);
  }
});

test("src/ declares no interfaces beyond the Tamagui augmentation exception", () => {
  const hits = [];
  for (const file of sourceFiles(join(repoRoot, "src"))) {
    const code = readFileSync(file, "utf8");
    for (const hit of findInterfaceDeclarations(code)) {
      hits.push({ file: file.slice(repoRoot.length + 1), name: hit.name });
    }
  }
  assert.deepEqual(hits, [{ file: "src/tamagui.config.ts", name: "TamaguiCustomConfig" }]);
});

test("the exception is the declare-module augmentation, not a stray declaration", () => {
  const code = readFileSync(join(repoRoot, "src/tamagui.config.ts"), "utf8");
  const augmentAt = code.indexOf('declare module "tamagui"');
  const declarationAt = code.indexOf("interface TamaguiCustomConfig");
  assert.ok(augmentAt !== -1, 'the `declare module "tamagui"` block must exist');
  assert.ok(
    declarationAt > augmentAt,
    "TamaguiCustomConfig must be declared inside the augmentation block",
  );
});
