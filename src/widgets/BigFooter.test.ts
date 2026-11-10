import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readCode(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const bigFooter = readCode("src/widgets/BigFooter.tsx");

test("BigFooter renders all sections from the one footer data object", () => {
  assert.match(bigFooter, /export type BigFooterData = \{/);
  assert.match(bigFooter, /brand: BigFooterBrand;/);
  assert.match(bigFooter, /columns: BigFooterColumn\[\];/);
  assert.match(bigFooter, /storeLinks: BigFooterStoreLink\[\];/);
  assert.match(bigFooter, /socialLinks: BigFooterSocialLink\[\];/);
  assert.match(bigFooter, /columns\.map\(\(column\) =>/);
  assert.match(bigFooter, /column\.links\.map\(\(link\) =>/);
  assert.match(bigFooter, /storeLinks\.map\(\(link\) =>/);
  assert.match(bigFooter, /socialLinks\.map\(\(link\) =>/);
  // Nothing app-specific is hardcoded: no app names, no legal
  // labels, no routes — content is caller data only (#320).
  for (const baked of [
    "Eciperay",
    "Memorize",
    "Privacy",
    "Terms",
    "Do Not Sell",
    "/privacy",
    "/terms",
  ]) {
    assert.ok(!bigFooter.includes(baked), `BigFooter must not hardcode ${baked}`);
  }
  assert.ok(!/onPress/.test(bigFooter), "footer navigation is links, never press callbacks");
});

test("store and social entries are real links with accessible names", () => {
  // Store links (#466): a real anchor wrapping the store's
  // official badge, named by the label — never a plain Button.
  assert.match(bigFooter, /<StyledBigFooterStoreAnchor/);
  assert.match(bigFooter, /store: BigFooterStore;/);
  assert.ok(!/<Button/.test(bigFooter), "store links must not render as Buttons (#466)");
  // Social entries: an anchor carrying the href, named by the label.
  assert.match(bigFooter, /accessibilityRole: "link",\s*accessibilityLabel: link\.label/);
  assert.match(bigFooter, /href=\{link\.href\}/);
  // Social glyphs are the Feather social icons (Stephen's adjustment),
  // exported under semantic usage names (Social*Icon), never the raw
  // Feather glyph names (icons module convention, PR #413 review).
  for (const icon of [
    "SocialFacebookIcon",
    "SocialInstagramIcon",
    "SocialTwitterIcon",
    "SocialYoutubeIcon",
    "SocialGithubIcon",
    "SocialLinkedinIcon",
  ]) {
    assert.ok(bigFooter.includes(icon), `BigFooter maps a Feather social glyph: ${icon}`);
  }
  assert.match(bigFooter, /icon: BigFooterSocialIcon/);
});

test("the mobile stack breakpoint is named and the shell is sticky in flow", () => {
  assert.match(bigFooter, /export const BIG_FOOTER_STACK_BREAKPOINT = 640;/);
  assert.match(bigFooter, /flexBasis=\{BIG_FOOTER_COLUMN_BASIS\}/);
  assert.match(bigFooter, /flexWrap="wrap"/);
  // Page-scroll model (#547): the web shell is a flex column with
  // minHeight 100dvh and justifyContent "space-between" and
  // exactly two children — the page content and the footer. The
  // minimum height is platform-specific (PR #413 review): 100dvh
  // on web, 100% of the parent's available height by default —
  // React Native does not support viewport units for minHeight.
  assert.match(bigFooter, /minHeight=\{\{ default: "100%", web: "100dvh" \}\}/);
  assert.match(bigFooter, /justifyContent="space-between"/);
  assert.ok(
    !/<YStack minHeight="100dvh"/.test(bigFooter),
    "the shell must not pass a raw 100dvh minHeight to native",
  );
  // The content child is the positioned ancestor, so an
  // absolute-fill child (StepOverlay) cannot cover the footer;
  // there is no bounded flex region allocating it a height
  // (#547 removed the bounded region and its nested scroller).
  assert.match(bigFooter, /<YStack position="relative">\{children\}<\/YStack>/);
  assert.ok(!/flexBasis="auto"/.test(bigFooter), "the bounded content region is gone (#547)");
  assert.ok(!/position="(fixed|absolute)"/.test(bigFooter), "the footer is in flow, never pinned");
});

test("BigFooter is internal — not exported from the components barrel or the package (#298)", () => {
  const barrel = readCode("src/widgets/index.ts");
  assert.ok(
    !barrel.includes("BigFooter"),
    "BigFooter must not be exported from src/widgets/index.ts",
  );
  const pagesBarrel = readCode("src/pages/index.ts");
  assert.match(pagesBarrel, /type BigFooterData/, "the footer data types are the pages contract");
  assert.ok(
    !/export \{ BigFooter,/.test(pagesBarrel),
    "the component itself is not a package export",
  );
  assert.ok(
    !existsSync(join(root, "src/widgets/PublicFrameFooter.tsx")),
    "PublicFrameFooter is retired (#410)",
  );
  assert.ok(!barrel.includes("PublicFrameFooter"), "PublicFrameFooter is removed from the barrel");
});

test("every page component renders BigFooter through the shell from a footer prop", () => {
  const pagesDir = join(root, "src", "pages");
  const exceptions = new Set([
    "BoundedList.tsx",
    "fixtures.ts",
    "useCatalogPagination.ts",
    "index.ts",
    // The colocated Android VR baselines (#530) — PNGs, not a page
    // module; their placement is pinned by
    // test/visualRegressionScope.test.ts.
    "__snapshots__",
  ]);
  const pages: string[] = [];
  for (const entry of readdirSync(pagesDir)) {
    if (
      entry.endsWith(".stories.tsx") ||
      entry.endsWith(".test.ts") ||
      entry.endsWith(".test.tsx") ||
      entry.endsWith(".test.steps.md") ||
      exceptions.has(entry)
    )
      continue;
    assert.ok(entry.endsWith(".tsx"), `unaccounted pages file ${entry}`);
    pages.push(entry);
  }
  assert.ok(pages.length >= 38, `expected at least 38 page modules, found ${pages.length}`);
  for (const entry of pages) {
    const code = readCode(join("src", "pages", entry));
    assert.ok(
      code.includes("BigFooterShell") || code.includes("<BigFooter"),
      `${entry} does not render BigFooter/BigFooterShell — every page renders the footer (#410)`,
    );
    assert.ok(
      /footer\?: BigFooterData/.test(code),
      `${entry} takes no footer?: BigFooterData prop`,
    );
    assert.ok(
      !code.includes("PublicFrameFooter"),
      `${entry} still renders the retired PublicFrameFooter`,
    );
  }
});

test("the shell reserves viewport height only when a footer is supplied", () => {
  // No footer data: no footer band and no full-viewport inner
  // shell, so a page composed inside a frame that owns the layout
  // (a hub page composing a nested page) adds neither a second footer nor a 100dvh
  // reservation. The no-footer branch must come before (and stay
  // clear of) the sticky viewport shell.
  const noFooterBranch = bigFooter.indexOf("if (!footer)");
  assert.ok(noFooterBranch >= 0, "BigFooterShell handles the no-footer case explicitly");
  assert.ok(
    noFooterBranch < bigFooter.indexOf('minHeight={{ default: "100%", web: "100dvh" }}'),
    "the no-footer branch precedes the viewport-height shell",
  );
  assert.match(bigFooter, /padding: tokens\.spacing\[3\]/, "social links keep a ≥44px target");
});

test("native scroll ownership is an explicit shell mode, independent of footer data (PR #556)", () => {
  // The mode type is a type alias (Stephen's code style) with
  // the three owners: the shell's ScrollView (default), the
  // page content's own list/scroll region, or an enclosing
  // shell (nested pages opt out of scrolling entirely).
  assert.match(
    bigFooter,
    /export type BigFooterShellScrollMode = "shell" \| "content" \| "nested";/,
  );
  assert.match(bigFooter, /scrollMode\?: BigFooterShellScrollMode;/);
  assert.match(bigFooter, /scrollMode = "shell"/, "the shell scroller is the default mode");
  // Native handling comes FIRST and never consults footer
  // data: a standalone page with no footer scrolls on native
  // exactly like one with a footer (the footerless SignUpPage
  // stall CodeRabbit flagged on PR #556).
  const nativeBranch = bigFooter.indexOf("if (!isWeb)");
  assert.ok(nativeBranch >= 0, "BigFooterShell handles native explicitly");
  assert.ok(
    nativeBranch < bigFooter.indexOf("if (!footer)"),
    "the native branch precedes the web footer branch — native scrolling ignores footer data",
  );
  // "content" mode: a bounded frame and NO scroller, so a
  // page's FlatList / ScrollRegion is never nested inside the
  // shell's plain ScrollView (the RecipesPage windowing bug).
  assert.match(
    bigFooter,
    /if \(scrollMode === "content"\) \{\s*return \(\s*<YStack flex=\{1\} position="relative">\s*\{children\}/,
  );
  // "nested" mode: the growing column only — no scroller, no
  // bounded frame; the enclosing shell stays the scroll owner.
  assert.match(
    bigFooter,
    /if \(scrollMode === "nested"\) \{\s*return \(\s*<YStack flexGrow=\{1\} flexDirection="column" position="relative">\s*\{children\}/,
  );
});

test("list and self-scrolling pages put the shell in content mode (PR #556)", () => {
  // Every page whose content owns native scrolling — the
  // BoundedList catalog/verse pages and the ScrollRegion /
  // ScrollShell pages — renders its shell in "content" mode,
  // and the two frame pages slot self-scrolling surfaces, so
  // they do the same. A page left in the default mode would
  // nest its scroller inside the shell's ScrollView whenever
  // a host supplies footer data.
  for (const entry of [
    "RecipesPage.tsx",
    "DiscoverPage.tsx",
    "MyVersesPage.tsx",
    "VerseSearchPage.tsx",
    "MemorizeReviewPage.tsx",
    "RecipeFormPage.tsx",
    "RecipeDetailPage.tsx",
    "PublicRecipePage.tsx",
    "AppShellPage.tsx",
    "TabbedShellPage.tsx",
  ]) {
    const code = readCode(join("src", "pages", entry));
    assert.ok(
      code.includes('scrollMode="content"'),
      `${entry} must render BigFooterShell with scrollMode="content"`,
    );
    assert.ok(
      !/<BigFooterShell footer=\{[^}]*\}>/.test(code),
      `${entry} still renders a modeless BigFooterShell`,
    );
  }
  // A plain content page keeps the default: SignUpPage renders
  // the shell with no scrollMode, so the shell's ScrollView
  // owns its native scrolling with or without footer data.
  const signUp = readCode("src/pages/SignUpPage.tsx");
  assert.match(signUp, /<BigFooterShell footer=\{footer\}>/);
  assert.ok(!signUp.includes("scrollMode"), "SignUpPage stays in the default shell mode");
});

test("composed pages keep exactly one native scroll owner (PR #556 round 2)", () => {
  // MealsHubPage plans tab: the hub shell is a content-mode
  // bounded frame, so MealPlansPage's own shell ScrollView is
  // the tab's single native scroller and the pinned header
  // stays outside it. (The meals tab keeps the default shell:
  // its plain ScreenContainer content has no scroller of its
  // own.)
  const mealsHub = readCode("src/pages/MealsHubPage.tsx");
  assert.match(
    mealsHub,
    /<BigFooterShell footer=\{footer\} scrollMode="content">\s*<PinnedHeaderShell/,
    "the plans tab's hub shell must be content mode",
  );
  // The form-shell pages compose RecipeFormPage, whose
  // ScrollRegion is the screen's single native scroller: their
  // shells are content-mode frames, never a second ScrollView
  // around the region. EditVersionPage's not-editable state
  // renders no form, so that branch keeps the default shell.
  for (const entry of ["EditRecipePage.tsx", "ManualEntryPage.tsx"]) {
    const code = readCode(join("src", "pages", entry));
    assert.ok(
      code.includes('<BigFooterShell footer={footer} scrollMode="content">'),
      `${entry} must render its shell in content mode`,
    );
  }
  const editVersion = readCode("src/pages/EditVersionPage.tsx");
  assert.ok(
    editVersion.includes('<BigFooterShell footer={props.footer} scrollMode="content">'),
    "EditVersionPage's editable branch must render its shell in content mode",
  );
  assert.match(
    editVersion,
    /<BigFooterShell footer=\{props\.footer\}>\s*<ScreenContainer>\s*<Text variant="error">/,
    "EditVersionPage's not-editable branch keeps the default shell — it renders no form",
  );
});

test("on native the shell renders one ScrollView and no BigFooter (#547)", () => {
  // BigFooter is web-only (Stephen's #547 addendum): native uses
  // bottom navigation instead, so the native branch renders no
  // BigFooter at all. Native has no document scroll, so the
  // shell renders ONE ScrollView wrapping the page content —
  // the page's single scroller — whose content container grows
  // to at least the available height.
  assert.match(bigFooter, /if \(!isWeb\) \{/);
  assert.match(
    bigFooter,
    /<ScrollView flex=\{1\} keyboardShouldPersistTaps="handled">\s*<YStack flexGrow=\{1\} minHeight="100%" position="relative">\s*\{children\}/,
  );
  assert.equal(
    (bigFooter.match(/<ScrollView/g) ?? []).length,
    1,
    "BigFooterShell's only ScrollView is the native shell scroller",
  );
  // Exactly one BigFooter renders, in the web branch only.
  assert.equal(
    (bigFooter.match(/<BigFooter footer=\{footer\} \/>/g) ?? []).length,
    1,
    "the shell renders BigFooter once, on web only (#547)",
  );
});

test("composed pages and stories render exactly one footer", () => {
  // AiSessionPage: BOTH states (start and in-session) render
  // through the shell — the start state used to return early
  // without it.
  const aiSession = readCode("src/pages/AiSessionPage.tsx");
  assert.equal(
    (aiSession.match(/<BigFooterShell footer=\{footer\}>/g) ?? []).length,
    2,
    "AiSessionPage renders the footer in the start and in-session states",
  );
  // MealsHubPage: the hub owns the footer on BOTH tabs (PR #413
  // review). On the plans tab the hub's shell encloses the pinned
  // header AND MealPlansPage, so the shell's viewport minimum spans
  // the full pinned layout; MealPlansPage gets NO footer there (an
  // inner shell below the header pushed the footer one header
  // height past the viewport bottom on short lists).
  const mealsHub = readCode("src/pages/MealsHubPage.tsx");
  assert.match(
    mealsHub,
    /<BigFooterShell footer=\{footer\} scrollMode="content">\s*<PinnedHeaderShell[\s\S]*?<MealPlansPage/,
    "the plans tab's footer shell encloses the pinned header and MealPlansPage",
  );
  assert.doesNotMatch(
    mealsHub,
    /<MealPlansPage\b[^>]*\bfooter\b/,
    "MealPlansPage must not receive the footer on the plans tab — the hub shell owns it",
  );
  // Nested compositions: the outer page owns the footer; the
  // nested form/page gets no footer prop.
  for (const story of [
    "src/pages/EditRecipePage.stories.tsx",
    "src/pages/ManualEntryPage.stories.tsx",
    "src/pages/EditVersionPage.stories.tsx",
  ]) {
    assert.doesNotMatch(
      readCode(story),
      /<RecipeFormPage\b[^>]*\bfooter\b/,
      `${story} must not supply a footer to the nested RecipeFormPage`,
    );
  }
  // #473: PublicPageFrame is retired — PublicRecipePage owns its
  // footer itself, so its stories supply the footer to the page.
  assert.match(
    readCode("src/pages/PublicRecipePage.stories.tsx"),
    /<PublicRecipePage footer=\{eciperayFooterFixture\}/,
    "the PublicRecipePage stories supply the footer to the page itself — the page owns it (#473)",
  );
});

test("the eciperay story fixture carries the Legal column convention as data", () => {
  const fixtures = readCode("src/pages/fixtures.ts");
  assert.ok(fixtures.includes("eciperayFooterFixture"), "eciperay footer fixture exists");
  assert.ok(
    fixtures.includes('"Do Not Sell or Share My Personal Information"') ||
      fixtures.includes("Do Not Sell or Share My Personal Information"),
  );
  assert.ok(fixtures.includes("memorizeFooterFixture"), "memorize footer fixture exists");
});

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const { createTamaguiConfig, baseTheme }: Record<string, any> =
      await import("../../dist/tamagui.config.js").then(async (configModule) => {
        const themes: Record<string, any> = await import("../../dist/themes/index.js");
        return { ...configModule, ...themes };
      });
    const { BigFooter, BigFooterShell }: Record<string, any> =
      await import("../../dist/widgets/BigFooter.js");
    return {
      React,
      renderToString,
      TamaguiProvider,
      createTamaguiConfig,
      baseTheme,
      BigFooter,
      BigFooterShell,
    };
  })();
  return runtimePromise;
}

const footerData = {
  brand: { label: "Eciperay", href: "/" },
  columns: [
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Do Not Sell or Share My Personal Information", href: "/do-not-sell-or-share" },
      ],
    },
  ],
  storeLinks: [{ label: "Download on the App Store", href: "/app-store", store: "app-store" }],
  socialLinks: [{ label: "Eciperay on Facebook", href: "/social/facebook", icon: "facebook" }],
};

test("SSR: BigFooter renders brand, columns, store and social links as anchors", async () => {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, BigFooter } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      React.createElement(BigFooter, { footer: footerData }),
    ),
  );
  for (const [label, href] of [
    ["Privacy Policy", "/privacy"],
    ["Terms of Service", "/terms"],
    ["Do Not Sell or Share My Personal Information", "/do-not-sell-or-share"],
    ["Download on the App Store", "/app-store"],
  ] as const) {
    assert.ok(html.includes(label), `${label} renders`);
    assert.ok(new RegExp(`<a [^>]*href="${href}"`).test(html), `${label} is an anchor to ${href}`);
  }
  assert.ok(html.includes("Eciperay"), "the brand wordmark renders");
  const socialAnchor = /<a [^>]*href="\/social\/facebook"[^>]*>/.exec(html)?.[0];
  assert.ok(socialAnchor, "the social link renders as an anchor to its href");
  assert.ok(
    socialAnchor.includes('aria-label="Eciperay on Facebook"'),
    "the social anchor carries its accessible name as aria-label",
  );
});

test("SSR: an exported page renders its footer from the footer prop", async () => {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const { SignInPage }: Record<string, any> = await import("../../dist/pages/SignInPage.js");
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      React.createElement(SignInPage, {
        email: "",
        password: "",
        onEmailChange: () => {},
        onPasswordChange: () => {},
        onSubmit: () => {},
        signUpHref: "/signup",
        forgotPasswordHref: "/forgot-password",
        footer: footerData,
      }),
    ),
  );
  assert.ok(
    html.includes("Do Not Sell or Share My Personal Information"),
    "the page renders its BigFooter legal column",
  );
  assert.ok(
    new RegExp(`<a [^>]*href="/do-not-sell-or-share"`).test(html),
    "the page footer's legal link is an anchor",
  );
});

describe("bigFooterBrandLogo", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

  function readCode(rel: string) {
    return readFileSync(join(root, rel), "utf8")
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  }

  const footer = readCode("src/widgets/BigFooter.tsx");

  test("BigFooterBrand carries the optional logo slot (#468)", () => {
    assert.match(footer, /export type BigFooterBrand = \{/);
    assert.match(footer, /logo\?: ReactNode;/);
    assert.match(footer, /export const BIG_FOOTER_BRAND_LOGO_HEIGHT = 40;/);
  });

  test("a supplied logo renders in the DS-owned box instead of the wordmark (#468)", () => {
    assert.match(
      footer,
      /brand\.logo \? \(\s*<XStack height=\{BIG_FOOTER_BRAND_LOGO_HEIGHT\} alignItems="center">\s*\{brand\.logo\}\s*<\/XStack>\s*\) : \(\s*brand\.label\s*\)/,
    );
    // The brand anchor keeps the label as its accessible name in
    // both forms and stays a real link to the brand href.
    assert.match(footer, /accessibilityLabel: brand\.label/);
    assert.match(footer, /href=\{brand\.href\}/);
  });

  let runtimePromise: Promise<Record<string, any>> | undefined;
  function loadRuntime() {
    runtimePromise ??= (async () => {
      const reactModule = await import("react");
      const React = reactModule.default;
      const { renderToString } = await import("react-dom/server");
      const { TamaguiProvider }: Record<string, any> = await import("tamagui");
      const { createTamaguiConfig, baseTheme }: Record<string, any> =
        await import("../../dist/tamagui.config.js").then(async (configModule) => {
          const themes: Record<string, any> = await import("../../dist/themes/index.js");
          return { ...configModule, ...themes };
        });
      const { BigFooter }: Record<string, any> = await import("../../dist/widgets/BigFooter.js");
      return { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, BigFooter };
    })();
    return runtimePromise;
  }

  const baseFooter = {
    brand: { label: "Eciperay", href: "/" },
    columns: [],
    storeLinks: [],
    socialLinks: [],
  };

  test("SSR: a supplied logo renders inside the brand link, named by the brand label (#468)", async () => {
    const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, BigFooter } =
      await loadRuntime();
    const config = createTamaguiConfig(baseTheme);
    const html = renderToString(
      React.createElement(
        TamaguiProvider,
        { config, defaultTheme: "light" },
        React.createElement(BigFooter, {
          footer: {
            ...baseFooter,
            brand: {
              ...baseFooter.brand,
              logo: React.createElement("span", { "data-logo-marker": "fixture-logo" }, "LOGO"),
            },
          },
        }),
      ),
    );
    const anchor = /<a [^>]*href="\/"[^>]*>/.exec(html)?.[0];
    assert.ok(anchor, "the brand renders as an anchor to the brand href");
    assert.ok(
      anchor.includes('aria-label="Eciperay"'),
      "the brand anchor carries the brand label as its accessible name",
    );
    assert.ok(html.includes('data-logo-marker="fixture-logo"'), "the supplied logo node renders");
    assert.ok(!html.includes(">Eciperay<"), "the text wordmark does not render alongside the logo");
  });

  test("SSR: without a logo the text wordmark renders as before (#468)", async () => {
    const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, BigFooter } =
      await loadRuntime();
    const config = createTamaguiConfig(baseTheme);
    const html = renderToString(
      React.createElement(
        TamaguiProvider,
        { config, defaultTheme: "light" },
        React.createElement(BigFooter, { footer: baseFooter }),
      ),
    );
    const anchor = /<a [^>]*href="\/"[^>]*>/.exec(html)?.[0];
    assert.ok(anchor, "the brand renders as an anchor to the brand href");
    assert.ok(
      anchor.includes('aria-label="Eciperay"'),
      "the brand anchor carries the brand label as its accessible name",
    );
    assert.ok(html.includes(">Eciperay<"), "the text wordmark renders");
  });
});

