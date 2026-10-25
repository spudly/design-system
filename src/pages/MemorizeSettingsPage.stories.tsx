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
 * key with Drive connected (the resting state), a fresh
 * install (no key, Drive not yet connected), and a sync
 * conflict awaiting the user's choice.
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
// mirrors it, masked by the secure entry) and a Drive
// connection, so Clear renders and the sync card offers Sync.
// The folder name is the app's default.
export const Default: Story = {
  render: () => (
    <Viewport>
      <MemorizeSettingsPage
        apiKeyValue="example-api-key"
        onApiKeyValueChange={noop}
        hasSavedApiKey
        onSaveApiKeyPress={noop}
        onClearApiKeyPress={noop}
        driveFolderName="Memorize"
        driveConnected
        driveConnectReady
        isSyncing={false}
        syncConflict={false}
        onConnectDrivePress={noop}
        onSyncDrivePress={noop}
        onKeepDevicePress={noop}
        onKeepDrivePress={noop}
      />
    </Viewport>
  ),
};

// A fresh install: no key typed or saved (Save disabled, no
// Clear) and no Drive connection — the sync card offers
// Connect, enabled because the auth flow is ready.
export const NoApiKeyDriveDisconnected: Story = {
  render: () => (
    <Viewport>
      <MemorizeSettingsPage
        apiKeyValue=""
        onApiKeyValueChange={noop}
        hasSavedApiKey={false}
        onSaveApiKeyPress={noop}
        onClearApiKeyPress={noop}
        driveFolderName="Memorize"
        driveConnected={false}
        driveConnectReady
        isSyncing={false}
        syncConflict={false}
        onConnectDrivePress={noop}
        onSyncDrivePress={noop}
        onKeepDevicePress={noop}
        onKeepDrivePress={noop}
      />
    </Viewport>
  ),
};

// A sync that found both sides changed: the host's message
// crosses verbatim and renders as a warning, and the
// resolution pair appears under it.
export const SyncConflict: Story = {
  render: () => (
    <Viewport>
      <MemorizeSettingsPage
        apiKeyValue="example-api-key"
        onApiKeyValueChange={noop}
        hasSavedApiKey
        onSaveApiKeyPress={noop}
        onClearApiKeyPress={noop}
        driveFolderName="Memorize"
        driveConnected
        driveConnectReady
        isSyncing={false}
        syncMessage="Both this device and Drive changed since the last sync. Choose which side wins."
        syncConflict
        onConnectDrivePress={noop}
        onSyncDrivePress={noop}
        onKeepDevicePress={noop}
        onKeepDrivePress={noop}
      />
    </Viewport>
  ),
};
