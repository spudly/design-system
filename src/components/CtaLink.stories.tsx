import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { CtaLink } from "./CtaLink.js";

const meta: Meta<typeof CtaLink> = {
  title: "Components/CtaLink",
  component: CtaLink,
};

export default meta;
type Story = StoryObj<typeof CtaLink>;

export const Variants: Story = {
  render: () => (
    <YStack gap="$3" alignItems="flex-start">
      <CtaLink cta={{ label: "Start cooking — it's free", href: "/signup" }} variant="primary" />
      <CtaLink cta={{ label: "Browse public recipes", href: "/discover" }} variant="secondary" />
    </YStack>
  ),
};
