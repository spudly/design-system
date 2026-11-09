import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { CardRow } from "./CardRow.js";
import { Text } from "./Text.js";

const meta: Meta<typeof CardRow> = {
  title: "Widgets/CardRow",
  component: CardRow,
};

export default meta;
type Story = StoryObj<typeof CardRow>;

// CardRow is a list row: it renders as one card among several, so
// the stories show it the way pages compose it — a stack of rows
// (separation is the composing stack's gap, never the row's own
// spacing). The loading story renders 3 skeleton cards, matching
// the count a loading list shows (Stephen on #551).
const rows = [
  {
    title: "Weeknight favorites",
    subtitle: "4 entries · Oct 19 – Oct 25 · 12,400 cal",
  },
  {
    title: "Slow Sundays",
    subtitle: "3 entries · Oct 26 – Nov 1 · 9,850 cal",
  },
  {
    title: "Holiday baking",
    subtitle: "6 entries · Nov 2 – Nov 8 · 15,200 cal",
  },
];

/**
 * Press readout: the "Row presses: N" line under the stack
 * counts row presses, so pointer and Enter/Space activation
 * are observable in Storybook.
 */
function DefaultDemo() {
  const [rowPresses, setRowPresses] = useState(0);
  return (
    <YStack maxWidth={430} gap="$3">
      {rows.map((row) => (
        <CardRow
          key={row.title}
          {...row}
          onPress={() => setRowPresses((count) => count + 1)}
        />
      ))}
      <Text>Row presses: {rowPresses}</Text>
    </YStack>
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

/**
 * Separate readouts for the row press and the Delete action,
 * so a tester can confirm pressing Delete does not also
 * trigger the row's press.
 */
function WithActionDemo() {
  const [rowPresses, setRowPresses] = useState(0);
  const [actionPresses, setActionPresses] = useState(0);
  return (
    <YStack maxWidth={430} gap="$2">
      <CardRow
        title="Weeknight favorites"
        subtitle="4 entries · Oct 19 – Oct 25 · 12,400 cal"
        onPress={() => setRowPresses((count) => count + 1)}
        actionLabel="Delete"
        actionTone="danger"
        onActionPress={() => setActionPresses((count) => count + 1)}
      />
      <Text>Row presses: {rowPresses}</Text>
      <Text>Delete presses: {actionPresses}</Text>
    </YStack>
  );
}

export const WithAction: Story = {
  render: () => <WithActionDemo />,
};

export const TitleOnly: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <CardRow {...args} />
    </YStack>
  ),
  args: {
    title: "Empty plan",
    onPress: () => {},
  },
};

export const Loading: Story = {
  render: () => (
    <YStack maxWidth={430} gap="$3">
      {rows.map((row) => (
        <CardRow key={row.title} {...row} onPress={() => {}} loading />
      ))}
    </YStack>
  ),
};
