import { Row } from "../layout/Row.js";
import type { RowProps } from "../layout/Row.js";
import { tokens } from "../../tokens/index.js";
import { platformAccessibilityProps } from "../accessibility.js";

/**
 * One dot (#746, Option B): a Row disc, primary-filled while
 * its step is the current one, gray otherwise — the former
 * styled variant computed in code.
 */
function Dot({ active }: { active: boolean }) {
  return (
    <Row
      width={tokens.spacing[2]}
      height={tokens.spacing[2]}
      borderRadius={tokens.radii.full}
      backgroundColor={active ? "$primary" : tokens.colors.gray.gray4}
      aria-hidden
    />
  );
}

export type StepDotsProps = RowProps & {
  /** Total number of dots. */
  count: number;
  /** Zero-based index of the current step. */
  activeIndex: number;
  /** Accessible label, e.g. "Step 2 of 5". Defaults to "Step N of M". */
  label?: string;
};

/**
 * Dot row showing progress through a sequence — step progress, drill
 * rounds. Only the current step's dot is filled. Non-interactive:
 * the container carries `progressbar` semantics with the current step, and
 * individual dots are hidden from assistive tech.
 */
export function StepDots({ count, activeIndex, label, ...rest }: StepDotsProps) {
  const safeIndex = Math.min(Math.max(activeIndex, 0), Math.max(count - 1, 0));
  const accessibleLabel = label ?? `Step ${safeIndex + 1} of ${count}`;
  return (
    <Row
      gap="s"
      middle
      {...platformAccessibilityProps({
        accessibilityRole: "progressbar",
        accessibilityLabel: accessibleLabel,
        accessibilityValue: { min: 1, max: count, now: safeIndex + 1 },
      })}
      {...rest}
    >
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} active={i === safeIndex} />
      ))}
    </Row>
  );
}
