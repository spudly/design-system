/**
 * Elimination guard for the landing components
 * (spudly/design-system#171, extracted for #119, folded back
 * 2026-10-29): Hero, CtaRow, FeatureCard, and CardGrid were
 * extracted from LandingPage in the public-pages de-styling
 * tranche, but Stephen's no-new-components rule for tranche
 * PRs (2026-10-29) requires a tranche PR to add nothing under
 * src/components/ — the four had no second consumer, so they
 * were composed back into LandingPage, and this test guards
 * the end state: the components and their stories do not
 * exist, the package root does not export them, and the
 * treatments they carried are pinned where they now live, in
 * the page source.
 *
 * (There is also no CtaLink component: it duplicated Button's
 * href form and was deleted on Stephen's ruling on PR #311 —
 * the landing's CTAs are <Button href>. The page-level SSR
 * pins for the rendered anchors and headings live in
 * test/landingPage.test.mjs.)
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const page = readCode("src/pages/LandingPage.tsx");
const componentsBarrel = readCode("src/components/index.ts");

const ELIMINATED = ["Hero", "CtaRow", "FeatureCard", "CardGrid"];

test("the landing components are not library components anymore", async () => {
  const dist = await import("../dist/index.js");
  for (const name of ELIMINATED) {
    assert.equal(
      dist[name],
      undefined,
      `${name} must not be exported from @spudly/ui — it is composed inside LandingPage`,
    );
    assert.ok(
      !existsSync(join(root, "src", "components", `${name}.tsx`)),
      `src/components/${name}.tsx must not exist`,
    );
    assert.ok(
      !existsSync(join(root, "src", "components", `${name}.stories.tsx`)),
      `src/components/${name}.stories.tsx must not exist`,
    );
    assert.ok(!componentsBarrel.includes(name), `the barrel must not export ${name}`);
  }
  // CtaLink duplicated Button's href form and was deleted
  // (Stephen's ruling, PR #311): it must not come back either.
  assert.equal(dist.CtaLink, undefined, "CtaLink must not be exported — use Button's href form");
  assert.ok(!componentsBarrel.includes("CtaLink"), "the barrel must not export CtaLink");
});

test("the hero treatment lives in the page: centered heading, muted subtitle, top breathing room", () => {
  assert.match(page, /<Text variant="heading" textAlign="center">/);
  assert.match(page, /color="\$textMuted" textAlign="center"/);
  assert.match(page, /paddingTop="\$6"/, "the hero section owns its top breathing room");
  assert.match(page, /heroTitle: string;/);
  assert.match(page, /heroSubtitle: string;/);
});

test("the CTA row treatment lives in the page: stacks narrow, rows on web, never wrapping", () => {
  assert.match(
    page,
    /<YStack flexDirection="web:row" gap="\$3" alignItems="center" justifyContent="center">/,
  );
});

test("the feature card and grid treatments live in the page: 260px flex basis, wrapping grid", () => {
  assert.match(page, /<Card key=\{feature\.title\} flex=\{1\} flexBasis=\{260\} gap="\$2">/);
  assert.match(page, /<Text variant="subheading">\{feature\.title\}<\/Text>/);
  assert.match(page, /color="\$textMuted"/, "the description is muted ink");
  assert.match(page, /<XStack flexWrap="wrap" gap="\$3">/);
});
