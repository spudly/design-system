import type { AccessibilityRole, AccessibilityState, AccessibilityValue, Role } from "react-native";
import { isWeb } from "tamagui";

/**
 * Platform-split accessibility props for live regions and grouping.
 *
 * `status` and `group` are web ARIA roles. They are NOT members of React
 * Native's `accessibilityRole` set, and passing them as `accessibilityRole`
 * makes Android's view manager throw on mount:
 * `JSApplicationIllegalArgumentException: Invalid accessibility role value:
 * "status"` (spudly/eciperay#156 — Alert, Toast,
 * and SecretRevealPanel all crashed this way; Avatar's `img` and the
 * `group` roles in NumberStepper/ColorPickerField were the same defect).
 *
 * So ARIA-only roles go through the separate web `role` prop, web only,
 * and native gets the equivalent native mechanism instead:
 *
 * - A polite live region is `role="status"` on web and
 *   `accessibilityLiveRegion="polite"` (Android) on native. iOS has no
 *   live-region prop; VoiceOver picks up the content change from the
 *   accessibility tree.
 * - A grouping container is `role="group"` on web; native has no group
 *   role, so the container's accessible name (accessibilityLabel /
 *   aria-labelledby) carries the grouping on its own there.
 */
export const politeLiveRegionProps = isWeb
  ? ({ role: "status" } as const)
  : ({ accessibilityLiveRegion: "polite" } as const);

export const groupRoleProps = isWeb ? ({ role: "group" } as const) : ({} as const);

/**
 * React Native accessibility props a DS component accepts, plus the
 * ARIA props a caller may already have supplied for the same
 * semantics (the ARIA form wins on web).
 */
export type TranslatableAccessibilityProps = {
  accessible?: boolean | undefined;
  accessibilityElementsHidden?: boolean | undefined;
  accessibilityHint?: string | undefined;
  accessibilityLabel?: string | undefined;
  accessibilityLabelledBy?: string | string[] | undefined;
  accessibilityLiveRegion?: "none" | "polite" | "assertive" | undefined;
  accessibilityRole?: AccessibilityRole | undefined;
  accessibilityState?: AccessibilityState | undefined;
  accessibilityValue?: AccessibilityValue | undefined;
  role?: Role | undefined;
  "aria-busy"?: boolean | undefined;
  "aria-checked"?: boolean | "mixed" | undefined;
  "aria-disabled"?: boolean | undefined;
  "aria-expanded"?: boolean | undefined;
  "aria-hidden"?: boolean | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-level"?: number | undefined;
  "aria-live"?: "off" | "polite" | "assertive" | undefined;
  "aria-selected"?: boolean | undefined;
  "aria-valuemax"?: number | undefined;
  "aria-valuemin"?: number | undefined;
  "aria-valuenow"?: number | undefined;
  "aria-valuetext"?: string | undefined;
};

/**
 * The platform-correct prop set produced by
 * `platformAccessibilityProps`. Identical to the input shape except
 * `role`: Tamagui's `role` prop is typed `role?: Role` WITHOUT
 * `| undefined`, and this repo compiles with
 * `exactOptionalPropertyTypes`, so a spreadable result must not
 * declare `role?: Role | undefined`. The helper only ever SETS the
 * key when it has a value, so the tighter declaration is honest.
 */
export type PlatformAccessibilityProps = Omit<TranslatableAccessibilityProps, "role"> & {
  role?: Role;
};

/**
 * React Native roles whose ARIA equivalent differs. Every other RN
 * role name (`button`, `checkbox`, `radio`, `switch`, `tab`, …) is
 * spelled the same in ARIA and passes through unchanged.
 */
const webRoleByNativeRole: Record<string, Role> = {
  adjustable: "slider",
  header: "heading",
  image: "img",
  imagebutton: "button",
};

/**
 * Translate React Native accessibility props to the current
 * platform's prop set (#235).
 *
 * Tamagui's web renderer does NOT do this mapping: it passes unknown
 * props straight to the DOM, so a component that forwards
 * `accessibilityLabel` / `accessibilityState` / `accessibilityRole`
 * to a Tamagui element renders `accessibilitylabel="…"`,
 * `accessibilitystate="[object Object]"`, and
 * `accessibilityrole="…"` as raw HTML attributes on web — no
 * `aria-label`, so the element has NO accessible name (a hidden
 * BlankWord's button was an unnamed button to screen readers and to
 * role+name queries). Native is unaffected: the RN props are the
 * correct props there.
 *
 * On web this returns the ARIA equivalents and drops the RN-only
 * props: `accessibilityLabel` → `aria-label`,
 * `accessibilityLabelledBy` → `aria-labelledby`,
 * `accessibilityRole` → `role`, each `accessibilityState` field →
 * its `aria-*` counterpart (`disabled` → `aria-disabled`,
 * `selected` → `aria-selected`, `checked` → `aria-checked`,
 * `busy` → `aria-busy`, `expanded` → `aria-expanded`),
 * `accessibilityValue` → `aria-valuemin` / `aria-valuemax` /
 * `aria-valuenow` / `aria-valuetext`, `accessibilityLiveRegion` →
 * `aria-live` (`"none"` → `"off"`), and
 * `accessibilityElementsHidden` → `aria-hidden`.
 * `accessibilityHint` and `accessible` have no ARIA equivalent
 * expressible as a bare attribute (a hint would need a described-by
 * target element), so they are dropped on web only. A caller-supplied
 * ARIA prop or `role` always wins over the translated RN prop.
 *
 * On native the input is returned unchanged: the RN props are
 * correct there, and caller ARIA props pass through exactly as they
 * did before this helper existed (Tamagui's native renderer
 * translates the ones it knows).
 */
