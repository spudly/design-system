import { isWeb } from "tamagui";

import { Row } from "../layout/Row.js";
import type { RowProps } from "../layout/Row.js";
import { tokens } from "../../tokens/index.js";
import type { TagColorName } from "../../themes/tagColors.js";
import { platformAccessibilityProps } from "../accessibility.js";
import { useTagColorShadeResolver } from "../tagColors.js";

import { Text } from "./Text.js";

// Every tone takes the DARK step of its ramp as the background
// and the LIGHT step as the label and border ink (Stephen's
// direction on PR #730, 2026-11-21, restated 2026-11-23: for
// each tone the darker color is the background and the lighter
// color is the foreground/border). The pattern is one step pair
// per tone — step-8 background, step-2/3 foreground — resolved
// through the shared tokens, so all badge tones stay consistent
// and every theme keeps its own rendering. The success ramp is
// the visual direction's sage, rebalanced at the token level.
const toneStyles = {
  neutral: {
    background: tokens.colors.gray.gray8,
    text: tokens.colors.gray.gray3,
  },
  info: {
    background: "$primaryEmphasis",
    text: "$primarySubtle",
  },
  success: {
    background: tokens.colors.success.success8,
    text: tokens.colors.success.success2,
  },
  warning: {
    background: tokens.colors.warning.warning8,
    text: tokens.colors.warning.warning2,
  },
  danger: {
    background: tokens.colors.danger.danger8,
    text: tokens.colors.danger.danger2,
  },
  // Mastery (#850): the fill is the active theme's semantic
  // accent — the role the brief reserves for progress/mastery
  // (muted gold #b45309 in Memorize's Quiet Dawn, sage in
  // Eciperay's Warm Harvest) — with a white label/border ink:
  // white on the Memorize gold keeps WCAG AA text contrast
  // (~5:1), as it does on the sage accent. Following the tone
  // pattern above, the border takes the label ink.
  mastery: {
    background: "$accent",
    text: "#ffffff",
  },
  // Accent (#852): the secondary-action / tag role the Eciperay
  // brief assigns to its sage accent — the same theme semantic
  // accent fill as `mastery`, named for the tag/secondary role so
  // list markers (e.g. the shared-with-me badge on recipe rows)
  // render in sage under Warm Harvest instead of the terracotta
  // primary ramp. Under Memorize it resolves to that theme's
  // accent, exactly as `mastery` does.
  accent: {
    background: "$accent",
    text: "#ffffff",
  },
} as const;

type Tone = keyof typeof toneStyles;

export type BadgeProps = Omit<RowProps, "onPress"> & {
  tone?: Tone;
  /**
   * The selectable form's press handler: a bare intent with no
   * event argument (the keyboard handler invokes the same
   * callback). Passing it makes the badge a toggle (see
   * `selected`); leaving it unpassed keeps the badge
   * display-only.
   */
  onPress?: () => void;
  /**
   * A tag color: a design-system tag color token name (e.g. "blue"),
   * resolved through the active theme at render. When set, the badge
   * renders as a colored tag instead of a status pill: inverted like
   * the tone badges (#799, Stephen's direction on PR #730 extended to
   * tags) — the surface is the tag color's DARK shade token and the
   * border and label are its LIGHT shade token. The two forms
   * share the same label typography and padding — only the colors
   * differ. This is the rendering TagPill had before it was merged
   * into Badge (#183); `tone` is ignored while `color` is set. The
   * type is the strict `TagColorName` union (#207) — a raw hex is a
   * compile error; stored tag data converts to a name through
   * `tagColorNameForHex` before it reaches this prop.
   */
  color?: TagColorName;
  /**
   * The selectable form's state: while true — and a press handler
   * is passed — the badge renders selected (the primary fill with
   * the on-primary label ink, the treatment a selected toggle
   * Button takes) and announces itself as pressed. A badge with
   * no press handler is display-only and ignores this prop.
   */
  selected?: boolean;
  /**
   * The removable form's remove handler: a bare intent with no
   * event argument. Passing it renders a small × control inside
   * the badge, after the label — the chip form. The × is its own
   * button (see `removeAccessibilityLabel`); the chip label
   * itself stays plain text, so the whole chip is NOT pressable
   * in this form — removal is the only action. Leaving it
   * unpassed renders no remove control.
   */
  onRemove?: () => void;
  /**
   * The accessible name of the removable form's × button.
   * Defaults to `Remove <label>` when the label is a plain
   * string, and to "Remove" otherwise — callers whose voice
   * object composes the name (e.g. AutocompletePicker's
   * `removeItemLabel(label)`) pass it explicitly.
   */
  removeAccessibilityLabel?: string;
};

