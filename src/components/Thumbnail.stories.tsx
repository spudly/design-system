import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { storyImageSquare, storyImageWide } from "../storyFixtures.js";
import { Text } from "./Text.js";
import { Thumbnail } from "./Thumbnail.js";

const meta: Meta<typeof Thumbnail> = {
  title: "Components/Thumbnail",
  component: Thumbnail,
};

export default meta;
type Story = StoryObj<typeof Thumbnail>;

export const Hero: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <Thumbnail src={storyImageWide} variant="hero" accessibilityLabel="Tuscan chicken, plated" />
    </YStack>
  ),
};

export const Banner: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <Thumbnail src={storyImageWide} variant="banner" accessibilityLabel="Imported recipe photo" />
    </YStack>
  ),
};

export const Row: Story = {
  render: () => (
    <YStack maxWidth={430} gap={8}>
      <Thumbnail src={storyImageSquare} variant="row" />
      <Text variant="hint">The 64px list-row thumbnail, cover-cropped.</Text>
    </YStack>
  ),
};
