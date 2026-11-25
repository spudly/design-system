import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { FullBleed, PAGE_CONTENT_MAX_WIDTH, PageContentColumn } from "./PageContentColumn.js";
import { Text } from "../data/Text.js";

const meta: Meta<typeof PageContentColumn> = {
  title: "Widgets/Layout & Structure/PageContentColumn",
  component: PageContentColumn,
};

export default meta;
type Story = StoryObj<typeof PageContentColumn>;

/**
 * The column on a wide canvas (#628): the framed area is wider
 * than 1200px, so the content stack centers inside it with
 * clear space on both sides. On a narrow canvas the column is
 * simply full-width.
 */
export const CenteredColumn: Story = {
  render: () => (
    <YStack width="100%" borderWidth={1} borderColor="$borderColor">
      <PageContentColumn>
        <YStack backgroundColor="$surface" padding="$4" gap="$2">
          <Text variant="heading">Page content</Text>
          <Text>
            This block sits inside the centered {PAGE_CONTENT_MAX_WIDTH}px column: on a
            desktop-width canvas it stops at {PAGE_CONTENT_MAX_WIDTH}px and centers; the frame
            around it shows the space the column leaves on each side.
          </Text>
        </YStack>
      </PageContentColumn>
    </YStack>
  ),
};

/**
 * The breakout (#628): the middle band escapes the column to
 * the full width of its container's viewport measure via
 * FullBleed, while the blocks above and below stay inside the
 * centered column.
 */
export const WithFullBleedBreakout: Story = {
  render: () => (
    <YStack width="100%" borderWidth={1} borderColor="$borderColor">
      <PageContentColumn>
        <YStack gap="$2">
          <Text variant="heading">Inside the column</Text>
          <FullBleed>
            <YStack backgroundColor="$primary" padding="$4">
              <Text color="$onPrimary">Full-bleed band — this band breaks out of the column.</Text>
            </YStack>
          </FullBleed>
          <Text>Back inside the column, constrained and centered again.</Text>
        </YStack>
      </PageContentColumn>
    </YStack>
  ),
};
