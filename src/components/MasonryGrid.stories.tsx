import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { Card } from "./Card.js";
import { MasonryGrid } from "./MasonryGrid.js";
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

export const VariableHeights: Story = {
  render: () => (
    <MasonryGrid items={VARIED} renderItem={renderDemoItem} keyExtractor={(item) => item.id} />
  ),
};

export const Narrow: Story = {
  render: () => (
    <View width={300}>
      <MasonryGrid items={VARIED} renderItem={renderDemoItem} keyExtractor={(item) => item.id} />
    </View>
  ),
};

export const TwoColumns: Story = {
  render: () => (
    <View width={360}>
      <MasonryGrid items={VARIED} renderItem={renderDemoItem} keyExtractor={(item) => item.id} />
    </View>
  ),
};

export const Wide: Story = {
  render: () => (
    <View width={760}>
      <MasonryGrid items={VARIED} renderItem={renderDemoItem} keyExtractor={(item) => item.id} />
    </View>
  ),
};

export const CappedColumns: Story = {
  render: () => (
    <View width={760}>
      <MasonryGrid
        items={VARIED}
        renderItem={renderDemoItem}
        keyExtractor={(item) => item.id}
        maxColumns={2}
      />
    </View>
  ),
};

export const FewItems: Story = {
  render: () => (
    <View width={760}>
      <MasonryGrid
        items={makeItems([2, 4, 1])}
        renderItem={renderDemoItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  ),
};

export const Empty: Story = {
  render: () => (
    <View width={760}>
      <MasonryGrid
        items={[]}
        renderItem={renderDemoItem}
        keyExtractor={(item: DemoItem) => item.id}
      />
    </View>
  ),
};
