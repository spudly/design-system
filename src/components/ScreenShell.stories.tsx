import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { Badge } from "./Badge.js";
import { ScreenShell } from "./ScreenShell.js";
import { ScrollRegion } from "./ScrollRegion.js";
import { Text } from "./Text.js";

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
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$3"
          gap="$2"
          alignItems="center"
          borderBottomWidth={1}
          borderColor="$borderColor"
        >
          <Badge tone="info">Evolving</Badge>
          <Text variant="hint">Version 3</Text>
        </XStack>
        <ScrollRegion>
          <YStack padding="$4">
            <Text>
              The toolbar stays pinned while this region scrolls — the fixed-shell structure detail
              pages compose from ScreenShell, their pinned chrome, and ScrollRegion.
            </Text>
          </YStack>
        </ScrollRegion>
      </ScreenShell>
    </YStack>
  ),
};
