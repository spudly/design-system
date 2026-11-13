/**
 * Landmark test for the legal page
 * (spudly/design-system#366; frame components retired by #473).
 *
 * The retired web layouts rendered real `<header>`, `<main>`,
 * and `<footer>` elements; their DS replacements rendered none,
 * so screen-reader users could not navigate the public surfaces
 * by landmark. The fix gives the page landmark
 * semantics on web through the shared accessibility translation
 * in src/widgets/accessibility.ts (the #256 pattern):
 *
 * - LegalDocumentPage's header row — `banner`
 * - LegalDocumentPage's document column — `main`
 * - BigFooter — `contentinfo`
 *
 * `banner`, `main`, and `contentinfo` are ARIA-only roles: they
 * are not members of React Native's `accessibilityRole` set, so
 * they go through the web `role` prop via the platform-split
 * constants (`bannerRoleProps` / `mainRoleProps` /
 * `contentInfoRoleProps`), which are empty on native — native
 * is unaffected.
 *
 * Duplicate-landmark care: each composed surface must render
 * exactly one banner, one main, and one contentinfo.
 * LegalDocumentPage (ScreenContainer + its inline header row +
 * its document column, with BigFooter through BigFooterShell) is
 * the outermost chrome on its surface, so it owns its
 * landmarks; no inner page component adds landmarks of its own
 * (pinned by the source scan below).
 *
 * PublicRecipePage (#473): the retired PublicPageFrame's layout
 * owned this surface's `main`; with the frame gone the page is
 * the outermost chrome, so the page owns `main` — every state
 * (ready, loading, not-found, unavailable) renders its content
 * inside exactly one `main`, with BigFooter (`contentinfo`)
 * outside it. The SSR tests below cover each state.
 */
import "./registerSvgStub.js";
import { loadInternalDist } from "./internalDist.js";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
function readCode(rel: string) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}
const a11y = readCode("src/widgets/accessibility.ts");
const publicFooter = readCode("src/widgets/BigFooter.tsx");
const legalPage = readCode("src/pages/LegalDocumentPage.tsx");
test("the shared translation exports web-only landmark props (#366)", () => {
  assert.match(
    a11y,
    /export const bannerRoleProps = isWeb \? \(\{ role: "banner" \} as const\) : \(\{\} as const\);/,
  );
  assert.match(
    a11y,
    /export const mainRoleProps = isWeb \? \(\{ role: "main" \} as const\) : \(\{\} as const\);/,
  );
  assert.match(
    a11y,
    /export const contentInfoRoleProps = isWeb \? \(\{ role: "contentinfo" \} as const\) : \(\{\} as const\);/,
  );
  // Landmarks must never go through accessibilityRole: banner /
  // main / contentinfo are not RN roles and would crash Android
  // (the accessibilityRoles scan pins that invariant globally).
  for (const code of [legalPage]) {
    assert.ok(
      !code.includes("accessibilityRole"),
      "landmarks use the web role prop, not accessibilityRole",
    );
  }
});
test("the legal page's composition carries its landmarks (#366)", () => {
  assert.match(legalPage, /\{\.\.\.bannerRoleProps\}/, "the header row is banner");
  assert.match(legalPage, /\{\.\.\.mainRoleProps\}/, "the document column is main");
  assert.match(
    publicFooter,
    /\{\.\.\.contentInfoRoleProps\}/,
    "BigFooter is the legal page contentinfo (#410)",
  );
});
test("no other source file adds a landmark role — no duplicates inside the frames (#366)", () => {
  const srcDir = join(root, "src");
  const owners = new Set([
    join(srcDir, "widgets", "accessibility.ts"),
    join(srcDir, "widgets", "BigFooter.tsx"),
    join(srcDir, "pages", "LegalDocumentPage.tsx"),
    // #473: MainLandmark owns the `main` role for the public
    // recipe surface now the frame page is retired.
    join(srcDir, "widgets", "MainLandmark.tsx"),
  ]);
  function files(dir: string): string[] {
    return readdirSync(dir, {
      withFileTypes: true,
    }).flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return files(path);
      return /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".test.ts") ? [path] : [];
    });
  }
  for (const file of files(srcDir)) {
    if (owners.has(file)) continue;
    const code = readCode(file.slice(root.length + 1));
    assert.ok(
      !/bannerRoleProps|mainRoleProps|contentInfoRoleProps|role:\s*"(banner|main|contentinfo)"|role="(banner|main|contentinfo)"/.test(
        code,
      ),
      `${file}: only the outermost frame components own landmarks — an inner component adding one would duplicate it inside the frame`,
    );
  }
});

