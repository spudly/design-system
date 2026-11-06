import { eciperayFooterFixture } from "./fixtures.js";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { RouteErrorPage } from "./RouteErrorPage.js";

const meta: Meta<typeof RouteErrorPage> = {
  title: "Pages/Eciperay/RouteErrorPage",
  component: RouteErrorPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RouteErrorPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

export const NotFound: Story = {
  render: () => (
    <Viewport>
      <RouteErrorPage footer={eciperayFooterFixture} variant="notFound" />
    </Viewport>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <Viewport>
      <RouteErrorPage footer={eciperayFooterFixture} variant="error" />
    </Viewport>
  ),
};
