import { XStack, isWeb, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { TagColorName } from "../themes/tagColors.js";
import { Text } from "./Text.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { useTagColorResolver } from "./tagColors.js";

const toneStyles = {
  neutral: {
    background: tokens.colors.gray.gray3,
    text: tokens.colors.gray.gray8,
  },
  info: {
    background: "$primarySubtle",
    text: "$primaryEmphasis",
  },
  success: {
    background: tokens.colors.success.success2,
    text: tokens.colors.success.success8,
  },
  warning: {
    background: tokens.colors.warning.warning2,
    text: tokens.colors.warning.warning8,
  },
  danger: {
    background: tokens.colors.danger.danger2,
    text: tokens.colors.danger.danger8,
  },
} as const;

type Tone = keyof typeof toneStyles;

const StyledBadge = styled(XStack, {
  name: "Badge",

  alignItems: "center",
  alignSelf: "flex-start",
  borderWidth: 1,
  borderRadius: tokens.radii.full,
  paddingHorizontal: tokens.spacing[2],
  paddingVertical: tokens.spacing[1],
});

type StyledBadgeProps = GetProps<typeof StyledBadge>;

export type BadgeProps = Omit<StyledBadgeProps, "onPress"> & {
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
   * renders as a colored tag instead of a status pill: the surface is
   * the resolved color at low alpha (`22` hex, 12.5% opacity), and the
   * border and label are the resolved color itself. The two forms
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
};

/**
 * Small status pill. Status is always conveyed with text, never color alone.
 * Tones: `neutral` (default), `info`, `success`, `warning`, `danger`.
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
 */
export function Badge({
  tone = "neutral",
  color,
  selected,
  onPress,
  disabled = false,
  children,
  ...rest
}: BadgeProps) {
  const resolveTagColor = useTagColorResolver();
  const selectable = onPress !== undefined;
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
  // (TextAction's treatment of `disabled`).
  const handleKeyDown = (event: { key: string; repeat?: boolean; preventDefault: () => void }) => {
    if (!disabled && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      // A held key repeats keydown events; a native button does
      // not re-activate on repeats, and a repeat here would flip
      // the selection back and forth.
      if (!event.repeat) {
        onPress?.();
      }
    }
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
  if (color) {
    const resolvedColor = resolveTagColor(color);
    return (
      <StyledBadge
        backgroundColor={isSelected ? "$primary" : `${resolvedColor}22`}
        borderColor={isSelected ? "$primary" : resolvedColor}
        {...rest}
        {...selectableProps}
      >
        <Text style={{ ...labelType, color: isSelected ? "$onPrimary" : resolvedColor }}>
          {children}
        </Text>
      </StyledBadge>
    );
  }
  const styles = toneStyles[tone];
  return (
    <StyledBadge
      backgroundColor={isSelected ? "$primary" : styles.background}
      borderColor={isSelected ? "$primary" : styles.text}
      {...rest}
      {...selectableProps}
    >
      <Text style={{ ...labelType, color: isSelected ? "$onPrimary" : styles.text }}>
        {children}
      </Text>
    </StyledBadge>
  );
}
