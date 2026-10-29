import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { CardRow } from "./CardRow.js";
import { Column } from "./Column.js";
import { DetailRow } from "./DetailRow.js";
import { Spinner } from "./Spinner.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Column> = {
  title: "Components/Column",
  component: Column,
  argTypes: {
    variant: { control: "select", options: ["sections", "group", "list", "state"] },
  },
};

export default meta;
type Story = StoryObj<typeof Column>;

export const Sections: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <Column {...args} variant="sections">
        <Text variant="title">Weeknight favorites</Text>
        <Text variant="hint">Oct 19 – Oct 25</Text>
        <Text>
          Every block in the stack is separated by the one sections gap — the page rhythm is
          identical between blocks by construction.
        </Text>
      </Column>
    </YStack>
  ),
};

export const Group: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <Column {...args} variant="group">
        <DetailRow label="Calories" value="850 / 2,000 · On track" />
        <DetailRow label="Protein" value="62 / 120 g · Behind" />
        <DetailRow label="Fiber" value="18 / 30 g · On track" />
      </Column>
    </YStack>
  ),
};

export const List: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <Column {...args} variant="list">
        <CardRow title="Weeknight favorites" subtitle="4 entries" onPress={() => {}} />
        <CardRow title="Sunday prep" subtitle="2 entries" onPress={() => {}} />
      </Column>
    </YStack>
  ),
};

export const State: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <Column {...args} variant="state">
        <Spinner label="Loading" />
      </Column>
    </YStack>
  ),
};
