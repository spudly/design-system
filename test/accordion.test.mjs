/**
 * Contract tests for the Accordion family (spudly/design-system#178,
 * adopting shuoink/ui's Accordion / AccordionSection / Collapsible as
 * spec, re-implemented in DS conventions).
 *
 * The contracts pinned here:
 * 1. All three components are exported from the package root (dist).
 * 2. Accordion is single-open and data-driven: sections arrive as
 *    AccordionItem data, the open section is tracked by value
 *    (openValue / defaultOpenValue / onOpenValueChange — the Tabs
 *    controlled-value shape), and each item renders an AccordionSection
 *    whose isOpen is exactly `openValue === item.value`.
 * 3. AccordionSection resolves controlled vs uncontrolled state as
 *    `isOpen ?? internal`, reports presses through onOpenChange, and
 *    renders its body through Collapsible.
 * 4. The section header is an accessible button: role + expanded
 *    state routed through platformAccessibilityProps (#235 — never a
 *    raw accessibility* prop on a Tamagui element), with web keyboard
 *    activation (Enter/Space) and a 44px minimum height.
 * 5. Collapsible animates its frame height with the shared "fast"
 *    animation between 0 and the onLayout-measured content height,
 *    clips overflow, and aria-hides closed content.
 * 6. DS hard rules across the family: type aliases only (no
 *    `interface`), no margins for spacing (#209 — gap/padding only),
 *    and no direct import of react-native / react-native-svg. The
 *    section's chevron is the icons module's CollapsibleIcon
 *    (Stephen's #250 split into CollapsedIcon / ExpandedIcon /
 *    CollapsibleIcon) — the one sanctioned icons import from a root
 *    component, which is why this file registers the test harness's
 *    react-native-svg stub before importing dist (see
 *    registerSvgStub.mjs).
 *
 * Source scan for the per-literal invariants (like this repo's other
 * component contract tests; comments are stripped first so prose
 * cannot satisfy the patterns), plus a dist import for the export
 * contract — `npm test` builds before running.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dist = await import("../dist/index.js");

function codeOf(rel) {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const accordion = codeOf("src/components/Accordion.tsx");
const section = codeOf("src/components/AccordionSection.tsx");
const collapsible = codeOf("src/components/Collapsible.tsx");
const family = { Accordion: accordion, AccordionSection: section, Collapsible: collapsible };

test("Accordion, AccordionSection, and Collapsible are exported from the package root", () => {
  for (const name of ["Accordion", "AccordionSection", "Collapsible"]) {
    assert.equal(typeof dist[name], "function", `${name} must be exported from dist/index.js`);
  }
});

test("Accordion tracks the open section by value with the controlled/uncontrolled pair", () => {
  assert.match(accordion, /openValue\?: string \| null/);
  assert.match(accordion, /defaultOpenValue\?: string \| null/);
  assert.match(accordion, /onOpenValueChange\?: \(value: string \| null\) => void/);
  assert.match(
    accordion,
    /const resolvedOpenValue = openValue === undefined \? internalOpenValue : openValue/,
  );
});

test("Accordion is single-open: each section's isOpen is openValue === its value", () => {
  assert.match(accordion, /<AccordionSection/);
  assert.match(accordion, /isOpen=\{resolvedOpenValue === section\.value\}/);
  assert.match(accordion, /const next = isOpen \? value : null/);
});

test("AccordionSection resolves controlled vs uncontrolled open state", () => {
  assert.match(section, /const open = isOpen \?\? internalOpen/);
  assert.match(section, /onOpenChange\?\.\(next\)/);
  assert.match(section, /<Collapsible isOpen=\{open\}>/);
});

test("the section header is a button carrying its expanded state through the a11y translator", () => {
  assert.match(section, /platformAccessibilityProps\(\{/);
  assert.match(section, /accessibilityRole: "button"/);
  assert.match(section, /accessibilityState: \{ expanded: open \}/);
  assert.doesNotMatch(section, /\saccessibility(State|Label|Role)=/);
});

test("the section header is keyboard-operable on web and at least 44px tall", () => {
  assert.match(section, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(section, /tabIndex=\{0\}/);
  assert.match(section, /minHeight=\{44\}/);
});

test("the section's indicator is the icons module's CollapsibleIcon (#250)", () => {
  assert.match(section, /import \{ CollapsibleIcon \} from "\.\.\/icons\/CollapsibleIcon\.js"/);
  assert.match(section, /<CollapsibleIcon isOpen=\{open\} size=\{20\}/);
  // The drawn-bars chevron it replaced is gone.
  assert.doesNotMatch(section, /SectionChevron/);
});

test("Collapsible animates height between 0 and the measured content height", () => {
  assert.match(collapsible, /animation="fast"/);
  assert.match(collapsible, /overflow="hidden"/);
  assert.match(collapsible, /height=\{isOpen \? \(contentHeight \?\? undefined\) : 0\}/);
  assert.match(collapsible, /onLayout=/);
  assert.match(collapsible, /aria-hidden=\{!isOpen\}/);
  assert.match(collapsible, /\(\{ inert: true \} as const\)/);
  assert.match(collapsible, /\{\.\.\.inertPropsWhenClosed\(isOpen\)\}/);
});

test("the family follows the DS hard rules: aliases only, no margins, no direct native imports", () => {
  for (const [name, code] of Object.entries(family)) {
    assert.doesNotMatch(code, /\binterface\s/, `${name} must use type aliases, not interfaces`);
    assert.doesNotMatch(
      code,
      /\bmargin(Top|Bottom|Left|Right|Vertical|Horizontal)?=/,
      `${name} must space with gap/padding, not margins (#209)`,
    );
    assert.doesNotMatch(
      code,
      /from "(react-native|react-native-svg)/,
      `${name} must not import react-native/react-native-svg directly (icons go through the icons module)`,
    );
  }
  // Accordion and Collapsible need no icons at all; AccordionSection's
  // single icons import is pinned by the CollapsibleIcon test above.
  assert.doesNotMatch(accordion, /from "\.\.\/icons/, "Accordion must not import the icons module");
  assert.doesNotMatch(
    collapsible,
    /from "\.\.\/icons/,
    "Collapsible must not import the icons module",
  );
  assert.match(section, /export type AccordionSectionProps = \{/);
  assert.match(accordion, /export type AccordionItem = \{/);
  assert.match(collapsible, /export type CollapsibleProps = \{/);
});
