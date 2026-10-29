import type { Meta, StoryObj } from "@storybook/react";
import { FeatureCard } from "./FeatureCard.js";

const meta: Meta<typeof FeatureCard> = {
  title: "Components/FeatureCard",
  component: FeatureCard,
};

export default meta;
type Story = StoryObj<typeof FeatureCard>;

export const Default: Story = {
  args: {
    feature: {
      title: "Plan the week",
      description: "Drop recipes onto days and let the shopping list build itself.",
    },
  },
};
