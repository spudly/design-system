import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ColorPickerField } from "./ColorPickerField.js";

const meta: Meta<typeof ColorPickerField> = {
  title: "Components/ColorPickerField",
  component: ColorPickerField,
  argTypes: {
    label: { control: "text" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ColorPickerField>;

const tagColors = ["#c2410c", "#15803d", "#4f46e5", "#b45309", "#be123c", "#0f766e"];

function ColorDemo(props: React.ComponentProps<typeof ColorPickerField>) {
  const { value: initialValue, onChange: _ignored, ...rest } = props;
  void _ignored;
  const [value, setValue] = useState(initialValue ?? "");
  return <ColorPickerField {...rest} value={value} onChange={setValue} />;
}

export const Default: Story = {
  args: { label: "Tag color", colors: tagColors, value: "#c2410c" },
  render: (args) => <ColorDemo {...args} />,
};

export const WithError: Story = {
  args: {
    label: "Tag color",
    colors: tagColors,
    value: "#c2410c",
    error: "Pick a color for this tag.",
  },
  render: (args) => <ColorDemo {...args} />,
};

export const WithoutLabel: Story = {
  args: { colors: tagColors, value: "" },
  render: (args) => <ColorDemo {...args} />,
};
