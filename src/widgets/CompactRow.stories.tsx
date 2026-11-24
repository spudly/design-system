import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./actions/Button.js";
import { CompactRow } from "./CompactRow.js";

const meta: Meta<typeof CompactRow> = {
  title: "Widgets/CompactRow",
  component: CompactRow,
};

export default meta;
type Story = StoryObj<typeof CompactRow>;

export const Default: Story = {
  render: () => (
    <CompactRow>
      <Button variant="primary" onPress={() => {}}>
        Action
      </Button>
    </CompactRow>
  ),
};
