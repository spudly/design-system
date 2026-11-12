import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Text } from "../widgets/Text.js";
import { LazySlot } from "./LazySlot.js";

const meta: Meta<typeof LazySlot> = {
  title: "Views/LazySlot",
  component: LazySlot,
  globals: { theme: "light_quietDawn" },
};

export default meta;
type Story = StoryObj<typeof LazySlot>;

/** A child that suspends the way a pending lazy chunk does. */
function PendingChild(): never {
  throw new Promise(() => {});
}

/** A child that fails the way a rejected lazy chunk import does. */
function FailingChild(): never {
  throw new Error("Failed to fetch dynamically imported module");
}

export const Loaded: Story = {
  args: {
    children: <Text>This section loaded successfully.</Text>,
  },
};

export const Loading: Story = {
  args: {
    children: <PendingChild />,
  },
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
// LazySlot's fallback is a neutral content-region skeleton (the
// incoming shape is unknown), so the overlay pairs the loaded
// slot with the suspending slot's fallback over it rather than
// expecting a bone-for-line match.
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative">
      <LazySlot>
        <Text>This section loaded successfully.</Text>
      </LazySlot>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <LazySlot>
          <PendingChild />
        </LazySlot>
      </YStack>
    </YStack>
  ),
};

export const FailedToLoad: Story = {
  args: {
    // The reload action is a no-op in Storybook so the story's
    // fallback stays on screen for inspection instead of reloading
    // the Storybook page itself.
    onReload: () => {},
    children: <FailingChild />,
  },
};
