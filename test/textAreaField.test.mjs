/**
 * Contract test for the MultilineField → TextAreaField rename
 * (spudly/design-system#180).
 *
 * The contracts pinned here:
 * 1. TextAreaField is exported from the package root (dist) and
 *    MultilineField is no longer exported under its old name.
 * 2. The component source keeps the field contract MultilineField had:
 *    a styled Tamagui TextArea named TextAreaField, a label wired
 *    via htmlFor, and error text wired through aria-describedby /
 *    aria-invalid, with numberOfLines defaulting to 4.
 * 3. No source file in src/ still references the old name.
 *
 * Run against the built output: `npm run build` first (the `test`
 * script does both).
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = await import("../dist/index.js");

test("TextAreaField is exported and MultilineField is gone (#180)", () => {
  assert.equal(typeof dist.TextAreaField, "function", "TextAreaField must be exported");
  assert.equal(dist.MultilineField, undefined, "MultilineField must not be exported");
});

test("TextAreaField keeps the labeled, error-aware field contract", () => {
  const source = readFileSync(join(root, "src", "components", "TextAreaField.tsx"), "utf8");
  assert.ok(source.includes("TextAreaField"), "styled name must be TextAreaField");
  assert.ok(source.includes("htmlFor={id}"), "label must be associated via htmlFor");
  assert.ok(source.includes("aria-describedby"), "error must be wired via aria-describedby");
  assert.ok(source.includes("aria-invalid"), "error must set aria-invalid");
  assert.ok(source.includes("numberOfLines = 4"), "numberOfLines must default to 4");
});

test("no source file still references MultilineField (#180)", () => {
  const offenders = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (
        /\.(ts|tsx)$/.test(entry.name) &&
        readFileSync(path, "utf8").includes("MultilineField")
      ) {
        offenders.push(path);
      }
    }
  };
  walk(join(root, "src"));
  assert.deepEqual(offenders, [], `old name still referenced in: ${offenders.join(", ")}`);
});
