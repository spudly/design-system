import type { Meta, StoryObj } from "@storybook/react";

import { accessTokensFixture, nutritionGoalsFixture, eciperayFooterFixture } from "../shared/fixtures.js";

import { ProfilePage } from "./ProfilePage.js";

const meta: Meta<typeof ProfilePage> = {
  title: "Pages/Eciperay/ProfilePage",
  component: ProfilePage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ProfilePage>;

/**
 * The sections are data-driven: the nutrition goals, access
 * tokens, and feedback preference sections render from their
 * data props (their app containers feed them live data), and
 * the legal links cross as label + href data.
 */
export const WithSections: Story = {
  render: () => (
    <>
      <ProfilePage
        footer={eciperayFooterFixture}
        email="cook@example.com"
        onSignOut={() => { /* noop */ }}
        tagsHref="/profile/tags"
        nutritionGoals={{
          goals: nutritionGoalsFixture,
          onChange: () => { /* noop */ },
          onSave: () => { /* noop */ },
        }}
        accessTokens={{
          tokens: accessTokensFixture.tokens,
          tokenName: "",
          onTokenNameChange: () => { /* noop */ },
          onCreate: () => { /* noop */ },
          createdSecret: null,
          onDismissSecret: () => { /* noop */ },
          onRevoke: () => { /* noop */ },
        }}
        feedbackPreferenceSection={{
          shortcutEnabled: true,
          onShortcutEnabledChange: () => { /* noop */ },
          consent: true,
          consentStatusText: "Analytics consent: Accepted",
          onAcceptConsent: () => { /* noop */ },
          onDeclineConsent: () => { /* noop */ },
          onWithdrawConsent: () => { /* noop */ },
          choicesHref: "/privacy/consent",
        }}
        legalLinks={[
          { label: "Terms of Service", href: "/terms" },
          { label: "Privacy Policy", href: "/privacy" },
        ]}
      />
    </>
  ),
};

export const Loading: Story = {
  // #874: the page-level loading state — every composed
  // section renders its skeleton and the email line is a
  // bone; no section data renders.
  render: () => (
    <>
      <ProfilePage
        footer={eciperayFooterFixture}
        email="cook@example.com"
        onSignOut={() => { /* noop */ }}
        loading
        subscription={{
          planLabel: "Plus plan",
          statusText: "Your Plus plan is active and renews on Dec 1, 2026.",
          onManage: () => { /* noop */ },
        }}
        authorDisplay={{
          settings: { displayName: "Jamie Cook", showOnPublicRecipes: true },
          onChange: () => { /* noop */ },
          onSave: () => { /* noop */ },
        }}
        familySharing={{
          grants: [
            {
              recipientUserId: "user-1",
              recipientEmail: "alex@example.com",
              recipientDisplayName: "Alex Cook",
              createdAt: "2026-10-02T12:00:00.000Z",
            },
          ],
          email: "",
          onEmailChange: () => { /* noop */ },
          onAdd: () => { /* noop */ },
          onRemove: () => { /* noop */ },
        }}
        feedbackPreferenceSection={{
          shortcutEnabled: true,
          onShortcutEnabledChange: () => { /* noop */ },
          consent: true,
          consentStatusText: "Analytics consent: Accepted",
          onAcceptConsent: () => { /* noop */ },
          onDeclineConsent: () => { /* noop */ },
          onWithdrawConsent: () => { /* noop */ },
          choicesHref: "/privacy/consent",
        }}
        accountData={{
          onExportData: () => { /* noop */ },
          onDeleteAccount: () => { /* noop */ },
        }}
        nutritionGoals={{
          goals: nutritionGoalsFixture,
          onChange: () => { /* noop */ },
          onSave: () => { /* noop */ },
        }}
        accessTokens={{
          tokens: accessTokensFixture.tokens,
          tokenName: "",
          onTokenNameChange: () => { /* noop */ },
          onCreate: () => { /* noop */ },
          createdSecret: null,
          onDismissSecret: () => { /* noop */ },
          onRevoke: () => { /* noop */ },
        }}
        legalLinks={[
          { label: "Terms of Service", href: "/terms" },
          { label: "Privacy Policy", href: "/privacy" },
        ]}
      />
    </>
  ),
};

export const WithCoverageSections: Story = {
  // The #438 Part 3 typed sections: subscription,
  // feedback-preference, transfer, and account-data render from
  // their data props (the migrated form of the slot sections
  // WithSections exercises with stand-ins). The nutrition-goals
  // and access-tokens sections (#511) render from their data
  // props here too, in the same before-feedback position
  // WithSections composes them in the slot.
  render: () => (
    <>
      <ProfilePage
        footer={eciperayFooterFixture}
        email="cook@example.com"
        onSignOut={() => { /* noop */ }}
        subscription={{
          planLabel: "Plus plan",
          statusText: "Your Plus plan is active and renews on Dec 1, 2026.",
          onManage: () => { /* noop */ },
        }}
        showLess={{
          entries: [
            { sourceRecipeId: "recipe-1", title: "Spicy Tuna Casserole" },
            { sourceRecipeId: "recipe-2", title: "Liver and Onions" },
          ],
          onUndo: () => { /* noop */ },
        }}
        authorDisplay={{
          settings: { displayName: "Jamie Cook", showOnPublicRecipes: true },
          onChange: () => { /* noop */ },
          onSave: () => { /* noop */ },
        }}
        familySharing={{
          grants: [
            {
              recipientUserId: "user-1",
              recipientEmail: "alex@example.com",
              recipientDisplayName: "Alex Cook",
              createdAt: "2026-10-02T12:00:00.000Z",
            },
          ],
          email: "",
          onEmailChange: () => { /* noop */ },
          onAdd: () => { /* noop */ },
          onRemove: () => { /* noop */ },
        }}
        feedbackPreferenceSection={{
          shortcutEnabled: true,
          onShortcutEnabledChange: () => { /* noop */ },
          consent: true,
          consentStatusText: "Analytics consent: Accepted",
          onAcceptConsent: () => { /* noop */ },
          onDeclineConsent: () => { /* noop */ },
          onWithdrawConsent: () => { /* noop */ },
          choicesHref: "/privacy/consent",
        }}
        transfer={{
          exportPicker: {
            search: "",
            onSearchChange: () => { /* noop */ },
            items: [
              { id: "r1", label: "Skillet Chicken" },
              { id: "r2", label: "First Soup" },
            ],
            selectedIds: ["r1"],
            onToggle: () => { /* noop */ },
            onSelectAll: () => { /* noop */ },
            onClearSelection: () => { /* noop */ },
            onExport: () => { /* noop */ },
            exportLabel: "Export selected (1)",
          },
          onImportPress: () => { /* noop */ },
        }}
        accountData={{
          onExportData: () => { /* noop */ },
          onDeleteAccount: () => { /* noop */ },
        }}
        nutritionGoals={{
          goals: nutritionGoalsFixture,
          onChange: () => { /* noop */ },
          onSave: () => { /* noop */ },
        }}
        accessTokens={{
          tokens: accessTokensFixture.tokens,
          tokenName: "",
          onTokenNameChange: () => { /* noop */ },
          onCreate: () => { /* noop */ },
          createdSecret: null,
          onDismissSecret: () => { /* noop */ },
          onRevoke: () => { /* noop */ },
        }}
        legalLinks={[
          { label: "Terms of Service", href: "/terms" },
          { label: "Privacy Policy", href: "/privacy" },
        ]}
      />
    </>
  ),
};
