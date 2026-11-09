import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { LogEntryCard } from "./LogEntryCard.js";

const meta: Meta<typeof LogEntryCard> = {
  title: "Widgets/LogEntryCard",
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

export const Loading: Story = {
  render: () => (
    <YStack maxWidth={430} padding="$4">
      <LogEntryCard
        dateLabel="Oct 12, 2026"
        starRating={4}
        notes="Kids asked for seconds. Needed a pinch more salt."
        onDeletePress={() => {}}
        deleteAccessibilityLabel="Delete cook log 1 from Oct 12, 2026"
        loading
      />
    </YStack>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430}>
      <LogEntryCard
        dateLabel="Oct 12, 2026"
        starRating={4}
        notes="Kids asked for seconds. Needed a pinch more salt."
        onDeletePress={() => {}}
        deleteAccessibilityLabel="Delete cook log 1 from Oct 12, 2026"
      />
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <LogEntryCard
          dateLabel="Oct 12, 2026"
          starRating={4}
          notes="Kids asked for seconds. Needed a pinch more salt."
          onDeletePress={() => {}}
          deleteAccessibilityLabel="Delete cook log 1 from Oct 12, 2026"
          loading
        />
      </YStack>
    </YStack>
  ),
};
