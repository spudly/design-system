import { XStack, styled } from "tamagui";
import type { TagColorName } from "../themes/tagColors.js";
import { tokens } from "../tokens/index.js";
import { useLoadingScope } from "../contexts/LoadingScope.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Badge } from "./Badge.js";
import { SkeletonBone } from "./SkeletonClock.js";

const StyledTagRow = styled(XStack, {
  name: "TagListRow",

  flexWrap: "wrap",
  gap: tokens.spacing[2],
  alignItems: "flex-start",
});

type TagListTag = {
  /** Stable key for the tag. */
  id: string;
  /** The tag's label. */
  name: string;
  /**
   * The tag's color: a DS tag color token name, strictly typed
   * (a raw hex is a compile error) — resolved through the active
   * theme for the pill tint and label (#207). The host converts
   * stored tag data to a name through `tagColorNameForHex` first.
   */
  color: TagColorName;
};

export type TagListProps = {
  /** The tags to render, in display order. */
  tags: TagListTag[];
  /** Loading state (#278): the row renders one pill skeleton per
   * tag, at the badge's own geometry (full-radius pill, the
   * label's estimated width), with no real tag names. With no
   * tags to mirror, exactly 3 dummy pills render. An enclosing
   * composite's LoadingScope can also put the list into this
   * state without prop-drilling. */
  loading?: boolean;
};

// The dummy pills for a tag-less loading list (#278): exactly 3
// placeholder pills, from a frozen module-level constant — never
// generated per render. Their widths are typical tag-label
// widths; a loading list WITH tags mirrors its own tags instead
// (one pill per tag, width estimated from the label the way
// Button's ghost bone estimates from its label).
const LOADING_TAG_WIDTHS = [72, 96, 64] as const;

// A Badge pill's height: the xs label's line box (14) plus the
// badge's vertical padding (spacing 1 each side) and its border.
const TAG_PILL_HEIGHT = 14 + tokens.spacing[1] * 2 + 2;

/**
 * A display list of tags (#119): one Badge per tag in a wrapping
 * row, each badge in its tag color (#211's color form — the
 * tint is Badge's own resolution, never re-implemented at the
 * call site). Extracted from RecipeDetailPage's tag row; the
 * list owns the row's rhythm, and its separation from
 * surrounding content is the parent stack's. These badges are
 * display-only (no press handler is passed); Badge's selectable
 * form is what tag pickers render — a tag is a Badge in both
 * forms.
 */
export function TagList({ tags, loading = false }: TagListProps) {
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    // Loading (#278): the same wrapping row, holding one pill
    // skeleton per tag — the pill keeps the badge's full radius
    // and height, its width estimated from the tag's label at
    // the xs size plus the badge's horizontal padding and
    // border — and the region marked busy. No real names show.
    const widths: readonly number[] =
      tags.length > 0
        ? tags.map((tag) =>
            Math.max(
              40,
              Math.round(tag.name.length * tokens.typography.fontSize.xs * 0.62) +
                tokens.spacing[2] * 2 +
                2,
            ),
          )
        : LOADING_TAG_WIDTHS;
    return (
      <StyledTagRow {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
        {widths.map((width, index) => (
          <SkeletonBone
            key={tags[index]?.id ?? `loading-${index}`}
            width={width}
            height={TAG_PILL_HEIGHT}
            borderRadius={tokens.radii.full}
          />
        ))}
      </StyledTagRow>
    );
  }
  return (
    <StyledTagRow>
      {tags.map((tag) => (
        <Badge key={tag.id} color={tag.color}>
          {tag.name}
        </Badge>
      ))}
    </StyledTagRow>
  );
}
