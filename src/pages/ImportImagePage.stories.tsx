import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { ImportImagePage } from "./ImportImagePage.js";

const meta: Meta<typeof ImportImagePage> = {
  title: "Pages/Eciperay/ImportImagePage",
  component: ImportImagePage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ImportImagePage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}


export const Idle: Story = {
  render: () => (
    <Viewport>
      <ImportImagePage
        onPickCamera={() => undefined}
        onPickLibrary={() => undefined}
      />
    </Viewport>
  ),
};
