import { useRef, useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { Button } from "../widgets/Button.js";
import {
  RecipeInstructionListView,
  type RecipeInstructionRow,
} from "./RecipeInstructionListView.js";

const meta: Meta<typeof RecipeInstructionListView> = {
  title: "Views/RecipeInstructionListView",
  component: RecipeInstructionListView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeInstructionListView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" padding="$4">
      {children}
    </View>
  );
}

const seedRows: RecipeInstructionRow[] = [
  { key: "sear", body: "Season the chicken and sear in a large skillet until golden." },
  { key: "simmer", body: "Pour in the cream and simmer gently until the sauce thickens." },
];

/** Stateful harness: the list is controlled, so the harness
 * plays the host's part (form state, row keys, add/remove). */
function Harness({ initial }: { initial: RecipeInstructionRow[] }) {
  const [rows, setRows] = useState(initial);
  const nextKey = useRef(0);
  return (
    <RecipeInstructionListView
      rows={rows}
      onBodyChange={(key, value) => {
        setRows((prev) => prev.map((r) => (r.key === key ? { ...r, body: value } : r)));
      }}
      onRemove={(key) => {
        setRows((prev) => prev.filter((r) => r.key !== key));
      }}
      onAdd={() => {
        nextKey.current += 1;
        const key = `added-${nextKey.current}`;
        setRows((prev) => [...prev, { key, body: "" }]);
      }}
      renderDragHandle={(_row, index) => (
        <Button
          variant="secondary"
          size="sm"
          accessibilityLabel={`Reorder step ${index + 1}`}
          onPress={() => undefined}
        >
          Drag
        </Button>
      )}
    />
  );
}

/** The labeled list: numbered steps with host-bound drag
 * handles, the add action in the label row. */
export const Default: Story = {
  render: () => (
    <Viewport>
      <Harness initial={seedRows} />
    </Viewport>
  ),
};

/** No rows: the empty line renders; the add action stays. */
export const Empty: Story = {
  render: () => (
    <Viewport>
      <Harness initial={[]} />
    </Viewport>
  ),
};

/** No intents bound: no add or remove actions — a
 * read-only-order rendering of the same steps. */
export const WithoutIntents: Story = {
  render: () => (
    <Viewport>
      <RecipeInstructionListView rows={seedRows} />
    </Viewport>
  ),
};
