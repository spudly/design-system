/**
 * Voice-slot pins for the auth pages (#539 tranche 3a):
 * SignInPage's and SignUpPage's headings, and
 * ForgotPasswordPage's and ResetPasswordPage's headings and
 * intro lines come from the app-supplied voice object — the
 * DS ships no default strings. These pages have no copy props
 * for their headings or intro lines, so their copy reads the
 * voice slots directly.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const strip = (text: string) =>
  text.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const read = (name: string) => strip(readFileSync(join(here, `${name}.tsx`), "utf8"));

test("SignInPage reads its heading from the voice object", () => {
  const page = read("SignInPage");
  assert.match(page, /useVoice\(\)/);
  assert.match(page, /voice\.signInPage\.heading/, "slot heading is read");
  assert.doesNotMatch(page, /"Welcome back"|>\s*Welcome back\s*</);
});

test("SignUpPage reads its heading from the voice object", () => {
  const page = read("SignUpPage");
  assert.match(page, /useVoice\(\)/);
  assert.match(page, /voice\.signUpPage\.heading/, "slot heading is read");
  assert.doesNotMatch(page, /"Create account"|>\s*Create account\s*</);
});

test("ForgotPasswordPage reads its heading and description from the voice object", () => {
  const page = read("ForgotPasswordPage");
  assert.match(page, /useVoice\(\)/);
  for (const slot of ["heading", "description"]) {
    assert.match(page, new RegExp(`voice\\.forgotPasswordPage\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    page,
    /"Reset password"|>\s*Reset password\s*<|send a reset link to your email/,
  );
});

test("ResetPasswordPage reads its heading and description from the voice object", () => {
  const page = read("ResetPasswordPage");
  assert.match(page, /useVoice\(\)/);
  for (const slot of ["heading", "description"]) {
    assert.match(page, new RegExp(`voice\\.resetPasswordPage\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    page,
    /"New password"|>\s*New password\s*<|Choose a new password for your account/,
  );
});
