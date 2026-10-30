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

export const Default: Story = {
  render: () => {
    const [viewer, setViewer] = useState<number | null>(4);
    return (
      <YStack maxWidth={430} padding="$4">
        <RatingsCard
          ratings={{
            community: { stars: "★★★★☆", label: "4.6 (9)" },
            viewer: { value: viewer },
          }}
          onViewerRatingChange={setViewer}
        />
      </YStack>
    );
  },
};

export const NoRatingsYet: Story = {
  render: () => (
    <YStack maxWidth={430} padding="$4">
      <RatingsCard ratings={{ community: null, viewer: null }} onViewerRatingChange={undefined} />
    </YStack>
  ),
};

export const Stale: Story = {
  render: () => {
    const [viewer, setViewer] = useState<number | null>(3);
    const [viewerIsStale, setViewerIsStale] = useState(true);
    return (
      <YStack maxWidth={430} padding="$4">
        <RatingsCard
          ratings={{
            community: { stars: "★★★★☆", label: "4.6 (9)", hasStaleRatings: true },
            viewer: { value: viewer, isStale: viewerIsStale },
          }}
          onViewerRatingChange={(stars) => {
            setViewer(stars);
            setViewerIsStale(false);
          }}
        />
      </YStack>
    );
  },
};
