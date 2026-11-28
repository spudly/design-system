import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { RatingStars } from "./RatingStars.js";

const meta: Meta<typeof RatingStars> = {
  title: "Widgets/Form/RatingStars",
  component: RatingStars,
};

export default meta;
type Story = StoryObj<typeof RatingStars>;

export const Rated: Story = {
  render: () => (
    <YStack>
      <RatingStars rating={4} />
      <RatingStars rating={2.4} />
    </YStack>
  ),
};

export const Unrated: Story = {
  render: () => (
    <YStack>
      <RatingStars rating={null} />
    </YStack>
  ),
};

export const Pressable: Story = {
  render: () => (
    <YStack>
      <RatingStars
        rating={3}
        accessibilityLabel="Log a cook, rated 3 out of 5 stars"
        onPress={() => {}}
      />
    </YStack>
  ),
};
