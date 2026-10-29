/**
 * Contract tests for the #119 auth tranche: the auth pages'
 * embedded forms are extracted into form components
 * (SignInForm, SignUpForm, ForgotPasswordForm,
 * ResetPasswordForm — a form is a group of fields AND a way to
 * handle them, per Stephen's definition for #182), the profile
 * page's legal block is the LegalSection component, and the
 * de-emphasized auth links take TextLink's `muted` tone.
 *
 * The pins:
 * - each form is exported from the components barrel and from
 *   the built dist, and each auth page composes its form unit
 *   (the page keeps its prop surface — the b3cPages pins hold
 *   the declarations);
 * - the forms own their layout: the field rhythm is the form's
 *   own gap, and the pages render no fields directly;
 * - SignUpForm keeps the legalNotice slot between the submit
 *   button and the sign-in link (the app view's order);
 * - LegalSection renders its title in the app profile screen's
 *   section-title treatment and frames the host's links as
 *   children;
 * - TextLink's muted tone is the theme's muted role on both
 *   link frames, and an explicit color still wins over it.
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
const FORM_PAGES = {
  SignInForm: "SignInPage",
  SignUpForm: "SignUpPage",
  ForgotPasswordForm: "ForgotPasswordPage",
  ResetPasswordForm: "ResetPasswordPage",
};

test("the auth forms and LegalSection are exported from the components barrel", () => {
  const barrel = read("src/components/index.ts");
  for (const name of [...FORMS, "LegalSection"]) {
    assert.match(barrel, new RegExp(String.raw`export \{ ${name},`), name);
  }
});

test("the auth pages compose their form units and render no fields directly", () => {
  for (const [form, page] of Object.entries(FORM_PAGES)) {
    const pageSource = read(`src/pages/${page}.tsx`);
    assert.match(pageSource, new RegExp(String.raw`<${form}\b`), `${page} composes ${form}`);
    assert.doesNotMatch(pageSource, /<TextField/, `${page} renders no field directly`);
    assert.doesNotMatch(
      pageSource,
      /from "tamagui"|from '@tamagui/,
      `${page} imports no layout primitives`,
    );
  }
});

test("each form owns its field rhythm and its submit handling", () => {
  for (const form of FORMS) {
    const source = read(`src/components/${form}.tsx`);
    assert.match(
      source,
      /gap: tokens\.spacing\[4\]/,
      `${form}'s column carries the 16px field rhythm`,
    );
    assert.match(source, /onSubmit: \(\) => void/, `${form} submits a bare intent`);
    assert.doesNotMatch(
      source,
      /useMutation|useQuery|fetch\(|AsyncStorage/,
      `${form} reaches for no data layer`,
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
