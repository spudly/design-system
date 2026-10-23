import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Tabs } from "./Tabs.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const recipeTabs = [
  { value: "overview", label: "Overview" },
  { value: "ingredients", label: "Ingredients" },
  { value: "instructions", label: "Instructions" },
];

const studyTabs = [
  { value: "verses", label: "My verses" },
  { value: "search", label: "Search" },
  { value: "review", label: "Review" },
  { value: "settings", label: "Settings" },
];

function TabsDemo({ tabs }: { tabs: { value: string; label: string }[] }) {
  const [value, setValue] = useState(tabs[0]?.value ?? "");
  return (
    <YStack>
      <Tabs tabs={tabs} value={value} onValueChange={setValue} />
      <YStack paddingTop={16}>
        <Text variant="hint">Selected: {value}</Text>
      </YStack>
    </YStack>
  );
}

export const RecipeDetail: Story = {
  render: () => <TabsDemo tabs={recipeTabs} />,
};

export const AppNavigation: Story = {
  render: () => <TabsDemo tabs={studyTabs} />,
};
