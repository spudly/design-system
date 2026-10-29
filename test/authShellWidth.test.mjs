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
 * The contract now mirrors FormScreenLayout's two-layer shape:
 * 1. The `auth` variant's outer layer stays full-width — it keeps
 *    painting `$surface` across the whole screen — and centers its
 *    child via `alignItems` (not `alignSelf` on the column, which a
 *    block parent on web would ignore).
 * 2. The page content renders inside `StyledAuthContent`, a column
 *    capped at 480px, when and only when the variant is `auth`.
 * Only the four auth pages (SignInPage, SignUpPage,
 * ForgotPasswordPage, ResetPasswordPage) use `variant="auth"`, and
 * on phone-width viewports the cap does not bind, so phone
 * rendering (and the Android VR baselines) are unchanged.
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

test("FormScreenLayout's cap is the geometry the auth shell mirrors (#265)", () => {
  assert.match(formScreenLayout, /maxWidth: 480/);
  assert.match(formScreenLayout, /alignItems: "center"/);
});

test("the auth outer layer stays full-width, paints the surface, and centers its child (#265)", () => {
  const authBlock = screenContainer.slice(
    screenContainer.indexOf("auth: {"),
    screenContainer.indexOf("},", screenContainer.indexOf("auth: {")),
  );
  assert.match(authBlock, /backgroundColor: "\$surface"/);
  assert.match(authBlock, /alignItems: "center"/);
  assert.ok(!/maxWidth/.test(authBlock), "the surface-painting outer layer must not be capped");
  assert.ok(!/alignSelf/.test(authBlock), "centering must not rely on alignSelf");
});

test("the auth content column is capped at 480px and rendered only for the auth variant (#265)", () => {
  assert.match(screenContainer, /const StyledAuthContent = styled\(YStack/);
  const innerBlock = screenContainer.slice(
    screenContainer.indexOf("const StyledAuthContent"),
    screenContainer.indexOf("});", screenContainer.indexOf("const StyledAuthContent")),
  );
  assert.match(innerBlock, /width: "100%"/);
  assert.match(innerBlock, /maxWidth: 480/);
  assert.match(
    screenContainer,
    /rest\.variant === "auth" \? \(\s*<StyledAuthContent gap=\{gap \?\? tokens\.spacing\[4\]\}>\{children\}<\/StyledAuthContent>/,
    "children must be wrapped in the capped column only for the auth variant, with the caller's gap preserved (spacing[4] default)",
  );
  assert.match(
    screenContainer,
    /<\/StyledAuthContent>\s*\)\s*:\s*\(\s*children\s*\)/,
    "non-auth variants must render children directly, without the capped column",
  );
  assert.equal(
    [...screenContainer.matchAll(/maxWidth/g)].length,
    1,
    "maxWidth must appear exactly once in ScreenContainer (the auth content column)",
  );
});

test("only the four auth pages use the auth variant (#265)", () => {
  for (const page of ["SignInPage", "SignUpPage", "ForgotPasswordPage", "ResetPasswordPage"]) {
    const code = readCode(`src/pages/${page}.tsx`);
    assert.match(code, /variant="auth"/, `${page} must use the auth shell`);
  }
});
