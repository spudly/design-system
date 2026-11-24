import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { RecipeExportPickerView } from "./RecipeExportPickerView.js";
import { StoryFrame } from "../shared/storyFrame.js";

const meta: Meta<typeof RecipeExportPickerView> = {
  title: "Views/Eciperay/RecipeExportPickerView",
  component: RecipeExportPickerView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeExportPickerView>;

const items = [
  { id: "r1", label: "Skillet Chicken" },
  { id: "r2", label: "First Soup" },
  { id: "r3", label: "Garden Salad" },
];

export const WithSelection: Story = {
  render: () => (
    <StoryFrame variant="panel">
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
    </StoryFrame>
  ),
};

export const Loading: Story = {
  render: () => (
    <StoryFrame variant="panel">
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
    </StoryFrame>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <YStack position="relative">
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
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.45}
          pointerEvents="none"
        >
          <RecipeExportPickerView
            search=""
            onSearchChange={() => undefined}
            items={items}
            selectedIds={["r1", "r3"]}
            onToggle={() => undefined}
            onSelectAll={() => undefined}
            onClearSelection={() => undefined}
            loading
            onExport={() => undefined}
            exportLabel="Export selected (2)"
          />
        </YStack>
      </YStack>
    </StoryFrame>
  ),
};
