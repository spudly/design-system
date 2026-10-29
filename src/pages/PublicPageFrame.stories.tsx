import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../components/Text.js";
import { View, YStack } from "tamagui";
import { PublicPageFrame } from "./PublicPageFrame.js";
import { PublicRecipePage } from "./PublicRecipePage.js";
import { recipeDetailFixture } from "./fixtures.js";

/**
 * Stories for the real PublicPageFrame component (#169) — the
 * public chrome (header, wide column, footer) the host wraps
 * around every public page state. The Default story composes the
 * frame around the real PublicRecipePage in its not-found state,
 * the composition the web host renders; NarrowViewport pins the
 * same chrome at phone width, where the wide column simply fills
 * the viewport. Theme pinned to Warm Harvest, Eciperay's brand.
 * (The story is not named "Narrow": its baseline file would end
 * in "-narrow.png", the suffix the VR pipeline reserves for the
 * narrow-viewport variant captures.)
 */
const meta: Meta<typeof PublicPageFrame> = {
  title: "Pages/Eciperay/PublicPageFrame",
  component: PublicPageFrame,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof PublicPageFrame>;

function Viewport({ width, children }: { width: number; children: ReactNode }) {
  return (
    <View width={width} maxWidth="100%" height={900}>
      {children}
    </View>
  );
}

const frameProps = {
  onBrandPress: () => undefined,
  onSignInPress: () => undefined,
  onPrivacyPress: () => undefined,
  onTermsPress: () => undefined,
};

/** A plain stand-in for page content: the frame's contract is the
 * chrome and the column, not any page's sections. */
function StandInContent() {
  return (
    <YStack padding="$4" gap="$3">
      <Text variant="heading">{recipeDetailFixture.title}</Text>
      <Text>
        Page content renders in the frame's wide column — the header and footer stay pinned outside
        the page's own scroll.
      </Text>
    </YStack>
  );
}

export const Default: Story = {
  render: () => (
    <Viewport width={1024}>
      <PublicPageFrame {...frameProps}>
        <PublicRecipePage state="notFound" />
      </PublicPageFrame>
    </Viewport>
  ),
};

export const Content: Story = {
  render: () => (
    <Viewport width={1024}>
      <PublicPageFrame {...frameProps}>
        <StandInContent />
      </PublicPageFrame>
    </Viewport>
  ),
};

export const NarrowViewport: Story = {
  render: () => (
    <Viewport width={430}>
      <PublicPageFrame {...frameProps}>
        <StandInContent />
      </PublicPageFrame>
    </Viewport>
  ),
};
