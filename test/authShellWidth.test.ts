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
 *    child via its cross axis (not `alignSelf` on the column, which a
 *    block parent on web would ignore).
 * 2. The page content renders inside the auth content column, a
 *    column capped at 480px, when and only when the variant is `auth`.
 * Only the four auth pages (SignInPage, SignUpPage,
 * ForgotPasswordPage, ResetPasswordPage) use `variant="auth"`, and
 * on phone-width viewports the cap does not bind, so phone
 * rendering (and the Android VR baselines) are unchanged.
 *
 * #746 (Option B): both layers render Col directly — FormScreenLayout's
 * centering is Col's `center`, ScreenContainer's auth geometry is a
 * conditional prop spread plus the AuthContent column component — so
 * the pins read those shapes.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel: string) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const screenContainer = readCode("src/widgets/layout/ScreenContainer.tsx");
const formScreenLayout = readCode("src/widgets/layout/FormScreenLayout.tsx");

test("FormScreenLayout's cap is the geometry the auth shell mirrors (#265)", () => {
  assert.match(formScreenLayout, /maxWidth=\{480\}/);
  assert.match(formScreenLayout, /<Col width="100%" center px="l" py="xxl"/);
});

test("the auth outer layer stays full-width, paints the surface, and centers its child (#265)", () => {
  assert.match(
    screenContainer,
    /variant === "auth"\s*\?\s*\{ backgroundColor: "\$surface" as const, center: true \}/,
    "the auth geometry is a conditional spread: surface paint + cross-axis centering",
  );
  const outerCol = screenContainer.slice(
    screenContainer.indexOf("<Col\n"),
    screenContainer.indexOf("style={composedStyle}"),
  );
  assert.ok(!/maxWidth/.test(outerCol), "the surface-painting outer layer must not be capped");
  assert.ok(!/alignSelf/.test(outerCol), "centering must not rely on alignSelf");
});

test("the auth content column is capped at 480px and rendered only for the auth variant (#265)", () => {
  assert.match(screenContainer, /function AuthContent\(/);
  const innerBlock = screenContainer.slice(screenContainer.indexOf("function AuthContent"));
  assert.match(innerBlock, /name="ScreenContainerAuthContent"/);
  assert.match(innerBlock, /width="100%"/);
  assert.match(innerBlock, /maxWidth=\{480\}/);
  assert.match(
    screenContainer,
    /variant === "auth" \? <AuthContent gap=\{gap\}>\{children\}<\/AuthContent>/,
    "children must be wrapped in the capped column only for the auth variant, with the caller's gap preserved (the 16px default resolves inside AuthContent)",
  );
  assert.match(
    screenContainer,
    /<AuthContent gap=\{gap\}>\{children\}<\/AuthContent> : children/,
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
    const code = readCode(`src/pages/eciperay/${page}.tsx`);
    assert.match(code, /variant="auth"/, `${page} must use the auth shell`);
  }
});
