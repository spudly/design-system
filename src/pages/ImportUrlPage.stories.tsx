import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { ImportUrlPage } from "./ImportUrlPage.js";

const meta: Meta<typeof ImportUrlPage> = {
  title: "Pages/Eciperay/ImportUrlPage",
  component: ImportUrlPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ImportUrlPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

export const Filled: Story = {
  render: () => (
    <Viewport>
      <ImportUrlPage
        url="https://example.com/recipes/mushroom-stroganoff"
        onUrlChange={() => undefined}
        onSubmit={() => undefined}
      />
    </Viewport>
  ),
};
