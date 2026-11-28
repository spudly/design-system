import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { MediaRow } from "./MediaRow.js";

const meta: Meta<typeof MediaRow> = {
  title: "Widgets/Data Display/MediaRow",
  component: MediaRow,
};

export default meta;
type Story = StoryObj<typeof MediaRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <MediaRow href="/recipes/1" title="Weeknight Chili" subtitle="4 servings · 35 min" />
      <MediaRow
        href="/recipes/2"
        title="Shared Soup"
        subtitle="6 servings · 50 min"
        badgeLabel="Shared with you"
      />
    </YStack>
  ),
};
