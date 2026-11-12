/**
 * Shared SSR helpers for the #547 whole-page-flow contract tests
 * (ScrollRegion.test.ts, ScreenShell.test.ts).
 *
 * `renderToHtml` renders an element inside the Tamagui provider
 * using the calling test file's lazy runtime loader (each file
 * loads a different slice of the built dist, so the loader stays
 * per-file and is passed in).
 *
 * `verticalScrollers` returns every element in the rendered
 * markup that is a vertical scroller, by either mechanism that
 * can produce one in SSR output:
 *
 * - Inline style: Tamagui/RNW render a ScrollView's overflow as
 *   an inline style (`overflow-y: auto|scroll`, or the `overflow`
 *   shorthand in a scrolling form). This reads the rendered
 *   output itself — the assertion the #547 survival needed: the
 *   source looked right while the rendered page put its content
 *   inside a bounded, zero-height scroller.
 * - Class-based: a class whose rule in a rendered `<style>` block
 *   sets a scrolling vertical overflow. No component in the
 *   compositions under test sets overflow through CSS classes
 *   today (styling is Tamagui props, which SSR renders inline),
 *   but the detector covers the mechanism so a future class-based
 *   scroller cannot pass undetected; test/wholePageFlow.test.ts
 *   carries the negative control.
 */
export function makeRenderToHtml(
  loadRuntime: () => Promise<Record<string, any>>,
): (element: any) => Promise<string> {
  return async function renderToHtml(element: any) {
    const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, VoiceProvider } =
      await loadRuntime();
    const config = createTamaguiConfig(baseTheme);
    // #539: compositions under test can contain voice-reading widgets;
    // supply the fixture voice the same way Storybook does.
    let inner = element;
    if (VoiceProvider) {
      const { fixtureVoice } = await import("../dist/voice/fixtures.js");
      inner = React.createElement(VoiceProvider, { voice: fixtureVoice }, element);
    }
    return renderToString(
      React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, inner),
    );
  };
}

/**
 * Whether a CSS declaration block (an inline `style` value or a
 * `<style>` rule body) gives its element a vertical scroller.
 * `overflow-y` decides directly; the `overflow` shorthand's
 * vertical value is its second token when present, otherwise
 * its only token — so `overflow: auto hidden` (horizontal-only
 * scrolling) does not count, and `overflow: hidden auto` does.
 */
function declaresVerticalScroller(declarations: string): boolean {
  for (const declaration of declarations.split(";")) {
    const colon = declaration.indexOf(":");
    if (colon === -1) {
      continue;
    }
    const property = declaration.slice(0, colon).trim();
    const values = declaration
      .slice(colon + 1)
      .trim()
      .split(/\s+/);
    const vertical =
      property === "overflow-y"
        ? values[0]
        : property === "overflow"
          ? (values[1] ?? values[0])
          : undefined;
    if (vertical === "auto" || vertical === "scroll") {
      return true;
    }
  }
  return false;
}

function scrollingClassNames(html: string): Set<string> {
  const names = new Set<string>();
  for (const styleBlock of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    for (const rule of styleBlock[1].matchAll(/\.([A-Za-z0-9_-]+)\s*\{([^}]*)\}/g)) {
      if (declaresVerticalScroller(rule[2])) {
        names.add(rule[1]);
      }
    }
  }
  return names;
}

export function verticalScrollers(html: string): string[] {
  const found: string[] = [];
  const classScrollers = scrollingClassNames(html);
  for (const match of html.matchAll(/<[^>]+>/g)) {
    const tag = match[0];
    const style = /style="([^"]*)"/.exec(tag)?.[1];
    if (style && declaresVerticalScroller(style)) {
      found.push(tag.slice(0, 160));
      continue;
    }
    if (classScrollers.size > 0) {
      const classes = /class="([^"]*)"/.exec(tag)?.[1];
      if (classes && classes.split(/\s+/).some((name) => classScrollers.has(name))) {
        found.push(tag.slice(0, 160));
      }
    }
  }
  return found;
}
