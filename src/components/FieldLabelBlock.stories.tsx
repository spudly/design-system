import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { CheckboxSelectList } from "./CheckboxSelectList.js";
import { FieldLabelBlock } from "./FieldLabelBlock.js";

const meta: Meta<typeof FieldLabelBlock> = {
  title: "Components/FieldLabelBlock",
  component: FieldLabelBlock,
};

export default meta;
type Story = StoryObj<typeof FieldLabelBlock>;

const recipeItems = [
  { id: "tuscan", label: "Creamy Tuscan Garlic Chicken" },
  { id: "peppers", label: "Classic Stuffed Peppers" },
  { id: "brownies", label: "Fudgy Brownies" },
];

function BlockDemo() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["tuscan"]);
  const toggle = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
    );
  };
  return (
    <YStack maxWidth={430} gap={16}>
      <FieldLabelBlock label="Recipes" />
      <CheckboxSelectList items={recipeItems} selectedIds={selectedIds} onToggle={toggle} />
    </YStack>
  );
}

export const Default: Story = {
  render: () => <BlockDemo />,
};
