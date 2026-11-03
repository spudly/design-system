import type { Meta, StoryObj } from "@storybook/react";
import { View, XStack, YStack } from "tamagui";
import { BoxSkeleton } from "./BoxSkeleton.js";
import { CircleSkeleton } from "./CircleSkeleton.js";
import { SkeletonClock } from "./SkeletonClock.js";
import { TextSkeleton } from "./TextSkeleton.js";

const meta: Meta<typeof SkeletonClock> = {
  title: "Components/SkeletonClock",
  component: SkeletonClock,
};

export default meta;
type Story = StoryObj<typeof SkeletonClock>;

/**
 * A card-shaped skeleton composition: every bone derives its
 * opacity from the one shared clock, so the whole block pulses
 * together.
 */
function CardSkeleton() {
  return (
    <YStack gap={12} width={300}>
      <XStack gap={12} alignItems="center">
        <CircleSkeleton size={48} />
        <View flex={1}>
          <TextSkeleton lines={2} />
        </View>
      </XStack>
      <BoxSkeleton height={140} />
      <TextSkeleton lines={3} />
    </YStack>
  );
}

export const Synchronized: Story = {
  render: () => (
    <SkeletonClock>
      <CardSkeleton />
    </SkeletonClock>
  ),
};

/** The frozen clock: a static mid-opacity block, as captures render it. */
export const Frozen: Story = {
  render: () => (
    <SkeletonClock frozen>
      <CardSkeleton />
    </SkeletonClock>
  ),
};

/** Without a provider the bones share the default clock and stay in phase. */
export const NoProvider: Story = {
  render: () => <CardSkeleton />,
};
