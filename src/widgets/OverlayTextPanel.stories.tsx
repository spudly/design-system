import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { OverlayTextPanel } from "./OverlayTextPanel.js";

const meta: Meta<typeof OverlayTextPanel> = {
  title: "Widgets/OverlayTextPanel",
  component: OverlayTextPanel,
};

export default meta;
type Story = StoryObj<typeof OverlayTextPanel>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430} backgroundColor={tokens.colors.gray.gray9} padding="$4">
      <OverlayTextPanel heading="Panel heading" lines={["First line", "Second line"]} />
    </YStack>
  ),
};

export const Loading: Story = {
  render: () => (
    <YStack maxWidth={430} backgroundColor={tokens.colors.gray.gray9} padding="$4">
      <OverlayTextPanel heading="Panel heading" lines={["First line", "Second line"]} loading />
    </YStack>
  ),
};
