/**
 * Contract test for spudly/design-system#265 (found on the Eciperay
 * web surface as spudly/eciperay#293): since the DS auth pages moved
 * to render directly in the web hosts, their shell — ScreenContainer
 * variant `auth` — had horizontal padding but no max-width and no
 * centering, so on desktop web the sign-in form stretched to ~97.5%
 * of a 1,920px viewport. Before that move the web auth screens
 * rendered FormScreenLayout, which caps content at 480px and
 * centers it.
 *
 * The contract now: the `auth` variant caps its border box at the
 * FormScreenLayout geometry (480px of content + the variant's own
 * horizontal padding on both sides) and centers itself; the other
 * variants stay uncapped. Only the four auth pages (SignInPage,
 * SignUpPage, ForgotPasswordPage, ResetPasswordPage) use
 * `variant="auth"`, and on phone-width viewports the cap does not
 * bind, so phone rendering (and the Android VR baselines) are
 * unchanged.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const screenContainer = readCode("src/components/ScreenContainer.tsx");
const formScreenLayout = readCode("src/components/FormScreenLayout.tsx");

test("FormScreenLayout's cap is the geometry the auth variant mirrors (#265)", () => {
  assert.match(formScreenLayout, /maxWidth: 480/);
  assert.match(formScreenLayout, /alignItems: "center"/);
});

test("ScreenContainer auth variant is capped at 480px of content and centered (#265)", () => {
  const authBlock = screenContainer.slice(
    screenContainer.indexOf("auth: {"),
    screenContainer.indexOf("},", screenContainer.indexOf("auth: {")),
  );
  assert.match(authBlock, /maxWidth: 480 \+ 2 \* tokens\.spacing\[6\]/);
  assert.match(authBlock, /alignSelf: "center"/);
  assert.match(authBlock, /width: "100%"/);
});

test("only the auth variant is capped (#265)", () => {
  assert.equal(
    [...screenContainer.matchAll(/maxWidth/g)].length,
    1,
    "maxWidth must appear exactly once in ScreenContainer (the auth variant)",
  );
});

test("only the four auth pages use the auth variant (#265)", () => {
  for (const page of ["SignInPage", "SignUpPage", "ForgotPasswordPage", "ResetPasswordPage"]) {
    const code = readCode(`src/pages/${page}.tsx`);
    assert.match(code, /variant="auth"/, `${page} must use the auth shell`);
  }
});
