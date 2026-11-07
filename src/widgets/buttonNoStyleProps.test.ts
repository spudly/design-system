/**
 * Contract test for #480 (Stephen's 2026-11-05 Storybook review,
 * plan approved 2026-11-06): Button owns its styles completely.
 *
 * The pins: Button's public props reject backgroundColor/color
 * (type-level Omit on both activation forms); the wrapper derives
 * label ink from variant/tone only; the danger treatment is the
 * semantic tone prop; NutritionPanel passes no styling props into
 * Button (Estimate is primary, Refresh is plain secondary); the
 * migrated danger call sites (CardRow, LogEntryCard) use tone; and
 * Alert's dismiss ink flows only through the internal, non-barrel
 * ButtonInternal form.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

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
