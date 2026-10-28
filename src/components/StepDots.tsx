import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";

const StyledDot = styled(XStack, {
  name: "StepDot",

  width: tokens.spacing[2],
  height: tokens.spacing[2],
  borderRadius: tokens.radii.full,
  backgroundColor: tokens.colors.gray.gray4,

  variants: {
    active: {
      true: {
        backgroundColor: "$primary",
      },
    },
  } as const,
});

type StyledDotProps = GetProps<typeof StyledDot>;

export type StepDotsProps = Omit<StyledDotProps, "active"> & {
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
    <XStack
      gap={tokens.spacing[2]}
      alignItems="center"
      {...platformAccessibilityProps({
        accessibilityRole: "progressbar",
        accessibilityLabel: accessibleLabel,
        accessibilityValue: { min: 1, max: count, now: safeIndex + 1 },
      })}
      {...rest}
    >
      {Array.from({ length: count }, (_, i) => (
        <StyledDot key={i} active={i === safeIndex} aria-hidden />
      ))}
    </XStack>
  );
}
