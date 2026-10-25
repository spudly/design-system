import { XStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

export interface TagPillProps {
  /** The tag's display name. */
  name: string;
  /**
   * The tag's own color (a data value, not a theme token): the pill
   * surface is the color at low alpha and the label is the color itself.
   */
  color: string;
}

/**
 * Display pill for a colored tag: full-radius chip whose tint comes from
 * the tag's data color — the surface composes the color with a `22` hex
 * alpha suffix (12.5% opacity) and the label renders in the color itself,
 * at the small/medium type step. Read-only; for selectable chips use
 * ToggleChipGroup.
 */
export function TagPill({ name, color }: TagPillProps) {
  return (
    <XStack
      borderRadius={tokens.radii.full}
      paddingHorizontal="$3"
      paddingVertical="$1"
      backgroundColor={`${color}22`}
    >
      <Text
        fontSize={tokens.typography.fontSize.sm}
        fontWeight={tokens.typography.fontWeight.medium}
        color={color}
      >
        {name}
      </Text>
    </XStack>
  );
}
