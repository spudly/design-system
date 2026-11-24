import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../data/Text.js";
import { CenteredRow } from "./CenteredRow.js";

const meta: Meta<typeof CenteredRow> = {
  title: "Widgets/Layout & Structure/CenteredRow",
  component: CenteredRow,
};

export default meta;
type Story = StoryObj<typeof CenteredRow>;

export const Default: Story = {
  render: () => (
    <CenteredRow>
      <Text>First item</Text>
      <Text>Second item</Text>
    </CenteredRow>
  ),
};
