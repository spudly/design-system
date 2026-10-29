import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { RatingsCard } from "./RatingsCard.js";

const meta: Meta<typeof RatingsCard> = {
  title: "Components/RatingsCard",
  component: RatingsCard,
};

export default meta;
type Story = StoryObj<typeof RatingsCard>;

function RatingsCardDemo() {
  const [viewerRating, setViewerRating] = useState<number | null>(4);
  return (
    <YStack width={430} maxWidth="100%">
      <RatingsCard
        ratings={{
          community: { stars: "★★★★★", label: "4.6 (9)", hasStaleRatings: true },
          viewer: { value: viewerRating, isStale: true },
        }}
        onViewerRatingChange={setViewerRating}
      />
    </YStack>
  );
}

export const Default: Story = {
  render: () => <RatingsCardDemo />,
};

export const SignedOut: Story = {
  render: () => (
    <YStack width={430} maxWidth="100%">
      <RatingsCard
        ratings={{
          community: { stars: "★★★★☆", label: "4.2 (5)" },
          viewer: null,
        }}
      />
    </YStack>
  ),
};

export const NoRatings: Story = {
  render: () => (
    <YStack width={430} maxWidth="100%">
      <RatingsCard
        ratings={{ community: null, viewer: { value: null } }}
        onViewerRatingChange={() => undefined}
      />
    </YStack>
  ),
};
