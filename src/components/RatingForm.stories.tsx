import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { tokens } from "../tokens/index.js";
import { RatingForm } from "./RatingForm.js";

const meta: Meta<typeof RatingForm> = {
  title: "Components/RatingForm",
  component: RatingForm,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RatingForm>;

function Viewport({ children, onOverlay = false }: { children: ReactNode; onOverlay?: boolean }) {
  return (
    <View
      width={430}
      maxWidth="100%"
      padding="$4"
      backgroundColor={onOverlay ? tokens.colors.gray.gray10 : undefined}
    >
      {children}
    </View>
  );
}

export const Dark: Story = {
  render: () => (
    <Viewport onOverlay>
      <RatingForm onSubmit={() => undefined} onSkip={() => undefined} isPending={false} />
    </Viewport>
  ),
};

export const Light: Story = {
  render: () => (
    <Viewport>
      <RatingForm
        variant="light"
        onSubmit={() => undefined}
        onSkip={() => undefined}
        isPending={false}
      />
    </Viewport>
  ),
};

export const Pending: Story = {
  render: () => (
    <Viewport>
      <RatingForm variant="light" onSubmit={() => undefined} onSkip={() => undefined} isPending />
    </Viewport>
  ),
};

export const CustomLabels: Story = {
  render: () => (
    <Viewport>
      <RatingForm
        variant="light"
        title="Rate this recipe"
        notesPlaceholder="Notes from this cook (optional)"
        secondaryLabel="Cancel"
        onSubmit={() => undefined}
        onSkip={() => undefined}
        isPending={false}
      />
    </Viewport>
  ),
};
