/**
 * Contract tests for the #119 auth form components, shipped
 * standalone ahead of the pages that will compose them
 * (SignInForm, SignUpForm, ForgotPasswordForm,
 * ResetPasswordForm — a form is a group of fields AND a way to
 * handle them, per Stephen's definition for #182), plus
 * LegalSection, the profile page's legal block as a component,
 * and the de-emphasized auth links' TextLink `muted` tone.
 *
 * The pins:
 * - each form is exported from the components barrel and from
 *   the built dist;
 * - the forms compose the shared FormStack (the #119 dedupe
 *   canonical form stack), which owns the 16px field rhythm —
 *   no form defines a local form stack;
 * - SignUpForm keeps the legalNotice slot between the submit
 *   button and the sign-in link (the app view's order);
 * - LegalSection renders its title in the app profile screen's
 *   section-title treatment and frames the host's links as
 *   children;
 * - TextLink's muted tone is the theme's muted role on both
 *   link frames, and an explicit color still wins over it.
 *
 * The page-side pins (each auth page composing its form unit
 * and forwarding its props) are not here: they land with the
 * pages' adoption of these components.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

const FORMS = ["SignInForm", "SignUpForm", "ForgotPasswordForm", "ResetPasswordForm"];

test("the auth forms and LegalSection are exported from the components barrel", () => {
  const barrel = read("src/components/index.ts");
  for (const name of [...FORMS, "LegalSection"]) {
    assert.match(barrel, new RegExp(String.raw`export \{ ${name},`), name);
  }
});

test("each form composes the shared FormStack and owns its submit handling", () => {
  for (const form of FORMS) {
    const source = read(`src/components/${form}.tsx`);
    assert.match(
      source,
      /import \{ FormStack \} from "\.\/FormStack\.js";/,
      `${form} imports the shared FormStack`,
    );
    assert.match(source, /<FormStack>/, `${form} renders its sections in the FormStack`);
    assert.doesNotMatch(
      source,
      /const StyledForm\b/,
      `${form} defines no local form stack (FormStack owns the 16px field rhythm)`,
    );
    assert.match(source, /onSubmit: \(\) => void/, `${form} submits a bare intent`);
    assert.doesNotMatch(
      source,
      /useMutation|useQuery|fetch\(|AsyncStorage/,
      `${form} reaches for no data layer`,
    );
  }
});

test("each form's submit button is named for the label it renders, in both states", () => {
  // The visible label swaps while loading; the accessible name
  // follows it (a static name would contradict the rendered
  // label on web, where the button's label forwards as its
  // aria-label).
  const BUTTON_LABELS = {
    SignInForm: ["Signing in…", "Sign In"],
    SignUpForm: ["Creating account…", "Create Account"],
    ForgotPasswordForm: ["Sending…", "Send Reset Link"],
    ResetPasswordForm: ["Updating…", "Update password"],
  };
  for (const [form, [busy, idle]] of Object.entries(BUTTON_LABELS)) {
    const source = read(`src/components/${form}.tsx`);
    assert.ok(
      source.includes(`accessibilityLabel={loading ? "${busy}" : "${idle}"}`),
      `${form} names its submit button for the state it renders`,
    );
    // The rendered label itself must be the same ternary, so a
    // change to either visible label is caught here too (the
    // name and the text cannot drift apart).
    assert.match(
      source,
      new RegExp(
        `^\\s*\\{loading \\? "${busy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" : "${idle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\}$`,
        "m",
      ),
      `${form} renders the same loading ternary it is named by`,
    );
  }
});

test("SignUpForm keeps the legal notice between submit and the sign-in link", () => {
  const source = read("src/components/SignUpForm.tsx");
  const submitAt = source.indexOf("Create Account");
  const noticeAt = source.indexOf("{legalNotice}");
  const linkAt = source.indexOf("Already have an account? Sign in");
  assert.ok(submitAt !== -1 && noticeAt !== -1 && linkAt !== -1, "all three footer parts render");
  assert.ok(
    submitAt < noticeAt && noticeAt < linkAt,
    "footer order: submit, legal notice, sign-in link",
  );
});

test("LegalSection frames the host's links under its title in the app treatment", () => {
  const source = read("src/components/LegalSection.tsx");
  assert.match(source, /title: string/, "the title crosses as the host's copy");
  assert.match(source, /children: ReactNode/, "the links cross as children");
  assert.match(
    source,
    /fontSize: tokens\.typography\.fontSize\.lg/,
    "the title keeps the app section title's size",
  );
  assert.match(
    source,
    /fontWeight: tokens\.typography\.fontWeight\.semibold/,
    "the title keeps the app section title's weight",
  );
  assert.match(source, /gap: tokens\.spacing\[3\]/, "the block carries its 12px rhythm");
  assert.match(
    source,
    /color: "\$color"/,
    "the title inks with the theme's text color, not a fixed gray step (legible on dark themes)",
  );
  assert.match(
    source,
    /accessibilityRole: "header", "aria-level": 2/,
    "the title carries level-2 heading semantics, like the DS's other section titles",
  );
});

test("TextLink's muted tone is the muted role on both frames, under an explicit color", () => {
  const source = read("src/components/TextLink.tsx");
  assert.match(source, /tone\?: "default" \| "muted"/, "the tone prop is declared");
  assert.match(
    source,
    /const toneColor = tone === "muted" \? "\$textMuted" : "\$link";/,
    "the muted tone resolves to the theme's muted role; the default tone is the frames' link color",
  );
  assert.equal(
    (source.match(/color=\{toneColor\}\s*\{\.\.\.rest\}/g) ?? []).length,
    2,
    "both link frames take the tone color before the caller's props, so an explicit color still wins",
  );
});

test("the built dist exports the auth forms and LegalSection", async () => {
  const dist = await import("../dist/index.js");
  for (const name of [...FORMS, "LegalSection"]) {
    assert.equal(typeof dist[name], "function", `${name} is exported from dist`);
  }
});
