import type { Meta, StoryObj } from "@storybook/react";

import { StoryFrame } from "../shared/storyFrame.js";

import { ConfirmActionView } from "./ConfirmActionView.js";

const meta: Meta<typeof ConfirmActionView> = {
  title: "Views/Eciperay/ConfirmActionView",
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
        onOpenChange={() => { /* noop */ }}
        title="Delete this recipe?"
        description="This permanently deletes the recipe and its cook history."
        confirmLabel="Delete recipe"
        confirmPendingLabel="Deleting…"
        onConfirm={() => { /* noop */ }}
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
        onOpenChange={() => { /* noop */ }}
        title="Delete this recipe?"
        description="This permanently deletes the recipe and its cook history."
        error="We couldn't delete this recipe. Try again."
        confirmLabel="Delete recipe"
        onConfirm={() => { /* noop */ }}
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
        onOpenChange={() => { /* noop */ }}
        title="Nutrition unavailable"
        description="Nutrition couldn't be calculated for this version."
        confirmLabel="OK"
        confirmTone="primary"
        onConfirm={() => { /* noop */ }}
      />
    </StoryFrame>
  ),
};
