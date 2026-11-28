import type { Meta, StoryObj } from "@storybook/react";

import { CheckboxSkeletonRow } from "./CheckboxSkeletonRow.js";

const meta: Meta<typeof CheckboxSkeletonRow> = {
  title: "Widgets/Feedback & Loading/CheckboxSkeletonRow",
  component: CheckboxSkeletonRow,
};

export default meta;
type Story = StoryObj<typeof CheckboxSkeletonRow>;

export const Default: Story = {
  render: () => <CheckboxSkeletonRow />,
};

export const WithDescription: Story = {
  render: () => <CheckboxSkeletonRow description />,
};
