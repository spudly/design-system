import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { PanelStack } from "./PanelStack.js";
import { StatBand } from "./StatBand.js";
import { StatCard } from "./StatCard.js";
import { Text } from "./Text.js";

const meta: Meta<typeof PanelStack> = {
  title: "Components/PanelStack",
  component: PanelStack,
};

export default meta;
type Story = StoryObj<typeof PanelStack>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <PanelStack>
        <Text variant="formTitle">Tuscan chicken</Text>
        <Text variant="body">
          A weeknight chicken and rice skillet with sun-dried tomatoes and spinach.
        </Text>
        <StatBand>
          <StatCard label="Servings" value="4" />
          <StatCard label="Prep" value="15m" />
          <StatCard label="Cook" value="30m" />
        </StatBand>
      </PanelStack>
    </YStack>
  ),
};
