import { XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { politeLiveRegionProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

const SecretBox = styled(XStack, {
  name: "SecretBox",

  backgroundColor: "$surface",
  borderWidth: 1,
  borderColor: "$borderColor",
  borderRadius: tokens.radii.md,
  padding: tokens.spacing[3],
  alignItems: "center",
});

export type SecretRevealPanelProps = {
  /** The secret value to display (shown once). */
  secret: string;
  title?: string;
  copyLabel?: string;
  /** Called with the secret when Copy is pressed; the app wires the real clipboard. */
  onCopy: (secret: string) => void;
  onDismiss?: () => void;
};

/**
 * Show-once secret display (API tokens, recovery codes, etc.). Renders the
 * secret in mono inside a bordered box with Copy and optional Dismiss
 * actions. The container announces politely so its appearance is
 * announced — `role="status"` on web, `accessibilityLiveRegion="polite"`
 * on native, via `politeLiveRegionProps` (`status` is not a valid React
 * Native `accessibilityRole` and crashes Android — spudly/eciperay#156).
 * The app wires `onCopy` to the real clipboard API.
 */
export function SecretRevealPanel({
  secret,
  title = "Your secret",
  copyLabel = "Copy",
  onCopy,
  onDismiss,
}: SecretRevealPanelProps) {
  return (
    <YStack gap={tokens.spacing[3]} {...politeLiveRegionProps}>
      <Text variant="subheading">{title}</Text>
      <Text variant="hint">Copy it now — it won&apos;t be shown again.</Text>
      <SecretBox>
        <Text
          style={{
            fontFamily: tokens.typography.fontFamily.mono,
            fontSize: tokens.typography.fontSize.sm,
            flex: 1,
          }}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {secret}
        </Text>
      </SecretBox>
      <XStack gap={tokens.spacing[2]}>
        <Button variant="primary" size="sm" onPress={() => onCopy(secret)}>
          {copyLabel}
        </Button>
        {onDismiss ? (
          <Button variant="secondary" size="sm" onPress={onDismiss}>
            Dismiss
          </Button>
        ) : null}
      </XStack>
    </YStack>
  );
}
