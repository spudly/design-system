import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { TransferRecipesView } from "./TransferRecipesView.js";

const meta: Meta<typeof TransferRecipesView> = {
  title: "Views/TransferRecipesView",
  component: TransferRecipesView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof TransferRecipesView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" padding="$4">
      {children}
    </View>
  );
}

export const Default: Story = {
  render: () => (
    <Viewport>
      <TransferRecipesView
        exportPicker={{
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
        }}
        onImportPress={() => undefined}
        importSummary="Imported 3 recipes."
      />
    </Viewport>
  ),
};
