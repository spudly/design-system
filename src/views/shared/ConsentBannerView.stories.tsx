import type { Meta, StoryObj } from "@storybook/react";

import { ConsentBannerView } from "./ConsentBannerView.js";
import { StoryFrame } from "./storyFrame.js";

const meta: Meta<typeof ConsentBannerView> = {
  title: "Views/Shared/ConsentBannerView",
  component: ConsentBannerView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ConsentBannerView>;

export const Default: Story = {
  render: () => (
    <StoryFrame variant="banner">
      <ConsentBannerView
        messageBeforeLink="We use analytics to improve the app. See our"
        linkLabel="Privacy Policy"
        linkHref="/privacy"
        messageAfterLink=" for details."
        onAccept={() => {}}
        onDecline={() => {}}
      />
    </StoryFrame>
  ),
};
