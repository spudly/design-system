/**
 * Guard for the landing components (spudly/design-system#171,
 * extracted for #119, folded back 2026-10-29, geometry
 * re-extracted #119 tranche 2): Hero, CtaRow, and FeatureCard
 * were extracted from LandingPage in the public-pages
 * de-styling tranche, but Stephen's no-new-components rule for
 * tranche PRs (2026-10-29) required a tranche PR to add
 * nothing under src/widgets/ — they had no second consumer,
 * so they were composed back into LandingPage, and this test
 * guarded that end state. Tranche 2 of the refreshed #119
 * inventory supersedes it for the geometry: the hero, CTA-row,
 * and grid geometry now live in the generic HeroStack,
 * StackedButtonRow, and CardGrid widgets (CardGrid returns
 * under its old name as a generic card grid, not the
 * page-specific component that was eliminated), while Hero,
 * CtaRow, and FeatureCard stay eliminated — this test guards
 * the new end state: the eliminated components and their
 * stories do not exist, the internal components barrel does
 * not export them, and the treatments are pinned where they
 * now live, in the widget sources.
 *
 * (There is also no CtaLink component: it duplicated Button's
 * href form and was deleted on Stephen's ruling on PR #311 —
 * the landing's CTAs are <Button href>. The page-level SSR
 * pins for the rendered anchors and headings live in
 * src/pages/eciperay/LandingPage.test.ts.)
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

function readCode(rel: string) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const page = readCode("src/pages/eciperay/LandingPage.tsx");
const componentsBarrel = readCode("src/widgets/index.ts");
const heroStack = readCode("src/widgets/HeroStack.tsx");
const stackedButtonRow = readCode("src/widgets/actions/StackedButtonRow.tsx");
const cardGrid = readCode("src/widgets/CardGrid.tsx");

const ELIMINATED = ["Hero", "CtaRow", "FeatureCard"];

test("the landing components are not library components anymore", async () => {
  const dist: Record<string, any> = await import("../../dist/widgets/index.js");
  for (const name of ELIMINATED) {
    assert.equal(
      dist[name],
      undefined,
      `${name} must not be exported from the internal components barrel — it is composed inside LandingPage`,
    );
    assert.ok(
      !existsSync(join(root, "src", "widgets", `${name}.tsx`)),
      `src/widgets/${name}.tsx must not exist`,
    );
    assert.ok(
      !existsSync(join(root, "src", "widgets", `${name}.stories.tsx`)),
      `src/widgets/${name}.stories.tsx must not exist`,
    );
    assert.ok(
      !componentsBarrel.includes(`from "./${name}.js"`),
      `the barrel must not export ${name}`,
    );
  }
  // CtaLink duplicated Button's href form and was deleted
  // (Stephen's ruling, PR #311): it must not come back either.
  assert.equal(dist.CtaLink, undefined, "CtaLink must not be exported — use Button's href form");
  assert.ok(!componentsBarrel.includes("CtaLink"), "the barrel must not export CtaLink");
});

test("the hero treatment lives in HeroStack: centered, 12px rhythm, top breathing room", () => {
  assert.match(page, /<Text variant="heading" textAlign="center">/);
  assert.match(page, /color="\$textMuted" textAlign="center"/);
  assert.match(page, /<HeroStack>/, "the hero renders in HeroStack");
  assert.match(heroStack, /alignItems: "center",/);
  assert.match(heroStack, /gap: tokens\.spacing\[3\],/);
  assert.match(
    heroStack,
    /paddingTop: tokens\.spacing\[6\],/,
    "the hero stack owns its top breathing room",
  );
  assert.match(page, /heroTitle: string;/);
  assert.match(page, /heroSubtitle: string;/);
});

test("the CTA row treatment lives in StackedButtonRow: stacks narrow, rows on web, never wrapping", () => {
  assert.match(page, /<StackedButtonRow>/, "the CTAs render in StackedButtonRow");
  assert.match(
    stackedButtonRow,
    /flexDirection="web:row"\s+gap=\{tokens\.spacing\[3\]\}\s+alignItems="center"\s+justifyContent="center"/,
  );
  assert.ok(!stackedButtonRow.includes("flexWrap"), "the CTA row never wraps");
});

test("the feature card and grid treatments live in CardGrid: 260px flex basis, wrapping grid", () => {
  assert.match(page, /<CardGrid>/, "the features render in CardGrid");
  assert.match(page, /<Card key=\{feature\.title\}>/, "the page supplies plain cards");
  assert.match(page, /<Text variant="subheading">\{feature\.title\}<\/Text>/);
  assert.match(page, /color="\$textMuted"/, "the description is muted ink");
  assert.match(cardGrid, /<XStack flexWrap="wrap" gap=\{tokens\.spacing\[3\]\}>/);
  assert.match(cardGrid, /flex: 1,/, "the grid grows each card to share its row");
  assert.match(cardGrid, /flexBasis: 260,/, "the grid's wrap basis is 260px");
  assert.match(cardGrid, /gap: "\$2",/, "the grid sets each card's internal rhythm");
});
