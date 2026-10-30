import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { BadgeCardRow } from "./BadgeCardRow.js";

const meta: Meta<typeof BadgeCardRow> = {
  title: "Components/BadgeCardRow",
  component: BadgeCardRow,
};

export default meta;
type Story = StoryObj<typeof BadgeCardRow>;

const noop = () => {};

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <BadgeCardRow
        badgeLabel="Weeknight"
        badgeColor="green"
        actions={[
          { label: "Edit", accessibilityLabel: "Edit tag Weeknight", onPress: noop },
          {
            label: "Delete",
            accessibilityLabel: "Delete tag Weeknight",
            variant: "error",
            onPress: noop,
          },
        ]}
      />
    </YStack>
  ),
};

export const DeleteOnly: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <BadgeCardRow
        badgeLabel="Freezer"
        badgeColor="blue"
        actions={[
          {
            label: "Delete",
            accessibilityLabel: "Delete tag Freezer",
            variant: "error",
            onPress: noop,
          },
        ]}
      />
    </YStack>
  ),
};
