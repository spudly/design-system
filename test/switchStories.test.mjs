/**
 * Contract test for spudly/design-system#220: the Switch
 * WithoutDescription story must actually render without a
 * description. The shared SwitchDemo helper hard-coded a
 * description, so the story could not omit it.
 *
 * Source scan (same rationale as test/badgeBorder.test.mjs).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stories = readFileSync(join(root, "src", "components", "Switch.stories.tsx"), "utf8");

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
  assert.ok(spread >= 0, "SwitchDemo must spread the story props into Switch");
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
