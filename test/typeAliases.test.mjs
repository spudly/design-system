/**
 * Type aliases, not interfaces (#214): Stephen's rule (PR #205 review —
 * "We should always use type aliases, not interfaces") as a CI guard.
 *
 * Two layers:
 *
 * - The sweep guard: every `.ts` / `.tsx` file under `src/` (including
 *   `.d.ts`) is scanned for `interface` declarations; the scan must
 *   find exactly one — the allowlisted exception below. This runs
 *   today via `node --test`. When the TypeScript lint restoration
 *   lands (eslint-config #8), `@typescript-eslint/consistent-type-
 *   definitions` set to `'type'` supersedes this text scan with a
 *   parser-backed rule; until then this guard is the enforcement.
 *
 * - Detector behaviour: the scanner is exercised on synthetic snippets
 *   so its precision is pinned — declarations are caught in their real
 *   forms (plain, exported, generic, `extends`, `declare`, nested in
 *   blocks and template interpolations), while the word "interface" in
 *   comments, strings, template text and property positions is not a
 *   declaration.
 *
 * The one exception: `TamaguiCustomConfig` in `src/tamagui.config.ts`
 * sits inside `declare module "tamagui"` and merges with @tamagui/web's
 * own `export interface TamaguiCustomConfig` — that merging is
 * Tamagui's documented config-typing contract, and a type alias cannot
 * merge (it would be a duplicate identifier). It stays an interface
 * deliberately; if it ever disappears, update the allowlist here.
 *
 * How the scanner works: a small lexer blanks comments and string /
 * template literal spans (newlines and length preserved, so indexes
 * line up with the raw source) and the declaration pattern is matched
 * over what remains. Code inside template interpolations is NOT
 * blanked — a function body in `${ ... }` can legally declare an
 * interface, so interpolations are scanned as code. A quote opens a
 * string only in expression position (after an operator, opener,
 * separator, or a keyword such as `return`/`from`), so an apostrophe
 * in JSX text ("Don't") never starts a phantom string. Regex literals
 * are not modelled; a `/` that opens a regex containing a quote could
 * desync the lexer — no such pattern exists under `src/` today, and
 * the whole-tree exact-match assertion makes any future drift fail
 * loudly here rather than slip through quietly.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const STRING_KEYWORDS = new Set([
  "return",
  "case",
  "typeof",
  "instanceof",
  "in",
  "of",
  "new",
  "delete",
  "void",
  "yield",
  "await",
  "from",
  "import",
  "else",
  "do",
  "throw",
]);
const STRING_PREV_CHARS = new Set("([{,;:=!&|?+-*/%<>^~");

/** Scanner state: quote mode plus a stack of open constructs. */
function createScanner() {
  return { quote: null, stack: [], prev: "", prevWord: "" };
}

function noteEmitted(scanner, text) {
  for (const ch of text) {
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") continue;
    if (/[\w$]/.test(ch)) {
      scanner.prevWord += ch;
    } else {
      scanner.prevWord = "";
    }
    scanner.prev = ch;
  }
}

function isStringPosition(scanner) {
  return (
    scanner.prev === "" ||
    STRING_PREV_CHARS.has(scanner.prev) ||
    STRING_KEYWORDS.has(scanner.prevWord)
  );
}

function stepComment(scanner, ch, next) {
  if (scanner.quote === "line") {
    if (ch === "\n") scanner.quote = null;
    return [ch === "\n" ? "\n" : " ", 1];
  }
  if (ch === "*" && next === "/") {
    scanner.quote = null;
    return ["  ", 2];
  }
  return [ch === "\n" ? "\n" : " ", 1];
}

function stepQuoted(scanner, ch) {
  const quoteChar = scanner.quote === "single" ? "'" : '"';
  if (ch === "\\") return ["  ", 2];
  if (ch === quoteChar || ch === "\n") {
    scanner.quote = null;
    return [ch === "\n" ? "\n" : " ", 1];
  }
  return [" ", 1];
}

function stepTemplateText(scanner, ch, next) {
  if (ch === "\\") return ["  ", 2];
  if (ch === "`") {
    scanner.stack.pop();
    return [" ", 1];
  }
  if (ch === "$" && next === "{") {
    scanner.stack.push("${");
    return ["  ", 2];
  }
  return [ch === "\n" ? "\n" : " ", 1];
}

