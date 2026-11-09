import { View, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Card } from "./Card.js";
import { useLoadingScope } from "../contexts/LoadingScope.js";
import { SkeletonBone } from "./SkeletonClock.js";
import { LINE_BOXES } from "./TextSkeleton.js";
import { Text } from "./Text.js";

export type StatCardProps = {
  /** The headline number, e.g. "12". Rendered large and semibold. */
  value: string;
  /** What the number measures, e.g. "verses mastered". */
  label: string;
  sublabel?: string;
  /** Loading state (#278): the tile renders skeletons in place
   * of its value, label, and sublabel — one bone per text run,
   * each in that run's line box (a TextSkeleton at a single
   * size cannot mix the tile's three run sizes). An enclosing
   * composite's LoadingScope can also put the tile into this
   * state without prop-drilling. */
  loading?: boolean;
};

/**
 * Big-number stat tile built on Card: a large semibold value, a label, and
 * an optional muted sublabel. Used for dashboards ("12 verses mastered")
 * and stat rows alike.
 */
export function StatCard({ value, label, sublabel, loading = false }: StatCardProps) {
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    // Loading (#278): the same card, with one bone per text run.
    // The rows mirror the runs they replace: each bone sits in a
    // View of its run's line-box height with the bone vertically
    // centered — the value run at 3xl, the label run at lg, and
    // the sublabel run when present at sm, all read from
    // TextSkeleton's LINE_BOXES table (the one source of truth
    // for skeleton text geometry). The widths are the runs'
    // typical proportions: a short number, a longer label, a
    // mid-length sublabel. The region is marked busy; no real
    // values show.
    return (
      <Card {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
        <YStack>
          <View height={LINE_BOXES["3xl"].lineBox} justifyContent="center">
            <SkeletonBone
              width="46%"
              height={LINE_BOXES["3xl"].bone}
              borderRadius={tokens.radii.md}
            />
          </View>
          <View height={LINE_BOXES.lg.lineBox} justifyContent="center">
            <SkeletonBone width="76%" height={LINE_BOXES.lg.bone} borderRadius={tokens.radii.md} />
          </View>
          {sublabel ? (
            <View height={LINE_BOXES.sm.lineBox} justifyContent="center">
              <SkeletonBone
                width="58%"
                height={LINE_BOXES.sm.bone}
                borderRadius={tokens.radii.md}
              />
            </View>
          ) : null}
        </YStack>
      </Card>
    );
  }
  return (
    <Card>
      <Text
        style={{
          fontSize: tokens.typography.fontSize["3xl"],
          fontWeight: tokens.typography.fontWeight.bold,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
        }}
      >
        {label}
      </Text>
      {sublabel ? <Text variant="hint">{sublabel}</Text> : null}
    </Card>
  );
}