describe("bigFooterPrimary", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

  function readCode(rel: string) {
    return readFileSync(join(root, rel), "utf8")
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  }

  const footer = readCode("src/widgets/BigFooter.tsx");

  test("the footer band fills with $primary and carries no top divider (#465)", () => {
    assert.match(footer, /backgroundColor="\$primary"/);
    assert.ok(
      !/backgroundColor="\$surface"/.test(footer),
      "the band must not keep the surface fill",
    );
    assert.ok(!/borderTopWidth/.test(footer), "the solid primary band carries no divider line");
  });

  test("the brand wordmark and social links ink in $onPrimary (#465)", () => {
    const styledBlocks = footer.match(/color: "\$onPrimary"/g) ?? [];
    assert.equal(
      styledBlocks.length,
      2,
      "brand anchor + social anchor styled frames use $onPrimary",
    );
    assert.ok(!/color: "\$primary"/.test(footer), "no frame inks in $primary on the primary fill");
  });

  test("column titles and column links ink in $onPrimary (#465)", () => {
    assert.match(footer, /<Text variant="label" color="\$onPrimary">/);
    assert.match(footer, /<TextLink[\s\S]*?color="\$onPrimary"/);
  });

  test("social glyphs receive the resolved on-primary ink explicitly (#465)", () => {
    // react-native-svg cannot inherit the anchor's text color on
    // native, so the glyph color is the theme's onPrimary role
    // resolved through useTheme — never currentColor inheritance.
    assert.match(footer, /useTheme\(\)/);
    assert.match(
      footer,
      /const socialInk = typeof theme\.onPrimary\?\.val === "string" \? theme\.onPrimary\.val : "#ffffff";/,
    );
    assert.match(footer, /<IconGlyph size=\{24\} color=\{socialInk\} \/>/);
  });

  test("store links are official badges, not secondary Buttons (#465 superseded by #466)", () => {
    // #465 kept store links as secondary Buttons on the primary
    // band; #466 superseded that: each store link is now a real
    // anchor wrapping its store's official badge artwork.
    assert.ok(!/<Button/.test(footer), "store links must not render as Buttons (#466)");
    assert.match(footer, /<StyledBigFooterStoreAnchor/);
    assert.match(footer, /STORE_BADGES/);
  });
});

