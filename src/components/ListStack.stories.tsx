import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ListRow } from "./ListRow.js";
import { ListStack } from "./ListStack.js";

const meta: Meta<typeof ListStack> = {
  title: "Components/ListStack",
  component: ListStack,
};

export default meta;
type Story = StoryObj<typeof ListStack>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <ListStack>
        <ListRow
          prefix="Meal · "
          title="Tacos al pastor"
          subtitle="Serves 4 · 640 kcal"
          onPress={() => {}}
        />
        <ListRow
          prefix="Recipe · "
          title="Garlic cream chicken"
          subtitle="2 servings · 520 kcal"
          onPress={() => {}}
        />
        <ListRow
          prefix="Recipe · "
          title="Old family lasagna"
          titleSuffix=" (unavailable)"
          isDisabled
          onPress={() => {}}
        />
      </ListStack>
    </YStack>
  ),
};
