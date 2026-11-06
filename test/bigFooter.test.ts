/**
 * Contract test for BigFooter (spudly/design-system#410): the fat
 * footer every page renders — big brand wordmark, multi-column
 * link lists, app-store links, and Feather social icon links —
 * all from ONE caller-supplied `footer` prop object per page.
 *
 * Pins: BigFooter renders every section from data and hardcodes
 * no app content; store/social entries are real links (href)
 * with accessible names; the mobile stack breakpoint is named;
 * the sticky shell is a full-viewport-height in-flow column; and
 * EVERY exported page component renders the footer through the
 * shell (no exceptions, no opt-outs).
 */
import "./registerSvgStub.js";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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
  // Sticky: full-viewport-height column, content grows, footer last.
  // The minimum height is platform-specific (PR #413 review): 100dvh
  // on web, 100% of the parent's available height by default —
  // React Native does not support viewport units for minHeight.
  assert.match(
    bigFooter,
    /<YStack minHeight=\{\{ default: "100%", web: "100dvh" \}\} flexDirection="column">/,
  );
  assert.ok(
    !/<YStack minHeight="100dvh"/.test(bigFooter),
    "the shell must not pass a raw 100dvh minHeight to native",
  );
  assert.match(bigFooter, /flexGrow=\{1\}/);
  // Bounded content region (PR #413 review): the region the list /
  // scroll child fills carries an intrinsic flex basis (shrink 1,
  // basis "auto"), so it participates in shrink allocation and
  // keeps a content viewport even when the native footer is
  // taller than the screen (a zero basis could allocate it zero
  // height); and the region is the positioned ancestor, so an
  // absolute-fill child (StepOverlay) cannot cover the footer.
  assert.match(bigFooter, /flexShrink=\{1\} flexBasis="auto" position="relative"/);
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
  ]);
  const pages: string[] = [];
  for (const entry of readdirSync(pagesDir)) {
    if (
      entry.endsWith(".stories.tsx") ||
      entry.endsWith(".test.ts") ||
      entry.endsWith(".test.tsx") ||
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
  // (PublicPageFrame) adds neither a second footer nor a 100dvh
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

test("on native a tall footer keeps a scroll path of its own (PR #413 review)", () => {
  // The defect: on native the shell places the footer OUTSIDE the
  // content region's scroll paths (a BoundedList FlatList inside a
  // non-scrolling ScreenContainer, or ScreenContainer's own
  // ScrollView) and native has no document scroll, so a stacked
  // footer taller than the remaining screen space extended past
  // the visible area with its lower links unreachable.
  //
  // Web renders the footer bare — the document scrolls the whole
  // shell, so the footer is already reachable there.
  assert.match(bigFooter, /isWeb \? \(\s*<BigFooter footer=\{footer\} \/>/);
  // Native renders it inside the footer's OWN bounded scroll
  // region: intrinsic height when it fits (flexGrow 0, so the
  // sticky placement is unchanged), shrinkable below it
  // (flexShrink 1) so the region caps at the available space and
  // the lower links scroll into reach.
  assert.match(
    bigFooter,
    /<ScrollView flexGrow=\{0\} flexShrink=\{1\} keyboardShouldPersistTaps="handled">\s*<BigFooter footer=\{footer\} \/>\s*<\/ScrollView>/,
  );
  assert.match(bigFooter, /import \{[^}]*ScrollView[^}]*isWeb[^}]*\} from "tamagui";/);
  // The scroll path wraps ONLY the footer: the shell's children
  // (and any BoundedList inside them) never sit inside this
  // ScrollView, so list windowing and end-reached pagination are
  // untouched — the file's one ScrollView is the footer region.
  assert.equal(
    (bigFooter.match(/<ScrollView/g) ?? []).length,
    1,
    "BigFooterShell's only ScrollView is the native footer region",
  );
  assert.ok(
    !/<ScrollView[^>]*>\s*\{children\}/.test(bigFooter),
    "the shell's children are not wrapped in a ScrollView",
  );
  // Exactly one footer renders per platform: the two source
  // occurrences are the web and native branches of one shell.
  assert.equal(
    (bigFooter.match(/<BigFooter footer=\{footer\} \/>/g) ?? []).length,
    2,
    "the shell renders BigFooter once per platform branch, never twice",
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
    /<BigFooterShell footer=\{footer\}>\s*<PinnedHeaderShell[\s\S]*?<MealPlansPage/,
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
  assert.doesNotMatch(
    readCode("src/pages/PublicPageFrame.stories.tsx"),
    /<PublicRecipePage\b[^>]*\bfooter\b/,
    "the frame story must not supply a footer to the nested PublicRecipePage — the frame owns it",
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
      await import("../dist/tamagui.config.js").then(async (configModule) => {
        const themes: Record<string, any> = await import("../dist/themes/index.js");
        return { ...configModule, ...themes };
      });
    const { BigFooter, BigFooterShell }: Record<string, any> =
      await import("../dist/widgets/BigFooter.js");
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
  const { SignInPage }: Record<string, any> = await import("../dist/pages/SignInPage.js");
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
