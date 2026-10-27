import { XStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { TagColorName } from "../themes/tagColors.js";
import { Text } from "./Text.js";
import { useTagColorResolver } from "./tagColors.js";

export type TagPillProps = {
  /** The tag's display name. */
  name: string;
  /**
   * The tag's color: a design-system tag color token name (e.g.
   * "blue"), resolved through the active theme at render. The type
   * is the strict `TagColorName` union — a raw hex is a compile
   * error. Stored tag data converts to a name through
   * `tagColorNameForHex` before it reaches this prop (#207).
   */
  color: TagColorName;
};

/**
 * Display pill for a colored tag: full-radius chip whose tint comes
 * from the tag's color — the surface composes the resolved color with
 * a `22` hex alpha suffix (12.5% opacity) and the label renders in
 * the resolved color itself, at the small/medium type step. Read-only;
 * for selectable chips use ToggleChipGroup.
 */
export function TagPill({ name, color }: TagPillProps) {
  const resolveTagColor = useTagColorResolver();
  const resolvedColor = resolveTagColor(color);
  return (
    <XStack
      borderRadius={tokens.radii.full}
      paddingHorizontal="$3"
      paddingVertical="$1"
      backgroundColor={`${resolvedColor}22`}
    >
      <Text
        fontSize={tokens.typography.fontSize.sm}
        fontWeight={tokens.typography.fontWeight.medium}
        color={resolvedColor}
      >
        {name}
      </Text>
    </XStack>
  );
}
