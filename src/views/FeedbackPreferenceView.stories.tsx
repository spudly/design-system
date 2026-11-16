import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { FeedbackPreferenceView } from "./FeedbackPreferenceView.js";
import { StoryFrame } from "./storyFrame.js";

const meta: Meta<typeof FeedbackPreferenceView> = {
  title: "Views/FeedbackPreferenceView",
  component: FeedbackPreferenceView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof FeedbackPreferenceView>;

const actions = {
  onShortcutEnabledChange: () => undefined,
  onAcceptConsent: () => undefined,
  onDeclineConsent: () => undefined,
  onWithdrawConsent: () => undefined,
  choicesHref: "/privacy/consent",
};

export const ConsentAccepted: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <FeedbackPreferenceView
        shortcutEnabled
        consent={true}
        consentStatusText="Analytics consent: Accepted"
        {...actions}
      />
    </StoryFrame>
  ),
};

export const PromptOpen: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <FeedbackPreferenceView
        shortcutEnabled={false}
        consent={null}
        consentStatusText="Analytics consent: Not set"
        consentPromptOpen
        {...actions}
      />
    </StoryFrame>
  ),
};

export const ShortcutUnavailable: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <FeedbackPreferenceView
        shortcutEnabled={false}
        shortcutUnavailable
        unavailableHint="The feedback shortcut needs analytics, which isn't configured."
        consent={false}
        consentStatusText="Analytics consent: Declined"
        {...actions}
      />
    </StoryFrame>
  ),
};

export const Loading: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <FeedbackPreferenceView
        shortcutEnabled
        consent={true}
        consentStatusText="Analytics consent: Accepted"
        {...actions}
        loading
      />
    </StoryFrame>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <View position="relative">
        <FeedbackPreferenceView
          shortcutEnabled
          consent={true}
          consentStatusText="Analytics consent: Accepted"
          {...actions}
        />
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.45}
          pointerEvents="none"
        >
          <FeedbackPreferenceView
            shortcutEnabled
            consent={true}
            consentStatusText="Analytics consent: Accepted"
            {...actions}
            loading
          />
        </View>
      </View>
    </StoryFrame>
  ),
};
