import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { TagColorName } from "../themes/tagColors.js";
import { StatBand } from "./StatBand.js";
import { StatCard } from "./StatCard.js";
import { StatusBadge, type StatusBadgeTone } from "./StatusBadge.js";
import { TagList } from "./TagList.js";
import { Text } from "./Text.js";
import { Thumbnail } from "./Thumbnail.js";

/**
 * A recipe's overview panel: the header block of the two recipe
 * surfaces (RecipeDetailPage and PublicRecipePage) — hero image,
 * title, status badge, description, the servings/prep/cook stat
 * band, and the tag row. Both pages carried this panel inline
 * before it moved here (#119); the view-model shape is declared
 * here structurally so either page's overview object composes
 * it without a second shape to drift. The panel carries no
 * outer padding or spacing — the page shell's column insets it,
 * and separation from the sections around it is the parent
 * stack's; the panel's own blocks separate with padding
 * wrappers, the recipe pages' settled form.
 *
 * The title carries Text's `heading` treatment (#364): level-1
 * heading semantics on web, so a page composing this panel
 * exposes its recipe title as its level-1 heading (the panel's
 * section headings sit at level 2, #317). The explicit
 * fontSize/fontWeight below pin the title's appearance, so the
 * variant changes semantics only — the same move #263 made for
 * standalone page titles. Rendering is unchanged on both
 * targets; on native the title gains the `header` role every
 * heading-variant title carries (#256 — VoiceOver/TalkBack
 * heading navigation), while the level itself is web-only.
 * Verified
 * for #364: PublicRecipePage (the panel's composing page)
 * renders no other level-1 heading, and RecipeDetailPage does
 * not compose this panel — its inline overview title already
 * carries level-1 semantics through the `formTitle` variant —
 * so no recipe surface gains a second level-1 heading.
 *
 * The pieces are the shared ones (#119 dedupe): the status
 * badge is the StatusBadge component, the tag row is the
 * TagList, the stats compose StatBand/StatCard, and the hero is
 * Thumbnail's frame. The status itself arrives as a tone and a
 * label the caller resolved from its own status vocabulary —
 * the design system owns no status map (Stephen's ruling on
 * the #119 dedupe: status words are the app's data, the same
 * principle that keeps filter option sets out of
 * CatalogFiltersBar); PublicRecipePage carries the map and
 * passes the pair in.
 */

export type RecipeOverviewPanelTag = {
  id: string;
  name: string;
  /** The tag's color: a DS tag color token name, strictly typed
   * (a raw hex is a compile error), resolved through the active
   * theme for the pill tint and label (#207). */
  color: TagColorName;
};

export type RecipeOverviewPanelProps = {
  imageUrl?: string | null;
  title: string;
  description?: string | null;
  /** The status badge's tone, resolved by the caller from its
   * status vocabulary. */
  statusTone: StatusBadgeTone;
  /** The status badge's label, resolved by the caller. */
  statusLabel: string;
  /** Stat band values, app-formatted ("4", "15m", "30m"). */
  servingsLabel: string;
  prepTimeLabel?: string;
  cookTimeLabel?: string;
  tags: RecipeOverviewPanelTag[];
};

export function RecipeOverviewPanel(props: RecipeOverviewPanelProps) {
  const {
    imageUrl,
    title,
    description,
    statusTone,
    statusLabel,
    servingsLabel,
    prepTimeLabel,
    cookTimeLabel,
    tags,
  } = props;

  return (
    <YStack>
      {imageUrl ? (
        <YStack paddingBlockEnd="$4">
          <Thumbnail src={imageUrl} />
        </YStack>
      ) : null}
      <YStack paddingBlockEnd="$2">
        <Text
          variant="heading"
          fontSize={tokens.typography.fontSize["2xl"]}
          fontWeight={tokens.typography.fontWeight.bold}
          color={tokens.colors.gray.gray10}
        >
          {title}
        </Text>
      </YStack>
      <YStack paddingBlockEnd="$4" alignSelf="flex-start">
        <StatusBadge tone={statusTone} label={statusLabel} />
      </YStack>
      {description ? (
        <YStack paddingBlockEnd="$4">
          <Text color={tokens.colors.gray.gray7}>{description}</Text>
        </YStack>
      ) : null}
      <YStack paddingBlockEnd="$4">
        <StatBand>
          <StatCard label="Servings" value={servingsLabel} />
          {prepTimeLabel ? <StatCard label="Prep" value={prepTimeLabel} /> : null}
          {cookTimeLabel ? <StatCard label="Cook" value={cookTimeLabel} /> : null}
        </StatBand>
      </YStack>
      {tags.length > 0 ? <TagList tags={tags} /> : null}
    </YStack>
  );
}
