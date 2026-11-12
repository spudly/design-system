import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { Button } from "../widgets/Button.js";
import { RecipeInstructionRowView } from "./RecipeInstructionRowView.js";

const meta: Meta<typeof RecipeInstructionRowView> = {
  title: "Views/RecipeInstructionRowView",
  component: RecipeInstructionRowView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeInstructionRowView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" padding="$4">
      {children}
    </View>
  );
}

const noop = () => undefined;

/** The host-bound drag handle stand-in: in the apps this node
 * is the drag container's activator (dnd-kit / DraggableFlatList). */
function DragHandle() {
  return (
    <Button variant="secondary" size="sm" accessibilityLabel="Reorder step 1" onPress={() => undefined}>
      Drag
    </Button>
  );
}

/** A filled step with its drag handle and remove action. */
export const Default: Story = {
  render: () => (
    <Viewport>
      <RecipeInstructionRowView
        row={{ key: "mix", body: "Whisk the flour and salt together in a large bowl." }}
        index={0}
        dragHandle={<DragHandle />}
        onBodyChange={noop}
        onRemove={noop}
      />
    </Viewport>
  ),
};

/** No drag handle bound: the step number, field, and remove
 * action only. */
export const WithoutDragHandle: Story = {
  render: () => (
    <Viewport>
      <RecipeInstructionRowView
        row={{ key: "bake", body: "Bake at 375°F for 25 minutes, until golden." }}
        index={1}
        onBodyChange={noop}
        onRemove={noop}
      />
    </Viewport>
  ),
};

/** A fresh step: the body field empty. */
export const Empty: Story = {
  render: () => (
    <Viewport>
      <RecipeInstructionRowView
        row={{ key: "new", body: "" }}
        index={2}
        dragHandle={<DragHandle />}
        onBodyChange={noop}
        onRemove={noop}
      />
    </Viewport>
  ),
};
