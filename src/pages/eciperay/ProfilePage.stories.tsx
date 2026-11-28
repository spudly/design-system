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
        onSignOut={() => {}}
        tagsHref="/profile/tags"
        nutritionGoals={{
          goals: nutritionGoalsFixture,
          onChange: () => {},
          onSave: () => {},
        }}
        accessTokens={{
          tokens: accessTokensFixture.tokens,
          tokenName: "",
          onTokenNameChange: () => {},
          onCreate: () => {},
          createdSecret: null,
          onDismissSecret: () => {},
          onRevoke: () => {},
        }}
        feedbackPreferenceSection={{
          shortcutEnabled: true,
          onShortcutEnabledChange: () => {},
          consent: true,
          consentStatusText: "Analytics consent: Accepted",
          onAcceptConsent: () => {},
          onDeclineConsent: () => {},
          onWithdrawConsent: () => {},
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
        onSignOut={() => {}}
        loading
        subscription={{
          planLabel: "Plus plan",
          statusText: "Your Plus plan is active and renews on Dec 1, 2026.",
          onManage: () => {},
        }}
        authorDisplay={{
          settings: { displayName: "Jamie Cook", showOnPublicRecipes: true },
          onChange: () => {},
          onSave: () => {},
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
          onEmailChange: () => {},
          onAdd: () => {},
          onRemove: () => {},
        }}
        feedbackPreferenceSection={{
          shortcutEnabled: true,
          onShortcutEnabledChange: () => {},
          consent: true,
          consentStatusText: "Analytics consent: Accepted",
          onAcceptConsent: () => {},
          onDeclineConsent: () => {},
          onWithdrawConsent: () => {},
          choicesHref: "/privacy/consent",
        }}
        accountData={{
          onExportData: () => {},
          onDeleteAccount: () => {},
        }}
        nutritionGoals={{
          goals: nutritionGoalsFixture,
          onChange: () => {},
          onSave: () => {},
        }}
        accessTokens={{
          tokens: accessTokensFixture.tokens,
          tokenName: "",
          onTokenNameChange: () => {},
          onCreate: () => {},
          createdSecret: null,
          onDismissSecret: () => {},
          onRevoke: () => {},
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
        onSignOut={() => {}}
        subscription={{
          planLabel: "Plus plan",
          statusText: "Your Plus plan is active and renews on Dec 1, 2026.",
          onManage: () => {},
        }}
        showLess={{
          entries: [
            { sourceRecipeId: "recipe-1", title: "Spicy Tuna Casserole" },
            { sourceRecipeId: "recipe-2", title: "Liver and Onions" },
          ],
          onUndo: () => {},
        }}
        authorDisplay={{
          settings: { displayName: "Jamie Cook", showOnPublicRecipes: true },
          onChange: () => {},
          onSave: () => {},
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
          onEmailChange: () => {},
          onAdd: () => {},
          onRemove: () => {},
        }}
        feedbackPreferenceSection={{
          shortcutEnabled: true,
          onShortcutEnabledChange: () => {},
          consent: true,
          consentStatusText: "Analytics consent: Accepted",
          onAcceptConsent: () => {},
          onDeclineConsent: () => {},
          onWithdrawConsent: () => {},
          choicesHref: "/privacy/consent",
        }}
        transfer={{
          exportPicker: {
            search: "",
            onSearchChange: () => {},
            items: [
              { id: "r1", label: "Skillet Chicken" },
              { id: "r2", label: "First Soup" },
            ],
            selectedIds: ["r1"],
            onToggle: () => {},
            onSelectAll: () => {},
            onClearSelection: () => {},
            onExport: () => {},
            exportLabel: "Export selected (1)",
          },
          onImportPress: () => {},
        }}
        accountData={{
          onExportData: () => {},
          onDeleteAccount: () => {},
        }}
        nutritionGoals={{
          goals: nutritionGoalsFixture,
          onChange: () => {},
          onSave: () => {},
        }}
        accessTokens={{
          tokens: accessTokensFixture.tokens,
          tokenName: "",
          onTokenNameChange: () => {},
          onCreate: () => {},
          createdSecret: null,
          onDismissSecret: () => {},
          onRevoke: () => {},
        }}
        legalLinks={[
          { label: "Terms of Service", href: "/terms" },
          { label: "Privacy Policy", href: "/privacy" },
        ]}
      />
    </>
  ),
};
