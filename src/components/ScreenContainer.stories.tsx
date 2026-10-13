import type { Meta, StoryObj } from "@storybook/react";
import { ScreenContainer } from "./ScreenContainer.js";
import { Card } from "./Card.js";
import { Text } from "./Text.js";

const meta: Meta<typeof ScreenContainer> = {
  title: "Components/ScreenContainer",
  component: ScreenContainer,
  argTypes: {
    scrollable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ScreenContainer>;

export const Scrollable: Story = {
  render: (args) => (
    <div style={{ height: 400, border: "1px dashed #ccc" }}>
      <ScreenContainer {...args}>
        <Text variant="heading">My verses</Text>
        <Card>
          <Text variant="body">Psalm 23:1</Text>
        </Card>
        <Card>
          <Text variant="body">Philippians 4:6–7</Text>
        </Card>
        <Card>
          <Text variant="body">Isaiah 40:31</Text>
        </Card>
        <Card>
          <Text variant="body">John 3:16</Text>
        </Card>
      </ScreenContainer>
    </div>
  ),
};

export const NotScrollable: Story = {
  render: (args) => (
    <ScreenContainer {...args} scrollable={false}>
      <Text variant="heading">Sign in</Text>
      <Text variant="hint">Fixed-height content, no scroll view.</Text>
    </ScreenContainer>
  ),
};
