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
 * target. Its × glyph renders at the 2xl font size, not a button label
 * size: at the small button size the glyph was 14px and read as a speck
 * next to the message text (#179).
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
          // Shift the 44px target into the corner with relative
          // positioning: the banner's own padding (spacing[3]) plus
          // the glyph centering inside the target otherwise leaves
          // the × floating ~34px from the top-right corner. The
          // offsets are spacing tokens, not raw pixels: up by
          // spacing[6] and right by spacing[5] puts the glyph
          // center ~10px from the corner. Offsets, not margins —
          // spacing belongs to the parent layout; the layout box
          // and the target size are unchanged.
          position="relative"
          top={-tokens.spacing[6]}
          right={-tokens.spacing[5]}
          fontSize={tokens.typography.fontSize["2xl"]}
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
