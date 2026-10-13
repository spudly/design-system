import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onPress={() => setOpen(true)}>Delete recipe</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this recipe?"
        description="This cannot be undone."
        actions={
          <>
            <Button variant="secondary" size="sm" onPress={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onPress={() => setOpen(false)}>
              Delete
            </Button>
          </>
        }
      >
        <Text variant="body">
          “Creamy Tuscan Garlic Chicken” will be removed from your library.
        </Text>
      </Dialog>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <DialogDemo />,
};

export const WithoutActions: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Button onPress={() => setOpen(true)}>About</Button>
        <Dialog open={open} onOpenChange={setOpen} title="About this app">
          <Text variant="body">Version 1.0.0</Text>
        </Dialog>
      </div>
    );
  },
};
