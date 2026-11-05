import { memorizeFooterFixture } from "./fixtures.js";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { MemorizeSettingsPage } from "./MemorizeSettingsPage.js";

/**
 * Stories for the real MemorizeSettingsPage component
 * (#127) — not a made-up page composition: this renders the
 * same component the Memorize app will consume, driven by
 * fixture props. The states below are the screen's real
 * display states, as the app's host composes them: a saved
 * key (the resting state) and a fresh install (no key yet).
 * The page renders only the "Scripture source" card — the
 * Google Drive sync section was removed entirely in #424
 * when Stephen removed Drive sync from Memorize.
 *
 * The frame matches the other page stories: a phone viewport
 * (430×844) pinned so Chromatic screenshots are deterministic
 * and the fixed shell bounds the way it does on device. Theme
 * pinned to Quiet Dawn, Memorize's brand, like Pages/Memorize.
 */
const meta: Meta<typeof MemorizeSettingsPage> = {
  title: "Pages/Memorize/MemorizeSettingsPage",
  component: MemorizeSettingsPage,
  globals: { theme: "light_quietDawn" },
};

export default meta;
type Story = StoryObj<typeof MemorizeSettingsPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

const noop = (): void => undefined;

// The resting state: the host holds a saved key (the field
// mirrors it, masked by the secure entry), so Clear renders
// beside Save.
export const Default: Story = {
  render: () => (
    <Viewport>
      <MemorizeSettingsPage
        footer={memorizeFooterFixture}
        apiKeyValue="example-api-key"
        onApiKeyValueChange={noop}
        hasSavedApiKey
        onSaveApiKeyPress={noop}
        onClearApiKeyPress={noop}
      />
    </Viewport>
  ),
};

// A fresh install: no key typed or saved, so Save is
// disabled and Clear does not render.
export const NoApiKey: Story = {
  render: () => (
    <Viewport>
      <MemorizeSettingsPage
        footer={memorizeFooterFixture}
        apiKeyValue=""
        onApiKeyValueChange={noop}
        hasSavedApiKey={false}
        onSaveApiKeyPress={noop}
        onClearApiKeyPress={noop}
      />
    </Viewport>
  ),
};
