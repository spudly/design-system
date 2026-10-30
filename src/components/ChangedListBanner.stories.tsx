import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ChangedListBanner } from "./ChangedListBanner.js";
import { Text } from "./Text.js";

const meta: Meta<typeof ChangedListBanner> = {
  title: "Components/ChangedListBanner",
  component: ChangedListBanner,
};

export default meta;
type Story = StoryObj<typeof ChangedListBanner>;

function BannerDemo() {
  const [count, setCount] = useState(0);
  return (
    <YStack maxWidth={430} gap={8}>
      <ChangedListBanner
        label="Ingredients differ from the parent version (2 changed)."
        onRevert={() => {
          setCount((current) => current + 1);
        }}
      />
      <Text variant="hint">{`Reverted ${count} times`}</Text>
    </YStack>
  );
}

export const Default: Story = {
  render: () => <BannerDemo />,
};

export const WithoutRevert: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <ChangedListBanner label="Instructions differ from the parent version (1 changed)." />
    </YStack>
  ),
};
