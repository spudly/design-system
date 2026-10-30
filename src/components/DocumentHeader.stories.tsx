import type { Meta, StoryObj } from "@storybook/react";
import { DocumentHeader } from "./DocumentHeader.js";

const meta: Meta<typeof DocumentHeader> = {
  title: "Components/DocumentHeader",
  component: DocumentHeader,
};

export default meta;
type Story = StoryObj<typeof DocumentHeader>;

export const Default: Story = {
  args: {
    brandLabel: "Eciperay",
    brandHref: "/",
    signInLabel: "Sign in",
    signInHref: "/login",
  },
};
