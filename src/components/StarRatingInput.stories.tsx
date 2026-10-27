import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { StarRatingInput } from "./StarRatingInput.js";

const meta: Meta<typeof StarRatingInput> = {
  title: "Components/StarRatingInput",
  component: StarRatingInput,
  argTypes: {
    label: { control: "text" },
    tone: { control: "select", options: ["default", "dark"] },
    allowClear: { control: "boolean" },
    readOnly: { control: "boolean" },
    disabled: { control: "boolean" },
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

export const DarkTone: Story = {
  args: { label: "Rate this recipe", value: 3, tone: "dark" },
  render: (args) => (
    <YStack
      backgroundColor={tokens.colors.gray.gray10}
      padding={tokens.spacing[3]}
      borderRadius={tokens.radii.md}
    >
      <RatingDemo {...args} />
    </YStack>
  ),
};

export const AllowClear: Story = {
  args: { label: "Tap the current rating to clear it", value: 3, allowClear: true },
  render: (args) => <RatingDemo {...args} />,
};

export const ReadOnly: Story = {
  args: { label: "Your rating", value: 4, readOnly: true },
  render: (args) => <RatingDemo {...args} />,
};

export const Disabled: Story = {
  args: { label: "Rate this recipe", value: 2, disabled: true },
  render: (args) => <RatingDemo {...args} />,
};
