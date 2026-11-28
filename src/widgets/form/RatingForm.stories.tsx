import type { Meta, StoryObj } from "@storybook/react";

import { StoryFrame } from "../../views/shared/storyFrame.js";

import { RatingForm } from "./RatingForm.js";

const meta: Meta<typeof RatingForm> = {
  title: "Widgets/Form/RatingForm",
  component: RatingForm,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RatingForm>;

export const Dark: Story = {
  render: () => (
    <StoryFrame variant="overlayPanel">
      <RatingForm onSubmit={() => { /* noop */ }} onSkip={() => { /* noop */ }} isPending={false} />
    </StoryFrame>
  ),
};

export const Light: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RatingForm
        variant="light"
        onSubmit={() => { /* noop */ }}
        onSkip={() => { /* noop */ }}
        isPending={false}
      />
    </StoryFrame>
  ),
};

export const Pending: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RatingForm variant="light" onSubmit={() => { /* noop */ }} onSkip={() => { /* noop */ }} isPending />
    </StoryFrame>
  ),
};

export const CustomLabels: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RatingForm
        variant="light"
        title="Rate this recipe"
        notesPlaceholder="Notes from this cook (optional)"
        secondaryLabel="Cancel"
        onSubmit={() => { /* noop */ }}
        onSkip={() => { /* noop */ }}
        isPending={false}
      />
    </StoryFrame>
  ),
};
