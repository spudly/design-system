import type { ReactNode } from "react";
import { View, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "../components/Text.js";
import { TextLink } from "../components/TextLink.js";

/**
 * PublicPageFrame (#169): the public (signed-out) page chrome as a
 * design-system building block — header (brand + Sign in), the wide
 * public content column, and footer (the viewed-without-an-account
 * note + Privacy/Terms links) — shared by every public surface
 * (PublicRecipePage here; Discover #168, Legal #170, and the
 * marketing landing #171 reuse it as they land).
 *
 * Ownership model (Stephen, 2026-10-28, confirmed for #168–#171
 * alike): the DS owns the design — this frame included — and the
 * app owns the content. The frame's copy is therefore DS-owned
 * constants that move with the frame (the copy precedent from
 * RecipeDetailPage), and every navigation leaves through an intent
 * callback: the host routes (brand → home, Sign in → the login
 * route, Privacy/Terms → the legal routes). Nothing here imports
 * an app package or fetches anything.
 *
 * This is the wide public counterpart to PageFrame (the 430px
 * phone frame the app-page stories render in): the content column
 * is the web layout's max-w-3xl (768px), centered, and the frame
 * itself does not scroll — the page inside owns its scroll, the
 * same split as the web PublicPageLayout it replaces, whose header
 * and footer sit outside the scrolling document flow.
 *
 * Placement: page components live in src/pages behind the
 * `@spudly/ui/pages` subpath export, not the package root.
 */

export type PublicPageFrameProps = {
  /** Brand intent: the host navigates to the public home. */
  onBrandPress: () => void;
  /** Sign-in intent: the host navigates to the login route. */
  onSignInPress: () => void;
  /** Privacy intent: the host navigates to the privacy policy. */
  onPrivacyPress: () => void;
  /** Terms intent: the host navigates to the terms of service. */
  onTermsPress: () => void;
  children: ReactNode;
};

// Frame copy, DS-owned constants that move with the frame (the
// copy precedent): the brand, the header action, the footer note,
// and the legal link labels, verbatim from the web layout.
const BRAND_LABEL = "Eciperay";
const SIGN_IN_LABEL = "Sign in";
const FOOTER_NOTE = "Recipes shared on Eciperay may be viewed without an account.";
const PRIVACY_LABEL = "Privacy Policy";
const TERMS_LABEL = "Terms of Service";

// The wide public column: the web layout's max-w-3xl.
const COLUMN_MAX_WIDTH = 768;

/** The brand wordmark: a link-styled pressable that carries the
 * link role and web keyboard activation (Enter), like TextLink,
 * but in the brand treatment (primary ink, semibold, no underline)
 * the web header uses. */
function BrandLink({ onPress }: { onPress: () => void }) {
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onPress();
    }
  };
  return (
    <Text
      fontSize={tokens.typography.fontSize.lg}
      fontWeight={tokens.typography.fontWeight.semibold}
      color="$primary"
      accessibilityRole="link"
      accessibilityLabel={BRAND_LABEL}
      onPress={onPress}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {BRAND_LABEL}
    </Text>
  );
}

/**
 * The public chrome: pinned header and footer around the wide
 * centered column the page renders into. Controlled — see the
 * file header for the contract and the ownership split.
 */
export function PublicPageFrame({
  onBrandPress,
  onSignInPress,
  onPrivacyPress,
  onTermsPress,
  children,
}: PublicPageFrameProps) {
  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack
        backgroundColor="$surface"
        borderBottomWidth={1}
        borderColor={tokens.colors.gray.gray2}
      >
        <XStack
          width="100%"
          maxWidth={COLUMN_MAX_WIDTH}
          alignSelf="center"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$6"
          paddingVertical="$4"
        >
          <BrandLink onPress={onBrandPress} />
          <TextLink fontSize={tokens.typography.fontSize.sm} onPress={onSignInPress}>
            {SIGN_IN_LABEL}
          </TextLink>
        </XStack>
      </YStack>
      <View flex={1} width="100%" maxWidth={COLUMN_MAX_WIDTH} alignSelf="center">
        {children}
      </View>
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
            {FOOTER_NOTE}
          </Text>
          <XStack flexWrap="wrap" gap="$4">
            <TextLink fontSize={tokens.typography.fontSize.sm} onPress={onPrivacyPress}>
              {PRIVACY_LABEL}
            </TextLink>
            <TextLink fontSize={tokens.typography.fontSize.sm} onPress={onTermsPress}>
              {TERMS_LABEL}
            </TextLink>
          </XStack>
        </XStack>
      </YStack>
    </YStack>
  );
}
