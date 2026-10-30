import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { SuggestionPanel } from "./SuggestionPanel.js";

const meta: Meta<typeof SuggestionPanel> = {
  title: "Components/SuggestionPanel",
  component: SuggestionPanel,
};

export default meta;
type Story = StoryObj<typeof SuggestionPanel>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430} padding="$4">
      <SuggestionPanel
        title="Substitutions"
        entries={[
          {
            id: "jasmine rice",
            label: "jasmine rice",
            detail: "basmati rice, or cauliflower rice",
          },
          { id: "spinach", label: "spinach", detail: "kale, stems removed, or frozen spinach" },
        ]}
      />
    </YStack>
  ),
};
