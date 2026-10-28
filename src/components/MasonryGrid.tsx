import { useState, type ReactNode } from "react";
import { View, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";

/** Default target column width in px (see `minColumnWidth`). */
const DEFAULT_MIN_COLUMN_WIDTH = 160;
/** Default fewest columns (see `minColumns`). */
const DEFAULT_MIN_COLUMNS = 1;
/** Default most columns (see `maxColumns`). */
const DEFAULT_MAX_COLUMNS = 4;

export type MasonryColumnCountOptions = {
  /**
   * Target column width in px: the grid fits as many columns of at
   * least this width as the container allows. Default 160.
   */
  minColumnWidth?: number | undefined;
  /** Fewest columns, however narrow the container. Default 1. */
  minColumns?: number | undefined;
  /** Most columns, however wide the container. Default 4. */
  maxColumns?: number | undefined;
  /** Gap between columns in px. Default 12 (the spacing scale's 3). */
  gap?: number | undefined;
};

/**
 * How many masonry columns fit a container of the given width: as
 * many columns of at least `minColumnWidth` (plus one `gap` each) as
 * fit, clamped to [`minColumns`, `maxColumns`]. An unmeasured or
 * non-positive width yields `minColumns` — the grid's first render,
 * before its first layout pass reports a width.
 *
 * This is the dynamic column detection the shuoink/ui original never
 * finished (it hard-coded 3 columns behind a TODO); it is exported
 * so hosts and tests can reason about the layout without rendering.
 */
export function masonryColumnCount(
  containerWidth: number,
  options: MasonryColumnCountOptions = {},
): number {
  const minColumnWidth = options.minColumnWidth ?? DEFAULT_MIN_COLUMN_WIDTH;
  const minColumns = Math.max(1, Math.floor(options.minColumns ?? DEFAULT_MIN_COLUMNS));
  const maxColumns = Math.max(minColumns, Math.floor(options.maxColumns ?? DEFAULT_MAX_COLUMNS));
  const gap = options.gap ?? tokens.spacing[3];
  if (!(containerWidth > 0) || !(minColumnWidth > 0)) {
    return minColumns;
  }
  const fit = Math.floor((containerWidth + gap) / (minColumnWidth + gap));
  return Math.min(maxColumns, Math.max(minColumns, fit));
}

/**
 * Distribute items into `columnCount` columns, round-robin: item 0
 * heads the first column, item 1 the second, and so on, wrapping to
 * the first column once every column has an item. Reading order runs
 * across each row, and with varied item heights the columns end at
 * staggered heights — the masonry look. The result never contains an
 * empty column: fewer items than columns yields one column per item,
 * and no items yields no columns.
 */
export function distributeMasonryItems<Item>(
  items: readonly Item[],
  columnCount: number,
): Item[][] {
  const count = Math.min(items.length, Math.max(1, Math.floor(columnCount) || 1));
  if (count === 0) {
    return [];
  }
  const columns: Item[][] = Array.from({ length: count }, () => []);
  items.forEach((item, index) => {
    columns[index % count]?.push(item);
  });
  return columns;
}

export type MasonryGridProps<Item> = {
  /** Items to lay out, in reading order. */
  items: readonly Item[];
  /**
   * Renders one item, given the item and its index in `items`. Item
   * content is entirely the host's — the grid owns only the layout.
   */
  renderItem: (item: Item, index: number) => ReactNode;
  /** Stable key for an item; defaults to the item's index. */
  keyExtractor?: ((item: Item, index: number) => string) | undefined;
  /**
   * Target column width in px: as many columns of at least this
   * width as the measured container allows. Default 160.
   */
  minColumnWidth?: number | undefined;
  /** Fewest columns, however narrow the container. Default 1. */
  minColumns?: number | undefined;
  /** Most columns, however wide the container. Default 4. */
  maxColumns?: number | undefined;
  /**
   * Gap between columns and between the items stacked in a column,
   * in px. Default 12 (the spacing scale's 3).
   */
  gap?: number | undefined;
};

/**
 * Pinterest-style staggered grid (#178, adopted from shuoink/ui and
 * finished): items flow round-robin into columns whose count adapts
 * to the grid's measured width — one column in a narrow pane, more
 * on tablets and wide web layouts, bounded by `minColumns` /
 * `maxColumns` and tuned by `minColumnWidth`. The original was
 * CSS-grid and web-only with its column count hard-coded at 3 behind
 * a TODO to detect it dynamically; this version measures its own
 * container (layout callback, so it tracks panes and resizes, not
 * just the window) and renders the same column stacks on React
 * Native and web.
 *
 * The first render, before the first layout pass reports a width,
 * uses `minColumns`; the grid re-flows as soon as the width lands
 * and again whenever the container resizes. Items keep their
 * identity across re-flows through `keyExtractor` (or their index).
 *
 * Layout only — no data, fetching, or press handling lives here.
 * Item content arrives through `renderItem`; if an item navigates,
 * the link/button semantics are the rendered item's own concern
 * (navigation rule: a navigating control is a link with an href,
 * anything else is a button with a callback).
 */
export function MasonryGrid<Item>({
  items,
  renderItem,
  keyExtractor,
  minColumnWidth,
  minColumns,
  maxColumns,
  gap = tokens.spacing[3],
}: MasonryGridProps<Item>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const columnCount = masonryColumnCount(containerWidth, {
    minColumnWidth,
    minColumns,
    maxColumns,
    gap,
  });
  const columns = distributeMasonryItems(
    items.map((_, index) => index),
    columnCount,
  );
  return (
    <View
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;
        setContainerWidth((previous) => (Math.abs(previous - width) < 0.5 ? previous : width));
      }}
    >
      <XStack gap={gap} alignItems="flex-start">
        {columns.map((column, columnIndex) => (
          <YStack key={columnIndex} flex={1} gap={gap}>
            {column.map((itemIndex) => {
              const item = items[itemIndex];
              if (item === undefined) {
                return null;
              }
              return (
                <View key={keyExtractor ? keyExtractor(item, itemIndex) : itemIndex}>
                  {renderItem(item, itemIndex)}
                </View>
              );
            })}
          </YStack>
        ))}
      </XStack>
    </View>
  );
}
