import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { PublicFrameFooter } from "./PublicFrameFooter.js";
import { PublicFrameHeader } from "./PublicFrameHeader.js";
import { PublicFrameLayout } from "./PublicFrameLayout.js";
import { Text } from "./Text.js";

const meta: Meta<typeof PublicFrameLayout> = {
  title: "Components/PublicFrameLayout",
  component: PublicFrameLayout,
};

export default meta;
type Story = StoryObj<typeof PublicFrameLayout>;

export const Default: Story = {
  render: () => (
    <YStack height={480}>
      <PublicFrameLayout
        header={
          <PublicFrameHeader
            brandLabel="Eciperay"
            brandHref="/"
            signInLabel="Sign in"
            signInHref="/sign-in"
          />
        }
        footer={
          <PublicFrameFooter
            note="Recipes shared on Eciperay may be viewed without an account."
            privacyLabel="Privacy Policy"
            privacyHref="/privacy"
            termsLabel="Terms of Service"
            termsHref="/terms"
          />
        }
      >
        <YStack padding="$6" gap="$3">
          <Text variant="heading">A public page</Text>
          <Text>
            The header band sits above and the footer band below the wide centered column this
            content renders into; the column caps at 768px and centers on wider viewports.
          </Text>
        </YStack>
      </PublicFrameLayout>
    </YStack>
  ),
};
