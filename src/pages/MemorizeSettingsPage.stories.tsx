import { memorizeFooterFixture } from "./fixtures.js";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { MemorizeSettingsPage } from "./MemorizeSettingsPage.js";

/**
 * Stories for the real MemorizeSettingsPage component
 * (#127) — not a made-up page composition: this renders the
 * same component the Memorize app will consume. The page
 * renders only its "Settings" heading — the Google Drive
 * sync section was removed entirely in #424 when Stephen
 * removed Drive sync from Memorize, and the API key section
 * was removed entirely in #439 when Stephen ruled Memorize
 * search is server-key-only on every platform. With both
 * sections gone the page has a single display state.
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

// The page's only state: the heading in the shared shell,
// with the host-supplied footer.
export const Default: Story = {
  render: () => (
    <Viewport>
      <MemorizeSettingsPage footer={memorizeFooterFixture} />
    </Viewport>
  ),
};
