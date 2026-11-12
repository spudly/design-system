import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { RatingsCard } from "./RatingsCard.js";

const meta: Meta<typeof RatingsCard> = {
  title: "Widgets/RatingsCard",
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

export const Loading: Story = {
  render: () => (
    <YStack maxWidth={430} padding="$4">
      <RatingsCard
        ratings={{
          community: { stars: "★★★★☆", label: "4.6 (9)" },
          viewer: { value: 4 },
        }}
        onViewerRatingChange={() => {}}
        loading
      />
    </YStack>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430} padding="$4">
      <RatingsCard
        ratings={{
          community: { stars: "★★★★☆", label: "4.6 (9)" },
          viewer: { value: 4 },
        }}
        onViewerRatingChange={() => {}}
      />
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
        padding="$4"
      >
        <RatingsCard
          ratings={{
            community: { stars: "★★★★☆", label: "4.6 (9)" },
            viewer: { value: 4 },
          }}
          onViewerRatingChange={() => {}}
          loading
        />
      </YStack>
    </YStack>
  ),
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