function stepCodeQuote(scanner, ch, next) {
  if (ch === "/" && next === "/") {
    scanner.quote = "line";
    return ["  ", 2];
  }
  if (ch === "/" && next === "*") {
    scanner.quote = "block";
    return ["  ", 2];
  }
  if ((ch === "'" || ch === '"') && isStringPosition(scanner)) {
    scanner.quote = ch === "'" ? "single" : "double";
    return [" ", 1];
  }
  return null;
}

function stepCode(scanner, ch, next) {
  const quoted = stepCodeQuote(scanner, ch, next);
  if (quoted) return quoted;
  if (ch === "`") {
    scanner.stack.push("T");
    return [" ", 1];
  }
  if (ch === "{") {
    scanner.stack.push("{");
    return [ch, 1];
  }
  if (ch === "}") {
    scanner.stack.pop();
    return [ch, 1];
  }
  return [ch, 1];
}

/** One lexer step: [emitted, advance]. Mutates the scanner state. */
function stepBlanker(scanner, ch, next) {
  if (scanner.quote === "line" || scanner.quote === "block") {
    return stepComment(scanner, ch, next);
  }
  if (scanner.quote === "single" || scanner.quote === "double") {
    return stepQuoted(scanner, ch);
  }
  if (scanner.stack.at(-1) === "T") return stepTemplateText(scanner, ch, next);
  return stepCode(scanner, ch, next);
}

/** Blank out comments and string/template literals, preserving newlines. */
export function blankNonCode(code) {
  const scanner = createScanner();
  let out = "";
  let i = 0;
  while (i < code.length) {
    const [emitted, advance] = stepBlanker(scanner, code[i], code[i + 1] ?? "");
    out += emitted;
    noteEmitted(scanner, emitted);
    i += advance;
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
    else if (/\.tsx?$/.test(entry.name)) yield path;
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
    ["function f() { interface Local { a: string } return 1; }", "Local"],
  ];
  for (const [code, name] of cases) {
    assert.equal(findInterfaceDeclarations(code).length, 1, code);
    assert.equal(findInterfaceDeclarations(code)[0].name, name, code);
  }
});

test("detector scans code inside template interpolations", () => {
  const code =
    // eslint-disable-next-line no-template-curly-in-string -- the snippet under test is data, not a template literal
    "const x = `${(() => { interface NewProps { value: string } return 1; })()}`;";
  const found = findInterfaceDeclarations(code);
  assert.equal(found.length, 1);
  assert.equal(found[0].name, "NewProps");
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

test("a JSX-text apostrophe does not hide a declaration on the same line", () => {
  const hidden = "const el = <Text>Don't miss it</Text>; interface Foo { a: string }";
  const found = findInterfaceDeclarations(hidden);
  assert.equal(found.length, 1);
  assert.equal(found[0].name, "Foo");
  const innocent = "const el = <Text>Don't miss it</Text>;";
  assert.deepEqual(findInterfaceDeclarations(innocent), []);
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

test("the exception sits inside the augmentation block, not just after it", () => {
  const code = readFileSync(join(repoRoot, "src/tamagui.config.ts"), "utf8");
  const blanked = blankNonCode(code);
  const blockStart = blanked.search(/declare\s+module/);
  assert.ok(blockStart !== -1, 'the `declare module "tamagui"` block must exist');
  const openBrace = blanked.indexOf("{", blockStart);
  let depth = 0;
  let blockEnd = -1;
  for (let i = openBrace; i < blanked.length; i += 1) {
    if (blanked[i] === "{") depth += 1;
    if (blanked[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        blockEnd = i;
        break;
      }
    }
  }
  assert.ok(blockEnd !== -1, "the augmentation block must close");
  const hit = findInterfaceDeclarations(code).find(
    (found) => found.name === "TamaguiCustomConfig",
  );
  assert.ok(hit, "TamaguiCustomConfig must be declared");
  assert.ok(
    hit.index > openBrace && hit.index < blockEnd,
    "TamaguiCustomConfig must be declared between the augmentation block's braces",
  );
});
