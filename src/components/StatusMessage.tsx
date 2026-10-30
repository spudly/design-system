import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { politeLiveRegionProps } from "./accessibility.js";
import { Text } from "./Text.js";

export type StatusMessageProps = {
  /**
   * The transient message to show and announce. Null/undefined (or
   * empty) renders the live region empty — the region itself stays
   * mounted either way.
   */
  message?: string | null | undefined;
};

/**
 * A transient action confirmation line (#318): "Saved", "Added to
 * your list", the recipedetail action message. Small, centered, in
 * the theme's muted ink.
 *
 * Announcement (#318, gap 1): the root is a POLITE LIVE REGION via
 * `politeLiveRegionProps` — `role="status"` on web,
 * `accessibilityLiveRegion="polite"` on native — the Alert /
 * EmptyState pattern from src/components/accessibility.ts. The
 * treatment this component replaces rendered with
 * `accessibilityRole="text"`, which never announces: a transient
 * confirmation a sighted user sees appear is silently missed by
 * screen-reader users. A live region only announces changes that
 * happen AFTER it mounts, so the root renders UNCONDITIONALLY —
 * with no message it is an empty region, and consumers must render
 * the component itself unconditionally too (RecipeDetailPage, its
 * consumer, renders `<StatusMessage message={actionMessage} />`
 * in place of its old conditional block, so the mount requirement
 * holds by construction).
 *
 * Ink (#318, gap 2): `$textMuted`, the theme-aware muted token —
 * never a raw ramp step. The old treatment's fixed gray7 (#525252)
 * measures 1.94:1 against the dark shell surface (gray9). Verified
 * against both modes' token tables (buildTamaguiThemes in
 * src/tamagui.config.ts; test/statusMessage.test.mjs recomputes
 * these from the registered themes): dark $textMuted is gray5
 * (#a3a3a3) — 6.00:1 on the dark surface, 7.11:1 on the dark
 * background; light $textMuted is gray6 (#737373) in the base
 * theme — 4.54:1 on its background, 4.74:1 on its surface — and
 * #57534e in the Eciperay/Memorize themes — 6.60:1 to 7.63:1
 * across their backgrounds and surfaces. AA (≥4.5:1) in every
 * theme and mode.
 *
 * This is the component the #119 dedupe folded into CenteredText
 * as a static centered line; it ships separately again because a
 * transient announcer's contract (always-mounted live region) is
 * not a static line's — CenteredText stays the static component,
 * and making every centered subtitle a live region would announce
 * page furniture. CenteredText's header comment records the split.
 */
export function StatusMessage({ message }: StatusMessageProps) {
  return (
    <YStack {...politeLiveRegionProps} {...(message ? { paddingBlockEnd: "$4" } : {})}>
      {message ? (
        <Text textAlign="center" fontSize={tokens.typography.fontSize.sm} color="$textMuted">
          {message}
        </Text>
      ) : null}
    </YStack>
  );
}
