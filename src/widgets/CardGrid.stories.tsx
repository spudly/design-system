import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Card } from "./Card.js";
import { CardGrid } from "./CardGrid.js";
import { Text } from "./Text.js";

const meta: Meta<typeof CardGrid> = {
  title: "Widgets/CardGrid",
  component: CardGrid,
};

export default meta;
type Story = StoryObj<typeof CardGrid>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={860}>
      <CardGrid>
        <Card>
          <Text variant="subheading">One home for recipes</Text>
          <Text color="$textMuted">Keep every recipe in a single place.</Text>
        </Card>
        <Card>
          <Text variant="subheading">Tweak as you learn</Text>
          <Text color="$textMuted">Iterate on a recipe each time you cook it.</Text>
        </Card>
        <Card>
          <Text variant="subheading">Create without searching</Text>
          <Text color="$textMuted">Start a new recipe from an idea, not a search.</Text>
        </Card>
      </CardGrid>
    </YStack>
  ),
};
