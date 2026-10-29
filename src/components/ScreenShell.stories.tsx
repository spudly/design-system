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
          <YStack padding="$4">
            <Text>
              The toolbar stays pinned while this region scrolls — the fixed-shell structure detail
              pages compose from ScreenShell, Toolbar, and ScrollRegion.
            </Text>
          </YStack>
        </ScrollRegion>
      </ScreenShell>
    </YStack>
  ),
};
