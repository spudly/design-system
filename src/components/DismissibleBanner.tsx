import { XStack, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

const toneStyles = {
  info: {
    background: tokens.colors.primary.primary1,
    border: tokens.colors.primary.primary4,
    text: tokens.colors.primary.primary8,
  },
  warning: {
    background: tokens.colors.warning.warning1,
    border: tokens.colors.warning.warning4,
    text: tokens.colors.warning.warning8,
  },
} as const;

type Tone = keyof typeof toneStyles;

const StyledBanner = styled(YStack, {
  name: "SpudlyDismissibleBanner",

  borderWidth: 1,
  borderRadius: tokens.radii.md,
  padding: tokens.spacing[3],
  gap: tokens.spacing[2],
});

type StyledBannerProps = GetProps<typeof StyledBanner>;

export interface BannerAction {
  label: string;
  onPress: () => void;
}

export interface DismissibleBannerProps extends StyledBannerProps {
  message: string;
  actions?: BannerAction[];
  onDismiss: () => void;
  tone?: Tone;
}

/**
 * Banner with a message, optional action buttons, and a dismiss (×) button.
 * The container uses `role="status"`; the dismiss button is labeled
 * "Dismiss" and meets the 44px minimum touch target.
 */
export function DismissibleBanner({
  message,
  actions,
  onDismiss,
  tone = "info",
  ...rest
}: DismissibleBannerProps) {
  const styles = toneStyles[tone];
  return (
    <StyledBanner
      backgroundColor={styles.background}
      borderColor={styles.border}
      accessibilityRole="status"
      {...rest}
    >
      <XStack justifyContent="space-between" alignItems="flex-start" gap={tokens.spacing[2]}>
        <Text style={{ color: styles.text, flex: 1 }}>{message}</Text>
        <Button
          variant="ghost"
          size="sm"
          onPress={onDismiss}
          accessibilityLabel="Dismiss"
          minWidth={44}
          minHeight={44}
        >
          ×
        </Button>
      </XStack>
      {actions && actions.length > 0 ? (
        <XStack justifyContent="flex-end" gap={tokens.spacing[2]}>
          {actions.map((action) => (
            <Button key={action.label} variant="secondary" onPress={action.onPress}>
              {action.label}
            </Button>
          ))}
        </XStack>
      ) : null}
    </StyledBanner>
  );
}
