import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Contract tests for #255: the DS auth pages submit on
 * Enter/return. The retired web views were native forms, so
 * Enter submitted; the DS pages render TextFields whose
 * fields are internal to the page, so the submit-on-enter
 * wiring can only live in the page itself. Source-scan style,
 * like the b3cPages batch these pages shipped in: every field
 * of every auth page must route its submit-editing event to
 * the page's submit intent, held while loading exactly the
 * way the (disabled) submit button is, and button activation
 * must stay wired to the same intent.
 */

const page = (name) => readFileSync(`src/pages/${name}.tsx`, "utf8");

const AUTH_PAGES = [
  { name: "SignInPage", fields: 2 },
  { name: "SignUpPage", fields: 3 },
  { name: "ForgotPasswordPage", fields: 1 },
  { name: "ResetPasswordPage", fields: 1 },
];

const textFieldBlocks = (source) =>
  source
    .split("<TextField")
    .slice(1)
    .map((chunk) => chunk.split("/>")[0]);

for (const { name, fields } of AUTH_PAGES) {
  test(`${name}: every field submits on Enter/return, held while loading`, () => {
    const source = page(name);
    const blocks = textFieldBlocks(source);
    assert.equal(blocks.length, fields, `${name} field count`);
    for (const block of blocks) {
      assert.match(
        block,
        /onSubmitEditing=\{submitFromField\}/,
        `${name} field wires onSubmitEditing`,
      );
    }
    // Exactly the final field advertises the "go" return key.
    assert.equal(
      (source.match(/returnKeyType="go"/g) ?? []).length,
      1,
      `${name} final field carries returnKeyType="go"`,
    );
    // The shared handler guards on loading (the button is
    // disabled then) and otherwise fires the submit intent.
    assert.match(
      source,
      /const submitFromField = \(\) => \{\s*if \(!loading\) \{\s*onSubmit\(\);\s*\}\s*\};/,
      `${name} submitFromField guards loading and calls onSubmit`,
    );
  });

  test(`${name}: button activation still submits via onPress`, () => {
    const source = page(name);
    assert.match(source, /disabled=\{loading\}/, `${name} button disables while loading`);
    assert.match(source, /onPress=\{onSubmit\}/, `${name} button onPress is the submit intent`);
  });
}
