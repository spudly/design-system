import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChecklistRow } from "./ChecklistRow.js";

const meta: Meta<typeof ChecklistRow> = {
  title: "Components/ChecklistRow",
  component: ChecklistRow,
  argTypes: {
    label: { control: "text" },
    metadata: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ChecklistRow>;

function RowDemo(props: React.ComponentProps<typeof ChecklistRow>) {
  const { checked: initialChecked, onCheckedChange: _ignored, ...rest } = props;
  void _ignored;
  const [checked, setChecked] = useState(initialChecked);
  return <ChecklistRow {...rest} checked={checked} onCheckedChange={setChecked} />;
}

export const Unchecked: Story = {
  args: {
    label: "1 whole chicken (3–4 lb), patted dry",
    metadata: "Meat & seafood",
    checked: false,
  },
  render: (args) => <RowDemo {...args} />,
};

export const Checked: Story = {
  args: {
    label: "2 tbsp olive oil",
    metadata: "Pantry",
    checked: true,
  },
  render: (args) => <RowDemo {...args} />,
};

export const WithoutMetadata: Story = {
  args: {
    label: "Salt & black pepper, to taste",
    checked: false,
  },
  render: (args) => <RowDemo {...args} />,
};
