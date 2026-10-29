import type { Meta, StoryObj } from "@storybook/react";
import { CardGrid } from "./CardGrid.js";
import { FeatureCard } from "./FeatureCard.js";

const meta: Meta<typeof CardGrid> = {
  title: "Components/CardGrid",
  component: CardGrid,
};

export default meta;
type Story = StoryObj<typeof CardGrid>;

export const Default: Story = {
  render: () => (
    <CardGrid>
      <FeatureCard
        feature={{
          title: "Plan the week",
          description: "Drop recipes onto days and let the shopping list build itself.",
        }}
      />
      <FeatureCard
        feature={{
          title: "Import from anywhere",
          description: "Paste a link and get a clean, cookable recipe back.",
        }}
      />
      <FeatureCard
        feature={{
          title: "Cook mode",
          description: "Big type, awake screen, hands-free steps while you cook.",
        }}
      />
    </CardGrid>
  ),
};