describe("bigFooterSideColumn", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

  function readCode(rel: string) {
    return readFileSync(join(root, rel), "utf8")
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  }

  const footer = readCode("src/widgets/BigFooter.tsx");

  test("the side column renders after the link columns, inside the same row (#467)", () => {
    const columnsAt = footer.indexOf("columns.map((column)");
    const sideAt = footer.indexOf('testID="big-footer-side-column"');
    assert.ok(columnsAt >= 0, "link columns render");
    assert.ok(sideAt > columnsAt, "side column follows the link-columns region");
    const brandAt = footer.indexOf("<StyledBigFooterBrandAnchor");
    assert.ok(brandAt >= 0 && brandAt < columnsAt, "brand wordmark stays above the row");
  });

  test("store links sit above socials in the side column, socials pinned to its bottom (#467)", () => {
    const sideAt = footer.indexOf('testID="big-footer-side-column"');
    const sideBlock = footer.slice(sideAt);
    const storeAt = sideBlock.indexOf("<StyledBigFooterStoreAnchor");
    const socialAt = sideBlock.indexOf("<StyledBigFooterSocialAnchor");
    assert.ok(storeAt >= 0, "store links render inside the side column");
    assert.ok(socialAt > storeAt, "social row renders below the store links");
    const tagStart = footer.lastIndexOf("<YStack", sideAt);
    const openingTag = footer.slice(tagStart, footer.indexOf(">", sideAt));
    assert.ok(
      openingTag.includes('justifyContent="space-between"'),
      "the side column pins its social row to the bottom via space-between",
    );
  });

  test("the side column renders only when it has content (#467)", () => {
    assert.match(footer, /storeLinks\.length > 0 \|\| socialLinks\.length > 0 \?/);
  });
});

