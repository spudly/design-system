import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { StarRatingInput } from "./StarRatingInput.js";

const meta: Meta<typeof StarRatingInput> = {
  title: "Components/StarRatingInput",
  component: StarRatingInput,
  argTypes: {
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof StarRatingInput>;

function RatingDemo(props: React.ComponentProps<typeof StarRatingInput>) {
  const { value: initialValue, onChange: _ignored, ...rest } = props;
  void _ignored;
  const [value, setValue] = useState(initialValue);
  return <StarRatingInput {...rest} value={value} onChange={setValue} />;
}

export const Default: Story = {
  args: { label: "Rate this recipe", value: 3 },
  render: (args) => <RatingDemo {...args} />,
};

export const Unrated: Story = {
  args: { label: "Rate this recipe", value: 0 },
  render: (args) => <RatingDemo {...args} />,
};

export const WithoutLabel: Story = {
  args: { value: 5 },
  render: (args) => <RatingDemo {...args} />,
};
