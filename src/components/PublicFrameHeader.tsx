import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { BrandLink } from "./BrandLink.js";
import { COLUMN_MAX_WIDTH } from "./PublicFrameLayout.js";
import { TextLink } from "./TextLink.js";

export type PublicFrameHeaderProps = {
  /** Brand wordmark text (the frame's DS-owned copy, passed in). */
  brandLabel: string;
  /** Brand intent: the host navigates to the public home. */
  onBrandPress: () => void;
  /** Sign-in link label (the frame's DS-owned copy, passed in). */
  signInLabel: string;
  /** Sign-in intent: the host navigates to the login route. */
  onSignInPress: () => void;
};

/**
 * The public frame's header band (#119): a surface band with a
 * hairline bottom border, holding the brand wordmark and the
 * sign-in link at the ends of the wide public column
 * (COLUMN_MAX_WIDTH). Extracted from PublicPageFrame for the
 * #119 page de-styling program — the band's fill, border, column
 * geometry, and link treatments are the frame's design, owned
 * here; the copy and the navigation intents cross as props.
 */
export function PublicFrameHeader({
  brandLabel,
  onBrandPress,
  signInLabel,
  onSignInPress,
}: PublicFrameHeaderProps) {
  return (
    <YStack backgroundColor="$surface" borderBottomWidth={1} borderColor={tokens.colors.gray.gray2}>
      <XStack
        width="100%"
        maxWidth={COLUMN_MAX_WIDTH}
        alignSelf="center"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$6"
        paddingVertical="$4"
      >
        <BrandLink label={brandLabel} onPress={onBrandPress} />
        <TextLink fontSize={tokens.typography.fontSize.sm} onPress={onSignInPress}>
          {signInLabel}
        </TextLink>
      </XStack>
    </YStack>
  );
}
