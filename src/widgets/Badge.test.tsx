import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
describe("badgeBorder", () => {
  const srcPath = join(
    dirname(fileURLToPath(import.meta.url)),
    "../..",
    "src",
    "widgets",
    "Badge.tsx",
  );
  const text = readFileSync(srcPath, "utf8");
  test("the badge pill has a 1px border (#174)", () => {
    assert.ok(
      /borderWidth: 1,/.test(text),
      "StyledBadge must set borderWidth: 1 so the Badge renders a 1px border (#174)",
    );
  });
  test("the badge border uses the tone's text color (#174)", () => {
    assert.ok(
      /borderColor=\{isSelected \? "\$primary" : styles\.text\}/.test(text),
      "Badge must pass borderColor={styles.text} while unselected so the border is the same color as the badge text for every tone (#174); the selectable form's selected state takes the primary fill instead (the badgeSelectable block in this file)",
    );
  });
});
describe("badgeSelectable", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, "../..");
  const badgeSource = readFileSync(join(root, "src", "widgets", "Badge.tsx"), "utf8");
  test("Badge declares the selectable form, gated on a press handler", () => {
    assert.ok(badgeSource.includes("selected?: boolean"), "Badge must declare the selected prop");
    assert.ok(
      badgeSource.includes("const selectable = onPress !== undefined"),
      "the selectable form must be gated on a press handler being passed",
    );
    assert.ok(
      badgeSource.includes("selectable && selected === true"),
      "selected must only take effect on the selectable form",
    );
  });
  test("a selectable Badge announces a toggle: aria-pressed on web, selected state on native", () => {
    assert.ok(
      badgeSource.includes('"aria-pressed": selected ?? false'),
      "web must announce the toggle with aria-pressed",
    );
    assert.ok(
      badgeSource.includes("accessibilityState: { selected: selected ?? false, disabled }"),
      "native must announce the toggle with the selected accessibility state",
    );
    assert.ok(
      badgeSource.includes('platformAccessibilityProps({ accessibilityRole: "button" })'),
      "the selectable form must take the button role through the platform helper",
    );
  });
  test("a selectable Badge is keyboard-operable on web: focusable, Enter/Space, no held-key repeats", () => {
    assert.ok(
      badgeSource.includes("tabIndex: disabled ? -1 : 0"),
      "an enabled selectable badge must be focusable on web; a disabled one leaves the tab order",
    );
    assert.ok(
      badgeSource.includes("onKeyDown: handleKeyDown"),
      "a selectable badge must wire the activation-keys handler",
    );
    assert.ok(
      badgeSource.includes('event.key === "Enter" || event.key === " "'),
      "Enter and Space must invoke the press callback",
    );
    assert.ok(
      badgeSource.includes("if (!event.repeat)"),
      "a held key must not re-activate (it would flip the selection back and forth)",
    );
  });
  test("the selected treatment is the primary fill with the on-primary label ink", () => {
    assert.ok(
      badgeSource.includes('isSelected ? "$primary"'),
      "a selected badge must take the primary fill",
    );
    assert.ok(
      badgeSource.includes('isSelected ? "$onPrimary"'),
      "a selected badge's label must take the on-primary ink",
    );
  });

  // Runtime imports are lazy (inside the SSR tests) so the
  // source-scan tests above still run and report when the build
  // output is missing or broken.
  let runtimePromise;
  function loadRuntime() {
    runtimePromise ??= (async () => {
      const reactModule = await import("react");
      const React = reactModule.default;
      const { renderToString } = await import("react-dom/server");
      const { TamaguiProvider }: Record<string, any> = await import("tamagui");
      const distRuntime = await loadInternalDist();
      return {
        React,
        renderToString,
        TamaguiProvider,
        ...distRuntime,
      };
    })();
    return runtimePromise;
  }
  async function renderToHtml(element: any) {
    const { renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } = await loadRuntime();
    const config = createTamaguiConfig(baseTheme);
    const html = renderToString(
      <TamaguiProvider config={config} defaultTheme="light">
        {element}
      </TamaguiProvider>,
    );
    const styleEnd = html.lastIndexOf("</style>");
    return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
  }
  test("SSR: a selectable Badge renders the button role with aria-pressed tracking selected", async () => {
    const { Badge } = await loadRuntime();
    const selectedHtml = await renderToHtml(
      <Badge selected={true} onPress={() => null}>
        Weeknight
      </Badge>,
    );
    assert.match(selectedHtml, /role="button"/, "a selectable badge takes the button role");
    assert.match(selectedHtml, /aria-pressed="true"/, "a selected badge announces pressed");
    assert.match(selectedHtml, /tabindex="0"/, "a selectable badge is keyboard-focusable");
    const unselectedHtml = await renderToHtml(
      <Badge selected={false} onPress={() => null}>
        Weeknight
      </Badge>,
    );
    assert.match(
      unselectedHtml,
      /aria-pressed="false"/,
      "an unselected badge announces not pressed",
    );
  });
  test("a disabled selectable Badge never activates and announces its state", async () => {
    assert.ok(
      badgeSource.includes('if (!disabled && (event.key === "Enter"'),
      "the keyboard handler must not activate a disabled badge",
    );
    assert.ok(
      badgeSource.includes("onPress: disabled ? undefined : onPress"),
      "a disabled badge carries no press handler",
    );
    assert.ok(
      badgeSource.includes('"aria-disabled": disabled'),
      "web must announce a disabled selectable badge",
    );
    const { Badge } = await loadRuntime();
    const html = await renderToHtml(
      <Badge selected={true} disabled={true} onPress={() => null}>
        Weeknight
      </Badge>,
    );
    assert.match(html, /aria-pressed="true"/, "a disabled badge still announces its toggle state");
    assert.match(html, /aria-disabled="true"/, "a disabled badge announces disabled");
    assert.match(html, /tabindex="-1"/, "a disabled badge is out of the tab order");
  });
  test("SSR: a display-only Badge renders no button role and no pressed state", async () => {
    const { Badge } = await loadRuntime();
    const html = await renderToHtml(<Badge tone="info">Syncing</Badge>);
    assert.ok(!html.includes("aria-pressed"), "a display-only badge carries no pressed state");
    assert.ok(!html.includes('role="button"'), "a display-only badge carries no button role");
  });
});
describe("badgeTagForm", async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  const dist: Record<string, any> = await loadInternalDist();
  test("Badge is exported and TagPill is gone (#183)", () => {
    assert.equal(typeof dist.Badge, "function", "Badge must be exported");
    assert.equal(dist.TagPill, undefined, "TagPill must not be exported");
  });
  test("Badge's color form keeps TagPill's tint and type contract", () => {
    const source = readFileSync(join(root, "src", "widgets", "Badge.tsx"), "utf8");
    assert.ok(
      source.includes("color?: TagColorName"),
      "Badge color must be the strict TagColorName token union, not a raw string",
    );
    assert.ok(
      source.includes("useTagColorResolver"),
      "Badge must resolve tag colors through the shared token resolver",
    );
    assert.ok(
      source.includes("{resolvedColor}22`"),
      "surface must be the resolved color at 22 hex alpha",
    );
    assert.ok(
      source.includes("fontSize: tokens.typography.fontSize.xs"),
      "tag label must use the extra-small type step, same as the status form",
    );
    assert.ok(
      source.includes("fontWeight: tokens.typography.fontWeight.semibold"),
      "tag label must use the semibold weight, same as the status form",
    );
    assert.ok(source.includes("borderWidth: 1"), "Badge must carry the 1px border (#174)");
    assert.ok(
      source.includes('borderColor={isSelected ? "$primary" : resolvedColor}'),
      "the color form's border must be the resolved tag color itself while unselected (#211)",
    );
    assert.ok(
      source.includes('borderColor={isSelected ? "$primary" : styles.text}'),
      "the tone form's border must match its text color while unselected (#174)",
    );
  });
  test("no source file still imports TagPill (#183)", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, {
        withFileTypes: true,
      })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (
          /\.(ts|tsx)$/.test(entry.name) &&
          !entry.name.endsWith(".test.ts") &&
          !entry.name.endsWith(".test.tsx") &&
          readFileSync(path, "utf8").includes("TagPill.js")
        )
          offenders.push(path);
      }
    };
    walk(join(root, "src"));
    assert.deepEqual(offenders, [], `TagPill still imported in: ${offenders.join(", ")}`);
  });
});
