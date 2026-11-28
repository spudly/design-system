import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { StoryFrame } from "../shared/storyFrame.js";

import { TransferRecipesView } from "./TransferRecipesView.js";

const meta: Meta<typeof TransferRecipesView> = {
  title: "Views/Eciperay/TransferRecipesView",
  component: TransferRecipesView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof TransferRecipesView>;

const exportPicker = {
  search: "",
  onSearchChange: () => {},
  items: [
    { id: "r1", label: "Skillet Chicken" },
    { id: "r2", label: "First Soup" },
  ],
  selectedIds: ["r1"],
  onToggle: () => {},
  onSelectAll: () => {},
  onClearSelection: () => {},
  onExport: () => {},
  exportLabel: "Export selected (1)",
};

export const Default: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <TransferRecipesView
        exportPicker={exportPicker}
        onImportPress={() => {}}
        importSummary="Imported 3 recipes."
      />
    </StoryFrame>
  ),
};

export const Loading: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <TransferRecipesView exportPicker={exportPicker} onImportPress={() => {}} loading />
    </StoryFrame>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <YStack position="relative">
        <TransferRecipesView
          exportPicker={exportPicker}
          onImportPress={() => {}}
          importSummary="Imported 3 recipes."
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
          <TransferRecipesView
            exportPicker={exportPicker}
            onImportPress={() => {}}
            loading
          />
        </YStack>
      </YStack>
    </StoryFrame>
  ),
};
