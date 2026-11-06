import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { FeedbackPreferenceView } from "./FeedbackPreferenceView.js";

const meta: Meta<typeof FeedbackPreferenceView> = {
  title: "Views/FeedbackPreferenceView",
  component: FeedbackPreferenceView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof FeedbackPreferenceView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" padding="$4">
      {children}
    </View>
  );
}

const actions = {
  onShortcutEnabledChange: () => undefined,
  onAcceptConsent: () => undefined,
  onDeclineConsent: () => undefined,
  onWithdrawConsent: () => undefined,
  choicesHref: "/privacy/consent",
};

export const ConsentAccepted: Story = {
  render: () => (
    <Viewport>
      <FeedbackPreferenceView
        shortcutEnabled
        consent={true}
        consentStatusText="Analytics consent: Accepted"
        {...actions}
      />
    </Viewport>
  ),
};

export const PromptOpen: Story = {
  render: () => (
    <Viewport>
      <FeedbackPreferenceView
        shortcutEnabled={false}
        consent={null}
        consentStatusText="Analytics consent: Not set"
        consentPromptOpen
        {...actions}
      />
    </Viewport>
  ),
};

export const ShortcutUnavailable: Story = {
  render: () => (
    <Viewport>
      <FeedbackPreferenceView
        shortcutEnabled={false}
        shortcutUnavailable
        unavailableHint="The feedback shortcut needs analytics, which isn't configured."
        consent={false}
        consentStatusText="Analytics consent: Declined"
        {...actions}
      />
    </Viewport>
  ),
};
