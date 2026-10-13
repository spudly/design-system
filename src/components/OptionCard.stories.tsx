import type { Meta, StoryObj } from "@storybook/react";
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
    <div style={{ maxWidth: 480 }}>
      <OptionCard {...args} />
    </div>
  ),
};

export const TitleOnly: Story = {
  args: { title: "Import from URL", onPress: () => {} },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <OptionCard {...args} />
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 12 }}>
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
    </div>
  ),
};
