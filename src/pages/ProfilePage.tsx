import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";

/**
 * ProfilePage (#126, B3c): the profile view — the split view
 * half of Eciperay's `ProfileView` (the B2 audit's page-view
 * disposition: "section slots stay as page slots"). The app
 * screen keeps the auth session, the section hosts (nutrition
 * goals, access tokens), and navigation; this view renders
 * the chrome and the slot regions in the app view's order.
 *
 * The slots, in render order:
 * - `sectionsBeforeFeedback` — the app's section hosts
 *   (NutritionGoalsForm + AccessTokensPanel, wired by their
 *   app containers).
 * - `feedbackPreference` — the app's feedback-preference
 *   container (a hook + analytics-config flag — business logic
 *   that stays app-side per the audit) rendered at the exact
 *   position the app view renders it, between the two section
 *   slots.
 * - `sectionsAfterFeedback` — any remaining app sections.
 * - `legalLinks` — the Legal section's links are app content
 *   (the URLs are app constants; the B2 audit keeps
 *   `LegalLinks` app-side), so the host renders its LegalLinks
 *   into the section this page frames.
 *
 * Sign out is a bare intent: the session teardown is app-side
 * business logic and never enters the DS.
 */

export type ProfilePageProps = {
  email?: string | null;
  onSignOut: () => void;
  onManageTagsPress?: () => void;
  onComponentShowcasePress?: () => void;
  sectionsBeforeFeedback?: ReactNode;
  feedbackPreference?: ReactNode;
  sectionsAfterFeedback?: ReactNode;
  /** The app's LegalLinks, rendered inside the Legal section. */
  legalLinks?: ReactNode;
};

export function ProfilePage({
  email,
  onSignOut,
  onManageTagsPress,
  onComponentShowcasePress,
  sectionsBeforeFeedback,
  feedbackPreference,
  sectionsAfterFeedback,
  legalLinks,
}: ProfilePageProps) {
  return (
    <ScreenContainer variant="padded">
      <YStack paddingBottom="$4">
        <Text
          variant="heading"
          fontSize={tokens.typography.fontSize.xl}
          fontWeight={tokens.typography.fontWeight.bold}
        >
          Profile
        </Text>
      </YStack>
      {email ? (
        <YStack paddingBottom="$6">
          <Text color={tokens.colors.gray.gray8}>{email}</Text>
        </YStack>
      ) : null}
      {onComponentShowcasePress ? (
        <YStack paddingBottom="$4">
          <Button variant="secondary" onPress={onComponentShowcasePress}>
            Component Showcase
          </Button>
        </YStack>
      ) : null}
      {sectionsBeforeFeedback}
      {onManageTagsPress ? (
        <YStack paddingBottom="$4">
          <Button variant="secondary" onPress={onManageTagsPress}>
            Manage Tags
          </Button>
        </YStack>
      ) : null}
      {feedbackPreference}
      {sectionsAfterFeedback}
      <YStack paddingBottom="$8">
        <YStack paddingBottom="$3">
          <Text
            fontSize={tokens.typography.fontSize.lg}
            fontWeight={tokens.typography.fontWeight.semibold}
            color={tokens.colors.gray.gray10}
          >
            Legal
          </Text>
        </YStack>
        {legalLinks}
      </YStack>
      <Button variant="danger" onPress={onSignOut}>
        Sign Out
      </Button>
    </ScreenContainer>
  );
}
