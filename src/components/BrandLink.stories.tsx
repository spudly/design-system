import type { Meta, StoryObj } from "@storybook/react";
import { BrandLink } from "./BrandLink.js";

const meta: Meta<typeof BrandLink> = {
  title: "Components/BrandLink",
  component: BrandLink,
};

export default meta;
type Story = StoryObj<typeof BrandLink>;

export const Default: Story = {
  args: {
    label: "Eciperay",
    onPress: () => {},
  },
};
