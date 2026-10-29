import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { DetailRow } from "./DetailRow.js";

const meta: Meta<typeof DetailRow> = {
  title: "Components/DetailRow",
  component: DetailRow,
};

export default meta;
type Story = StoryObj<typeof DetailRow>;

export const Default: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <DetailRow {...args} />
    </YStack>
  ),
  args: {
    label: "Calories",
    value: "850 / 2,000 · On track",
  },
};

export const Stacked: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <DetailRow label="Calories" value="850 / 2,000 · On track" />
      <DetailRow label="Protein" value="62 / 120 g · Behind" />
      <DetailRow label="Fiber" value="18 / 30 g · On track" />
    </YStack>
  ),
};
