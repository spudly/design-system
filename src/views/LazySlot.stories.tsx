import type { Meta, StoryObj } from "@storybook/react";
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

export const FailedToLoad: Story = {
  args: {
    // The reload action is a no-op in Storybook so the story's
    // fallback stays on screen for inspection instead of reloading
    // the Storybook page itself.
    onReload: () => {},
    children: <FailingChild />,
  },
};
