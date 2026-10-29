import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CancelSessionAction } from "./CancelSessionAction.js";
import { Text } from "./Text.js";

const meta: Meta<typeof CancelSessionAction> = {
  title: "Components/CancelSessionAction",
  component: CancelSessionAction,
};

export default meta;
type Story = StoryObj<typeof CancelSessionAction>;

export const Default: Story = {
  render: () => {
    const [presses, setPresses] = useState(0);
    return (
      <>
        <CancelSessionAction
          onPress={() => {
            setPresses((count) => count + 1);
          }}
        />
        <Text>Pressed {presses} times</Text>
      </>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [presses, setPresses] = useState(0);
    return (
      <>
        <CancelSessionAction
          disabled
          onPress={() => {
            setPresses((count) => count + 1);
          }}
        />
        <Text>Pressed {presses} times</Text>
      </>
    );
  },
};
