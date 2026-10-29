import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ActionChip } from "./ActionChip.js";
import { Badge } from "./Badge.js";
import { ChipRow } from "./ChipRow.js";

const meta: Meta<typeof ChipRow> = {
  title: "Components/ChipRow",
  component: ChipRow,
};

export default meta;
type Story = StoryObj<typeof ChipRow>;

export const Badges: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <ChipRow>
        <Badge color="red">Weeknight</Badge>
        <Badge color="green">Gluten-free</Badge>
        <Badge color="amber">Kid favorite</Badge>
        <Badge color="blue">Freezer friendly</Badge>
        <Badge color="purple">Company</Badge>
      </ChipRow>
    </YStack>
  ),
};

export const ActionChips: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <ChipRow>
        <ActionChip tone="outline" onPress={() => {}}>
          Tweak manually
        </ActionChip>
        <ActionChip tone="primary" href="https://example.com/tweak">
          Tweak with AI
        </ActionChip>
        <ActionChip tone="success" onPress={() => {}}>
          Mark perfected
        </ActionChip>
        <ActionChip tone="danger" onPress={() => {}}>
          Abandon
        </ActionChip>
      </ChipRow>
    </YStack>
  ),
};
