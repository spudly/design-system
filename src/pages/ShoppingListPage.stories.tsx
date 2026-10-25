import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { shoppingListFixture } from "./fixtures.js";
import { ShoppingListPage, type ShoppingListPageLine } from "./ShoppingListPage.js";

/**
 * Stories for the real ShoppingListPage (#125): one line is
 * already checked, one carries the optional marker, one has
 * no quantity — the row states the real screen renders.
 * Check-off state is held by the story, as the app screen
 * holds it. Theme pinned to Warm Harvest.
 */
const meta: Meta<typeof ShoppingListPage> = {
  title: "Pages/Eciperay/ShoppingListPage",
  component: ShoppingListPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ShoppingListPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

function List() {
  const [lines, setLines] = useState<ShoppingListPageLine[]>(shoppingListFixture.lines);
  return (
    <ShoppingListPage
      lines={lines}
      onToggleLine={(key) => {
        setLines((current) =>
          current.map((line) =>
            line.key === key ? { ...line, isChecked: !line.isChecked } : line,
          ),
        );
      }}
    />
  );
}

export const Default: Story = {
  render: () => (
    <Viewport>
      <List />
    </Viewport>
  ),
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <ShoppingListPage lines={[]} isLoading onToggleLine={() => undefined} />
    </Viewport>
  ),
};

export const Empty: Story = {
  render: () => (
    <Viewport>
      <ShoppingListPage lines={[]} onToggleLine={() => undefined} />
    </Viewport>
  ),
};
