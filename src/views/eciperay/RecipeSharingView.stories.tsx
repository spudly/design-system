import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { StoryFrame } from "../shared/storyFrame.js";

import { RecipeSharingView } from "./RecipeSharingView.js";

const meta: Meta<typeof RecipeSharingView> = {
  title: "Views/Eciperay/RecipeSharingView",
  component: RecipeSharingView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeSharingView>;

const options = [
  { value: "private", label: "Private", description: "Only you can see this recipe." },
  { value: "unlisted", label: "Unlisted", description: "Anyone with the link can view it." },
  { value: "public", label: "Public", description: "Anyone can find and view it." },
];

function PublicWithConsentDemo() {
  // Stateful consent so the manual check can exercise the
  // consent gate: Save stays disabled until the box is checked.
  const [consentChecked, setConsentChecked] = useState(false);
  return (
    <StoryFrame variant="panel">
      <RecipeSharingView
        options={options}
        value="public"
        onValueChange={() => { /* noop */ }}
        publicWarning="Public recipes can be discovered by anyone. Make sure you're happy to share this recipe before saving."
        consentDescription={[
          { type: "text", text: "I agree to publish this recipe under the " },
          { type: "link", label: "Privacy Policy", href: "/privacy" },
          { type: "text", text: "." },
        ]}
        consentChecked={consentChecked}
        onConsentCheckedChange={setConsentChecked}
        consentRequired
        onSave={() => { /* noop */ }}
        shareLinkUrl="https://example.com/s/abc123"
        onRotateShareLink={() => { /* noop */ }}
        rotateShareLinkLabel="Rotate share link"
        onCopyShareLink={() => { /* noop */ }}
        permalinkUrl="https://example.com/recipes/skillet-chicken"
        onCopyPermalink={() => { /* noop */ }}
      />
    </StoryFrame>
  );
}

export const PublicWithConsent: Story = {
  render: () => <PublicWithConsentDemo />,
};

export const Private: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeSharingView
        options={options}
        value="private"
        onValueChange={() => { /* noop */ }}
        onSave={() => { /* noop */ }}
        onRotateShareLink={() => { /* noop */ }}
      />
    </StoryFrame>
  ),
};

export const Loading: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeSharingView
        options={options}
        value="private"
        onValueChange={() => { /* noop */ }}
        onSave={() => { /* noop */ }}
        onRotateShareLink={() => { /* noop */ }}
        loading
      />
    </StoryFrame>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <YStack position="relative">
        <RecipeSharingView
          options={options}
          value="private"
          onValueChange={() => { /* noop */ }}
          onSave={() => { /* noop */ }}
          onRotateShareLink={() => { /* noop */ }}
        />
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.45}
          pointerEvents="none"
        >
          <RecipeSharingView
            options={options}
            value="private"
            onValueChange={() => { /* noop */ }}
            onSave={() => { /* noop */ }}
            onRotateShareLink={() => { /* noop */ }}
            loading
          />
        </YStack>
      </YStack>
    </StoryFrame>
  ),
};