describe("bigFooterStoreBadges", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

  function readCode(rel: string) {
    return readFileSync(join(root, rel), "utf8")
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  }

  const footer = readCode("src/widgets/BigFooter.tsx");
  const appStoreBadge = readCode("src/icons/AppStoreBadge.tsx");
  const googlePlayBadge = readCode("src/icons/GooglePlayBadge.tsx");

  test("BigFooterStoreLink requires the store discriminator (#466)", () => {
    assert.match(footer, /export type BigFooterStore = "app-store" \| "google-play";/);
    assert.match(footer, /store: BigFooterStore;/);
    const fixtures = readCode("src/pages/fixtures.ts");
    assert.match(fixtures, /store: "app-store"/);
    assert.match(fixtures, /store: "google-play"/);
  });

  test("each store value maps to its matching badge component (#466)", () => {
    assert.match(footer, /"app-store": AppStoreBadge/);
    assert.match(footer, /"google-play": GooglePlayBadge/);
    assert.match(footer, /const Badge = STORE_BADGES\[link\.store\];/);
    assert.match(footer, /<Badge \/>/);
    // The badge renders INSIDE its anchor: the SSR harness's
    // react-native-svg stub renders no badge artwork, so the
    // nesting is pinned here at source level — the same pattern
    // icons.test.ts uses for glyph rendering (#246).
    assert.match(
      footer,
      /<StyledBigFooterStoreAnchor[\s\S]*?<Badge \/>\s*<\/StyledBigFooterStoreAnchor>/,
    );
  });

  test("the badges are bundled SVG artwork at the stores' required sizes (#466)", () => {
    // Apple's badge: 120x40 minimum, black field, white border,
    // Apple logo, and the two-line lockup.
    assert.match(appStoreBadge, /export function AppStoreBadge\(\)/);
    assert.match(appStoreBadge, /APP_STORE_BADGE_WIDTH = 120/);
    assert.match(appStoreBadge, /APP_STORE_BADGE_HEIGHT = 40/);
    assert.match(appStoreBadge, /viewBox="0 0 120 40"/);
    assert.match(appStoreBadge, /fill="#000000" stroke="#ffffff"/);
    assert.ok(appStoreBadge.includes("Download on the"), "Apple badge carries its lockup line");
    assert.ok(appStoreBadge.includes("App Store"), "Apple badge names the App Store");
    assert.match(appStoreBadge, /from "react-native-svg"/);
    // Google's badge: 155x46 generic badge, black field, white
    // border, the multicolor Play triangle, and its lockup.
    assert.match(googlePlayBadge, /export function GooglePlayBadge\(\)/);
    assert.match(googlePlayBadge, /GOOGLE_PLAY_BADGE_WIDTH = 155/);
    assert.match(googlePlayBadge, /GOOGLE_PLAY_BADGE_HEIGHT = 46/);
    assert.match(googlePlayBadge, /viewBox="0 0 155 46"/);
    assert.match(googlePlayBadge, /fill="#000000" stroke="#ffffff"/);
    for (const color of ["#00d2ff", "#00f076", "#ffce00", "#ff3a44"]) {
      assert.ok(googlePlayBadge.includes(color), `Play triangle carries its ${color} segment`);
    }
    assert.ok(googlePlayBadge.includes("GET IT ON"), "Google badge carries its lockup line");
    assert.ok(googlePlayBadge.includes("Google Play"), "Google badge names Google Play");
    assert.match(googlePlayBadge, /from "react-native-svg"/);
  });

  test("a store link is a real anchor with href and the label as its accessible name (#466)", () => {
    assert.match(footer, /<StyledBigFooterStoreAnchor/);
    assert.match(footer, /accessibilityRole: "link",\s*accessibilityLabel: link\.label/);
    assert.match(footer, /href=\{link\.href\}/);
    assert.ok(!/<Button/.test(footer), "no plain text Button renders a store link (#466)");
    assert.match(footer, /storeLinks\.length > 0 \? \(/);
  });

  let runtimePromise: Promise<Record<string, any>> | undefined;
  function loadRuntime() {
    runtimePromise ??= (async () => {
      const reactModule = await import("react");
      const React = reactModule.default;
      const { renderToString } = await import("react-dom/server");
      const { TamaguiProvider }: Record<string, any> = await import("tamagui");
      const { createTamaguiConfig, baseTheme }: Record<string, any> =
        await import("../../dist/tamagui.config.js").then(async (configModule) => {
          const themes: Record<string, any> = await import("../../dist/themes/index.js");
          return { ...configModule, ...themes };
        });
      const { BigFooter }: Record<string, any> = await import("../../dist/widgets/BigFooter.js");
      return { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, BigFooter };
    })();
    return runtimePromise;
  }

  const baseFooter = {
    brand: { label: "Eciperay", href: "/" },
    columns: [],
    socialLinks: [],
  };

  test("SSR: each store link renders as an anchor with its href and accessible name (#466)", async () => {
    const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, BigFooter } =
      await loadRuntime();
    const config = createTamaguiConfig(baseTheme);
    const html = renderToString(
      React.createElement(
        TamaguiProvider,
        { config, defaultTheme: "light" },
        React.createElement(BigFooter, {
          footer: {
            ...baseFooter,
            storeLinks: [
              { label: "Download on the App Store", href: "/app-store", store: "app-store" },
              { label: "Get it on Google Play", href: "/google-play", store: "google-play" },
            ],
          },
        }),
      ),
    );
    for (const [label, href] of [
      ["Download on the App Store", "/app-store"],
      ["Get it on Google Play", "/google-play"],
    ] as const) {
      const anchor = new RegExp(`<a [^>]*href="${href}"[^>]*>`).exec(html)?.[0];
      assert.ok(anchor, `the ${label} store link is an anchor to ${href}`);
      assert.ok(
        anchor.includes(`aria-label="${label}"`),
        `the ${label} anchor carries the label as its accessible name`,
      );
    }
  });

  test("SSR: an empty storeLinks array renders no store section (#466)", async () => {
    const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, BigFooter } =
      await loadRuntime();
    const config = createTamaguiConfig(baseTheme);
    const html = renderToString(
      React.createElement(
        TamaguiProvider,
        { config, defaultTheme: "light" },
        React.createElement(BigFooter, { footer: { ...baseFooter, storeLinks: [] } }),
      ),
    );
    assert.ok(!html.includes("/app-store"), "no App Store link renders");
    assert.ok(!html.includes("/google-play"), "no Google Play link renders");
    assert.ok(!html.includes("Download on the App Store"), "no App Store badge renders");
    assert.ok(!html.includes("Get it on Google Play"), "no Google Play badge renders");
  });
});
