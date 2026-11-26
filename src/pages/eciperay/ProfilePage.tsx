import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import { Button } from "../../widgets/actions/Button.js";
import { TextLink } from "../../widgets/actions/TextLink.js";
import { LegalSection } from "../../widgets/content/LegalSection.js";
import { Col } from "../../widgets/layout/Col.js";
import { ScreenContainer } from "../../widgets/layout/ScreenContainer.js";
import { Text } from "../../widgets/data/Text.js";
import {
  AccountDataView,
  type AccountDataViewProps,
} from "../../views/eciperay/AccountDataView.js";
import {
  FeedbackPreferenceView,
  type FeedbackPreferenceViewProps,
} from "../../views/eciperay/FeedbackPreferenceView.js";
import {
  SubscriptionView,
  type SubscriptionViewProps,
} from "../../views/eciperay/SubscriptionView.js";
import {
  TransferRecipesView,
  type TransferRecipesViewProps,
} from "../../views/eciperay/TransferRecipesView.js";
import {
  AccessTokensPanel,
  type AccessTokensPanelProps,
} from "../../views/eciperay/AccessTokensPanel.js";
import {
  NutritionGoalsForm,
  type NutritionGoalsFormProps,
} from "../../views/eciperay/NutritionGoalsForm.js";
import {
  AuthorDisplayView,
  type AuthorDisplayViewProps,
} from "../../views/eciperay/AuthorDisplayView.js";
import {
  FamilySharingView,
  type FamilySharingViewProps,
} from "../../views/eciperay/FamilySharingView.js";
import {
  ShowLessView,
  type ShowLessViewProps,
} from "../../views/eciperay/ShowLessView.js";

// The section view-models live with the views (#438 Part 3);
// the page's contract names are aliases, so consumers of the
// page's types are untouched (the RecipeDetailPage ratings
// precedent).
export type ProfilePageSubscription = SubscriptionViewProps;
export type ProfilePageAccountData = AccountDataViewProps;
export type ProfilePageTransfer = TransferRecipesViewProps;
export type ProfilePageFeedbackPreference = FeedbackPreferenceViewProps;
export type ProfilePageAuthorDisplay = AuthorDisplayViewProps;
export type ProfilePageFamilySharing = FamilySharingViewProps;
export type ProfilePageShowLess = ShowLessViewProps;
type ProfilePageNutritionGoals = NutritionGoalsFormProps;
type ProfilePageAccessTokens = AccessTokensPanelProps;

/** One Legal-section link (#686): the label renders as the
 * link's text, the href is its destination (#248). */
export type ProfilePageLegalLink = {
  label: string;
  href: string;
};

/**
 * ProfilePage (#126, B3c): the profile view — the split view
 * half of Eciperay's `ProfileView` (the B2 audit's page-view
 * disposition: "section slots stay as page slots"). The app
 * screen keeps the auth session and navigation; this view
 * renders the chrome and the slot regions in the app view's
 * order. The nutrition-goals and access-tokens sections are
 * covered by the `nutritionGoals` / `accessTokens` data props
 * (#511), and every section is composed by the page itself
 * from data props (#685). The author-display, family-sharing,
 * and show-less sections — the last three hosts rendered
 * themselves — are covered by the `authorDisplay` /
 * `familySharing` / `showLess` data props (#873).
 *
 * No render slots remain: the feedback position is served by
 * the `feedbackPreferenceSection` data prop (#680), the generic
 * before/after-feedback section slots are removed (#685), and
 * the Legal section's links cross as data (#686, below).
 * - `legalLinks` — the Legal section's links are app content
 *   (the labels and URLs are app data), so they cross as
 *   label + href data and the page renders them itself inside
 *   the Legal section it frames (LegalSection, #119; #686).
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
  /** The Legal section's links as data (#686): each entry's
   * label and href; the page renders them as links inside the
   * Legal section. The legal text itself stays app-owned —
   * only the rendering moved into the DS. */
  legalLinks?: ProfilePageLegalLink[];
  /**
   * Typed section data (#438 Part 3): the profile sections the
   * design system covers as views — the page composes every
   * section itself from these props (#685: the generic
   * before/after-feedback ReactNode slots are removed; #680:
   * the feedbackPreference ReactNode slot is removed — no
   * rendered UI crosses the page boundary for sections).
   * Each renders at its position — `subscription`,
   * `nutritionGoals`, and `accessTokens` before the feedback
   * position, `feedbackPreferenceSection` at the feedback
   * position, and `transfer` and `accountData` after it.
   *
   * `nutritionGoals` and `accessTokens` (#511) render at the
   * before-feedback position, in that order.
   */
  subscription?: ProfilePageSubscription;
  /**
   * The last three host-rendered profile sections, covered
   * as data props in #873: `showLess`, `authorDisplay`, and
   * `familySharing` render at the before-feedback position,
   * in that order — the relative order the host ProfilePage
   * places them today, directly ahead of the feedback
   * position.
   */
  authorDisplay?: ProfilePageAuthorDisplay;
  familySharing?: ProfilePageFamilySharing;
  showLess?: ProfilePageShowLess;
  feedbackPreferenceSection?: ProfilePageFeedbackPreference;
  transfer?: ProfilePageTransfer;
  accountData?: ProfilePageAccountData;
  nutritionGoals?: ProfilePageNutritionGoals;
  accessTokens?: ProfilePageAccessTokens;
};

export function ProfilePage({
  email,
  onSignOut,
  tagsHref,
  showcaseHref,
  legalLinks,
  subscription,
  authorDisplay,
  familySharing,
  showLess,
  feedbackPreferenceSection,
  transfer,
  accountData,
  nutritionGoals,
  accessTokens,
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
        {nutritionGoals ? <NutritionGoalsForm {...nutritionGoals} /> : null}
        {accessTokens ? <AccessTokensPanel {...accessTokens} /> : null}
        {tagsHref ? (
          <Button variant="secondary" href={tagsHref}>
            Manage Tags
          </Button>
        ) : null}
        {showLess ? <ShowLessView {...showLess} /> : null}
        {authorDisplay ? <AuthorDisplayView {...authorDisplay} /> : null}
        {familySharing ? <FamilySharingView {...familySharing} /> : null}
        {feedbackPreferenceSection ? (
          <FeedbackPreferenceView {...feedbackPreferenceSection} />
        ) : null}
        {transfer ? <TransferRecipesView {...transfer} /> : null}
        {accountData ? <AccountDataView {...accountData} /> : null}
        <LegalSection title="Legal">
          <Col gap="s">
            {(legalLinks ?? []).map((link) => (
              <TextLink key={link.href} href={link.href}>
                {link.label}
              </TextLink>
            ))}
          </Col>
        </LegalSection>
        <Button variant="danger" onPress={onSignOut}>
          Sign Out
        </Button>
      </ScreenContainer>
    </BigFooterShell>
  );
}
