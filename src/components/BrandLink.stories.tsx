import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { BrandLink } from "./BrandLink.js";
import { Text } from "./Text.js";

const meta: Meta<typeof BrandLink> = {
  title: "Components/BrandLink",
  component: BrandLink,
};

export default meta;
type Story = StoryObj<typeof BrandLink>;

/** The press counter makes activation observable: clicking the
 * wordmark — or focusing it and pressing Enter — increments it,
 * which is what the manual check verifies. */
function PressCounterDemo() {
  const [count, setCount] = useState(0);
  return (
    <YStack gap="$2">
      <BrandLink
        label="Eciperay"
        onPress={() => {
          setCount((current) => current + 1);
        }}
      />
      <Text>Pressed {count} times</Text>
    </YStack>
  );
}

export const Default: Story = {
  render: () => <PressCounterDemo />,
};
