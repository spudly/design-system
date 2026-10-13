import { tokens } from "../tokens/index.js";
import { Card } from "./Card.js";
import { Text } from "./Text.js";

export interface StatCardProps {
  /** The headline number, e.g. "12". Rendered large and semibold. */
  value: string;
  /** What the number measures, e.g. "verses mastered". */
  label: string;
  sublabel?: string;
}

/**
 * Big-number stat tile built on Card: a large semibold value, a label, and
 * an optional muted sublabel. Used for dashboards ("12 verses mastered")
 * and stat rows alike.
 */
export function StatCard({ value, label, sublabel }: StatCardProps) {
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
