import type { Meta, StoryObj } from "@storybook/react";
import { ChunkErrorBoundary } from "./ChunkErrorBoundary.js";
import { Text } from "../widgets/Text.js";

const meta: Meta<typeof ChunkErrorBoundary> = {
  title: "Views/ChunkErrorBoundary",
  component: ChunkErrorBoundary,
};

export default meta;
type Story = StoryObj<typeof ChunkErrorBoundary>;

/** A child that fails the way a rejected lazy chunk import does. */
function FailingChild(): never {
  throw new Error("Failed to fetch dynamically imported module");
}

export const Loaded: Story = {
  args: {
    children: <Text>This section loaded successfully.</Text>,
  },
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
