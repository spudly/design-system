/**
 * Contract test for spudly/design-system#461: a non-image (initials)
 * Avatar must render with a 1px border matching its text color.
 *
 * This is a source scan, not a render test: the invariant is a
 * per-literal property of the Avatar source (same rationale as
 * src/widgets/badgeBorder.test.ts) — the Fallback styled definition
 * carries a fixed 1px border in "$primaryEmphasis", the exact token
 * the initials Text renders in, while the image path carries no border.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const srcPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
  "src",
  "widgets",
  "Avatar.tsx",
);
const text = readFileSync(srcPath, "utf8");

const fallbackDef = text.slice(
  text.indexOf("const Fallback"),
  text.indexOf("type StyledImageProps"),
);
const imageDef = text.slice(text.indexOf("const StyledImage"), text.indexOf("const Fallback"));

test("the initials fallback has a 1px border (#461)", () => {
  assert.ok(
    /borderWidth: 1,/.test(fallbackDef),
    "Avatar Fallback must set borderWidth: 1 so non-image avatars render a 1px border (#461)",
  );
});

test("the fallback border matches the initials text color (#461)", () => {
  assert.ok(
    /borderColor: "\$primaryEmphasis",/.test(fallbackDef),
    'Avatar Fallback must set borderColor: "$primaryEmphasis" so the border matches the initials text color (#461)',
  );
  assert.ok(
    /color: "\$primaryEmphasis"/.test(text),
    "Avatar initials must render in $primaryEmphasis, the token the border matches (#461)",
  );
});

test("image avatars carry no border (#461)", () => {
  assert.ok(
    !/borderWidth|borderColor/.test(imageDef),
    "StyledImage must not gain a border — image avatars are unchanged (#461)",
  );
});
