import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

describe("textFontContext", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const srcDir = join(here, "../..", "src");

  function readSrc(rel: string) {
    return readFileSync(join(srcDir, rel), "utf8");
  }

  test("Text passes fontFamily as an instance prop for both roles (#69)", () => {
    const source = readSrc("widgets/Text.tsx");
    assert.match(
      source,
      /fontFamily=\{variant === "verse" \? "verse" : "body"\}/,
      'Text must pass fontFamily={variant === "verse" ? "verse" : "body"} as an instance prop',
    );
  });

  test("VerseText passes fontFamily as an instance prop (#69)", () => {
    const source = readSrc("widgets/VerseText.tsx");
    assert.match(
      source,
      /<StyledVerseText fontFamily="verse"/,
      'VerseText must pass fontFamily="verse" as an instance prop',
    );
  });

  test("Button passes fontFamily as an instance prop (#69)", () => {
    const source = readSrc("widgets/Button.tsx");
    assert.match(
      source,
      /fontFamily="body"/,
      'Button must pass fontFamily="body" as an instance prop',
    );
  });

  test("SelectField passes fontFamily as an instance prop on its value and item text (#69)", () => {
    // Found by the same render check on RecipesPage: the selected
    // value ("All statuses", "Newest") was the one remaining
    // non-theme family on the page. SelectField's label is a fonted
    // Tamagui Label, so it already rendered in the theme stack.
    const source = readSrc("widgets/SelectField.tsx");
    assert.match(
      source,
      /<StyledValue placeholder=\{placeholder\} fontFamily="body" \/>/,
      'SelectField value must pass fontFamily="body" as an instance prop',
    );
    assert.match(
      source,
      /<StyledItemText fontFamily="body">/,
      'SelectField item text must pass fontFamily="body" as an instance prop',
    );
  });

  test("the #69 page components and their stories carry no local font-family override", () => {
    // Scoped to the pages #69 names: two Eciperay page stories set a
    // token fontFamily on raw fixture markup (a pre-existing, correct
    // use — raw elements have no primitive to own their font), so a
    // blanket pages/ ban would be wrong. The Memorize pages and their
    // stories must rely on the primitives entirely.
    for (const file of [
      "pages/MyVersesPage.tsx",
      "pages/MyVersesPage.stories.tsx",
      "pages/VerseSearchPage.tsx",
      "pages/VerseSearchPage.stories.tsx",
    ]) {
      const source = readSrc(file);
      assert.ok(
        !/fontFamily/.test(source),
        `${file} must not set fontFamily locally — the primitives own the font context (#69)`,
      );
    }
  });
});

describe("textVariants", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, "../..", "src", "widgets", "Text.tsx"), "utf8");
  const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

  test("the label variant is the section eyebrow treatment", () => {
    assert.match(
      code,
      /label: \{\s+fontSize: tokens\.typography\.fontSize\.xs,\s+fontWeight: tokens\.typography\.fontWeight\.semibold,\s+letterSpacing: 0\.3,\s+textTransform: "uppercase",\s+color: "\$textMuted",\s+\},/,
    );
  });

  test("the formTitle variant is the 2xl bold form-flow title", () => {
    assert.match(
      code,
      /formTitle: \{\s+fontSize: tokens\.typography\.fontSize\["2xl"\],\s+fontWeight: tokens\.typography\.fontWeight\.bold,\s+\},/,
    );
  });

  test("both variants are in the public TextProps union", () => {
    assert.match(code, /"formTitle"/);
    assert.match(code, /"label"/);
  });

  test("formTitle is a level-1 heading; label carries no heading level", () => {
    assert.match(
      code,
      /variant === "heading" \|\| variant === "title" \|\| variant === "formTitle"/,
      "formTitle must sit in the level-1 heading group",
    );
  });

  test("the muted variant is the muted role at body size", () => {
    assert.match(code, /muted: \{\s+color: "\$textMuted",\s+\},/);
  });

  test("the success variant is small text in the success treatment", () => {
    assert.match(
      code,
      /success: \{\s+fontSize: tokens\.typography\.fontSize\.sm,\s+color: tokens\.colors\.success\.success8,\s+\},/,
    );
  });

  test("muted and success are in the public TextProps union and carry no heading level", () => {
    assert.match(code, /"muted"/);
    assert.match(code, /"success"/);
  });
});
