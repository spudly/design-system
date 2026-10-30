import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ScrollShell } from "./ScrollShell.js";
import { Text } from "./Text.js";

const meta: Meta<typeof ScrollShell> = {
  title: "Components/ScrollShell",
  component: ScrollShell,
};

export default meta;
type Story = StoryObj<typeof ScrollShell>;

// Four blocks whose combined height exceeds the 480px frame, so the
// column visibly scrolls as one region — the behavior the manual
// checks exercise (docs/manual-tests.md, Page shells). Shorter
// content never overflows the frame and leaves scrolling untestable
// (#340).
export const Default: Story = {
  render: () => (
    <YStack width={430} height={480}>
      <ScrollShell>
        <Text variant="subheading">First block</Text>
        <Text>
          The shell paints the surface, scrolls as one region, and insets its blocks with the
          standard rhythm — this text and the headings sit 16px from the shell's edges and from each
          other without any of them carrying spacing.
        </Text>
        <Text variant="subheading">Second block</Text>
        <Text>
          Blocks stack in the shell's column in order. The column keeps the same inset and the same
          separation between every block, however many blocks the page composes into it.
        </Text>
        <Text variant="subheading">Third block</Text>
        <Text>
          With four blocks the content is taller than the frame, so the fourth block starts below
          the fold: reaching it means scrolling the whole column inside the surface frame, which is
          the shell's one job. Nothing outside the frame moves while it scrolls — the surface stays
          painted around the moving column, and the frame itself keeps its size.
        </Text>
        <Text variant="subheading">Fourth block</Text>
        <Text>
          The last block carries the column's bottom inset when it scrolls into view — the same 16px
          the first block sits from the top — so the rhythm holds at both ends of the scroll. If
          this paragraph is readable, the column scrolled: that is the whole check.
        </Text>
      </ScrollShell>
    </YStack>
  ),
};
