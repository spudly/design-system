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

export type BadgeProps = StyledBadgeProps & {
  tone?: Tone;
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
 * treatment a selected toggle Button takes. With no press handler
 * the badge is display-only.
 */
export function Badge({
  tone = "neutral",
  color,
  selected,
  onPress,
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
  if (color) {
    const resolvedColor = resolveTagColor(color);
    return (
      <StyledBadge
        backgroundColor={isSelected ? "$primary" : `${resolvedColor}22`}
        borderColor={isSelected ? "$primary" : resolvedColor}
        {...rest}
        {...(selectable ? { onPress, cursor: "pointer" } : null)}
        {...(selectable ? platformAccessibilityProps({ accessibilityRole: "button" }) : null)}
        {...(selectable
          ? isWeb
            ? { "aria-pressed": selected ?? false }
            : { accessibilityState: { selected: selected ?? false } }
          : null)}
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
      {...(selectable ? { onPress, cursor: "pointer" } : null)}
      {...(selectable ? platformAccessibilityProps({ accessibilityRole: "button" }) : null)}
      {...(selectable
        ? isWeb
          ? { "aria-pressed": selected ?? false }
          : { accessibilityState: { selected: selected ?? false } }
        : null)}
    >
      <Text style={{ ...labelType, color: isSelected ? "$onPrimary" : styles.text }}>
        {children}
      </Text>
    </StyledBadge>
  );
}
