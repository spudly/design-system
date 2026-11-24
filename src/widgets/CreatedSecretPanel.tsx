import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./actions/Button.js";
import { Text } from "./Text.js";

export type CreatedSecretPanelProps = {
  /** The panel's title (e.g. "Your new token"). */
  title: string;
  /** The show-once secret value, rendered selectable in mono. */
  secret: string;
  /** The warning hint under the secret ("Copy it now — it won't be shown again"). */
  hint: string;
  /** The dismiss action's label. */
  doneLabel: string;
  /** Dismiss intent: the host clears the secret it holds. */
  onDismiss: () => void;
};

/**
 * A created secret's warning panel (#698 tranche 4): the
 * amber warning treatment a show-once secret renders in —
 * the title, the secret selectable in mono inside its
 * surface box, the hint, and the dismiss action — extracted
 * from AccessTokensPanel, whose created-secret panel carried
 * this treatment inline (the #126 option-A panel). The
 * panel owns its frame, insets, and rhythms outright; the
 * secret and copy cross as data and dismissal as an intent.
 */
export function CreatedSecretPanel({
  title,
  secret,
  hint,
  doneLabel,
  onDismiss,
}: CreatedSecretPanelProps) {
  return (
    <YStack paddingTop="$4" paddingBottom="$4">
      <YStack
        borderRadius={tokens.radii.md}
        borderWidth={1}
        borderColor={tokens.colors.warning.warning4}
        backgroundColor={tokens.colors.warning.warning1}
        padding="$4"
        gap="$2"
      >
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.semibold}
          color={tokens.colors.warning.warning10}
        >
          {title}
        </Text>
        <YStack borderRadius={tokens.radii.sm} backgroundColor="$surface" padding="$3">
          <Text
            userSelect="text"
            color={tokens.colors.gray.gray10}
            style={{
              fontFamily: tokens.typography.fontFamily.mono,
              fontSize: tokens.typography.fontSize.sm,
            }}
          >
            {secret}
          </Text>
        </YStack>
        <Text fontSize={tokens.typography.fontSize.xs} color={tokens.colors.warning.warning9}>
          {hint}
        </Text>
        <XStack gap="$2">
          <Button variant="secondary" onPress={onDismiss}>
            {doneLabel}
          </Button>
        </XStack>
      </YStack>
    </YStack>
  );
}
