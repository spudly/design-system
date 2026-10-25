import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, YStack } from "tamagui";
import { AccessTokensPanel } from "../components/AccessTokensPanel.js";
import { CheckboxField } from "../components/CheckboxField.js";
import { NutritionGoalsForm } from "../components/NutritionGoalsForm.js";
import { TextLink } from "../components/TextLink.js";
import { accessTokensFixture, nutritionGoalsFixture } from "./fixtures.js";
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
        email="cook@example.com"
        onSignOut={() => undefined}
        onManageTagsPress={() => undefined}
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
