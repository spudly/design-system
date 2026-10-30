import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { LegalSection } from "./LegalSection.js";
import { TextLink } from "./TextLink.js";

const meta: Meta<typeof LegalSection> = {
  title: "Components/LegalSection",
  component: LegalSection,
};

export default meta;
type Story = StoryObj<typeof LegalSection>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LegalSection title="Legal">
        <TextLink href="#/privacy">Privacy Policy</TextLink>
        <TextLink href="#/terms">Terms of Service</TextLink>
      </LegalSection>
    </YStack>
  ),
};
