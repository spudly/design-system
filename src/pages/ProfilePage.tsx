import { BigFooterShell, type BigFooterData } from "../components/BigFooter.js";
import type { ReactNode } from "react";
import { Button } from "../components/Button.js";
import { LegalSection } from "../views/LegalSection.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";
import { AccountDataView, type AccountDataViewProps } from "../views/AccountDataView.js";
import {
  FeedbackPreferenceView,
  type FeedbackPreferenceViewProps,
} from "../views/FeedbackPreferenceView.js";
import { SubscriptionView, type SubscriptionViewProps } from "../views/SubscriptionView.js";
import {
  TransferRecipesView,
  type TransferRecipesViewProps,
} from "../views/TransferRecipesView.js";

// The section view-models live with the views (#438 Part 3);
// the page's contract names are aliases, so consumers of the
// page's types are untouched (the RecipeDetailPage ratings
// precedent).
export type ProfilePageSubscription = SubscriptionViewProps;
export type ProfilePageAccountData = AccountDataViewProps;
export type ProfilePageTransfer = TransferRecipesViewProps;
export type ProfilePageFeedbackPreference = FeedbackPreferenceViewProps;

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
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
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
  /**
   * Typed section data (#438 Part 3): the profile sections the
   * design system now covers as views. Each renders at its
   * slot position — `subscription` with the before-feedback
   * sections, `feedbackPreferenceSection` at the feedback
   * position, `transfer` and `accountData` with the
   * after-feedback sections — and the ReactNode slots stay as
   * the fallback for sections the DS does not cover. A data
   * prop and its slot position's ReactNode are alternatives:
   * when both are supplied for the feedback position, the slot
   * wins (it is the more specific composition).
   */
  subscription?: ProfilePageSubscription;
  feedbackPreferenceSection?: ProfilePageFeedbackPreference;
  transfer?: ProfilePageTransfer;
  accountData?: ProfilePageAccountData;
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
  subscription,
  feedbackPreferenceSection,
  transfer,
  accountData,
  footer,
}: ProfilePageProps) {
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer variant="padded">
        <Text variant="title">Profile</Text>
        {email ? <Text variant="muted">{email}</Text> : null}
        {showcaseHref ? (
          <Button variant="secondary" href={showcaseHref}>
            Component Showcase
          </Button>
        ) : null}
        {subscription ? <SubscriptionView {...subscription} /> : null}
        {sectionsBeforeFeedback}
        {tagsHref ? (
          <Button variant="secondary" href={tagsHref}>
            Manage Tags
          </Button>
        ) : null}
        {feedbackPreference}
        {!feedbackPreference && feedbackPreferenceSection ? (
          <FeedbackPreferenceView {...feedbackPreferenceSection} />
        ) : null}
        {transfer ? <TransferRecipesView {...transfer} /> : null}
        {accountData ? <AccountDataView {...accountData} /> : null}
        {sectionsAfterFeedback}
        <LegalSection title="Legal">{legalLinks}</LegalSection>
        <Button variant="danger" onPress={onSignOut}>
          Sign Out
        </Button>
      </ScreenContainer>
    </BigFooterShell>
  );
}
