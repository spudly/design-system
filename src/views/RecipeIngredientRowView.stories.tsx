import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { Button } from "../widgets/Button.js";
import { RecipeIngredientRowView } from "./RecipeIngredientRowView.js";

const meta: Meta<typeof RecipeIngredientRowView> = {
  title: "Views/RecipeIngredientRowView",
  component: RecipeIngredientRowView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeIngredientRowView>;

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
    <Button variant="secondary" size="sm" accessibilityLabel="Reorder ingredient 1" onPress={() => undefined}>
      Drag
    </Button>
  );
}

/** A filled row with its drag handle and remove action. */
export const Default: Story = {
  render: () => (
    <Viewport>
      <RecipeIngredientRowView
        row={{ key: "flour", quantity: "2", unit: "cups", name: "All-purpose flour" }}
        index={0}
        dragHandle={<DragHandle />}
        onFieldChange={noop}
        onRemove={noop}
      />
    </Viewport>
  ),
};

/** No drag handle bound: the fields and remove action only. */
export const WithoutDragHandle: Story = {
  render: () => (
    <Viewport>
      <RecipeIngredientRowView
        row={{ key: "eggs", quantity: "3", unit: "", name: "Eggs" }}
        index={1}
        onFieldChange={noop}
        onRemove={noop}
      />
    </Viewport>
  ),
};

/** A fresh row: every field empty, placeholders showing. */
export const Empty: Story = {
  render: () => (
    <Viewport>
      <RecipeIngredientRowView
        row={{ key: "new", quantity: "", unit: "", name: "" }}
        index={2}
        dragHandle={<DragHandle />}
        onFieldChange={noop}
        onRemove={noop}
      />
    </Viewport>
  ),
};