/**
 * Small status pill. Status is always conveyed with text, never color alone.
 * Tones: `neutral` (default), `info`, `success`, `warning`, `danger`,
 * `mastery` (the theme's accent fill — the progress/mastery role,
 * #850), `accent` (the same accent fill — the secondary/tag role,
 * #852).
 * With a `color` prop (a tag color token name) it renders as a colored
 * tag (the former TagPill).
 *
 * Selectable form: pass a press handler (with `selected`) and the
 * badge is a toggle — a tag renders as a Badge, including when it
 * selects (the tag pickers use this form). It takes the button
 * role and announces its state — `aria-pressed` on web, the
 * selected accessibility state on native — and while selected it
 * renders the primary fill with the on-primary label ink, the
 * treatment a selected toggle Button takes. On web it is
 * keyboard-operable like the DS's other pressable blocks:
 * focusable, with Enter and Space invoking the press callback.
 * A `disabled` selectable badge is inert: out of the tab order,
 * announced disabled, dimmed, and it never activates. With no
 * press handler the badge is display-only.
 *
 * Removable form: pass `onRemove` and the badge is a chip — the
 * label stays plain text and a small × control inside the badge
 * is its own button, named `removeAccessibilityLabel` (default
 * `Remove <label>` for a string label). On web the × is
 * keyboard-operable like the selectable form (focusable, Enter
 * and Space, no held-key repeats). A `disabled` removable badge
 * dims and its × is inert: out of the tab order, announced
 * disabled, and it never activates.
 */
export function Badge({
  tone = "neutral",
  color,
  selected,
  onPress,
  onRemove,
  removeAccessibilityLabel,
  disabled = false,
  children,
  ...rest
}: BadgeProps) {
  const resolveTagColorShade = useTagColorShadeResolver();
  const selectable = onPress !== undefined;
  const removable = onRemove !== undefined;
  const isSelected = selectable && selected === true;
  const labelType = {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold,
  } as const;
  // Web keyboard support for the selectable form (the pressable
  // rows' pattern): an element carrying the button role is not
  // keyboard-operable on its own, so it is made focusable and the
  // button activation keys — Enter and Space — invoke the same
  // callback as a press. `tabIndex` and `onKeyDown` are web-only
  // props in Tamagui and are ignored on native, where onPress is
  // the activation path. A disabled badge leaves the tab order,
  // announces itself disabled, dims, and never activates
  // (the same treatment Button gives `disabled`).
  const makeKeyDownHandler =
    (activate: (() => void) | undefined) =>
    (event: { key: string; repeat?: boolean; preventDefault: () => void }) => {
      if (!disabled && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        // A held key repeats keydown events; a native button does
        // not re-activate on repeats, and a repeat here would flip
        // the selection back and forth.
        if (!event.repeat) {
          activate?.();
        }
      }
    };
  const handleKeyDown = makeKeyDownHandler(onPress);
  const handleRemoveKeyDown = makeKeyDownHandler(onRemove);
  const removeLabel =
    removeAccessibilityLabel ?? (typeof children === "string" ? `Remove ${children}` : "Remove");
  const removeButtonProps = {
    onPress: disabled ? undefined : onRemove,
    tabIndex: disabled ? -1 : 0,
    onKeyDown: handleRemoveKeyDown,
  };
  const selectableProps = selectable
    ? {
        ...platformAccessibilityProps({ accessibilityRole: "button" }),
        onPress: disabled ? undefined : onPress,
        tabIndex: disabled ? -1 : 0,
        onKeyDown: handleKeyDown,
        cursor: "web:pointer" as const,
        opacity: disabled ? 0.5 : undefined,
        ...(isWeb
          ? { "aria-pressed": selected ?? false, "aria-disabled": disabled }
          : { accessibilityState: { selected: selected ?? false, disabled } }),
      }
    : null;
  // The colored-tag form (`color`) and the status-pill form
  // (`tone`) differ only in three color values (#707): compute
  // those once, then render a single Row, so a Badge
  // change can't land in one form and miss the other.
  const styles = toneStyles[tone];
  const tagDark = color ? resolveTagColorShade(color, "dark") : undefined;
  const tagLight = color ? resolveTagColorShade(color, "light") : undefined;
  const backgroundColor = isSelected ? "$primary" : (tagDark ?? styles.background);
  const borderColor = isSelected ? "$primary" : (tagLight ?? styles.text);
  const textColor = isSelected ? "$onPrimary" : (tagLight ?? styles.text);
  return (
    <Row
      middle
      alignSelf="flex-start"
      borderWidth={1}
      borderRadius={tokens.radii.full}
      px="s"
      py="xs"
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      {...(removable ? { gap: "xs" as const } : {})}
      opacity={removable && disabled ? 0.5 : undefined}
      {...rest}
      {...selectableProps}
    >
      <Text style={{ ...labelType, color: textColor }}>{children}</Text>
      {removable ? (
        <Row
          {...platformAccessibilityProps({
            accessibilityRole: "button",
            accessibilityLabel: removeLabel,
            accessibilityState: { disabled },
          })}
          {...removeButtonProps}
          cursor="web:pointer"
          middle
          center
          minWidth={20}
          minHeight={20}
          {...(isWeb ? { "aria-disabled": disabled } : {})}
        >
          <Text aria-hidden style={{ ...labelType, color: textColor }}>
            ×
          </Text>
        </Row>
      ) : null}
    </Row>
  );
}
