import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Badge } from "./Badge.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";
import { TrailingActionsRow } from "./TrailingActionsRow.js";

const meta: Meta<typeof TrailingActionsRow> = {
  title: "Widgets/TrailingActionsRow",
  component: TrailingActionsRow,
};

export default meta;
type Story = StoryObj<typeof TrailingActionsRow>;

const noop = () => {};

export const FieldAndAction: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <TrailingActionsRow leading={<Text variant="label">Color</Text>}>
        <Button onPress={noop}>Add</Button>
      </TrailingActionsRow>
    </YStack>
  ),
};

export const ContentAndGhostButtons: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <TrailingActionsRow leading={<Badge color="green">Weeknight</Badge>}>
        <Button ghost size="sm" onPress={noop}>
          Edit
        </Button>
        <Button ghost size="sm" variant="danger" onPress={noop}>
          Delete
        </Button>
      </TrailingActionsRow>
    </YStack>
  ),
};

export const Narrow: Story = {
  render: () => (
    <YStack maxWidth={220}>
      <TrailingActionsRow
        leading={
          <Text variant="label" flexShrink={1}>
            A long leading label that cannot share the row
          </Text>
        }
      >
        <Button onPress={noop}>Add</Button>
      </TrailingActionsRow>
    </YStack>
  ),
};
