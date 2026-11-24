import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ScrollSentinel } from "./ScrollSentinel.js";
import { Text } from "./data/Text.js";

const meta: Meta<typeof ScrollSentinel> = {
  title: "Widgets/ScrollSentinel",
  component: ScrollSentinel,
};

export default meta;
type Story = StoryObj<typeof ScrollSentinel>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430} gap="$2">
      <Text>
        The scroll sentinel renders below this text as a 1px marker — it is intentionally invisible;
        a paginated list's observer logic reads its position to request the next page.
      </Text>
      <ScrollSentinel sentinelRef={{ current: null }} />
    </YStack>
  ),
};
