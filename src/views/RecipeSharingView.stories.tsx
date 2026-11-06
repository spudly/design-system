import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { TextLink } from "../widgets/TextLink.js";
import { RecipeSharingView } from "./RecipeSharingView.js";

const meta: Meta<typeof RecipeSharingView> = {
  title: "Views/RecipeSharingView",
  component: RecipeSharingView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeSharingView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" padding="$4">
      {children}
    </View>
  );
}

const options = [
  { value: "private", label: "Private", description: "Only you can see this recipe." },
  { value: "unlisted", label: "Unlisted", description: "Anyone with the link can view it." },
  { value: "public", label: "Public", description: "Anyone can find and view it." },
];

export const PublicWithConsent: Story = {
  render: () => (
    <Viewport>
      <RecipeSharingView
        options={options}
        value="public"
        onValueChange={() => undefined}
        publicWarning="Public recipes can be discovered by anyone. Make sure you're happy to share this recipe before saving."
        consentDescription={
          <>
            I agree to publish this recipe under the{" "}
            <TextLink href="/privacy">Privacy Policy</TextLink>.
          </>
        }
        consentChecked={false}
        onConsentCheckedChange={() => undefined}
        consentRequired
        onSave={() => undefined}
        shareLinkUrl="https://example.com/s/abc123"
        onRotateShareLink={() => undefined}
        rotateShareLinkLabel="Rotate share link"
        onCopyShareLink={() => undefined}
        permalinkUrl="https://example.com/recipes/skillet-chicken"
        onCopyPermalink={() => undefined}
      />
    </Viewport>
  ),
};

export const Private: Story = {
  render: () => (
    <Viewport>
      <RecipeSharingView
        options={options}
        value="private"
        onValueChange={() => undefined}
        onSave={() => undefined}
        onRotateShareLink={() => undefined}
      />
    </Viewport>
  ),
};
