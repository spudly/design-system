import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { RatingStars } from "./RatingStars.js";

const meta: Meta<typeof RatingStars> = {
  title: "Components/RatingStars",
  component: RatingStars,
};

export default meta;
type Story = StoryObj<typeof RatingStars>;

export const Display: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <RatingStars rating={4} />
    </YStack>
  ),
};

export const Pressable: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <RatingStars
        rating={4}
        onPress={() => {}}
        accessibilityLabel="Log a cook of Tuscan Chicken, rated 4 out of 5 stars"
      />
    </YStack>
  ),
};

export const UnratedPressable: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <RatingStars
        rating={null}
        onPress={() => {}}
        accessibilityLabel="Log a cook of Arroz con Pollo"
      />
    </YStack>
  ),
};
