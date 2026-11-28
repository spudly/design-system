import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "../data/Text.js";

import { DashedPlaceholder } from "./DashedPlaceholder.js";

const meta: Meta<typeof DashedPlaceholder> = {
  title: "Widgets/Content/DashedPlaceholder",
  component: DashedPlaceholder,
};

export default meta;
type Story = StoryObj<typeof DashedPlaceholder>;

export const Default: Story = {
  render: () => (
    <DashedPlaceholder>
      <Text variant="hint">Nothing here yet</Text>
    </DashedPlaceholder>
  ),
};
