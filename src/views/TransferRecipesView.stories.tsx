import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { TransferRecipesView } from "./TransferRecipesView.js";
import { StoryFrame } from "./storyFrame.js";

const meta: Meta<typeof TransferRecipesView> = {
  title: "Views/TransferRecipesView",
  component: TransferRecipesView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof TransferRecipesView>;

const exportPicker = {
  search: "",
  onSearchChange: () => undefined,
  items: [
    { id: "r1", label: "Skillet Chicken" },
    { id: "r2", label: "First Soup" },
  ],
  selectedIds: ["r1"],
  onToggle: () => undefined,
  onSelectAll: () => undefined,
  onClearSelection: () => undefined,
  onExport: () => undefined,
  exportLabel: "Export selected (1)",
};

export const Default: Story = {
  render: () => (
    <StoryFrame padded>
      <TransferRecipesView
        exportPicker={exportPicker}
        onImportPress={() => undefined}
        importSummary="Imported 3 recipes."
      />
    </StoryFrame>
  ),
};

export const Loading: Story = {
  render: () => (
    <StoryFrame padded>
      <TransferRecipesView exportPicker={exportPicker} onImportPress={() => undefined} loading />
    </StoryFrame>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <StoryFrame padded>
      <YStack position="relative">
        <TransferRecipesView
          exportPicker={exportPicker}
          onImportPress={() => undefined}
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
            onImportPress={() => undefined}
            loading
          />
        </YStack>
      </YStack>
    </StoryFrame>
  ),
};
