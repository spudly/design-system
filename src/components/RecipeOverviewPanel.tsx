import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { TagColorName } from "../themes/tagColors.js";
import { Badge } from "./Badge.js";
import { StatBand } from "./StatBand.js";
import { StatCard } from "./StatCard.js";
import { Text } from "./Text.js";
import { Thumbnail } from "./Thumbnail.js";

/**
 * A recipe's overview panel: the header block of the two recipe
 * surfaces (RecipeDetailPage and PublicRecipePage) — hero image,
 * title, status badge, description, the servings/prep/cook stat
 * band, and the tag row. Both pages carried this panel inline
 * before it moved here (#119); the view-model shape is declared
 * here structurally so either page's overview object composes it
 * without a second shape to drift. The panel carries no outer
 * padding or spacing — the page shell's column insets it, and
 * separation from the sections around it is the parent stack's.
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
  /** Recipe status as a plain string; the badge label/tone map
   * below is DS-owned. Unknown values fall back to "idea", as
   * the app's status normalizer does. */
  status: string;
  /** Stat band values, app-formatted ("4", "15m", "30m"). */
  servingsLabel: string;
  prepTimeLabel?: string;
  cookTimeLabel?: string;
  tags: RecipeOverviewPanelTag[];
};

// Status badge map: DS-owned labels and tones (idea → neutral
// gray, evolving → info blue, perfected → success green,
// abandoned → danger red, matching the app's badge tints).
const STATUS_BADGES: Record<
  string,
  { label: string; tone: "neutral" | "info" | "success" | "danger" }
> = {
  idea: { label: "Idea", tone: "neutral" },
  evolving: { label: "Evolving", tone: "info" },
  perfected: { label: "Perfected", tone: "success" },
  abandoned: { label: "Abandoned", tone: "danger" },
};

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGES[status] ?? STATUS_BADGES.idea;
  return <Badge tone={badge?.tone ?? "neutral"}>{badge?.label ?? "Idea"}</Badge>;
}

export function RecipeOverviewPanel(props: RecipeOverviewPanelProps) {
  const {
    imageUrl,
    title,
    description,
    status,
    servingsLabel,
    prepTimeLabel,
    cookTimeLabel,
    tags,
  } = props;

  return (
    <YStack>
      {imageUrl ? (
        <YStack marginBlockEnd="$4">
          <Thumbnail src={imageUrl} />
        </YStack>
      ) : null}
      <Text
        fontSize={tokens.typography.fontSize["2xl"]}
        fontWeight={tokens.typography.fontWeight.bold}
        color={tokens.colors.gray.gray10}
        marginBlockEnd="$2"
      >
        {title}
      </Text>
      <YStack marginBlockEnd="$4" alignSelf="flex-start">
        <StatusBadge status={status} />
      </YStack>
      {description ? (
        <Text color={tokens.colors.gray.gray7} marginBlockEnd="$4">
          {description}
        </Text>
      ) : null}
      <YStack marginBlockEnd="$4">
        <StatBand>
          <StatCard label="Servings" value={servingsLabel} />
          {prepTimeLabel ? <StatCard label="Prep" value={prepTimeLabel} /> : null}
          {cookTimeLabel ? <StatCard label="Cook" value={cookTimeLabel} /> : null}
        </StatBand>
      </YStack>
      {tags.length > 0 ? (
        <XStack flexWrap="wrap" gap="$2">
          {tags.map((tag) => (
            <Badge key={tag.id} color={tag.color}>
              {tag.name}
            </Badge>
          ))}
        </XStack>
      ) : null}
    </YStack>
  );
}
