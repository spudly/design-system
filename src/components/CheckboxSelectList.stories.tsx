import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CheckboxSelectList } from "./CheckboxSelectList.js";

const meta: Meta<typeof CheckboxSelectList> = {
  title: "Components/CheckboxSelectList",
  component: CheckboxSelectList,
};

export default meta;
type Story = StoryObj<typeof CheckboxSelectList>;

const ITEMS = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
  { id: "c", label: "Gamma" },
];

export const Default: Story = {
  render: () => {
    const [selectedIds, setSelectedIds] = useState<string[]>(["a"]);
    return (
      <CheckboxSelectList
        items={ITEMS}
        selectedIds={selectedIds}
        onToggle={(id) => {
          setSelectedIds((previous) =>
            previous.includes(id) ? previous.filter((entry) => entry !== id) : [...previous, id],
          );
        }}
      />
    );
  },
};

export const Loading: Story = {
  args: { items: [], selectedIds: [], onToggle: () => {}, isLoading: true },
};

export const Empty: Story = {
  args: { items: [], selectedIds: [], onToggle: () => {} },
};
