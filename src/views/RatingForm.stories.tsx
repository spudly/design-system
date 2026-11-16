import type { Meta, StoryObj } from "@storybook/react";
import { RatingForm } from "./RatingForm.js";
import { StoryFrame } from "./storyFrame.js";

const meta: Meta<typeof RatingForm> = {
  title: "Views/RatingForm",
  component: RatingForm,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RatingForm>;

export const Dark: Story = {
  render: () => (
    <StoryFrame padded onOverlay>
      <RatingForm onSubmit={() => undefined} onSkip={() => undefined} isPending={false} />
    </StoryFrame>
  ),
};

export const Light: Story = {
  render: () => (
    <StoryFrame padded>
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
    <StoryFrame padded>
      <RatingForm variant="light" onSubmit={() => undefined} onSkip={() => undefined} isPending />
    </StoryFrame>
  ),
};

export const CustomLabels: Story = {
  render: () => (
    <StoryFrame padded>
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
