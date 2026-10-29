import type { Meta, StoryObj } from "@storybook/react";
import { PublicFrameFooter } from "./PublicFrameFooter.js";

const meta: Meta<typeof PublicFrameFooter> = {
  title: "Components/PublicFrameFooter",
  component: PublicFrameFooter,
};

export default meta;
type Story = StoryObj<typeof PublicFrameFooter>;

export const Default: Story = {
  args: {
    note: "Recipes shared on Eciperay may be viewed without an account.",
    privacyLabel: "Privacy Policy",
    onPrivacyPress: () => {},
    termsLabel: "Terms of Service",
    onTermsPress: () => {},
  },
};
