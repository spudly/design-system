import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { LogEntryCard } from "./LogEntryCard.js";

const meta: Meta<typeof LogEntryCard> = {
  title: "Components/LogEntryCard",
  component: LogEntryCard,
};

export default meta;
type Story = StoryObj<typeof LogEntryCard>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430} padding="$4">
      <LogEntryCard
        dateLabel="Oct 12, 2026"
        starRating={4}
        notes="Kids asked for seconds. Needed a pinch more salt."
        onDeletePress={() => {}}
        deleteAccessibilityLabel="Delete cook log 1 from Oct 12, 2026"
      />
    </YStack>
  ),
};

export const WithoutAction: Story = {
  render: () => (
    <YStack maxWidth={430} padding="$4">
      <LogEntryCard dateLabel="Sep 28, 2026" starRating={5} />
    </YStack>
  ),
};
