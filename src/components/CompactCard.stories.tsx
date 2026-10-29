import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Badge } from "./Badge.js";
import { CompactCard } from "./CompactCard.js";
import { Text } from "./Text.js";

const meta: Meta<typeof CompactCard> = {
  title: "Components/CompactCard",
  component: CompactCard,
};

export default meta;
type Story = StoryObj<typeof CompactCard>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <CompactCard>
        <Badge color="green">Weeknight</Badge>
        <Text variant="hint">A dense row's worth of content on the compact surface.</Text>
      </CompactCard>
    </YStack>
  ),
};
