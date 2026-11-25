import type { Meta, StoryObj } from "@storybook/react";
import { InstallBannerView } from "./InstallBannerView.js";
import { StoryFrame } from "./storyFrame.js";

const meta: Meta<typeof InstallBannerView> = {
  title: "Views/Shared/InstallBannerView",
  component: InstallBannerView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof InstallBannerView>;

export const Default: Story = {
  render: () => (
    <StoryFrame variant="banner">
      <InstallBannerView
        message="Get the app for cooking mode and offline access:"
        links={[
          { label: "App Store", href: "https://example.com/app-store" },
          { label: "Google Play", href: "https://example.com/google-play" },
        ]}
        onDismiss={() => undefined}
      />
    </StoryFrame>
  ),
};
