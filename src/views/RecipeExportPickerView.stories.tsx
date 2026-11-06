import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { RecipeExportPickerView } from "./RecipeExportPickerView.js";

const meta: Meta<typeof RecipeExportPickerView> = {
  title: "Views/RecipeExportPickerView",
  component: RecipeExportPickerView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeExportPickerView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" padding="$4">
      {children}
    </View>
  );
}

const items = [
  { id: "r1", label: "Skillet Chicken" },
  { id: "r2", label: "First Soup" },
  { id: "r3", label: "Garden Salad" },
];

export const WithSelection: Story = {
  render: () => (
    <Viewport>
      <RecipeExportPickerView
        search=""
        onSearchChange={() => undefined}
        items={items}
        selectedIds={["r1", "r3"]}
        onToggle={() => undefined}
        onSelectAll={() => undefined}
        onClearSelection={() => undefined}
        onExport={() => undefined}
        exportLabel="Export selected (2)"
      />
    </Viewport>
  ),
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <RecipeExportPickerView
        search=""
        onSearchChange={() => undefined}
        items={[]}
        selectedIds={[]}
        onToggle={() => undefined}
        onSelectAll={() => undefined}
        onClearSelection={() => undefined}
        loading
        onExport={() => undefined}
        exportLabel="Export selected (0)"
      />
    </Viewport>
  ),
};
