import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { CardRow } from "./CardRow.js";
import { Text } from "./Text.js";

const meta: Meta<typeof CardRow> = {
  title: "Widgets/CardRow",
  component: CardRow,
};

export default meta;
type Story = StoryObj<typeof CardRow>;

// CardRow is a list row: it renders as one card among several, so
// the Default and Loading stories lay the cards out in a
// horizontal row — each card flexing to an equal share of a wide
// container — rather than stacking them vertically, which read
// as a CardStack duplicate (Stephen on #551). (CardRow itself
// accepts no flex prop, so each card sits in a flexing wrapper.)
// The loading story renders 3 skeleton cards, matching the count
// a loading list shows.
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
 * Press readout: the "Row presses: N" line under the row of
 * cards counts row presses, so pointer and Enter/Space
 * activation are observable in Storybook.
 */
function DefaultDemo() {
  const [rowPresses, setRowPresses] = useState(0);
  return (
    <YStack maxWidth={960} gap="$3">
      <XStack gap="$3">
        {rows.map((row) => (
          <YStack key={row.title} flex={1}>
            <CardRow {...row} onPress={() => setRowPresses((count) => count + 1)} />
          </YStack>
        ))}
      </XStack>
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
    <YStack maxWidth={960}>
      <XStack gap="$3">
        {rows.map((row) => (
          <YStack key={row.title} flex={1}>
            <CardRow {...row} onPress={() => {}} loading />
          </YStack>
        ))}
      </XStack>
    </YStack>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={960}>
      <XStack gap="$3">
        {rows.map((row) => (
          <YStack key={row.title} flex={1}>
            <CardRow
              {...row}
              onPress={() => {}}
              actionLabel="Delete"
              actionTone="danger"
              onActionPress={() => {}}
            />
          </YStack>
        ))}
      </XStack>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <XStack gap="$3">
          {rows.map((row) => (
            <YStack key={row.title} flex={1}>
              <CardRow
                {...row}
                onPress={() => {}}
                actionLabel="Delete"
                actionTone="danger"
                onActionPress={() => {}}
                loading
              />
            </YStack>
          ))}
        </XStack>
      </YStack>
    </YStack>
  ),
};
