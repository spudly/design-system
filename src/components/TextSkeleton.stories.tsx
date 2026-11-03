import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { TextSkeleton } from "./TextSkeleton.js";

const meta: Meta<typeof TextSkeleton> = {
  title: "Components/TextSkeleton",
  component: TextSkeleton,
  argTypes: {
    lines: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof TextSkeleton>;

export const SingleLine: Story = {
  args: { lines: 1 },
  decorators: [
    (Story) => (
      <View width={280}>
        <Story />
      </View>
    ),
  ],
};

export const Paragraph: Story = {
  args: { lines: 3 },
  decorators: [
    (Story) => (
      <View width={280}>
        <Story />
      </View>
    ),
  ],
};
