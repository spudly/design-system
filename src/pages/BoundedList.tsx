import { FlatList, View } from "react-native";
import type { ListRenderItem } from "react-native";
import { tokens } from "../tokens/index.js";

/**
 * BoundedList (#119): the shared bounded FlatList for the fixed
 * (non-scrolling) page shells — the list half of the #119 page-fix
 * program, owning the two pieces of list styling the pages used to
 * apply themselves:
 *
 * - The bounding style: `flex: 1` on the FlatList (#188). Inside a
 *   non-scrolling ScreenContainer a list that sizes to its content
 *   height overflows the shell and never gets a scrollable viewport
 *   of its own; bounded, it takes exactly the space the shell
 *   leaves it. This is the geometry the app screens render with,
 *   and it must land on the FlatList itself — no wrapper around it
 *   can substitute.
 * - Row separation: an 8px separator between rows (the spacing
 *   scale's step 2), rendered by the list itself, replacing the
 *   per-row bottom margin the row cards used to carry.
 *
 * Why this lives in src/pages and not src/components: it imports
 * react-native's FlatList, and no root-exported component may do
 * that — the package root (dist/index.js) is imported in plain
 * Node by the test suite, and react-native does not load there.
 * The pages subpath is the package's react-native-importing area,
 * so the shared list sits with its consumers as internal page
 * scaffolding — the PageFrame pattern: not exported from
 * src/pages/index.ts, exercised through the pages that render it
 * (VerseSearchPage, MemorizeReviewPage, MyVersesPage). The style
 * props on the FlatList below are the styling this component
 * exists to own; the pages that use it stay free of them (#119).
 */

const listStyle = { flex: 1 } as const;

const separatorStyle = { height: tokens.spacing[2] } as const;

function BoundedListSeparator() {
  return <View style={separatorStyle} />;
}

export type BoundedListProps<Item> = {
  /** The rows to render, in order. */
  data: readonly Item[];
  /** Stable key for a row, as React Native's FlatList expects. */
  keyExtractor: (item: Item, index: number) => string;
  /** Render one row, as React Native's FlatList expects. */
  renderItem: ListRenderItem<Item>;
};

/**
 * A FlatList bounded to the fixed shell with token row separation.
 * The API mirrors the FlatList props the pages use, so a page's
 * list contract (data in, rows out) is unchanged — only the list's
 * own styling moved in here.
 */
export function BoundedList<Item>({ data, keyExtractor, renderItem }: BoundedListProps<Item>) {
  return (
    <FlatList
      style={listStyle}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={BoundedListSeparator}
    />
  );
}
