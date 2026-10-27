import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

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

export interface BadgeProps extends StyledBadgeProps {
  tone?: Tone;
}

/**
 * Small status pill. Status is always conveyed with text, never color alone.
 * Tones: `neutral` (default), `info`, `success`, `warning`, `danger`.
 */
export function Badge({ tone = "neutral", children, ...rest }: BadgeProps) {
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
