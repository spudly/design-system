import type { Meta, StoryObj } from "@storybook/react";
import { DocumentFooter } from "./DocumentFooter.js";

const meta: Meta<typeof DocumentFooter> = {
  title: "Components/DocumentFooter",
  component: DocumentFooter,
};

export default meta;
type Story = StoryObj<typeof DocumentFooter>;

export const Default: Story = {
  args: {
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
};
