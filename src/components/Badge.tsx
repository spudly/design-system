import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { TagColorName } from "../themes/tagColors.js";
import { Text } from "./Text.js";
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
  name: "SpudlyBadge",

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
};

/**
 * Small status pill. Status is always conveyed with text, never color alone.
 * Tones: `neutral` (default), `info`, `success`, `warning`, `danger`.
 * With a `color` prop (a tag color token name) it renders as a colored
 * tag (the former TagPill).
 */
export function Badge({ tone = "neutral", color, children, ...rest }: BadgeProps) {
  const resolveTagColor = useTagColorResolver();
  if (color) {
    const resolvedColor = resolveTagColor(color);
    return (
      <StyledBadge backgroundColor={`${resolvedColor}22`} borderColor={resolvedColor} {...rest}>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: resolvedColor,
          }}
        >
          {children}
        </Text>
      </StyledBadge>
    );
  }
  const styles = toneStyles[tone];
  return (
    <StyledBadge backgroundColor={styles.background} borderColor={styles.text} {...rest}>
      <Text
        style={{
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: styles.text,
        }}
      >
        {children}
      </Text>
    </StyledBadge>
  );
}
