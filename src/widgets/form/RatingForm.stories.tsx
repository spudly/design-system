import type { Meta, StoryObj } from "@storybook/react";
import { RatingForm } from "./RatingForm.js";
import { StoryFrame } from "../../views/shared/storyFrame.js";

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
      <RatingForm onSubmit={() => undefined} onSkip={() => undefined} isPending={false} />
    </StoryFrame>
  ),
};

export const Light: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RatingForm
        variant="light"
        onSubmit={() => undefined}
        onSkip={() => undefined}
        isPending={false}
      />
    </StoryFrame>
  ),
};

export const Pending: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RatingForm variant="light" onSubmit={() => undefined} onSkip={() => undefined} isPending />
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
        onSubmit={() => undefined}
        onSkip={() => undefined}
        isPending={false}
      />
    </StoryFrame>
  ),
};
