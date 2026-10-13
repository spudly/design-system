import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button.js";
import { Toast, ToastProvider, toast } from "./Toast.js";

const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Card: Story = {
  args: {
    title: "Verse memorized!",
    description: "Psalm 23:1 is now in your review queue.",
  },
};

export const TitleOnly: Story = {
  args: { title: "Saved" },
};

export const Live: Story = {
  render: () => (
    <ToastProvider>
      <Button
        onPress={() =>
          toast("Verse memorized!", {
            description: "Psalm 23:1 is now in your review queue.",
          })
        }
      >
        Show toast
      </Button>
    </ToastProvider>
  ),
};
