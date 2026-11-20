import type { Meta, StoryObj } from "@storybook/react";
import { RadioSkeletonRow } from "./RadioSkeletonRow.js";

const meta: Meta<typeof RadioSkeletonRow> = {
  title: "Widgets/RadioSkeletonRow",
  component: RadioSkeletonRow,
};

export default meta;
type Story = StoryObj<typeof RadioSkeletonRow>;

export const Default: Story = {
  render: () => <RadioSkeletonRow />,
};

export const WithDescription: Story = {
  render: () => <RadioSkeletonRow description />,
};
