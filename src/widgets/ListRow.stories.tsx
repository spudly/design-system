import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ListRow } from "./ListRow.js";
import { Text } from "./Text.js";

const meta: Meta<typeof ListRow> = {
  title: "Widgets/ListRow",
  component: ListRow,
};

export default meta;
type Story = StoryObj<typeof ListRow>;

/**
 * Press readout: the "Row presses: N" line under the row
 * counts row presses, so pointer and Enter/Space activation
 * are observable in Storybook.
 */
function PrefixedDemo() {
  const [presses, setPresses] = useState(0);
  return (
    <YStack maxWidth={430} gap="$2">
      <ListRow
        prefix="Meal · "
        title="Taco Tuesday"
        subtitle="Serves 4 · 2,150 cal"
        onPress={() => setPresses((count) => count + 1)}
      />
      <Text>Row presses: {presses}</Text>
    </YStack>
  );
}

export const Prefixed: Story = {
  render: () => <PrefixedDemo />,
};

export const Plain: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <ListRow {...args} />
    </YStack>
  ),
  args: {
    title: "Garlic cream chicken",
    onPress: () => {},
  },
};

export const Disabled: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <ListRow {...args} />
    </YStack>
  ),
  args: {
    prefix: "Recipe · ",
    title: "Shared stew",
    titleSuffix: " (unavailable)",
    subtitle: "Serves 6",
    isDisabled: true,
    onPress: () => {},
  },
};

export const Loading: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <ListRow {...args} />
    </YStack>
  ),
  args: {
    prefix: "Meal · ",
    title: "Taco Tuesday",
    subtitle: "Serves 4 · 2,150 cal",
    onPress: () => {},
    loading: true,
  },
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430}>
      <ListRow
        prefix="Meal · "
        title="Taco Tuesday"
        subtitle="Serves 4 · 2,150 cal"
        onPress={() => {}}
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
        <ListRow
          prefix="Meal · "
          title="Taco Tuesday"
          subtitle="Serves 4 · 2,150 cal"
          onPress={() => {}}
          loading
        />
      </YStack>
    </YStack>
  ),
};
