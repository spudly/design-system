import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { TagColorName } from "../themes/tagColors.js";
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

const tagColors: TagColorName[] = ["orange", "green", "indigo", "amber", "pink", "teal"];

function ColorDemo(props: React.ComponentProps<typeof ColorPickerField>) {
  const { value: initialValue, onChange: _ignored, ...rest } = props;
  void _ignored;
  const [value, setValue] = useState<TagColorName | undefined>(initialValue);
  return (
    <ColorPickerField {...rest} {...(value !== undefined ? { value } : {})} onChange={setValue} />
  );
}

export const Default: Story = {
  args: { label: "Tag color", colors: tagColors, value: "orange" },
  render: (args) => <ColorDemo {...args} />,
};

export const WithError: Story = {
  args: {
    label: "Tag color",
    colors: tagColors,
    value: "orange",
    error: "Pick a color for this tag.",
  },
  render: (args) => <ColorDemo {...args} />,
};

export const WithoutLabel: Story = {
  args: { colors: tagColors },
  render: (args) => <ColorDemo {...args} />,
};
