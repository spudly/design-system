import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { CheckboxSelectList } from "./CheckboxSelectList.js";

const meta: Meta<typeof CheckboxSelectList> = {
  title: "Widgets/CheckboxSelectList",
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
  args: { items: [], selectedIds: [], onToggle: () => {}, loading: true },
};

export const Empty: Story = {
  args: { items: [], selectedIds: [], onToggle: () => {} },
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430}>
      <CheckboxSelectList items={ITEMS} selectedIds={["a"]} onToggle={() => {}} />
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <CheckboxSelectList items={ITEMS} selectedIds={["a"]} onToggle={() => {}} loading />
      </YStack>
    </YStack>
  ),
};
