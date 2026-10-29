import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { StatBand } from "./StatBand.js";
import { StatCard } from "./StatCard.js";

const meta: Meta<typeof StatBand> = {
  title: "Components/StatBand",
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
