import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Card } from "./Card.js";
import { MediaRow } from "./MediaRow.js";
import { RatingStars } from "./RatingStars.js";
import { Text } from "./Text.js";

const meta: Meta<typeof MediaRow> = {
  title: "Components/MediaRow",
  component: MediaRow,
};

export default meta;
type Story = StoryObj<typeof MediaRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <MediaRow
        href="/recipes/tuscan-chicken"
        title="Tuscan Chicken"
        subtitle="4 servings · 45 min"
        imageUrl="https://picsum.photos/seed/mediarow-default/160"
        subtitleAction={
          <RatingStars
            rating={4}
            onPress={() => {}}
            accessibilityLabel="Log a cook of Tuscan Chicken, rated 4 out of 5 stars"
          />
        }
      />
    </YStack>
  ),
};

export const WithAccessory: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <MediaRow
        href="/recipes/arroz-con-pollo"
        title="Arroz con Pollo"
        subtitle="6 servings · 1 hr"
        accessory={
          <Card>
            <Text>Expanded accessory content renders under the card.</Text>
          </Card>
        }
      />
    </YStack>
  ),
};
