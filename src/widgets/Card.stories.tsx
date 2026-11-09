import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Badge } from "./Badge.js";
import { Card } from "./Card.js";
import { ListRow } from "./ListRow.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Card> = {
  title: "Widgets/Card",
  component: Card,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "bordered", "muted", "elevated", "compact"],
    },
    elevated: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} style={{ maxWidth: 360 }}>
      <Text variant="subheading">Psalm 23:1</Text>
      <Text variant="body">The LORD is my shepherd; I shall not want.</Text>
    </Card>
  ),
};

export const Elevated: Story = {
  render: (args) => (
    <Card {...args} elevated style={{ maxWidth: 360 }}>
      <Text variant="subheading">Creamy Tuscan Garlic Chicken</Text>
      <Text variant="hint">30 min · Medium · 4.8 stars</Text>
    </Card>
  ),
};

export const Bordered: Story = {
  render: (args) => (
    <Card {...args} variant="bordered" style={{ maxWidth: 360 }}>
      <Text variant="subheading">Outline only</Text>
      <Text variant="body">No surface fill — content sits on the page background.</Text>
    </Card>
  ),
};

export const Muted: Story = {
  render: (args) => (
    <Card {...args} variant="muted" style={{ maxWidth: 360 }}>
      <Text variant="subheading">Recessed section</Text>
      <Text variant="body">Page-background fill with no border.</Text>
    </Card>
  ),
};

export const ElevatedVariant: Story = {
  render: (args) => (
    <Card {...args} variant="elevated" style={{ maxWidth: 360 }}>
      <Text variant="subheading">Raised section</Text>
      <Text variant="hint">Same look as the legacy `elevated` boolean.</Text>
    </Card>
  ),
};

export const Compact: Story = {
  render: (args) => (
    <Card {...args} variant="compact" style={{ maxWidth: 430 }}>
      <Badge color="green">Weeknight</Badge>
      <Text variant="hint">A dense row's worth of content on the compact surface.</Text>
    </Card>
  ),
};

// Loading propagates through the card's LoadingScope to its
// contents: the ListRow inside skeletonizes. The contents are a
// frameless row on purpose — a framed card inside the card read
// as a card nested in a card (Stephen on #551).
export const Loading: Story = {
  render: () => (
    <Card loading style={{ maxWidth: 430 }}>
      <ListRow title="Weeknight favorites" subtitle="4 entries" onPress={() => {}} />
    </Card>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430}>
      <Card style={{ maxWidth: 430 }}>
        <ListRow title="Weeknight favorites" subtitle="4 entries" onPress={() => {}} />
      </Card>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <Card loading style={{ maxWidth: 430 }}>
          <ListRow title="Weeknight favorites" subtitle="4 entries" onPress={() => {}} />
        </Card>
      </YStack>
    </YStack>
  ),
};
