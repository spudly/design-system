import type { Meta, StoryObj } from "@storybook/react";
import { XStack } from "tamagui";
import { ActionBar } from "./ActionBar.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

const meta: Meta<typeof ActionBar> = {
  title: "Components/ActionBar",
  component: ActionBar,
  argTypes: {
    placement: {
      control: "select",
      options: ["top", "bottom"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActionBar>;

// The bar is absolutely positioned, so stories render it inside a
// relatively positioned frame standing in for a screen.
function ScreenFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        height: 360,
        maxWidth: 480,
        border: "1px dashed #ccc",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: 16 }}>
        <Text variant="body">Screen content scrolls beneath the pinned bar.</Text>
      </div>
      {children}
    </div>
  );
}

export const Bottom: Story = {
  render: (args) => (
    <ScreenFrame>
      <ActionBar {...args} placement="bottom">
        <XStack gap={12} justifyContent="flex-end">
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Save changes</Button>
        </XStack>
      </ActionBar>
    </ScreenFrame>
  ),
};

export const Top: Story = {
  render: (args) => (
    <ScreenFrame>
      <ActionBar {...args} placement="top">
        <XStack gap={12} justifyContent="flex-end">
          <Button variant="ghost" size="sm">
            Dismiss
          </Button>
          <Button variant="primary" size="sm">
            Accept
          </Button>
        </XStack>
      </ActionBar>
    </ScreenFrame>
  ),
};

export const WithMessage: Story = {
  render: (args) => (
    <ScreenFrame>
      <ActionBar {...args} placement="bottom">
        <Text variant="body">We use cookies to improve Eciperay.</Text>
        <XStack gap={12} justifyContent="flex-end">
          <Button variant="secondary">Decline</Button>
          <Button variant="primary">Accept</Button>
        </XStack>
      </ActionBar>
    </ScreenFrame>
  ),
};
