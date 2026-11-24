import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./actions/Button.js";
import { EndRow } from "./EndRow.js";

const meta: Meta<typeof EndRow> = {
  title: "Widgets/EndRow",
  component: EndRow,
};

export default meta;
type Story = StoryObj<typeof EndRow>;

export const Default: Story = {
  render: () => (
    <EndRow>
      <Button variant="primary" onPress={() => {}}>
        Action
      </Button>
    </EndRow>
  ),
};
