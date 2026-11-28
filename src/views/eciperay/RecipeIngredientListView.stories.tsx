import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../widgets/actions/Button.js";
import { StoryFrame } from "../shared/storyFrame.js";

import {
  RecipeIngredientListView,
  type RecipeIngredientField,
  type RecipeIngredientRow,
} from "./RecipeIngredientListView.js";

const meta: Meta<typeof RecipeIngredientListView> = {
  title: "Views/Eciperay/RecipeIngredientListView",
  component: RecipeIngredientListView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeIngredientListView>;

const seedRows: RecipeIngredientRow[] = [
  { key: "chicken", quantity: "1 1/2", unit: "lb", name: "Chicken breasts" },
  { key: "garlic", quantity: "4", unit: "", name: "Garlic cloves" },
  { key: "cream", quantity: "1", unit: "cup", name: "Heavy cream" },
];

/** Stateful harness: the list is controlled, so the harness
 * plays the host's part (form state, row keys, add/remove).
 * `hostDragHandle` binds the host-override handle; without
 * it the list renders the default DS grip (#878). */
function Harness({
  initial,
  hostDragHandle = true,
}: {
  initial: RecipeIngredientRow[];
  hostDragHandle?: boolean;
}) {
  const [rows, setRows] = useState(initial);
  const nextKey = useRef(0);
  const onFieldChange = (key: string, field: RecipeIngredientField, value: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };
  return (
    <RecipeIngredientListView
      rows={rows}
      onFieldChange={onFieldChange}
      onRemove={(key) => {
        setRows((prev) => prev.filter((r) => r.key !== key));
      }}
      onAdd={() => {
        nextKey.current += 1;
        const key = `added-${nextKey.current}`;
        setRows((prev) => [...prev, { key, quantity: "", unit: "", name: "" }]);
      }}
      {...(hostDragHandle
        ? {
            renderDragHandle: (_row: RecipeIngredientRow, index: number) => (
              <Button
                variant="secondary"
                size="sm"
                accessibilityLabel={`Reorder ingredient ${index + 1}`}
                onPress={() => {}}
              >
                Drag
              </Button>
            ),
          }
        : {})}
    />
  );
}

/** The labeled list: rows with host-bound drag handles (the
 * host override), the add action in the label row. */
export const Default: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <Harness initial={seedRows} />
    </StoryFrame>
  ),
};

/** No `renderDragHandle` supplied: every row renders the
 * design system's own drag-handle grip (#878) — hosts keep
 * only the drag behavior, not the handle visual. */
export const WithDefaultDragHandle: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <Harness initial={seedRows} hostDragHandle={false} />
    </StoryFrame>
  ),
};

/** No rows: the empty line renders; the add action stays. */
export const Empty: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <Harness initial={[]} />
    </StoryFrame>
  ),
};

/** No intents bound: no add or remove actions — a
 * read-only-order rendering of the same rows, with the
 * default DS grip on each row. */
export const WithoutIntents: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeIngredientListView rows={seedRows} />
    </StoryFrame>
  ),
};
