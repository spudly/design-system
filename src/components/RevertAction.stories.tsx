import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { RevertAction } from "./RevertAction.js";
import { Text } from "./Text.js";

const meta: Meta<typeof RevertAction> = {
  title: "Components/RevertAction",
  component: RevertAction,
};

export default meta;
type Story = StoryObj<typeof RevertAction>;

function RevertDemo() {
  const [count, setCount] = useState(0);
  return (
    <YStack maxWidth={430} gap={8}>
      <RevertAction
        label="Chicken, plain"
        onPress={() => {
          setCount((current) => current + 1);
        }}
      />
      <Text variant="hint">{`Reverted ${count} times`}</Text>
    </YStack>
  );
}

export const Default: Story = {
  render: () => <RevertDemo />,
};
