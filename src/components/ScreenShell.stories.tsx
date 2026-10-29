import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Badge } from "./Badge.js";
import { ScreenShell } from "./ScreenShell.js";
import { ScrollRegion } from "./ScrollRegion.js";
import { Text } from "./Text.js";
import { Toolbar } from "./Toolbar.js";

const meta: Meta<typeof ScreenShell> = {
  title: "Components/ScreenShell",
  component: ScreenShell,
};

export default meta;
type Story = StoryObj<typeof ScreenShell>;

export const Default: Story = {
  render: () => (
    <YStack width={430} maxWidth="100%" height={480}>
      <ScreenShell>
        <Toolbar>
          <Badge tone="info">Evolving</Badge>
          <Text variant="hint">Version 3</Text>
        </Toolbar>
        <ScrollRegion>
          <YStack padding="$4" gap="$3">
            <Text>
              The toolbar stays pinned while this region scrolls — the fixed-shell structure detail
              pages compose from ScreenShell, Toolbar, and ScrollRegion.
            </Text>
            <Text>
              The shell flexes to its parent and paints the surface token; only the region between
              the pinned bars scrolls, so page chrome keeps its place at any content height.
            </Text>
            <Text>
              Content taller than the shell — like these paragraphs — is what makes the pinning
              visible: scroll and the toolbar above stays put while this text moves under it.
            </Text>
            <Text>
              Pages own no frame styling of their own (#119): the shell, the bar, and the region
              are the whole frame vocabulary, and everything inside the region is content.
            </Text>
            <Text>
              The last block sits well past the 480px shell height, so the region has somewhere to
              scroll to.
            </Text>
          </YStack>
        </ScrollRegion>
      </ScreenShell>
    </YStack>
  ),
};
