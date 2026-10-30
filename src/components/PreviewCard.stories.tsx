import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button.js";
import { PreviewCard } from "./PreviewCard.js";
import { Text } from "./Text.js";

const meta: Meta<typeof PreviewCard> = {
  title: "Components/PreviewCard",
  component: PreviewCard,
};

export default meta;
type Story = StoryObj<typeof PreviewCard>;

export const Default: Story = {
  args: {
    title: "Your recipe",
    children: <Text>Tuscan Chicken — 4 servings, 15 min prep, 30 min cook.</Text>,
    actions: <Button variant="primary">Looks good</Button>,
  },
};

export const NoTitle: Story = {
  args: {
    children: <Text>A preview that names itself needs no title.</Text>,
  },
};

export const NoActions: Story = {
  args: {
    title: "Draft preview",
    children: <Text>The confirm controls live outside this card.</Text>,
  },
};
