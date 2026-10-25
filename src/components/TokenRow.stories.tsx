import type { Meta, StoryObj } from "@storybook/react";
import { TokenRow } from "./TokenRow.js";

const meta: Meta<typeof TokenRow> = {
  title: "Components/TokenRow",
  component: TokenRow,
};

export default meta;
type Story = StoryObj<typeof TokenRow>;

export const Default: Story = {
  args: {
    name: "Claude Desktop",
    prefix: "eci_pat_8f3k",
    metaLabel: "Created Oct 2, 2026 · Last used Oct 20, 2026",
    onRevoke: () => {},
  },
};

export const NeverUsed: Story = {
  args: {
    name: "Backup script",
    prefix: "eci_pat_51qd",
    metaLabel: "Created Oct 12, 2026 · Never used",
    onRevoke: () => {},
  },
};

export const Revoked: Story = {
  args: {
    name: "Old laptop",
    prefix: "eci_pat_9zx2",
    metaLabel: "Created Sep 1, 2026 · Last used Sep 30, 2026",
    revoked: true,
    onRevoke: () => {},
  },
};
