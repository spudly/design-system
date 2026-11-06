import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { ConfirmActionView } from "./ConfirmActionView.js";

const meta: Meta<typeof ConfirmActionView> = {
  title: "Views/ConfirmActionView",
  component: ConfirmActionView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ConfirmActionView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={500}>
      {children}
    </View>
  );
}

export const DeleteConfirmation: Story = {
  render: () => (
    <Viewport>
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
    </Viewport>
  ),
};

export const WithError: Story = {
  render: () => (
    <Viewport>
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
    </Viewport>
  ),
};

export const Notice: Story = {
  render: () => (
    <Viewport>
      <ConfirmActionView
        open
        onOpenChange={() => undefined}
        title="Nutrition unavailable"
        description="Nutrition couldn't be calculated for this version."
        confirmLabel="OK"
        confirmTone="primary"
        onConfirm={() => undefined}
      />
    </Viewport>
  ),
};
