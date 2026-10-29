import type { Meta, StoryObj } from "@storybook/react";
import { BrandLink } from "./BrandLink.js";

const meta: Meta<typeof BrandLink> = {
  title: "Components/BrandLink",
  component: BrandLink,
};

export default meta;
type Story = StoryObj<typeof BrandLink>;

/** The wordmark is a real link: it renders as an anchor carrying
 * the home href — "/" here, the stand-in for the host's home
 * route — which is what the manual check verifies in the DOM. */
export const Default: Story = {
  args: {
    label: "Eciperay",
    href: "/",
  },
};
