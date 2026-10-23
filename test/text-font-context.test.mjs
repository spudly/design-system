/**
 * Contract test for spudly/design-system#69: the Memorize page
 * stories (MyVersesPage, VerseSearchPage) rendered with an
 * inconsistent font-family — parts of the page in the theme stack,
 * parts in whatever family the surrounding page inherited.
 *
 * Root cause, verified by rendering the built Storybook and
 * reading computed styles: on web, Tamagui resolves a styled()
 * `fontFamily` to `var(--f-family)`, a CSS variable only a
 * font-context class (`font_body` / `font_verse`) defines — and
 * styled() values never emit that class. So DS Text (and Button's
 * internal label) inherited the environment default family, while
 * Tamagui's fonted primitives (Input, Label) rendered in the theme
 * stack. An instance `fontFamily` prop is what makes Tamagui emit
 * the font-context class on the element.
 *
 * The contract:
 * 1. Text passes an instance `fontFamily` prop — `body` for the
 *    UI variants, `verse` for the verse variant.
 * 2. VerseText passes an instance `fontFamily="verse"` prop.
 * 3. Button passes an instance `fontFamily="body"` prop (the same
 *    instance-prop rule its label `color` already follows).
 * 4. No page story or page component re-introduces a local font
 *    override to work around the primitives — the fix lives in the
 *    primitives, so every story and app screen gets it.
 *
 * Source-scan test (like theme-fonts.test.mjs part 4): the
 * rendering proof lives in the PR description, this pins the
 * mechanism so it cannot silently regress to styled()-only.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, "..", "src");

function readSrc(rel) {
  return readFileSync(join(srcDir, rel), "utf8");
}

test("Text passes fontFamily as an instance prop for both roles (#69)", () => {
  const source = readSrc("components/Text.tsx");
  assert.match(
    source,
    /fontFamily=\{variant === "verse" \? "verse" : "body"\}/,
    'Text must pass fontFamily={variant === "verse" ? "verse" : "body"} as an instance prop',
  );
});

test("VerseText passes fontFamily as an instance prop (#69)", () => {
  const source = readSrc("components/VerseText.tsx");
  assert.match(
    source,
    /<StyledVerseText fontFamily="verse"/,
    'VerseText must pass fontFamily="verse" as an instance prop',
  );
});

test("Button passes fontFamily as an instance prop (#69)", () => {
  const source = readSrc("components/Button.tsx");
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
  const source = readSrc("components/SelectField.tsx");
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
