import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ChangedListBanner } from "./ChangedListBanner.js";
import { Text } from "../widgets/Text.js";

const meta: Meta<typeof ChangedListBanner> = {
  title: "Views/ChangedListBanner",
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

export const Loading: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <ChangedListBanner
        label="Ingredients differ from the parent version (2 changed)."
        onRevert={() => {}}
        loading
      />
    </YStack>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430}>
      <ChangedListBanner
        label="Ingredients differ from the parent version (2 changed)."
        onRevert={() => {}}
      />
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <ChangedListBanner
          label="Ingredients differ from the parent version (2 changed)."
          onRevert={() => {}}
          loading
        />
      </YStack>
    </YStack>
  ),
};
