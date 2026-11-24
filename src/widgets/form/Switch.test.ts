import "../../../test/registerSvgStub.js";
import { loadInternalDist } from "../../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

describe("switchStories", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
  const stories = readFileSync(join(root, "src", "widgets", "form", "Switch.stories.tsx"), "utf8");

  test("SwitchDemo does not hard-code a description (#220)", () => {
    const demo = stories.slice(
      stories.indexOf("function SwitchDemo"),
      stories.indexOf("export const Off"),
    );
    assert.doesNotMatch(
      demo,
      /description=/,
      "SwitchDemo must pass description through as a prop, not hard-code one (#220)",
    );
  });

  test("Off and On stories pass their description explicitly (#220)", () => {
    assert.match(stories, /checked=\{false\} description="Get a reminder when verses are due\."/);
    assert.match(stories, /checked=\{true\} description="Get a reminder when verses are due\."/);
  });

  test("SwitchDemo stateful props win over the props spread (#231)", () => {
    const demo = stories.slice(
      stories.indexOf("function SwitchDemo"),
      stories.indexOf("export const Off"),
    );
    const spread = demo.indexOf("{...props}");
    assert.notEqual(spread, -1, "SwitchDemo must spread the story props into Switch");
    assert.ok(
      demo.indexOf("checked={checked}", spread) > spread,
      "checked={checked} must come after {...props} so the story's static checked prop cannot pin the rendered state (#231)",
    );
    assert.ok(
      demo.indexOf("onCheckedChange={setChecked}", spread) > spread,
      "onCheckedChange={setChecked} must come after {...props} so clicks update the rendered state (#231)",
    );
    assert.match(
      demo,
      /useState\(props\.checked \?\? false\)/,
      "SwitchDemo must seed its state from the story's checked prop (#231)",
    );
    assert.match(
      demo,
      /label=\{props\.label \?\? "Email notifications"\}/,
      "SwitchDemo must default the label while letting a story's label win (#231)",
    );
  });

  test("WithoutDescription story passes no description (#220)", () => {
    const story = stories.slice(stories.indexOf("export const WithoutDescription"));
    assert.match(story, /label="Dark mode"/);
    assert.doesNotMatch(
      story,
      /description=/,
      "WithoutDescription must not pass a description (#220)",
    );
  });
});

describe("switchThumb", () => {
  // Behavioral (#750, superseding the #484 source pins): SSR-render the
  // built Switch in both states and read the thumb's resolved horizontal
  // offset out of the rendered output. Tamagui compiles `x` to a `--t-x`
  // CSS variable delivered by a generated class on the thumb element;
  // when two rules target that class the later one wins (the cascade),
  // so the resolved offset is the LAST `--t-x` rule for the thumb's
  // class in the rendered stylesheet.
  function thumbClass(html: string, prefix: string): string {
    const thumb = /name="SwitchThumb"[^>]*class="([^"]*)"/.exec(html);
    assert.ok(thumb, "rendered output must contain the SwitchThumb element");
    const found = thumb[1].split(" ").find((name) => name.startsWith(prefix));
    assert.ok(found, `the thumb element must carry a ${prefix} class`);
    return found;
  }

  function resolvedThumbOffset(html: string): number {
    const txClass = thumbClass(html, "_tx-");
    const rules = [
      ...html.matchAll(new RegExp(`\\.${txClass.replace("-", "\\-")}\\{--t-x:(-?\\d+)px\\}`, "g")),
    ];
    assert.ok(rules.length > 0, `rendered CSS must define --t-x for ${txClass}`);
    return Number(rules[rules.length - 1][1]);
  }

  function resolvedThumbAlignSelf(html: string): string {
    const asClass = thumbClass(html, "_as-");
    const rules = [
      ...html.matchAll(
        new RegExp(`\\.${asClass.replace("-", "\\-")}\\{align-self:([a-z-]+)\\}`, "g"),
      ),
    ];
    assert.ok(rules.length > 0, `rendered CSS must define align-self for ${asClass}`);
    return rules[rules.length - 1][1];
  }

  async function renderSwitch(checked: boolean): Promise<string> {
    const React = (await import("react")).default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    const config = dist.createTamaguiConfig(dist.baseTheme);
    return renderToString(
      React.createElement(
        TamaguiProvider,
        { config },
        React.createElement(dist.Switch, {
          label: "Email notifications",
          checked,
          onCheckedChange: () => {},
        }),
      ),
    );
  }

  test("the rendered thumb sits at offset 0 when off and travels 20px when on (#750)", async () => {
    const off = resolvedThumbOffset(await renderSwitch(false));
    const on = resolvedThumbOffset(await renderSwitch(true));
    assert.equal(off, 0, "off: the thumb's resolved --t-x must be 0px");
    assert.equal(on, 20, "on: the thumb's resolved --t-x must be the full 20px travel");
    assert.equal(on - off, 20, "toggling must move the thumb by the 20px travel");
  });

  test("the rendered thumb's alignment origin is flex-start in both states (#750)", async () => {
    // Tamagui's Thumb HOC sets alignSelf from the INITIAL checked state
    // (flex-end when mounted checked, paired with its own compensating
    // x). The Switch pins flex-start so the direct x offset has the
    // same origin however the switch was mounted — an initially checked
    // render (this test's `on` render) must report the same origin as
    // an initially unchecked one.
    assert.equal(
      resolvedThumbAlignSelf(await renderSwitch(false)),
      "flex-start",
      "off: the thumb's resolved align-self must be flex-start",
    );
    assert.equal(
      resolvedThumbAlignSelf(await renderSwitch(true)),
      "flex-start",
      "on (mounted checked): the thumb's resolved align-self must be flex-start",
    );
  });
});

describe("switchDisabled (#801)", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
  const source = readFileSync(join(root, "src", "widgets", "form", "Switch.tsx"), "utf8");
  const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  const stories = readFileSync(join(root, "src", "widgets", "form", "Switch.stories.tsx"), "utf8");
  test("Switch declares disabled defaulting false and dims the row (#801)", () => {
    assert.match(code, /disabled\?: boolean/);
    assert.match(code, /disabled = false/);
    assert.match(code, /opacity=\{disabled \? 0\.5 : 1\}/);
  });
  test("disabled passes to the switch primitive and blocks toggling (#801)", () => {
    assert.match(code, /disabled=\{disabled\}/);
    assert.match(code, /aria-disabled=\{disabled \|\| undefined\}/);
    assert.match(code, /if \(disabled\) \{\s*return;/);
  });
  test("Switch has a Disabled story (#801)", () => {
    assert.match(stories, /export const Disabled/);
    assert.match(stories, /disabled/);
  });
});
