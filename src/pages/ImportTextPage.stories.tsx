import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { ImportTextPage } from "./ImportTextPage.js";

const meta: Meta<typeof ImportTextPage> = {
  title: "Pages/Eciperay/ImportTextPage",
  component: ImportTextPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ImportTextPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}


export const Empty: Story = {
  render: () => (
    <Viewport>
      <ImportTextPage onSubmit={() => undefined} />
    </Viewport>
  ),
};

export const WithError: Story = {
  render: () => (
    <Viewport>
      <ImportTextPage
        error="We couldn't find a recipe in that text. Check it and try again."
        onSubmit={() => undefined}
      />
    </Viewport>
  ),
};