// Runtime imports are lazy, like the other contract tests, so the
// source scans still run when the build output is missing.
let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    const { LegalDocumentPage }: Record<string, any> =
      await import("../dist/pages/LegalDocumentPage.js");
    const { PublicRecipePage }: Record<string, any> =
      await import("../dist/pages/PublicRecipePage.js");
    const { eciperayFooterFixture }: Record<string, any> =
      await import("../dist/pages/fixtures.js");
    // BigFooter is internal (not in the components barrel, #410/#298):
    // load its dist module directly, like the icons module's tests do.
    const { BigFooter }: Record<string, any> = await import("../dist/widgets/BigFooter.js");
    return {
      React,
      renderToString,
      TamaguiProvider,
      ...dist,
      LegalDocumentPage,
      PublicRecipePage,
      eciperayFooterFixture,
      BigFooter,
    };
  })();
  return runtimePromise;
}
async function renderToHtml(element: any) {
  const { renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } = await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  // #539: compositions under test can contain voice-reading widgets
  // (PublicRecipePage's overview panel); supply the fixture voice
  // the same way the whole-page-flow helper does.
  const { VoiceProvider }: Record<string, any> = await import("../dist/voice/index.js");
  const { fixtureVoice }: Record<string, any> = await import("../dist/voice/fixtures.js");
  const inner = React.createElement(VoiceProvider, { voice: fixtureVoice }, element);
  const html = renderToString(
    <TamaguiProvider config={config} defaultTheme="light">
      {inner}
    </TamaguiProvider>,
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}
function countRole(html: string, role: string) {
  return (html.match(new RegExp(`role="${role}"`, "g")) ?? []).length;
}

/**
 * The content range of the rendered `main` element: from the end
 * of its opening tag to the start of its matching close tag,
 * found by balancing tags of the same name (the SSR tree is
 * well-formed and the landmark element is a `div` whose nested
 * children include same-tag elements). String order alone cannot
 * prove descendance — content sitting between main's close and
 * the footer would pass an order check — so the SSR tests assert
 * the fixture content's index falls inside this range.
 */
function mainContentRange(html: string) {
  const roleAt = html.indexOf('role="main"');
  assert.ok(roleAt !== -1, "a main landmark renders");
  const openStart = html.lastIndexOf("<", roleAt);
  const openEnd = html.indexOf(">", roleAt);
  const tagName = /^<([a-zA-Z][\w-]*)/.exec(html.slice(openStart, openEnd))![1];
  const tagPattern = new RegExp(String.raw`</?${tagName}(?=[\s>])[^>]*>`, "g");
  tagPattern.lastIndex = openStart;
  let depth = 0;
  let match;
  while ((match = tagPattern.exec(html)) !== null) {
    if (match[0].startsWith("</")) depth -= 1;
    else if (!match[0].endsWith("/>")) depth += 1;
    if (depth === 0)
      return {
        start: openEnd + 1,
        end: match.index,
      };
  }
  return null;
}
function assertLandmarks(html: string, insideMain: any) {
  assert.equal(countRole(html, "banner"), 1, "exactly one banner landmark");
  assert.equal(countRole(html, "main"), 1, "exactly one main landmark");
  assert.equal(countRole(html, "contentinfo"), 1, "exactly one contentinfo landmark");
  assert.ok(
    html.indexOf('role="banner"') < html.indexOf('role="main"') &&
      html.indexOf('role="main"') < html.indexOf('role="contentinfo"'),
    "landmarks render in banner / main / contentinfo order",
  );
  const range = mainContentRange(html);
  assert.ok(range, "the main element has a matching close tag");
  const contentAt = html.indexOf(insideMain);
  assert.ok(
    range.start <= contentAt && contentAt < range.end,
    "the content is a descendant of the main element, not merely after it in the string",
  );
}
const legalFixture = {
  title: "Privacy Policy",
  lastUpdated: "July 22, 2026",
  brandLabel: "Eciperay",
  brandHref: "/",
  signInLabel: "Sign in",
  signInHref: "/login",
  footer: {
    brand: {
      label: "Eciperay",
      href: "/",
    },
    columns: [
      {
        title: "Legal",
        links: [
          {
            label: "Privacy Policy",
            href: "/privacy",
          },
          {
            label: "Terms of Service",
            href: "/terms",
          },
        ],
      },
    ],
    storeLinks: [],
    socialLinks: [],
  },
  sections: [
    {
      title: "Information we collect",
      blocks: [
        {
          type: "paragraph",
          spans: [
            {
              type: "text",
              text: "Body text.",
            },
          ],
        },
      ],
    },
  ],
};
const publicRecipePage = readCode("src/pages/PublicRecipePage.tsx");
test("PublicRecipePage carries its main landmark on every state (#473)", () => {
  // One MainLandmark per state branch: loading, notFound,
  // unavailable, and the ready ScrollShell branch. The role
  // itself lives in the MainLandmark component — the page
  // spreads no landmark props of its own.
  const wraps = publicRecipePage.match(/<MainLandmark>/g) ?? [];
  assert.equal(wraps.length, 4, "each of the four states renders its content inside main");
  assert.ok(
    !publicRecipePage.includes("mainRoleProps"),
    "the landmark role is MainLandmark's, not the page's",
  );
});
test("SSR: LegalDocumentPage renders exactly one banner, main, and contentinfo (#366)", async () => {
  const { LegalDocumentPage } = await loadRuntime();
  const html = await renderToHtml(<LegalDocumentPage {...legalFixture} />);
  assertLandmarks(html, "Body text.");
});
function assertPublicRecipeLandmarks(html: string, insideMain?: string) {
  assert.equal(countRole(html, "main"), 1, "exactly one main landmark");
  assert.equal(countRole(html, "contentinfo"), 1, "exactly one contentinfo landmark");
  assert.ok(
    html.indexOf('role="main"') < html.indexOf('role="contentinfo"'),
    "main renders before the footer contentinfo",
  );
  const range = mainContentRange(html);
  assert.ok(range, "the main element has a matching close tag");
  assert.ok(
    range.end < html.indexOf('role="contentinfo"'),
    "the footer is outside main, not nested inside it",
  );
  if (insideMain !== undefined) {
    const contentAt = html.indexOf(insideMain);
    assert.ok(
      range.start <= contentAt && contentAt < range.end,
      "the state content is a descendant of the main element",
    );
  }
}
const publicRecipeReadyFixture = {
  state: "ready",
  overview: {
    title: "Landmark Soup",
    status: "idea",
    servingsLabel: "4",
    tags: [],
  },
  ctas: {
    variant: "signedOut",
  },
  onSignUpPress: () => undefined,
  onClonePress: () => undefined,
  onGetAppPress: () => undefined,
  ingredients: {
    servings: 4,
    onServingsChange: () => undefined,
    scaleValue: "1",
    onScaleChange: () => undefined,
    ingredients: [
      {
        id: "salt",
        label: "1 tsp salt",
        isOptional: false,
        isMissing: false,
      },
    ],
    onIngredientPress: () => undefined,
    substitutions: [],
  },
  instructions: {
    instructions: [
      {
        id: "step-1",
        stepNumber: 1,
        body: "Stir everything together.",
      },
    ],
  },
};
test("SSR: PublicRecipePage ready state renders its content inside exactly one main, footer outside (#473)", async () => {
  const { PublicRecipePage, eciperayFooterFixture } = await loadRuntime();
  const html = await renderToHtml(
    <PublicRecipePage {...publicRecipeReadyFixture} footer={eciperayFooterFixture} />,
  );
  assertPublicRecipeLandmarks(html, "Landmark Soup");
});
test("SSR: PublicRecipePage loading state renders inside exactly one main, footer outside (#473)", async () => {
  const { PublicRecipePage, eciperayFooterFixture } = await loadRuntime();
  const html = await renderToHtml(
    <PublicRecipePage state="loading" footer={eciperayFooterFixture} />,
  );
  assertPublicRecipeLandmarks(html);
});
test("SSR: PublicRecipePage not-found state renders its card inside exactly one main, footer outside (#473)", async () => {
  const { PublicRecipePage, eciperayFooterFixture } = await loadRuntime();
  const html = await renderToHtml(
    <PublicRecipePage state="notFound" footer={eciperayFooterFixture} />,
  );
  assertPublicRecipeLandmarks(html, "Recipe not found");
});
test("SSR: PublicRecipePage unavailable state renders its card inside exactly one main, footer outside (#473)", async () => {
  const { PublicRecipePage, eciperayFooterFixture } = await loadRuntime();
  const html = await renderToHtml(
    <PublicRecipePage state="unavailable" footer={eciperayFooterFixture} />,
  );
  assertPublicRecipeLandmarks(html, "Recipe unavailable");
});
