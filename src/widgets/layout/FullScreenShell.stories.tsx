import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { FullScreenShell } from "./FullScreenShell.js";
import { Text } from "../data/Text.js";

const meta: Meta<typeof FullScreenShell> = {
  title: "Widgets/Layout & Structure/FullScreenShell",
  component: FullScreenShell,
};

export default meta;
type Story = StoryObj<typeof FullScreenShell>;

/**
 * The frame bounds its single content region to the whole
 * viewport with NO Big Footer (#752/#753): an
 * absolutely-positioned full-region child (the cooking-mode
 * pages' StepOverlay) anchors to the entire screen — no
 * footer band and no reserved footer height.
 */
export const FullScreen: Story = {
  render: () => (
    <FullScreenShell>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        alignItems="center"
        justifyContent="center"
      >
        <Text>Full-screen content region</Text>
      </YStack>
    </FullScreenShell>
  ),
};
