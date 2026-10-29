import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { COLUMN_MAX_WIDTH } from "./PublicFrameLayout.js";
import { Text } from "./Text.js";
import { TextLink } from "./TextLink.js";

export type PublicFrameFooterProps = {
  /** The footer's note (the frame's DS-owned copy, passed in). */
  note: string;
  /** Privacy link label (the frame's DS-owned copy, passed in). */
  privacyLabel: string;
  /** Privacy intent: the host navigates to the privacy policy. */
  onPrivacyPress: () => void;
  /** Terms link label (the frame's DS-owned copy, passed in). */
  termsLabel: string;
  /** Terms intent: the host navigates to the terms of service. */
  onTermsPress: () => void;
};

/**
 * The public frame's footer band (#119): a surface band with a
 * hairline top border, holding the frame's note and its legal
 * links at the ends of the wide public column (COLUMN_MAX_WIDTH),
 * wrapping when the column is narrow. Extracted from
 * PublicPageFrame for the #119 page de-styling program — the
 * band's fill, border, column geometry, and text treatments are
 * the frame's design, owned here; the copy and the navigation
 * intents cross as props.
 */
export function PublicFrameFooter({
  note,
  onPrivacyPress,
  onTermsPress,
  privacyLabel,
  termsLabel,
}: PublicFrameFooterProps) {
  return (
    <YStack backgroundColor="$surface" borderTopWidth={1} borderColor={tokens.colors.gray.gray2}>
      <XStack
        width="100%"
        maxWidth={COLUMN_MAX_WIDTH}
        alignSelf="center"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        gap="$3"
        paddingHorizontal="$6"
        paddingVertical="$4"
      >
        <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray6}>
          {note}
        </Text>
        <XStack flexWrap="wrap" gap="$4">
          <TextLink fontSize={tokens.typography.fontSize.sm} onPress={onPrivacyPress}>
            {privacyLabel}
          </TextLink>
          <TextLink fontSize={tokens.typography.fontSize.sm} onPress={onTermsPress}>
            {termsLabel}
          </TextLink>
        </XStack>
      </XStack>
    </YStack>
  );
}