export function platformAccessibilityProps(
  input: TranslatableAccessibilityProps,
): PlatformAccessibilityProps {
  if (!isWeb) {
    // Pass the defined props through untouched (filtering undefined
    // values only so the result satisfies the tighter `role` typing
    // above under exactOptionalPropertyTypes). `aria-level` is the
    // one exception: it is ARIA-only (React Native has no heading
    // level prop — the `header` role alone carries heading semantics
    // there), so it is dropped rather than forwarded to a native view.
    return Object.fromEntries(
      Object.entries(input).filter(([key, value]) => value !== undefined && key !== "aria-level"),
    ) as PlatformAccessibilityProps;
  }

  const {
    accessible: _accessible,
    accessibilityElementsHidden,
    accessibilityHint: _accessibilityHint,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityLiveRegion,
    accessibilityRole,
    accessibilityState,
    accessibilityValue,
    role,
    "aria-busy": ariaBusy,
    "aria-checked": ariaChecked,
    "aria-disabled": ariaDisabled,
    "aria-expanded": ariaExpanded,
    "aria-hidden": ariaHidden,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-level": ariaLevel,
    "aria-live": ariaLive,
    "aria-selected": ariaSelected,
    "aria-valuemax": ariaValueMax,
    "aria-valuemin": ariaValueMin,
    "aria-valuenow": ariaValueNow,
    "aria-valuetext": ariaValueText,
  } = input;

  const labelledBy = Array.isArray(accessibilityLabelledBy)
    ? accessibilityLabelledBy.join(" ")
    : accessibilityLabelledBy;

  const translated: PlatformAccessibilityProps = {};

  const label = ariaLabel ?? accessibilityLabel;
  if (label !== undefined) {
    translated["aria-label"] = label;
  }
  const labelledByResolved = ariaLabelledBy ?? labelledBy;
  if (labelledByResolved !== undefined) {
    translated["aria-labelledby"] = labelledByResolved;
  }
  // RN roles with no entry above are spelled the same in ARIA; the
  // cast covers the handful of platform-only RN roles (e.g.
  // "viewgroup"), which pass through as a best effort.
  const resolvedRole =
    role ??
    (accessibilityRole
      ? (webRoleByNativeRole[accessibilityRole] ?? (accessibilityRole as Role))
      : undefined);
  if (resolvedRole !== undefined) {
    translated.role = resolvedRole;
  }
  const disabled = ariaDisabled ?? accessibilityState?.disabled;
  if (disabled !== undefined) {
    translated["aria-disabled"] = disabled;
  }
  const selected = ariaSelected ?? accessibilityState?.selected;
  if (selected !== undefined) {
    translated["aria-selected"] = selected;
  }
  const checked = ariaChecked ?? accessibilityState?.checked;
  if (checked !== undefined) {
    translated["aria-checked"] = checked;
  }
  const busy = ariaBusy ?? accessibilityState?.busy;
  if (busy !== undefined) {
    translated["aria-busy"] = busy;
  }
  const expanded = ariaExpanded ?? accessibilityState?.expanded;
  if (expanded !== undefined) {
    translated["aria-expanded"] = expanded;
  }
  if (ariaLevel !== undefined) {
    translated["aria-level"] = ariaLevel;
  }
  const live = ariaLive ?? (accessibilityLiveRegion === "none" ? "off" : accessibilityLiveRegion);
  if (live !== undefined) {
    translated["aria-live"] = live;
  }
  const hidden = ariaHidden ?? accessibilityElementsHidden;
  if (hidden !== undefined) {
    translated["aria-hidden"] = hidden;
  }
  const valueMin = ariaValueMin ?? accessibilityValue?.min;
  if (valueMin !== undefined) {
    translated["aria-valuemin"] = valueMin;
  }
  const valueMax = ariaValueMax ?? accessibilityValue?.max;
  if (valueMax !== undefined) {
    translated["aria-valuemax"] = valueMax;
  }
  const valueNow = ariaValueNow ?? accessibilityValue?.now;
  if (valueNow !== undefined) {
    translated["aria-valuenow"] = valueNow;
  }
  const valueText = ariaValueText ?? accessibilityValue?.text;
  if (valueText !== undefined) {
    translated["aria-valuetext"] = valueText;
  }

  return translated;
}
