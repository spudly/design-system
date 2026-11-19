import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { CheckboxField } from "../views/CheckboxField.js";
import { TextLink } from "../widgets/TextLink.js";
import { accessTokensFixture, nutritionGoalsFixture, eciperayFooterFixture } from "./fixtures.js";
import { ProfilePage } from "./ProfilePage.js";

const meta: Meta<typeof ProfilePage> = {
  title: "Pages/Eciperay/ProfilePage",
  component: ProfilePage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ProfilePage>;

/**
 * The sections are data-driven (#685): the nutrition goals and
 * access tokens sections render from their data props (their
 * app containers feed them live data), the feedback preference
 * is the app's container (a DS CheckboxField stands in for its
 * shape), and the legal links are the app's LegalLinks.
 */
export const WithSections: Story = {
  render: () => (
    <>
      <ProfilePage
        footer={eciperayFooterFixture}
        email="cook@example.com"
        onSignOut={() => undefined}
        tagsHref="/profile/tags"
        nutritionGoals={{
          goals: nutritionGoalsFixture,
          onChange: () => undefined,
          onSave: () => undefined,
        }}
        accessTokens={{
          tokens: accessTokensFixture.tokens,
          tokenName: "",
          onTokenNameChange: () => undefined,
          onCreate: () => undefined,
          createdSecret: null,
          onDismissSecret: () => undefined,
          onRevoke: () => undefined,
        }}
        feedbackPreference={
          <CheckboxField
            label="Send product feedback prompts"
            checked
            onCheckedChange={() => undefined}
          />
        }
        legalLinks={
          <YStack gap="$2">
            <TextLink onPress={() => undefined}>Terms of Service</TextLink>
            <TextLink onPress={() => undefined}>Privacy Policy</TextLink>
          </YStack>
        }
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
        onSignOut={() => undefined}
        subscription={{
          planLabel: "Plus plan",
          statusText: "Your Plus plan is active and renews on Dec 1, 2026.",
          onManage: () => undefined,
        }}
        feedbackPreferenceSection={{
          shortcutEnabled: true,
          onShortcutEnabledChange: () => undefined,
          consent: true,
          consentStatusText: "Analytics consent: Accepted",
          onAcceptConsent: () => undefined,
          onDeclineConsent: () => undefined,
          onWithdrawConsent: () => undefined,
          choicesHref: "/privacy/consent",
        }}
        transfer={{
          exportPicker: {
            search: "",
            onSearchChange: () => undefined,
            items: [
              { id: "r1", label: "Skillet Chicken" },
              { id: "r2", label: "First Soup" },
            ],
            selectedIds: ["r1"],
            onToggle: () => undefined,
            onSelectAll: () => undefined,
            onClearSelection: () => undefined,
            onExport: () => undefined,
            exportLabel: "Export selected (1)",
          },
          onImportPress: () => undefined,
        }}
        accountData={{
          onExportData: () => undefined,
          onDeleteAccount: () => undefined,
        }}
        nutritionGoals={{
          goals: nutritionGoalsFixture,
          onChange: () => undefined,
          onSave: () => undefined,
        }}
        accessTokens={{
          tokens: accessTokensFixture.tokens,
          tokenName: "",
          onTokenNameChange: () => undefined,
          onCreate: () => undefined,
          createdSecret: null,
          onDismissSecret: () => undefined,
          onRevoke: () => undefined,
        }}
        legalLinks={
          <YStack gap="$2">
            <TextLink onPress={() => undefined}>Terms of Service</TextLink>
            <TextLink onPress={() => undefined}>Privacy Policy</TextLink>
          </YStack>
        }
      />
    </>
  ),
};
