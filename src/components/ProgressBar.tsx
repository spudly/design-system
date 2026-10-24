import { Progress as TamaguiProgress, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledTrack = styled(TamaguiProgress, {
  name: "SpudlyProgressBar",

  height: tokens.spacing[2],
  borderRadius: tokens.radii.full,
  // Track is the theme's progressTrack role: the primary's subtle tint
  // everywhere except Quiet Dawn light, where Stephen called for a
  // light gray instead of the light-blue teal tint (#94). The $primary
  // fill against it holds ≥3:1 (WCAG non-text) in every brand and
  // mode — 5.10 (base), 4.52 (Warm Harvest), ~4.8 (Quiet Dawn light
  // gray3 and dark primarySubtle alike). The previous $borderColor
  // track collapsed to 1.24–1.51:1 in dark mode, where border resolves
  // to gray7 (#525252), nearly the fill's luminance.
  backgroundColor: "$progressTrack",
  overflow: "hidden",
});

const StyledIndicator = styled(TamaguiProgress.Indicator, {
  name: "SpudlyProgressBarIndicator",

  backgroundColor: "$primary",
  height: "100%",
});

type StyledTrackProps = GetProps<typeof StyledTrack>;

export interface ProgressBarProps extends StyledTrackProps {
  /** Completion percentage, 0–100. */
  value: number;
}

/**
 * Linear progress meter. Exposes `progressbar` semantics with the current
 * value so screen readers announce progress.
 */
export function ProgressBar({ value, ...rest }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <StyledTrack
      value={clamped}
      max={100}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
      {...rest}
    >
      <StyledIndicator />
    </StyledTrack>
  );
}
