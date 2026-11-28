import type { Meta, StoryObj } from "@storybook/react";

import { StoryFrame } from "../shared/storyFrame.js";

import { DragHandleView } from "./DragHandleView.js";

const meta: Meta<typeof DragHandleView> = {
  title: "Views/Eciperay/DragHandleView",
  component: DragHandleView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof DragHandleView>;

/** The default DS grip: the six-dot handle visual the recipe
 * list views render when the host supplies no drag handle. */
export const Default: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <DragHandleView />
    </StoryFrame>
  ),
};

/** A caller-supplied accessible name for the grip. */
export const CustomLabel: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <DragHandleView accessibilityLabel="Reorder item" />
    </StoryFrame>
  ),
};
