import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

describe("switchStories", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  const stories = readFileSync(join(root, "src", "widgets", "Switch.stories.tsx"), "utf8");

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
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  const source = readFileSync(join(root, "src", "widgets", "Switch.tsx"), "utf8");
  const thumb = source.slice(
    source.indexOf("const StyledThumb"),
    source.indexOf("export type SwitchProps"),
  );

  test("StyledThumb carries an on variant with the 20px travel offset (#484)", () => {
    assert.match(thumb, /on:\s*\{\s*true:\s*\{[^}]*x: 20/s, "on:true must offset the thumb 20px");
    assert.match(thumb, /false:\s*\{\s*x: 0,?\s*\}/s, "on:false must leave the thumb at offset 0");
  });

  test("Switch passes its checked state to the thumb and transitions the travel (#484)", () => {
    assert.match(
      source,
      /<StyledThumb on=\{checked\} transition="fast" \/>/,
      'the thumb\'s on variant must be keyed off checked and animated with transition="fast"',
    );
    assert.doesNotMatch(
      source,
      /animation=/,
      "the animation prop never visibly animates in this repo (#457)",
    );
  });
});
