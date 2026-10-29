import type { ReactNode } from "react";
import { Button } from "../components/Button.js";
import { LegalSection } from "../components/LegalSection.js";
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
 *   into the section this page frames (LegalSection, #119).
 *
 * Sign out is a bare intent: the session teardown is app-side
 * business logic and never enters the DS.
 *
 * De-styled for #119: the page renders no layout primitives
 * and sets no styling props. The shell's own section rhythm
 * separates the blocks (the app view's title, email, and
 * button separations), the title takes Text's `title` variant
 * (the xl bold treatment it rendered with, owned by the
 * variant), the email takes the `muted` variant, and the
 * Legal block is the LegalSection component.
 */

export type ProfilePageProps = {
  email?: string | null;
  onSignOut: () => void;
  /** The tags destination (#248: navigation crosses as an href,
   * not a press callback); the button renders only when the href
   * is provided. */
  tagsHref?: string;
  /** The component-showcase destination (#248); the button
   * renders only when the href is provided. */
  showcaseHref?: string;
  sectionsBeforeFeedback?: ReactNode;
  feedbackPreference?: ReactNode;
  sectionsAfterFeedback?: ReactNode;
  /** The app's LegalLinks, rendered inside the Legal section. */
  legalLinks?: ReactNode;
};

export function ProfilePage({
  email,
  onSignOut,
  tagsHref,
  showcaseHref,
  sectionsBeforeFeedback,
  feedbackPreference,
  sectionsAfterFeedback,
  legalLinks,
}: ProfilePageProps) {
  return (
    <ScreenContainer variant="padded">
      <Text variant="title">Profile</Text>
      {email ? <Text variant="muted">{email}</Text> : null}
      {showcaseHref ? (
        <Button variant="secondary" href={showcaseHref}>
          Component Showcase
        </Button>
      ) : null}
      {sectionsBeforeFeedback}
      {tagsHref ? (
        <Button variant="secondary" href={tagsHref}>
          Manage Tags
        </Button>
      ) : null}
      {feedbackPreference}
      {sectionsAfterFeedback}
      <LegalSection title="Legal">{legalLinks}</LegalSection>
      <Button variant="danger" onPress={onSignOut}>
        Sign Out
      </Button>
    </ScreenContainer>
  );
}
