/**
 * Regression test for spudly/eciperay#156 (Android crash on the Profile
 * screen):
 * `JSApplicationIllegalArgumentException: Invalid accessibility role
 * value: "status"` from a view managed by `RCTView`.
 *
 * `status` is a web ARIA live-region role. React Native's
 * `accessibilityRole` accepts only its own role set, and Android's view
 * manager throws when any other value reaches a native view. Four
 * components passed ARIA roles as `accessibilityRole` (Alert,
 * Toast, SecretRevealPanel — all `"status"`), and the
 * same defect class existed in Avatar (`"img"`) and in NumberStepper /
 * ColorPickerField (`"group"`).
 *
 * The contract now: every `accessibilityRole` literal in `src/` is a
 * member of React Native's supported set (the `AccessibilityRole` union
 * in react-native's ViewAccessibility types). ARIA-only semantics go
 * through the platform split in `src/components/accessibility.ts`:
 * the web `role` prop on web, `accessibilityLiveRegion` on native.
 *
 * This is a source scan, not a render test: the crash happens in the
 * Android view manager, which no JS renderer in this repo exercises, and
 * the invariant is a per-literal property of the source. The scan fails
 * loudly (rather than passing vacuously) if an `accessibilityRole` ever
 * appears in a form it cannot extract literals from.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

/** React Native's supported `accessibilityRole` values (AccessibilityRole). */
const REACT_NATIVE_ACCESSIBILITY_ROLES = new Set([
  "none",
  "button",
  "togglebutton",
  "link",
  "search",
  "image",
  "keyboardkey",
  "text",
  "adjustable",
  "imagebutton",
  "header",
  "summary",
  "alert",
  "checkbox",
  "combobox",
  "menu",
  "menubar",
  "menuitem",
  "progressbar",
  "radio",
  "radiogroup",
  "scrollbar",
  "spinbutton",
  "switch",
  "tab",
  "tabbar",
  "tablist",
  "timer",
  "list",
  "toolbar",
]);

/**
 * Remove block comments and full-line `//` comments. Doc comments
 * legitimately discuss the invalid values in prose ("`status` is not a
 * valid accessibilityRole…"); the crash vector is code, not prose, so
 * the scan runs on code only.
 */
function stripComments(source) {
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/^[ \t]*\/\/.*$/gm, "");
}

function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

/**
 * Every `accessibilityRole` occurrence in one file, with the string
 * literals it hands over, from `accessibilityRole="x"`,
 * `accessibilityRole={"x"}` / `accessibilityRole={'x'}`,
 * `accessibilityRole={cond ? "x" : "y"}`, and the object form
 * `accessibilityRole: "x"`. An occurrence with NO extractable literals
 * (e.g. `accessibilityRole={role}`, a computed variable — the original
 * Alert crash pattern) is returned with an empty literal list so
 * the caller can reject it: silently skipping it would let exactly the
 * regression this test guards against pass unnoticed. Also returns how
 * many times `accessibilityRole` appears at all, so callers can assert
 * no occurrence went unmatched.
 */
function accessibilityRoleLiterals(source) {
  const occurrences = [];
  const pattern = /accessibilityRole\s*[=:]\s*(\{[^}]*\}|"[^"]*"|'[^']*')/g;
  for (const match of source.matchAll(pattern)) {
    const literals = [...match[1].matchAll(/["']([^"']+)["']/g)].map((literal) => literal[1]);
    occurrences.push({ expression: match[0], literals });
  }
  const total = (source.match(/accessibilityRole/g) ?? []).length;
  return { occurrences, total };
}

test("no component passes an accessibilityRole outside React Native's supported set", () => {
  const files = sourceFiles(srcDir);
  assert.ok(files.length > 0, "scan must find source files");

  let checked = 0;
  for (const file of files) {
    const source = stripComments(readFileSync(file, "utf8"));
    const { occurrences, total } = accessibilityRoleLiterals(source);
    assert.equal(
      occurrences.length,
      total,
      `${file}: every accessibilityRole occurrence must be in a form this scan understands`,
    );
    for (const { expression, literals } of occurrences) {
      assert.ok(
        literals.length > 0,
        `${file}: ${expression} hands accessibilityRole a value this scan cannot read (computed variable or unsupported form); spell the role as a string literal so it can be pinned against React Native's supported set`,
      );
      for (const value of literals) {
        checked += 1;
        assert.ok(
          REACT_NATIVE_ACCESSIBILITY_ROLES.has(value),
          `${file}: accessibilityRole="${value}" is not a React Native role and will crash Android (spudly/eciperay#156); use the platform split in src/components/accessibility.ts for ARIA-only roles`,
        );
      }
    }
  }
  assert.ok(checked > 0, "scan must find at least one accessibilityRole literal");
});
