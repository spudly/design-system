import { XStack, styled } from "tamagui";
import type { TagColorName } from "../themes/tagColors.js";
import { tokens } from "../tokens/index.js";
import { Badge } from "./Badge.js";

const StyledTagRow = styled(XStack, {
  name: "TagListRow",

  flexWrap: "wrap",
  gap: tokens.spacing[2],
  alignItems: "flex-start",
});

export type TagListTag = {
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
};

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
export function TagList({ tags }: TagListProps) {
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
