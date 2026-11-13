import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
describe("buttonGhostProp", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

  /**
   * Strip comments without touching string literals: a `//` inside
   * a URL (or any quoted string) is data, not a comment — eating the
   * rest of that line could hide a real call site from the scan
   * below (CodeRabbit round on PR #502).
   */
  function stripComments(code: string) {
    let out = "";
    let quote: string | null = null;
    for (let i = 0; i < code.length; i += 1) {
      const ch = code[i] ?? "";
      const next = code[i + 1] ?? "";
      if (quote !== null) {
        out += ch;
        if (ch === "\\") {
          out += next;
          i += 1;
        } else if (ch === quote) {
          quote = null;
        }
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        quote = ch;
        out += ch;
        continue;
      }
      if (ch === "/" && next === "/") {
        while (i < code.length && code[i] !== "\n") i += 1;
        out += "\n";
        continue;
      }
      if (ch === "/" && next === "*") {
        i += 2;
        while (i < code.length && !(code[i] === "*" && code[i + 1] === "/")) i += 1;
        i += 1;
        continue;
      }
      out += ch;
    }
    return out;
  }
  function readCode(rel: string) {
    return stripComments(readFileSync(join(root, rel), "utf8"));
  }

  // Every spelling of the deprecated value, as patterns so quote
  // style and whitespace cannot slip a call site past the scan:
  // the JSX attribute form, the JSX expression form, and the
  // object-property form (story args, quoted key included).
  const spellings = [
    /\bvariant\s*=\s*(["'])ghost\1/,
    /\bvariant\s*=\s*\{\s*(["'])ghost\1\s*\}/,
    /(?:\bvariant|["']variant["'])\s*:\s*(["'])ghost\1/,
  ];
  const button = readCode("src/widgets/Button.tsx");
  test("the frame carries a boolean ghost treatment: transparent, borderless (#463)", () => {
    const ghostBoolean =
      /ghost: \{\s*true: \{\s*backgroundColor: "transparent",\s*borderWidth: 0,/.exec(button);
    assert.ok(
      ghostBoolean,
      "buttonFrameConfig must define ghost.true as transparent + borderWidth 0",
    );
  });
  test("the ghost prop inks per variant: primary $primary, secondary gray10, danger danger7 (#463)", () => {
    const map = /const ghostLabelColors = \{([^}]*)\}/.exec(button);
    assert.ok(map, "the ghostLabelColors map must exist");
    assert.match(map[1], /primary: "\$primary"/);
    assert.match(map[1], /secondary: tokens\.colors\.gray\.gray10/);
    assert.match(map[1], /danger: tokens\.colors\.danger\.danger7/);
  });
  test("the deprecated ghost variant still renders for hosts that spell it (#463)", () => {
    // Deprecation, not removal (Stephen's 2026-11-06 adjustment):
    // the variant block and its legacy $link label color stay until
    // the host repos' usages are removed. The variant's own frame
    // stays transparent and borderless (the first `ghost:` block in
    // the frame config is the variant's, ahead of the boolean
    // treatment), so a host still spelling it renders unchanged.
    assert.match(button, /ghost: "\$link"/);
    const variantBlock = /ghost: \{([^}]*)\}/.exec(button);
    assert.ok(variantBlock, "the deprecated ghost variant block must exist in the frame config");
    assert.match(variantBlock[1], /backgroundColor: "transparent"/);
    assert.match(variantBlock[1], /borderWidth: 0/);
  });
  test("both Button forms forward the ghost prop to their frames (#463)", () => {
    // If either frame stopped receiving `ghost`, the config checks
    // above would still pass while the button kept its fill/border —
    // so pin the wiring itself, the same both-forms count pattern
    // the #459 border contract uses. (Rendered-frame assertions are
    // Storybook/Chromatic QA's layer; every Button contract in this
    // repo is a source scan like this one.)
    const applications = button.match(/\{\.\.\.\(ghost \? \{ ghost: true \} : null\)\}/g);
    assert.equal(
      applications?.length,
      2,
      "the button form and the href form must both pass ghost to their frames",
    );
  });
  test("no in-repo call site spells the deprecated ghost variant (#463)", () => {
    const srcFiles = readdirSync(join(root, "src"), {
      recursive: true,
    })
      .map((entry) => String(entry))
      .filter(
        (entry) => (entry.endsWith(".ts") || entry.endsWith(".tsx")) && !entry.endsWith(".test.ts"),
      );
    assert.ok(srcFiles.length > 100, "the scan must cover the source tree");
    for (const rel of srcFiles) {
      const code = readCode(join("src", rel));
      for (const spelling of spellings) {
        assert.ok(
          !spelling.test(code),
          `${rel} must use the ghost prop, not the deprecated ghost variant (${spelling})`,
        );
      }
    }
  });
  test("the scan's comment stripping preserves string literals (PR #502 round)", () => {
    // A `//` inside a URL string must not eat the rest of the line:
    // a deprecated spelling after it on the same line stays visible.
    const line = 'const u = "https://example.com//a"; <Button variant="ghost" />;';
    const stripped = stripComments(line);
    assert.ok(
      spellings.some((spelling) => spelling.test(stripped)),
      "the spelling after the URL must be detected",
    );
    // A real line comment still strips.
    assert.ok(!stripComments('// <Button variant="ghost" />').includes("variant"));
  });
  test("the scan detects a quoted object key for the deprecated variant (PR #502 round)", () => {
    assert.ok(spellings.some((spelling) => spelling.test('{ "variant": "ghost" }')));
    assert.ok(spellings.some((spelling) => spelling.test("{ 'variant': 'ghost' }")));
    assert.ok(spellings.some((spelling) => spelling.test('{ variant: "ghost" }')));
  });
});
describe("buttonIcon", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  function readCode(rel: string) {
    return readFileSync(join(root, rel), "utf8")
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  }
  const button = readCode("src/widgets/Button.tsx");
  const stories = readCode("src/widgets/Button.stories.tsx");
  const index = readCode("src/widgets/index.ts");
  const pageWebAria = readCode("test/pageWebAria.test.ts");
  test("the standalone IconButton is removed everywhere (#178 decision change)", () => {
    for (const rel of [
      "src/widgets/IconButton.tsx",
      "src/widgets/IconButton.stories.tsx",
      "test/iconButton.test.ts",
      ".changeset/icon-button-widget.md",
    ]) {
      assert.ok(!existsSync(join(root, rel)), `${rel} must not exist`);
    }
    assert.ok(!index.includes("IconButton"), "components index must not export IconButton");
    assert.ok(
      !pageWebAria.includes('"IconButton"'),
      "the #237 scan's sanctioned-tags set must not list IconButton",
    );
  });
  test("the icon slot takes an icon NAME, resolved through the internal registry (#178, #438 Part 4)", () => {
    assert.match(
      button,
      /import \{ iconsByName, type IconName \} from "\.\.\/icons\/iconRegistry\.js";/,
    );
    assert.match(button, /icon\?: IconName;/);
    assert.match(button, /iconsByName\[icon\]/);
    assert.ok(
      !/from "\.\.\/icons\/[A-Z][\w]*Icon\.js"/.test(button),
      "Button must not import per-icon components directly — glyphs resolve only through the registry",
    );
    assert.ok(
      !/ComponentType<IconComponentProps>/.test(button),
      "the slot no longer takes a caller-supplied icon component",
    );
  });
  test("icon-only requires accessibilityLabel at the type level; the labeled shapes do not (#178)", () => {
    // No-icon branch stays the permissive plain button.
    assert.match(
      button,
      /icon\?: undefined;\s*children\?: ReactNode;\s*accessibilityLabel\?: string;/,
    );
    // Icon + label branch. Boolean children are excluded: `false`
    // renders no label, so it must fall into the icon-only branch.
    assert.match(
      button,
      /icon: IconName;\s*children: Exclude<NonNullable<ReactNode>, boolean>;\s*accessibilityLabel\?: string;/,
    );
    // Icon-only branch: label is a required string, never optional.
    assert.match(
      button,
      /icon: IconName;\s*children\?: boolean \| null;\s*accessibilityLabel: string;/,
    );
  });
  test("the slot exposes no styling props — Button owns the glyph's size and ink (#178)", () => {
    assert.ok(
      !/icon(Color|Size|Style|StrokeWidth)/.test(button),
      "no icon color/size/style props may exist on Button",
    );
    // The glyph receives exactly Button's standard size and resolved ink.
    assert.match(button, /<IconGlyph size=\{glyphSize\} color=\{glyphInk\} \/>/);
  });
  test("the glyph renders LEFT of the label (#178)", () => {
    const glyphAt = button.indexOf("<IconGlyph size={glyphSize} color={glyphInk} />");
    // The label renders as the frame's direct child (the ternary's
    // bare `children` branch): Tamagui styles the frame's string
    // children as the button text, so the label must not be
    // wrapped — a fragment wrapper left it unstyled (#551).
    const labelAt = button.indexOf(
      "ghostSkeleton ? (hasLabel ? ghostLabelBone : null) : children",
      glyphAt,
    );
    assert.ok(glyphAt !== -1, "glyph element must be rendered");
    assert.ok(labelAt > glyphAt, "the label must render after (right of) the glyph");
  });
  test("glyph size is standardized per Button size: 18/20/24 (#178)", () => {
    assert.match(button, /sm: 18,\s*md: 20,\s*lg: 24/);
    assert.match(button, /glyphSizes\[size as keyof typeof glyphSizes\] \?\? glyphSizes\.md/);
  });
  test("glyph ink mirrors Button's variant label colors (#178)", () => {
    assert.match(button, /roleValue\("onPrimary"\)/);
    assert.match(button, /roleValue\("link"\)/);
    assert.match(button, /case "danger":\s*return "#ffffff";/);
    assert.match(button, /case "secondary":\s*return tokens\.colors\.gray\.gray10;/);
  });
  test("icon-only pins the square standard box (44/48/56) with text padding zeroed (#178)", () => {
    assert.match(button, /sm: 44,\s*md: 48,\s*lg: 56/);
    // Icon-only detection is render-based: Children.toArray drops
    // the child forms that render nothing (null, undefined,
    // booleans) and the some() check drops the empty string, so a
    // `false` or "" child cannot leave an unnamed, un-pinned button.
    assert.match(button, /Children\.toArray\(children\)\.some\(\(child\) => child !== ""\)/);
    assert.match(button, /const iconOnly = IconGlyph != null && !hasLabel;/);
    assert.match(button, /width: iconOnlyBox/);
    assert.match(button, /height: iconOnlyBox/);
    assert.match(button, /flexShrink: 0/);
    assert.match(button, /paddingHorizontal: 0/);
    assert.match(button, /paddingVertical: 0/);
  });
  test("every form shares one height per size in the frame config (#469)", () => {
    // Regression for #469: the labeled form's height was content-derived
    // while icon-only was pinned to its box, so the two rendered at
    // different heights. The shared frame's size variants now carry the
    // same per-size heights as the icon-only boxes (44/48/56).
    assert.match(button, /sm: \{\s*fontSize: tokens\.typography\.fontSize\.sm,\s*minHeight: 44,/);
    assert.match(button, /md: \{\s*fontSize: tokens\.typography\.fontSize\.md,\s*minHeight: 48,/);
    assert.match(button, /lg: \{\s*fontSize: tokens\.typography\.fontSize\.lg,\s*minHeight: 56,/);
    // lg vertical padding is spacing[3]: at spacing[4] the 24px glyph + padding + border totals 58px, above the 56px box.
    const lgVariant = button.slice(
      button.indexOf("minHeight: 56,"),
      button.indexOf("minHeight: 56,") + 400,
    );
    assert.ok(
      lgVariant.includes("paddingVertical: tokens.spacing[3],"),
      "the lg size variant must use spacing[3] vertical padding so its content fits the 56px height",
    );
  });
  test("the glyph-to-label gap is Button's own fixed spacing (#178)", () => {
    assert.match(button, /gap: tokens\.spacing\[2\]/);
  });
  test("stories cover icon+label and icon-only across variants, sizes, disabled, and a press interaction (#178)", () => {
    assert.match(stories, /title: "Widgets\/Button"/);
    for (const story of [
      "WithIcon",
      "WithIconVariants",
      "IconOnly",
      "IconOnlyVariants",
      "IconSizes",
      "IconDisabled",
      "IconPressCounter",
    ]) {
      assert.match(stories, new RegExp(`export const ${story}: Story`), `missing story ${story}`);
    }
    // The stories exercise the real DS icon names, not stand-ins.
    for (const name of ["print", "add", "share", "warning"]) {
      assert.match(
        stories,
        new RegExp(String.raw`icon[:=]\s*(?:\{\s*)?"${name}"`),
        `stories must pass the "${name}" icon by name`,
      );
    }
  });

  // Runtime imports are lazy, like the buttonWebAria block in this file, so the
  // source scans still report when the build output is missing.
  let runtimePromise: Promise<Record<string, any>> | undefined;
  function loadRuntime() {
    runtimePromise ??= (async () => {
      const reactModule = await import("react");
      const React = reactModule.default;
      const { renderToString } = await import("react-dom/server");
      const { TamaguiProvider }: Record<string, any> = await import("tamagui");
      const dist: Record<string, any> = await loadInternalDist();
      return {
        React,
        renderToString,
        TamaguiProvider,
        ...dist,
      };
    })();
    return runtimePromise;
  }
  async function renderToHtml(element: any) {
    const { renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } = await loadRuntime();
    const config = createTamaguiConfig(baseTheme);
    return renderToString(
      <TamaguiProvider config={config} defaultTheme="light">
        {element}
      </TamaguiProvider>,
    );
  }

  /**
   * The glyph itself renders inert under the harness's
   * react-native-svg stub (see the header): the runtime checks
   * below pin the button's own markup — element, accessible name,
   * label presence — while the source scans above pin what Button
   * passes the glyph (the standard size and variant ink, the glyph
   * element before the label).
   */

  const noop = () => null;
  test("SSR: icon + label renders the label in a real button, with no leaked RN attributes (#178)", async () => {
    const { Button } = await loadRuntime();
    const html = await renderToHtml(
      <Button icon="print" variant="secondary" onPress={noop}>
        Print recipe
      </Button>,
    );
    assert.ok(html.includes("<button"), "renders a real button element");
    assert.ok(html.includes("Print recipe"), "the label text renders");
    assert.ok(!/accessibilitylabel/i.test(html), "no leaked RN accessibility attributes");
    assert.ok(!html.includes("[object Object]"), "no stringified state object in the DOM");
  });
  test("SSR: icon-only renders no text and carries the required label as its name (#178)", async () => {
    const { Button } = await loadRuntime();
    const html = await renderToHtml(
      <Button
        icon="warning"
        variant="danger"
        size="lg"
        accessibilityLabel="Delete recipe"
        onPress={noop}
      />,
    );
    assert.ok(html.includes('aria-label="Delete recipe"'), "the label names the button on web");
    assert.ok(!html.includes(">Delete recipe<"), "no visible label text is rendered");
    const sm = await renderToHtml(
      <Button icon="print" size="sm" accessibilityLabel="Print recipe" onPress={noop} />,
    );
    assert.ok(sm.includes('aria-label="Print recipe"'));
    assert.ok(!sm.includes(">Print recipe<"), "no visible label text is rendered");
  });
  test('SSR: children that render nothing (false, "") are treated as icon-only, never left unnamed (#178)', async () => {
    const { Button } = await loadRuntime();
    for (const emptyChild of [false, ""]) {
      const html = await renderToHtml(
        <Button icon="print" accessibilityLabel="Print recipe" onPress={noop}>
          {emptyChild}
        </Button>,
      );
      assert.ok(
        html.includes('aria-label="Print recipe"'),
        `child ${JSON.stringify(emptyChild)}: the required label names the button`,
      );
      assert.ok(!html.includes(">Print recipe<"), "no visible label text is rendered");
    }
  });
  test("SSR: a disabled icon-only Button reports aria-disabled; a plain Button renders no glyph (#178)", async () => {
    const { Button } = await loadRuntime();
    const disabled = await renderToHtml(
      <Button icon="print" accessibilityLabel="Print recipe" disabled={true} onPress={noop} />,
    );
    assert.ok(disabled.includes('aria-disabled="true"'), "disabled is reported on web");
    const plain = await renderToHtml(<Button onPress={noop}>Save recipe</Button>);
    assert.ok(plain.includes("Save recipe"), "the plain labeled button is unchanged");
    assert.ok(
      !plain.includes("aria-label"),
      "no accessible name beyond the label text without the icon prop",
    );
  });
});
describe("buttonNoStyleProps", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const read = (rel: string) =>
    readFileSync(join(here, "../..", rel), "utf8")
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  const button = read("src/widgets/Button.tsx");
  test("Button's public props omit backgroundColor and color on both forms (#480)", () => {
    assert.match(
      button,
      /"disabled" \| "children" \| "icon" \| "href" \| "backgroundColor" \| "color"/,
    );
    assert.match(
      button,
      /"disabled" \| "children" \| "icon" \| "onPress" \| "backgroundColor" \| "color"/,
    );
    assert.doesNotMatch(button, /const \{[\s\S]*?\bcolor,[\s\S]*?\} = props as ButtonRenderProps/);
  });
  test("the danger tone is a semantic Button prop with an owned treatment (#480)", () => {
    assert.match(button, /tone\?: "default" \| "danger"/);
    assert.match(
      button,
      /dangerToneApplies = tone === "danger" && variant === "secondary" && !selected/,
    );
    assert.match(button, /dangerFillApplies = dangerToneApplies && !ghost/);
    assert.match(
      button,
      /dangerFillApplies \? \{ backgroundColor: tokens\.colors\.danger\.danger1 \}/,
    );
    assert.match(button, /tokens\.colors\.danger\.danger8/);
  });
  test("NutritionPanel passes no styling props into Button (#480)", () => {
    const panel = read("src/widgets/NutritionPanel.tsx");
    assert.doesNotMatch(panel, /backgroundColor=\{tokens\.colors\.gray/);
    assert.match(
      panel,
      /<Button\s+variant="primary"\s+disabled=\{nutrition\.isRefreshing \?\? false\}/,
    );
    assert.match(panel, /<Button\s+variant="secondary"\s+size="sm"\s+disabled=/);
  });
  test("CardRow and LogEntryCard use tone instead of style props (#480)", () => {
    assert.match(read("src/widgets/CardRow.tsx"), /tone: "danger" as const/);
    assert.match(read("src/widgets/LogEntryCard.tsx"), /tone="danger"/);
  });
  test("Alert's dismiss ink uses only the internal Button form (#480)", () => {
    const alert = read("src/widgets/Alert.tsx");
    assert.match(alert, /<ButtonInternal/);
    assert.match(alert, /internalInk=\{styles\.text\}/);
    const barrel = read("src/widgets/index.ts");
    assert.doesNotMatch(barrel, /ButtonInternal/);
  });
});
describe("buttonSecondaryBorder", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  function readCode(rel: string) {
    return readFileSync(join(root, rel), "utf8")
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  }
  const button = readCode("src/widgets/Button.tsx");

  /** The body of one variant block in the shared button frame config. */
  function variantBlock(name: string) {
    const match = new RegExp(String.raw`${name}: \{([^}]*)\}`).exec(button);
    assert.ok(match, `the ${name} variant block must exist in the button frame config`);
    return match[1];
  }
  test("the secondary variant has a 1px border in its text color (#459)", () => {
    const secondary = variantBlock("secondary");
    assert.match(secondary, /borderWidth: 1/);
    assert.match(secondary, /borderColor: tokens\.colors\.gray\.gray10/);
    // Border and text match: the variant's own `color` is the same token.
    assert.match(secondary, /color: tokens\.colors\.gray\.gray10/);
  });
  test("the border color token matches the secondary label color the wrapper passes (#459)", () => {
    assert.match(button, /secondary: tokens\.colors\.gray\.gray10,/);
  });
  test("the other variants have no VISIBLE border at rest (#459)", () => {
    for (const name of ["primary", "danger"]) {
      const block = variantBlock(name);
      assert.ok(!/borderColor/.test(block), `${name} must not set a visible border color`);
      assert.ok(!/borderWidth/.test(block), `${name} inherits the shared frame geometry`);
    }
    // Ghost is chrome-less by design: it explicitly zeroes the border.
    assert.match(variantBlock("ghost"), /borderWidth: 0/);
  });
  test("all filled variants share one geometry: the base frame carries a 1px transparent border (#459)", () => {
    // If only secondary had a border, it would render 2px wider and
    // taller than a primary/danger button with the same label in a
    // ButtonRow (CodeRabbit finding on PR #490). The base frame
    // therefore carries the 1px border for every variant, transparent
    // except where a variant (secondary) colors it.
    const base = /borderColor: "transparent",\s*borderWidth: 1,/.exec(button);
    assert.ok(base, "the base frame must carry borderColor transparent + borderWidth 1");
  });
  test("a secondary button's border always follows its label color (#459)", () => {
    // Selected takes the primary fill and the on-primary label, and a
    // caller-passed `color` overrides the label on any secondary
    // button — a gray10 border would match the text in neither case.
    // Both departures are exactly `labelColor` (gray10 by default),
    // so BOTH render forms pass it as the secondary border color.
    const applications = button.match(
      /\{\.\.\.\(variant === "secondary" \? \{ borderColor: labelColor \} : null\)\}/g,
    );
    assert.equal(
      applications?.length,
      2,
      "the button form and the href form must both apply the label color as the secondary border",
    );
  });
});
describe("buttonWebAria", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  function readCode(rel: string) {
    return readFileSync(join(root, rel), "utf8")
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  }
  const accessibility = readCode("src/widgets/accessibility.ts");
  const button = readCode("src/widgets/Button.tsx");
  const text = readCode("src/widgets/Text.tsx");
  const blankWord = readCode("src/widgets/BlankWord.tsx");
  test("platformAccessibilityProps is the shared translator with a web and a native branch (#235)", () => {
    assert.match(accessibility, /export function platformAccessibilityProps/);
    assert.match(accessibility, /if \(!isWeb\)/, "native must short-circuit unchanged");
    assert.match(accessibility, /ariaLabel \?\? accessibilityLabel/);
    assert.match(accessibility, /translated\["aria-label"\] = label/);
    assert.match(accessibility, /translated\["aria-labelledby"\] = labelledByResolved/);
    assert.match(accessibility, /translated\.role = resolvedRole/);
    assert.match(accessibility, /webRoleByNativeRole/);
    assert.match(accessibility, /image: "img"/);
    assert.match(accessibility, /imagebutton: "button"/);
    for (const field of ["disabled", "selected", "checked", "busy", "expanded"]) {
      assert.ok(
        accessibility.includes(`accessibilityState?.${field}`),
        `accessibilityState.${field} must be read for translation`,
      );
      assert.ok(
        accessibility.includes(`translated["aria-${field}"]`),
        `accessibilityState.${field} must map to aria-${field}`,
      );
    }
    assert.match(accessibility, /accessibilityValue\?\.now/);
    assert.match(accessibility, /translated\["aria-valuenow"\]/);
    assert.match(accessibility, /accessibilityLiveRegion === "none" \? "off"/);
    assert.match(accessibility, /ariaHidden \?\? accessibilityElementsHidden/);
  });
  test("Button destructures the RN accessibility props out of rest and routes them through the translator (#235)", () => {
    assert.match(button, /from "\.\/accessibility\.js"/);
    assert.match(button, /platformAccessibilityProps\(\{/);
    for (const prop of [
      "accessibilityLabel",
      "accessibilityState",
      "accessibilityRole",
      "accessibilityHint",
      "accessibilityLabelledBy",
      "accessibilityValue",
    ]) {
      assert.ok(button.includes(prop), `Button must handle ${prop} explicitly, not in rest`);
    }
    assert.match(
      button,
      /accessibilityRole: accessibilityRole \?\? \(isLink \? "link" : "button"\)/,
      "the default role (button, or link in the #248 href form) must survive the translation",
    );
    assert.match(
      button,
      /accessibilityState: \{ disabled, \.\.\.accessibilityState \}/,
      "disabled must still mirror into the state, under any caller state",
    );
    assert.ok(
      !/accessibility(State|Label|Role)=/.test(button),
      "Button must not pass raw RN accessibility JSX props to the Tamagui button",
    );
  });
  test("Text routes caller accessibility props through the same translator (#235)", () => {
    assert.match(text, /from "\.\/accessibility\.js"/);
    assert.match(text, /platformAccessibilityProps\(\{/);
    assert.match(text, /\{\.\.\.a11yProps\}/);
    assert.ok(
      !/accessibility(State|Label|Role)=/.test(text),
      "Text must not pass raw RN accessibility JSX props to the Tamagui text",
    );
  });
  test("BlankWord still labels its hidden button through Button (the label text is unchanged) (#235)", () => {
    assert.match(
      blankWord,
      /accessibilityLabel=\{`Reveal blank word \$\{index \+ 1\} of \$\{total\}`\}/,
    );
    assert.match(blankWord, /from "\.\/Button\.js"/);
  });
  const STACK_PRESSABLES = [
    "src/views/RatingForm.tsx",
    "src/widgets/ColorPickerField.tsx",
    "src/views/SearchField.tsx",
    "src/widgets/StarRatingInput.tsx",
    "src/widgets/StepDots.tsx",
    "src/widgets/Avatar.tsx",
  ];
  test("NumberStepper: group container and value input route through the translator; its buttons are DS Buttons (#235)", () => {
    const code = readCode("src/views/NumberStepper.tsx");
    assert.ok(code.includes("platformAccessibilityProps"));
    // The only raw accessibilityLabel props left in the file are the
    // ones passed TO the DS Button primitive (Decrease / Increase),
    // which is the sanctioned caller API — Button translates them.
    const rawLabels = code.match(/accessibilityLabel=\{/g) ?? [];
    assert.equal(rawLabels.length, 2, "only the two DS Button labels may remain as raw JSX props");
    assert.match(code, /accessibilityLabel=\{decreaseAccessibilityLabel \?\? \(label \? `Decrease \$\{label\}` : "Decrease value"\)\}/);
    assert.match(code, /accessibilityLabel=\{increaseAccessibilityLabel \?\? \(label \? `Increase \$\{label\}` : "Increase value"\)\}/);
  });
  test("component-internal stack pressables route through the translator, never raw RN JSX props (#235)", () => {
    for (const rel of STACK_PRESSABLES) {
      const code = readCode(rel);
      assert.ok(
        code.includes("platformAccessibilityProps"),
        `${rel} must route its accessibility props through platformAccessibilityProps`,
      );
      assert.ok(
        !/accessibility(Label|State|Role)=/.test(code),
        `${rel} must not pass a raw accessibilityLabel/accessibilityState/accessibilityRole JSX prop to a Tamagui element`,
      );
    }
  });

  // Runtime imports are lazy (inside the SSR tests) so the source-scan
  // tests above still run and report when the build output is missing
  // or broken, instead of the whole file failing at import time.
  let runtimePromise;
  function loadRuntime() {
    runtimePromise ??= (async () => {
      const reactModule = await import("react");
      const React = reactModule.default;
      const { renderToString } = await import("react-dom/server");
      const { TamaguiProvider }: Record<string, any> = await import("tamagui");
      const dist: Record<string, any> = await loadInternalDist();
      return {
        React,
        renderToString,
        TamaguiProvider,
        ...dist,
      };
    })();
    return runtimePromise;
  }
  async function renderToHtml(element: any) {
    const { renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } = await loadRuntime();
    const config = createTamaguiConfig(baseTheme);
    return renderToString(
      <TamaguiProvider config={config} defaultTheme="light">
        {element}
      </TamaguiProvider>,
    );
  }
  const noop = () => null;
  test("SSR: a labeled Button renders aria-label and no leaked RN attributes (#235)", async () => {
    const { Button } = await loadRuntime();
    const html = await renderToHtml(
      <Button
        accessibilityLabel="Reveal blank word 1 of 2"
        accessibilityState={{
          selected: true,
        }}
        onPress={noop}
      >
        x
      </Button>,
    );
    assert.ok(
      html.includes('aria-label="Reveal blank word 1 of 2"'),
      `expected aria-label in: ${html.slice(html.indexOf("<button"), html.indexOf("<button") + 400)}`,
    );
    assert.ok(html.includes('aria-selected="true"'), "state.selected must render as aria-selected");
    assert.ok(!/accessibilitylabel/i.test(html), "accessibilitylabel must not leak to the DOM");
    assert.ok(!/accessibilitystate/i.test(html), "accessibilitystate must not leak to the DOM");
    assert.ok(!/accessibilityrole/i.test(html), "accessibilityrole must not leak to the DOM");
    assert.ok(!html.includes("[object Object]"), "no stringified state object in the DOM");
  });
  test("SSR: a disabled Button reports aria-disabled (#235)", async () => {
    const { Button } = await loadRuntime();
    const html = await renderToHtml(
      <Button disabled={true} accessibilityLabel="Save">
        Save
      </Button>,
    );
    assert.ok(html.includes('aria-label="Save"'));
    assert.ok(html.includes('aria-disabled="true"'));
    assert.ok(!/accessibilitystate/i.test(html));
  });
  test("SSR: a hidden BlankWord's button has the accessible name from the issue (#235)", async () => {
    const { BlankWord } = await loadRuntime();
    const html = await renderToHtml(
      <BlankWord word="faith" revealed={false} onReveal={noop} index={0} total={2} />,
    );
    assert.ok(
      html.includes('aria-label="Reveal blank word 1 of 2"'),
      "the blank must be findable by role+name (spudly/memorize#53)",
    );
    assert.ok(!/accessibilitylabel/i.test(html));
    assert.ok(!/accessibilitystate/i.test(html));
    assert.ok(!html.includes("[object Object]"));
  });
  test("SSR: a revealed BlankWord's text carries its label as aria-label via Text (#235)", async () => {
    const { BlankWord } = await loadRuntime();
    const html = await renderToHtml(
      <BlankWord word="faith" revealed={true} onReveal={noop} index={0} total={2} />,
    );
    assert.ok(html.includes('aria-label="Revealed: faith"'));
    assert.ok(!/accessibilitylabel/i.test(html));
  });
});
