import { XStack, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { politeLiveRegionProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

const toneStyles = {
  // Info tone mirrors InlineAlert's semantic treatment exactly (the
  // warning tone keeps the brand-neutral status ramp, as in InlineAlert).
  info: {
    background: "$primarySubtle",
    border: "$primary",
    text: "$primaryEmphasis",
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
 * The container announces politely — `role="status"` on web,
 * `accessibilityLiveRegion="polite"` on native, via
 * `politeLiveRegionProps` (`status` is not a valid React Native
 * `accessibilityRole` and crashes Android — spudly/eciperay#156). The
 * dismiss button is labeled "Dismiss" and meets the 44px minimum touch
 * target.
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
      {...politeLiveRegionProps}
      {...rest}
    >
      <XStack justifyContent="space-between" alignItems="flex-start" gap={tokens.spacing[2]}>
        <Text style={{ color: styles.text, flex: 1 }}>{message}</Text>
        <Button
          variant="ghost"
          size="sm"
          // The banner background stays pale in dark mode ($primarySubtle /
          // warning1 in both modes), so the ghost variant's default $link
          // label — which lightens in dark themes for dark page backgrounds —
          // drops to 1.98–2.42:1 (info) / 2.18–2.88:1 (warning) against it,
          // below the 3:1 minimum for control icons. The banner's own text
          // color is the contrasting foreground for this background in both
          // modes: 6.38–6.73:1 (info, per brand) and 4.84:1 (warning).
          color={styles.text}
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
