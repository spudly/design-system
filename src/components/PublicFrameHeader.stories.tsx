import type { Meta, StoryObj } from "@storybook/react";
import { PublicFrameHeader } from "./PublicFrameHeader.js";

const meta: Meta<typeof PublicFrameHeader> = {
  title: "Components/PublicFrameHeader",
  component: PublicFrameHeader,
};

export default meta;
type Story = StoryObj<typeof PublicFrameHeader>;

export const Default: Story = {
  args: {
    brandLabel: "Eciperay",
    onBrandPress: () => {},
    signInLabel: "Sign in",
    onSignInPress: () => {},
  },
};
