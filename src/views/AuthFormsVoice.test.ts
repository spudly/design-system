/**
 * Voice-slot pins for the auth form views (#539 tranche 2c):
 * SignInForm's, SignUpForm's, ForgotPasswordForm's, and
 * ResetPasswordForm's field labels, submit actions, and footer
 * links come from the app-supplied voice object — the DS ships
 * no default strings. These forms have no label props, so their
 * copy reads the voice slots directly.
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

test("SignInForm reads its copy from the voice object", () => {
  const view = read("SignInForm");
  assert.match(view, /useVoice\(\)/);
  for (const slot of [
    "emailLabel",
    "passwordLabel",
    "submitLabel",
    "submitPendingLabel",
    "createAccountLabel",
    "forgotPasswordLabel",
  ]) {
    assert.match(view, new RegExp(`voice\\.signInForm\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    view,
    /"Email"|"Password"|"Sign In"|"Signing in…"|"Create an account"|"Forgot password\?"/,
  );
});

test("SignUpForm reads its copy from the voice object", () => {
  const view = read("SignUpForm");
  assert.match(view, /useVoice\(\)/);
  for (const slot of [
    "nameLabel",
    "emailLabel",
    "passwordLabel",
    "submitLabel",
    "submitPendingLabel",
    "signInLabel",
  ]) {
    assert.match(view, new RegExp(`voice\\.signUpForm\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    view,
    /"Your name"|"Email"|"Password"|"Create Account"|"Creating account…"|"Already have an account\? Sign in"/,
  );
});

test("ForgotPasswordForm reads its copy from the voice object", () => {
  const view = read("ForgotPasswordForm");
  assert.match(view, /useVoice\(\)/);
  for (const slot of ["emailLabel", "submitLabel", "submitPendingLabel", "backToSignInLabel"]) {
    assert.match(view, new RegExp(`voice\\.forgotPasswordForm\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(view, /"Email"|"Send Reset Link"|"Sending…"|"Back to sign in"/);
});

test("ResetPasswordForm reads its copy from the voice object", () => {
  const view = read("ResetPasswordForm");
  assert.match(view, /useVoice\(\)/);
  for (const slot of ["passwordLabel", "submitLabel", "submitPendingLabel"]) {
    assert.match(view, new RegExp(`voice\\.resetPasswordForm\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(view, /"New password"|"Update password"|"Updating…"/);
});
