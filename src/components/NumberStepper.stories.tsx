import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { NumberStepper } from "./NumberStepper.js";

const meta: Meta<typeof NumberStepper> = {
  title: "Components/NumberStepper",
  component: NumberStepper,
  argTypes: {
    label: { control: "text" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof NumberStepper>;

function StepperDemo(props: React.ComponentProps<typeof NumberStepper>) {
  const { value: initialValue, onChange: _ignored, ...rest } = props;
  void _ignored;
  const [value, setValue] = useState(initialValue);
  return <NumberStepper {...rest} value={value} onChange={setValue} />;
}

export const Default: Story = {
  args: { label: "Servings", value: 4, min: 1, max: 12 },
  render: (args) => <StepperDemo {...args} />,
};

export const AtMinBound: Story = {
  args: { label: "Servings", value: 1, min: 1, max: 12 },
  render: (args) => <StepperDemo {...args} />,
};

export const AtMaxBound: Story = {
  args: { label: "Servings", value: 12, min: 1, max: 12 },
  render: (args) => <StepperDemo {...args} />,
};

export const CustomStep: Story = {
  args: { label: "Quantity (packs of 2)", value: 2, min: 0, step: 2 },
  render: (args) => <StepperDemo {...args} />,
};

export const Inline: Story = {
  args: { label: "Servings", value: 4, min: 1, layout: "inline" },
  render: (args) => <StepperDemo {...args} />,
};
