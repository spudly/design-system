import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Contract tests for #255: the DS auth screens submit on
 * Enter/return. The retired web views were native forms, so
 * Enter submitted; the DS screens render TextFields whose
 * fields are internal to each screen's form unit (the
 * SignInForm/SignUpForm/ForgotPasswordForm/ResetPasswordForm
 * components the auth pages compose since #119), so the
 * submit-on-enter wiring lives in the form unit. Source-scan
 * style, like the b3cPages batch these screens shipped in:
 * every field of every auth form must route its
 * submit-editing event to the form's submit intent, held
 * while loading exactly the way the (disabled) submit button
 * is, and button activation must stay wired to the same
 * intent.
 */

const form = (name) => readFileSync(`src/components/${name}.tsx`, "utf8");

const AUTH_FORMS = [
  { name: "SignInForm", fields: 2 },
  { name: "SignUpForm", fields: 3 },
  { name: "ForgotPasswordForm", fields: 1 },
  { name: "ResetPasswordForm", fields: 1 },
];

const textFieldBlocks = (source) =>
  source
    .split("<TextField")
    .slice(1)
    .map((chunk) => chunk.split("/>")[0]);

for (const { name, fields } of AUTH_FORMS) {
  test(`${name}: every field submits on Enter/return, held while loading`, () => {
    const source = form(name);
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
    const source = form(name);
    assert.match(source, /disabled=\{loading\}/, `${name} button disables while loading`);
    assert.match(source, /onPress=\{onSubmit\}/, `${name} button onPress is the submit intent`);
  });
}

test("TextField: submit-editing is held while an IME composition is active (web)", () => {
  const source = readFileSync("src/components/TextField.tsx", "utf8");
  // Composition is tracked on the field itself (web only —
  // Tamagui's Enter handler fires onSubmitEditing without a
  // composition check, so the guard must live in the shared
  // field every auth form renders).
  assert.match(
    source,
    /const composingRef = useRef\(false\);/,
    "TextField tracks composition state",
  );
  assert.match(
    source,
    /composingRef\.current = true;[\s\S]*?onCompositionStart\?\.\(event\);/,
    "composition start sets the flag and chains the caller's handler",
  );
  assert.match(
    source,
    /composingRef\.current = false;\s*compositionEndedAtRef\.current = performance\.now\(\);[\s\S]*?onCompositionEnd\?\.\(event\);/,
    "composition end clears the flag, stamps the end time, and chains the caller's handler",
  );
  assert.match(
    source,
    /if \(\s*isWeb &&\s*\(composingRef\.current \|\|\s*performance\.now\(\) - compositionEndedAtRef\.current < 100\)\s*\) \{\s*return;\s*\}\s*onSubmitEditing\?\.\(event\);/,
    "submit-editing is held while composing on web — and for the grace window after composition ends (Safari fires compositionend before the confirming Enter keydown) — and otherwise fires",
  );
  assert.match(
    source,
    /onCompositionStart: handleCompositionStart,[\s\S]*?onCompositionEnd: handleCompositionEnd,/,
    "the composition handlers are wired on the web target",
  );
});
