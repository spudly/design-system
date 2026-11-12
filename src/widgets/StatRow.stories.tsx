import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { StatCard } from "./StatCard.js";
import { StatRow } from "./StatRow.js";

const meta: Meta<typeof StatRow> = {
  title: "Widgets/StatRow",
  component: StatRow,
};

export default meta;
type Story = StoryObj<typeof StatRow>;

export const Default: Story = {
  render: () => (
    <StatRow>
      <StatCard label="Servings" value="4" />
      <StatCard label="Prep" value="15m" />
      <StatCard label="Cook" value="30m" />
    </StatRow>
  ),
};

export const Loading: Story = {
  render: () => (
    <StatRow loading>
      <StatCard label="Servings" value="4" />
      <StatCard label="Prep" value="15m" />
      <StatCard label="Cook" value="30m" />
    </StatRow>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative">
      <StatRow>
        <StatCard label="Servings" value="4" />
        <StatCard label="Prep" value="15m" />
        <StatCard label="Cook" value="30m" />
      </StatRow>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <StatRow loading>
          <StatCard label="Servings" value="4" />
          <StatCard label="Prep" value="15m" />
          <StatCard label="Cook" value="30m" />
        </StatRow>
      </YStack>
    </YStack>
  ),
};
