import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Dialog> = {
  title: "Widgets/Dialog",
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
    <YStack>
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
    </YStack>
  );
}

export const Interactive: Story = {
  render: () => <DialogDemo />,
};

export const WithoutActions: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <YStack>
        <Button onPress={() => setOpen(true)}>About</Button>
        <Dialog open={open} onOpenChange={setOpen} title="About this app">
          <Text variant="body">Version 1.0.0</Text>
        </Dialog>
      </YStack>
    );
  },
};

// Nested dialogs open in the same commit (#394): the parent
// carries no controls of its own — on the pre-registry stack
// the parent registered last and its containment swallowed
// Tab, leaving the nested dialog keyboard-unreachable. Tab and
// Shift+Tab now cycle only between the nested dialog's two
// actions; closing the nested dialog returns containment to
// the parent.
function NestedDialogsDemo() {
  const [parentOpen, setParentOpen] = useState(true);
  const [childOpen, setChildOpen] = useState(true);
  return (
    <YStack>
      <Button
        onPress={() => {
          setParentOpen(true);
          setChildOpen(true);
        }}
      >
        Open nested dialogs
      </Button>
      <Dialog open={parentOpen} onOpenChange={setParentOpen} title="Archive this recipe?">
        <Text variant="body">
          The parent dialog carries no controls of its own — the nested dialog below is the layer
          keyboard focus belongs in.
        </Text>
        <Dialog
          open={childOpen}
          onOpenChange={setChildOpen}
          title="Discard the draft instead?"
          description="Opened in the same commit as its parent."
          actions={
            <>
              <Button variant="secondary" size="sm" onPress={() => setChildOpen(false)}>
                Keep draft
              </Button>
              <Button variant="primary" size="sm" onPress={() => setChildOpen(false)}>
                Discard
              </Button>
            </>
          }
        >
          <Text variant="body">Tab cycles between Keep draft and Discard.</Text>
        </Dialog>
      </Dialog>
    </YStack>
  );
}

export const NestedDialogs: Story = {
  render: () => <NestedDialogsDemo />,
};
