import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from "./StatCard.js";
import { StatRow } from "./StatRow.js";

const meta: Meta<typeof StatRow> = {
  title: "Components/StatRow",
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
