import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Slider, type SliderProps } from "./Slider.js";

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  argTypes: {
    label: { control: "text" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

function SliderDemo(props: Partial<SliderProps>) {
  const [value, setValue] = useState(props.value ?? 50);
  // Keep the demo in sync when the Storybook controls change the value arg
  // after mount; dragging only updates the local state, so it never fights
  // this effect (the arg itself does not change while dragging).
  useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value);
    }
  }, [props.value]);
  return <Slider {...props} value={value} onValueChange={setValue} />;
}

export const Default: Story = {
  args: { label: "Volume", value: 40 },
  render: (args) => <SliderDemo {...args} />,
};

/** The shuoink/ui spec's story, in DS form: a 1–10 range whose tick
 * labels spell out every step under the track. */
export const Ticks: Story = {
  args: {
    label: "Rating",
    min: 1,
    max: 10,
    value: 5,
    ticks: [
      { value: 1, label: "One" },
      { value: 2, label: "Two" },
      { value: 3, label: "Three" },
      { value: 4, label: "Four" },
      { value: 5, label: "Five" },
      { value: 6, label: "Six" },
      { value: 7, label: "Seven" },
      { value: 8, label: "Eight" },
      { value: 9, label: "Nine" },
      { value: 10, label: "Ten" },
    ],
  },
  render: (args) => <SliderDemo {...args} />,
};

/** A fractional step over a short range, with sparse tick labels. */
export const CustomRange: Story = {
  args: {
    label: "Portion size",
    min: 0,
    max: 5,
    step: 0.5,
    value: 2.5,
    ticks: [
      { value: 0, label: "0" },
      { value: 2.5, label: "2.5" },
      { value: 5, label: "5" },
    ],
  },
  render: (args) => <SliderDemo {...args} />,
};

export const WithError: Story = {
  args: { label: "Spice level", value: 0, error: "Choose a level before continuing." },
  render: (args) => <SliderDemo {...args} />,
};

export const Disabled: Story = {
  args: { label: "Volume", value: 60, disabled: true },
  render: (args) => <SliderDemo {...args} />,
};
