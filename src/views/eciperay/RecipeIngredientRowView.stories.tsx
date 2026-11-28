import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../widgets/actions/Button.js";
import { StoryFrame } from "../shared/storyFrame.js";

import { RecipeIngredientRowView } from "./RecipeIngredientRowView.js";

const meta: Meta<typeof RecipeIngredientRowView> = {
  title: "Views/Eciperay/RecipeIngredientRowView",
  component: RecipeIngredientRowView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeIngredientRowView>;

const noop = () => { /* noop */ };

/** The host-bound drag handle stand-in: in the apps this node
 * is the drag container's activator (dnd-kit / DraggableFlatList). */
function DragHandle() {
  return (
    <Button variant="secondary" size="sm" accessibilityLabel="Reorder ingredient 1" onPress={() => { /* noop */ }}>
      Drag
    </Button>
  );
}

/** A filled row with its drag handle and remove action. */
export const Default: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeIngredientRowView
        row={{ key: "flour", quantity: "2", unit: "cups", name: "All-purpose flour" }}
        index={0}
        dragHandle={<DragHandle />}
        onFieldChange={noop}
        onRemove={noop}
      />
    </StoryFrame>
  ),
};

/** No drag handle bound: the fields and remove action only. */
export const WithoutDragHandle: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeIngredientRowView
        row={{ key: "eggs", quantity: "3", unit: "", name: "Eggs" }}
        index={1}
        onFieldChange={noop}
        onRemove={noop}
      />
    </StoryFrame>
  ),
};

/** A fresh row: every field empty, placeholders showing. */
export const Empty: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeIngredientRowView
        row={{ key: "new", quantity: "", unit: "", name: "" }}
        index={2}
        dragHandle={<DragHandle />}
        onFieldChange={noop}
        onRemove={noop}
      />
    </StoryFrame>
  ),
};
