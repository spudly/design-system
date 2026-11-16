import type { Meta, StoryObj } from "@storybook/react";
import { ConsentBannerView } from "./ConsentBannerView.js";
import { StoryFrame } from "./storyFrame.js";

const meta: Meta<typeof ConsentBannerView> = {
  title: "Views/ConsentBannerView",
  component: ConsentBannerView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ConsentBannerView>;

export const Default: Story = {
  render: () => (
    <StoryFrame height={300}>
      <ConsentBannerView
        messageBeforeLink="We use analytics to improve the app. See our"
        linkLabel="Privacy Policy"
        linkHref="/privacy"
        messageAfterLink=" for details."
        onAccept={() => undefined}
        onDecline={() => undefined}
      />
    </StoryFrame>
  ),
};
