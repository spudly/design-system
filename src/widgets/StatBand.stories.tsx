import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { StatBand } from "./StatBand.js";
import { StatCard } from "./StatCard.js";

const meta: Meta<typeof StatBand> = {
  title: "Widgets/StatBand",
  component: StatBand,
};

export default meta;
type Story = StoryObj<typeof StatBand>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <StatBand>
        <StatCard label="Servings" value="4" />
        <StatCard label="Prep" value="15 min" />
        <StatCard label="Cook" value="30 min" />
      </StatBand>
    </YStack>
  ),
};

export const TwoStats: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <StatBand>
        <StatCard label="Servings" value="4" />
        <StatCard label="Cook" value="30 min" />
      </StatBand>
    </YStack>
  ),
};

export const Loading: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <StatBand loading>
        <StatCard label="Servings" value="4" />
        <StatCard label="Prep" value="15 min" />
        <StatCard label="Cook" value="30 min" />
      </StatBand>
    </YStack>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430}>
      <StatBand>
        <StatCard label="Servings" value="4" />
        <StatCard label="Prep" value="15 min" />
        <StatCard label="Cook" value="30 min" />
      </StatBand>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <StatBand loading>
          <StatCard label="Servings" value="4" />
          <StatCard label="Prep" value="15 min" />
          <StatCard label="Cook" value="30 min" />
        </StatBand>
      </YStack>
    </YStack>
  ),
};
