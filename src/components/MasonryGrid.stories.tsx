import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { Card } from "./Card.js";
import {
  MasonryGrid,
  type MasonryColumnCountOptions,
  type MasonryGridProps,
} from "./MasonryGrid.js";
import { Text } from "./Text.js";

const meta: Meta<typeof MasonryGrid> = {
  title: "Components/MasonryGrid",
  component: MasonryGrid,
  argTypes: {
    minColumnWidth: { control: { type: "number", min: 40, max: 400 } },
    minColumns: { control: { type: "number", min: 1, max: 6 } },
    maxColumns: { control: { type: "number", min: 1, max: 8 } },
    gap: { control: { type: "number", min: 0, max: 32 } },
  },
};

export default meta;
type Story = StoryObj<typeof MasonryGrid>;

type DemoItem = {
  id: string;
  title: string;
  /** How many times the filler line repeats — the card's height. */
  lines: number;
};

const FILLER = "A masonry card whose height comes from its content. ";

function makeItems(lineCounts: number[]): DemoItem[] {
  return lineCounts.map((lines, index) => ({
    id: `card-${index + 1}`,
    title: `Card ${index + 1}`,
    lines,
  }));
}

/** Twelve cards of varied heights — the staggered-columns showcase. */
const VARIED = makeItems([3, 1, 5, 2, 4, 1, 3, 5, 2, 4, 1, 3]);

function renderDemoItem(item: DemoItem) {
  return (
    <Card>
      <Text fontWeight="600">{item.title}</Text>
      <Text>{FILLER.repeat(item.lines)}</Text>
    </Card>
  );
}

/**
 * The layout props a story's controls drive. Each story spreads
 * these onto the grid so the minColumnWidth / minColumns /
 * maxColumns / gap controls actually re-flow it; story-specific
 * props set after the spread (items, a column cap) always win.
 */
function layoutArgs(args: MasonryColumnCountOptions): Partial<MasonryGridProps<DemoItem>> {
  return {
    minColumnWidth: args.minColumnWidth,
    minColumns: args.minColumns,
    maxColumns: args.maxColumns,
    gap: args.gap,
  };
}

export const VariableHeights: Story = {
  render: (args) => (
    <MasonryGrid
      {...layoutArgs(args)}
      items={VARIED}
      renderItem={renderDemoItem}
      keyExtractor={(item: DemoItem) => item.id}
    />
  ),
};

export const Narrow: Story = {
  render: (args) => (
    <View width={300}>
      <MasonryGrid
        {...layoutArgs(args)}
        items={VARIED}
        renderItem={renderDemoItem}
        keyExtractor={(item: DemoItem) => item.id}
      />
    </View>
  ),
};

export const TwoColumns: Story = {
  render: (args) => (
    <View width={360}>
      <MasonryGrid
        {...layoutArgs(args)}
        items={VARIED}
        renderItem={renderDemoItem}
        keyExtractor={(item: DemoItem) => item.id}
      />
    </View>
  ),
};

export const Wide: Story = {
  render: (args) => (
    <View width={760}>
      <MasonryGrid
        {...layoutArgs(args)}
        items={VARIED}
        renderItem={renderDemoItem}
        keyExtractor={(item: DemoItem) => item.id}
      />
    </View>
  ),
};

export const CappedColumns: Story = {
  render: (args) => (
    <View width={760}>
      <MasonryGrid
        {...layoutArgs(args)}
        items={VARIED}
        renderItem={renderDemoItem}
        keyExtractor={(item: DemoItem) => item.id}
        maxColumns={2}
      />
    </View>
  ),
};

export const FewItems: Story = {
  render: (args) => (
    <View width={760}>
      <MasonryGrid
        {...layoutArgs(args)}
        items={makeItems([2, 4, 1])}
        renderItem={renderDemoItem}
        keyExtractor={(item: DemoItem) => item.id}
      />
    </View>
  ),
};

export const Empty: Story = {
  render: (args) => (
    <View width={760}>
      <MasonryGrid
        {...layoutArgs(args)}
        items={[]}
        renderItem={renderDemoItem}
        keyExtractor={(item: DemoItem) => item.id}
      />
    </View>
  ),
};
