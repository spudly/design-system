import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SelectField } from "./SelectField.js";

const meta: Meta<typeof SelectField> = {
  title: "Components/SelectField",
  component: SelectField,
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SelectField>;

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "evolving", label: "Evolving" },
  { value: "final", label: "Final" },
];

function SelectDemo(props: React.ComponentProps<typeof SelectField>) {
  const { value: initialValue, onValueChange: _ignored, options, ...rest } = props;
  void _ignored;
  const [value, setValue] = useState(initialValue ?? "");
  return (
    <div style={{ maxWidth: 320 }}>
      <SelectField {...rest} options={options} value={value} onValueChange={setValue} />
    </div>
  );
}

export const Default: Story = {
  args: { label: "Recipe status", options: statusOptions, value: "evolving" },
  render: (args) => <SelectDemo {...args} />,
};

export const WithError: Story = {
  args: {
    label: "Recipe status",
    options: statusOptions,
    value: "evolving",
    error: "Please choose a status.",
  },
  render: (args) => <SelectDemo {...args} />,
};

export const CustomPlaceholder: Story = {
  args: {
    label: "Meal type",
    options: [
      { value: "breakfast", label: "Breakfast" },
      { value: "lunch", label: "Lunch" },
      { value: "dinner", label: "Dinner" },
    ],
    value: "",
    placeholder: "Choose a meal…",
  },
  render: (args) => <SelectDemo {...args} />,
};
