import type { ComponentType, ReactElement } from "react";
import { FlatList, View } from "react-native";
import type { ListRenderItem, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { YStack } from "tamagui";
import { Spinner } from "../components/Spinner.js";
import { tokens } from "../tokens/index.js";

/**
 * BoundedList (#119): the shared bounded FlatList for the fixed
 * (non-scrolling) page shells — the list half of the #119 page-fix
 * program, owning the pieces of list styling the pages used to
 * apply themselves:
 *
 * - The bounding style: `flex: 1` on the FlatList (#188). Inside a
 *   non-scrolling ScreenContainer a list that sizes to its content
 *   height overflows the shell and never gets a scrollable viewport
 *   of its own; bounded, it takes exactly the space the shell
 *   leaves it. This is the geometry the app screens render with,
 *   and it must land on the FlatList itself — no wrapper around it
 *   can substitute.
 * - Row separation: a separator between rows, rendered by the list
 *   itself, replacing the per-row margins the rows used to carry.
 *   The default is the spacing scale's step 2 (8px), the separation
 *   the fixed-shell pages' row cards used; `separator="md"` gives
 *   the 12px card rhythm the catalog lists use, and
 *   `separator="none"` leaves separation to rows that space
 *   themselves.
 * - Content geometry for the flush `list` shell: with
 *   `contentInset="page"` the list's content container carries the
 *   standard page inset (16px sides, 32px bottom) that
 *   RecipesPage and DiscoverPage each used to hand the FlatList
 *   identically; the default leaves content unpadded for shells
 *   that pad their content themselves.
 *
 * The optional slots and handlers (header/empty/footer, end-reached
 * pagination, scroll, keyboard tap persistence) are the catalog
 * pattern RecipesPage and DiscoverPage share — filters as the
 * list's header so they scroll with the rows and the focused filter
 * input never unmounts, the loading spinner as the empty state, a
 * next-page spinner as the footer. They are behavior and content,
 * not styling: every styling decision stays in here. All optional —
 * a page that passes none of them renders exactly the list the
 * fixed-shell pages have always rendered.
 *
 * Why this lives in src/pages and not src/components: it imports
 * react-native's FlatList, and no root-exported component may do
 * that — the package root (dist/index.js) is imported in plain
 * Node by the test suite, and react-native does not load there.
 * The pages subpath is the package's react-native-importing area,
 * so the shared list sits with its consumers as internal page
 * scaffolding — the PageFrame pattern: not exported from
 * src/pages/index.ts, exercised through the pages that render it
 * (VerseSearchPage, MemorizeReviewPage, MyVersesPage today;
 * RecipesPage and DiscoverPage adopt the catalog slots in their
 * #119 tranches). The style props on the FlatList below are the
 * styling this component exists to own; the pages that use it stay
 * free of them (#119).
 */

const listStyle = { flex: 1 } as const;

const separatorStyle = { height: tokens.spacing[2] } as const;

function BoundedListSeparator() {
  return <View style={separatorStyle} />;
}

const separatorMdStyle = { height: tokens.spacing[3] } as const;

function BoundedListSeparatorMd() {
  return <View style={separatorMdStyle} />;
}

const separators = { sm: BoundedListSeparator, md: BoundedListSeparatorMd } as const;

const pageContentStyle = {
  paddingHorizontal: tokens.spacing[4],
  paddingBottom: tokens.spacing[8],
} as const;

/**
 * The catalog lists' first-load state: the spinner that renders
 * as the list's empty component while the first page loads —
 * centered in the empty area, offset from the list's top by
 * the page rhythm (32px). The list (and its header) stays
 * mounted behind it; see BoundedList's header note.
 */
export function BoundedListLoading() {
  return (
    <YStack paddingBlockStart="$8" alignItems="center">
      <Spinner label="Loading" />
    </YStack>
  );
}

/**
 * The catalog lists' next-page state: the spinner that renders
 * as the list's footer while a next page is in flight —
 * centered, with the field rhythm (16px) of air above and
 * below it.
 */
export function BoundedListLoadingMore() {
  return (
    <YStack alignItems="center" justifyContent="center" paddingVertical="$4">
      <Spinner label="Loading" />
    </YStack>
  );
}

export type BoundedListProps<Item> = {
  /** The rows to render, in order. */
  data: readonly Item[];
  /** Stable key for a row, as React Native's FlatList expects. */
  keyExtractor: (item: Item, index: number) => string;
  /** Render one row, as React Native's FlatList expects. */
  renderItem: ListRenderItem<Item>;
  /**
   * Row separation the list renders itself: `sm` (default) is the
   * 8px gap; `md` is the 12px card rhythm; `none` renders no
   * separator (rows that space themselves).
   */
  separator?: "sm" | "md" | "none";
  /**
   * Content geometry: `page` gives the list's content container the
   * standard page inset for the flush `list` shell; `none`
   * (default) leaves the content unpadded.
   */
  contentInset?: "page" | "none";
  /** Header rendered above the rows, scrolling with them (the
   * catalog lists' filter bars). */
  ListHeaderComponent?: ComponentType<any> | ReactElement | undefined;
  /** Content rendered when the list is empty (the catalog lists'
   * loading spinner / empty state). */
  ListEmptyComponent?: ComponentType<any> | ReactElement | undefined;
  /** Footer rendered below the rows (the catalog lists' next-page
   * spinner). */
  ListFooterComponent?: ComponentType<any> | ReactElement | undefined;
  /** Pagination: called when the list scrolls near its end. */
  onEndReached?: ((info: { distanceFromEnd: number }) => void) | undefined;
  /** How close to the end (in visible lengths) `onEndReached` fires. */
  onEndReachedThreshold?: number | undefined;
  /** Scroll handler, as React Native's FlatList expects. */
  onScroll?: ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) | undefined;
  /** Whether taps on the list's controls land while the keyboard is
   * open (the catalog lists' filter inputs). */
  keyboardShouldPersistTaps?: "always" | "never" | "handled" | undefined;
};

/**
 * A FlatList bounded to the fixed shell with token row separation.
 * The API mirrors the FlatList props the pages use, so a page's
 * list contract (data in, rows out) is unchanged — only the list's
 * own styling moved in here.
 */
export function BoundedList<Item>({
  data,
  keyExtractor,
  renderItem,
  separator = "sm",
  contentInset = "none",
  ListHeaderComponent,
  ListEmptyComponent,
  ListFooterComponent,
  onEndReached,
  onEndReachedThreshold,
  onScroll,
  keyboardShouldPersistTaps,
}: BoundedListProps<Item>) {
  return (
    <FlatList
      style={listStyle}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={separator === "none" ? undefined : separators[separator]}
      {...(contentInset === "page" ? { contentContainerStyle: pageContentStyle } : null)}
      {...(ListHeaderComponent !== undefined ? { ListHeaderComponent } : null)}
      {...(ListEmptyComponent !== undefined ? { ListEmptyComponent } : null)}
      {...(ListFooterComponent !== undefined ? { ListFooterComponent } : null)}
      {...(onEndReached !== undefined ? { onEndReached } : null)}
      {...(onEndReachedThreshold !== undefined ? { onEndReachedThreshold } : null)}
      {...(onScroll !== undefined ? { onScroll } : null)}
      {...(keyboardShouldPersistTaps !== undefined ? { keyboardShouldPersistTaps } : null)}
    />
  );
}
