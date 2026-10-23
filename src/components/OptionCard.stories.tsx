import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { OptionCard } from "./OptionCard.js";

const meta: Meta<typeof OptionCard> = {
  title: "Components/OptionCard",
  component: OptionCard,
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof OptionCard>;

export const WithDescription: Story = {
  args: {
    title: "Manual entry",
    description: "Type or paste a recipe by hand",
    onPress: () => {},
  },
  render: (args) => (
    <YStack maxWidth={480}>
      <OptionCard {...args} />
    </YStack>
  ),
};

export const TitleOnly: Story = {
  args: { title: "Import from URL", onPress: () => {} },
  render: (args) => (
    <YStack maxWidth={480}>
      <OptionCard {...args} />
    </YStack>
  ),
};

export const Multiple: Story = {
  render: () => (
    <YStack maxWidth={480} gap={12}>
      <OptionCard
        title="Manual entry"
        description="Type or paste a recipe by hand"
        onPress={() => {}}
      />
      <OptionCard
        title="Import from URL"
        description="Pull a recipe from a website link"
        onPress={() => {}}
      />
      <OptionCard
        title="Import from image"
        description="Extract a recipe from a photo"
        onPress={() => {}}
      />
    </YStack>
  ),
};
