import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { BrandLink } from "./BrandLink.js";
import { COLUMN_MAX_WIDTH } from "./PublicFrameLayout.js";
import { TextLink } from "./TextLink.js";

export type PublicFrameHeaderProps = {
  /** Brand wordmark text (the frame's DS-owned copy, passed in). */
  brandLabel: string;
  /** The brand's href — the wordmark navigates home, so it is a link. */
  brandHref: string;
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
 * here; the copy crosses as props, the wordmark's home href
 * crosses as an href (it navigates — #248), and the sign-in
 * navigation crosses as an intent callback.
 */
export function PublicFrameHeader({
  brandLabel,
  brandHref,
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
        <BrandLink label={brandLabel} href={brandHref} />
        <TextLink fontSize={tokens.typography.fontSize.sm} onPress={onSignInPress}>
          {signInLabel}
        </TextLink>
      </XStack>
    </YStack>
  );
}
