// Story inventory + component import graph for VR scoping
// (issue #114). Pure source analysis, no dependencies:
//
//   - every CSF story file under src/, with the story ids
//     Storybook derives from its title + export names;
//   - the static import graph over src/, so scope.mjs can walk
//     from a changed file to the stories whose render trees
//     include it.
//
// The id derivation mirrors @storybook/csf exactly for the shapes
// this repo uses (explicit meta titles, PascalCase story exports);
// test/visualRegressionScope.test.mjs pins the derived capture set
// against the committed baselines so any drift fails loudly.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

// Storybook's sanitize(): lowercase, runs of non-alphanumerics to
// a single dash, no leading/trailing dashes. Story ids are
// sanitize(title) + "--" + sanitize(storyNameFromExport(export)).
export function sanitizeStoryPart(part) {
  return part
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Storybook's storyNameFromExport(): a startCase over the export
// key ("CookLogFormOpen" -> "Cook Log Form Open").
export function storyNameFromExport(key) {
  const words = key
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .filter(Boolean);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function storyId(title, exportName) {
  return `${sanitizeStoryPart(title)}--${sanitizeStoryPart(storyNameFromExport(exportName))}`;
}

// Extract a story file's CSF title and story export names. The
// title is read from the meta object (the object literal the
// default export is built from); fixture data in story files also
// carries `title:` fields, so a bare first-match is not safe. The
// fallback — the file's unique slash-bearing title — covers meta
// shapes the object scan cannot follow; story titles in this repo
// always contain a "/" ("Pages/Eciperay/...", "Components/..."),
// fixture titles never do. Returns title: null when neither works.
export function parseStoryFile(text) {
  const storyExports = [
    ...text.matchAll(/^export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm),
  ].map((m) => m[1]);
  let title = titleFromMetaObject(text);
  if (!title) {
    const candidates = [...text.matchAll(/title:\s*["'`]([^"'`]+)["'`]/g)]
      .map((m) => m[1])
      .filter((t) => t.includes("/"));
    const unique = [...new Set(candidates)];
    if (unique.length === 1) title = unique[0];
  }
  return { title, storyExports };
}

function titleFromMetaObject(text) {
  const meta = /(?:const\s+meta\b[^=]*=|export\s+default)\s*\{/.exec(text);
  if (!meta) return null;
  const open = text.indexOf("{", meta.index);
  let depth = 0;
  let end = -1;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return null;
  const t = /title:\s*["'`]([^"'`]+)["'`]/.exec(text.slice(open, end + 1));
  return t ? t[1] : null;
}

const SOURCE_FILE = /\.(?:ts|tsx|js|jsx|json)$/;

function walkFiles(relBase, dir, out) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = `${relBase}/${entry}`;
    if (statSync(full).isDirectory()) walkFiles(rel, full, out);
    else if (SOURCE_FILE.test(entry)) out.push(rel);
  }
  return out;
}

// All source files under <repoRoot>/src, as repo-relative posix
// paths — the node set of the import graph.
export function listSourceFiles(repoRoot) {
  const srcDir = join(repoRoot, "src");
  if (!existsSync(srcDir)) return [];
  return walkFiles("src", srcDir, []).sort();
}

function extractSpecifiers(text) {
  const specs = new Set();
  for (const m of text.matchAll(/(?:import|export)\s+(?:[^'";]*?\sfrom\s+)?["']([^"']+)["']/g)) {
    specs.add(m[1]);
  }
  for (const m of text.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g)) specs.add(m[1]);
  for (const m of text.matchAll(/require\s*\(\s*["']([^"']+)["']\s*\)/g)) specs.add(m[1]);
  return [...specs];
}

const RESOLVE_EXTS = [".ts", ".tsx", ".js", ".jsx", ".json"];

// Resolve a relative specifier ("../components/Button.js") to a
// graph node, mirroring the bundler: strip the source extension,
// then try file extensions and directory indexes in order. Returns
// null for external packages and unresolvable paths.
export function resolveSpecifier(importer, spec, fileSet) {
  if (!spec.startsWith(".")) return null;
  const parts = dirname(importer).split("/");
  for (const seg of spec.split("/")) {
    if (seg === "." || seg === "") continue;
    else if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  const base = parts.join("/").replace(/\.(?:ts|tsx|js|jsx|mjs|cjs)$/, "");
  for (const ext of RESOLVE_EXTS) if (fileSet.has(base + ext)) return base + ext;
  for (const ext of RESOLVE_EXTS)
    if (fileSet.has(`${base}/index${ext}`)) return `${base}/index${ext}`;
  return null;
}

// Forward edges: file -> files it imports (within src/ only).
export function buildImportGraph(repoRoot, files) {
  const fileSet = new Set(files);
  const edges = new Map();
  for (const file of files) {
    if (file.endsWith(".json")) continue;
    const text = readFileSync(join(repoRoot, file), "utf8");
    const targets = new Set();
    for (const spec of extractSpecifiers(text)) {
      const resolved = resolveSpecifier(file, spec, fileSet);
      if (resolved && resolved !== file) targets.add(resolved);
    }
    edges.set(file, targets);
  }
  return edges;
}

// Every story file under src/ with its derived story ids. A story
// file whose title cannot be parsed is reported in `unparseable` —
// its ids are unknowable, so a scoped set computed alongside it
// must not be trusted (scope.mjs falls back to the full set).
export function collectStories(repoRoot, files) {
  const stories = [];
  const unparseable = [];
  for (const file of files) {
    if (!/\.stories\.(?:ts|tsx|js|jsx)$/.test(file)) continue;
    const { title, storyExports } = parseStoryFile(readFileSync(join(repoRoot, file), "utf8"));
    if (!title) {
      unparseable.push(file);
      continue;
    }
    stories.push({ file, title, ids: storyExports.map((name) => storyId(title, name)) });
  }
  return { stories, unparseable };
}
