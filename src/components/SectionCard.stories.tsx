import type { Meta, StoryObj } from "@storybook/react";
import { SectionCard } from "./SectionCard.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

const meta: Meta<typeof SectionCard> = {
  title: "Components/SectionCard",
  component: SectionCard,
  argTypes: {
    title: { control: "text" },
    elevated: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SectionCard>;

export const Default: Story = {
  args: { title: "API access tokens" },
  render: (args) => (
    <SectionCard {...args} style={{ maxWidth: 480 }}>
      <Text variant="body">
        Tokens let scripts and integrations act on your behalf. Keep them secret.
      </Text>
    </SectionCard>
  ),
};

export const WithAction: Story = {
  args: { title: "Profile" },
  render: (args) => (
    <SectionCard
      {...args}
      style={{ maxWidth: 480 }}
      action={
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      }
    >
      <Text variant="body">Stephen</Text>
      <Text variant="hint">stephen@example.com</Text>
    </SectionCard>
  ),
};

export const Elevated: Story = {
  args: { title: "Nutrition goals", elevated: true },
  render: (args) => (
    <SectionCard {...args} style={{ maxWidth: 480 }}>
      <Text variant="body">Daily calorie target: 2,200</Text>
    </SectionCard>
  ),
};
