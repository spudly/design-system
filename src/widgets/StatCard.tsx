import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Card } from "./Card.js";
import { useLoadingScope } from "./LoadingScope.js";
import { Text } from "./Text.js";
import { TextSkeleton } from "./TextSkeleton.js";

export type StatCardProps = {
  /** The headline number, e.g. "12". Rendered large and semibold. */
  value: string;
  /** What the number measures, e.g. "verses mastered". */
  label: string;
  sublabel?: string;
  /** Loading state (#278): the tile renders text skeletons in
   * place of its value, label, and sublabel. An enclosing
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
    // Loading (#278): the same card, with one text-skeleton line
    // per text run (value, label, and sublabel when present) —
    // the region marked busy, no real values shown.
    return (
      <Card {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
        <TextSkeleton lines={sublabel ? 3 : 2} />
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
