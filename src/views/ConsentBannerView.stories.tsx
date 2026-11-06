import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { ConsentBannerView } from "./ConsentBannerView.js";

const meta: Meta<typeof ConsentBannerView> = {
  title: "Views/ConsentBannerView",
  component: ConsentBannerView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ConsentBannerView>;

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
      <ConsentBannerView
        messageBeforeLink="We use analytics to improve the app. See our"
        linkLabel="Privacy Policy"
        linkHref="/privacy"
        messageAfterLink=" for details."
        onAccept={() => undefined}
        onDecline={() => undefined}
      />
    </Viewport>
  ),
};
