import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { InstallBannerView } from "./InstallBannerView.js";

const meta: Meta<typeof InstallBannerView> = {
  title: "Views/InstallBannerView",
  component: InstallBannerView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof InstallBannerView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={300}>
      {children}
    </View>
  );
}

export const Default: Story = {
  render: () => (
    <Viewport>
      <InstallBannerView
        message="Get the app for cooking mode and offline access:"
        links={[
          { label: "App Store", href: "https://example.com/app-store" },
          { label: "Google Play", href: "https://example.com/google-play" },
        ]}
        onDismiss={() => undefined}
      />
    </Viewport>
  ),
};
