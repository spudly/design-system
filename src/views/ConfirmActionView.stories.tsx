import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmActionView } from "./ConfirmActionView.js";
import { StoryFrame } from "./storyFrame.js";

const meta: Meta<typeof ConfirmActionView> = {
  title: "Views/ConfirmActionView",
  component: ConfirmActionView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ConfirmActionView>;

export const DeleteConfirmation: Story = {
  render: () => (
    <StoryFrame variant="dialog">
      <ConfirmActionView
        open
        onOpenChange={() => undefined}
        title="Delete this recipe?"
        description="This permanently deletes the recipe and its cook history."
        confirmLabel="Delete recipe"
        confirmPendingLabel="Deleting…"
        onConfirm={() => undefined}
        cancelLabel="Cancel"
      />
    </StoryFrame>
  ),
};

export const WithError: Story = {
  render: () => (
    <StoryFrame variant="dialog">
      <ConfirmActionView
        open
        onOpenChange={() => undefined}
        title="Delete this recipe?"
        description="This permanently deletes the recipe and its cook history."
        error="We couldn't delete this recipe. Try again."
        confirmLabel="Delete recipe"
        onConfirm={() => undefined}
        cancelLabel="Cancel"
      />
    </StoryFrame>
  ),
};

export const Notice: Story = {
  render: () => (
    <StoryFrame variant="dialog">
      <ConfirmActionView
        open
        onOpenChange={() => undefined}
        title="Nutrition unavailable"
        description="Nutrition couldn't be calculated for this version."
        confirmLabel="OK"
        confirmTone="primary"
        onConfirm={() => undefined}
      />
    </StoryFrame>
  ),
};
