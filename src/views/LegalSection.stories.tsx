import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { LegalSection } from "./LegalSection.js";
import { TextLink } from "../widgets/TextLink.js";

const meta: Meta<typeof LegalSection> = {
  title: "Views/LegalSection",
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

export const Loading: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LegalSection title="Legal" loading>
        <TextLink href="#/privacy">Privacy Policy</TextLink>
        <TextLink href="#/terms">Terms of Service</TextLink>
      </LegalSection>
    </YStack>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430}>
      <LegalSection title="Legal">
        <TextLink href="#/privacy">Privacy Policy</TextLink>
        <TextLink href="#/terms">Terms of Service</TextLink>
      </LegalSection>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <LegalSection title="Legal" loading>
          <TextLink href="#/privacy">Privacy Policy</TextLink>
          <TextLink href="#/terms">Terms of Service</TextLink>
        </LegalSection>
      </YStack>
    </YStack>
  ),
};
