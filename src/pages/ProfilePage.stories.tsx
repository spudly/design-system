import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, YStack } from "tamagui";
import { AccessTokensPanel } from "../views/AccessTokensPanel.js";
import { CheckboxField } from "../views/CheckboxField.js";
import { NutritionGoalsForm } from "../views/NutritionGoalsForm.js";
import { TextLink } from "../components/TextLink.js";
import { accessTokensFixture, nutritionGoalsFixture, eciperayFooterFixture } from "./fixtures.js";
import { ProfilePage } from "./ProfilePage.js";

const meta: Meta<typeof ProfilePage> = {
  title: "Pages/Eciperay/ProfilePage",
  component: ProfilePage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ProfilePage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

/**
 * The slots are host-rendered: the nutrition goals and access
 * tokens sections are the DS section components fed fixture
 * data here (their app containers feed them live data), the
 * feedback preference is the app's container (a DS
 * CheckboxField stands in for its shape), and the legal links
 * are the app's LegalLinks.
 */
export const WithSections: Story = {
  render: () => (
    <Viewport>
      <ProfilePage
        footer={eciperayFooterFixture}
        email="cook@example.com"
        onSignOut={() => undefined}
        tagsHref="/profile/tags"
        sectionsBeforeFeedback={
          <YStack gap="$4">
            <NutritionGoalsForm
              goals={nutritionGoalsFixture}
              onChange={() => undefined}
              onSave={() => undefined}
            />
            <AccessTokensPanel
              tokens={accessTokensFixture.tokens}
              tokenName=""
              onTokenNameChange={() => undefined}
              onCreate={() => undefined}
              createdSecret={null}
              onDismissSecret={() => undefined}
              onRevoke={() => undefined}
            />
          </YStack>
        }
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
    </Viewport>
  ),
};

export const WithCoverageSections: Story = {
  // The #438 Part 3 typed sections: subscription,
  // feedback-preference, transfer, and account-data render from
  // their data props (the migrated form of the slot sections
  // WithSections exercises with stand-ins).
  render: () => (
    <Viewport>
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
        legalLinks={
          <YStack gap="$2">
            <TextLink onPress={() => undefined}>Terms of Service</TextLink>
            <TextLink onPress={() => undefined}>Privacy Policy</TextLink>
          </YStack>
        }
      />
    </Viewport>
  ),
};
