import { Spinner as TamaguiSpinner, View } from "tamagui";
import type { GetProps } from "tamagui";
import { platformAccessibilityProps } from "./accessibility.js";

type TamaguiSpinnerProps = GetProps<typeof TamaguiSpinner>;

export type SpinnerProps = TamaguiSpinnerProps & {
  label?: string;
  /**
   * Determinate progress, 0–100. When set, the spinner renders as a
   * progress ring showing that percentage instead of spinning — for
   * waits whose progress is known (uploads, AI generation). Omit it
   * for an open-ended wait. Out-of-range values are clamped, as on
   * ProgressBar.
   *
   * This is the shuoink/ui ProgressSpinner folded into Spinner
   * (design-system #178): Stephen's call was one loading-indicator
   * component with two modes, not a second widget.
   */
  value?: number;
};

/**
 * The ring's pixel size from the shared `size` prop: a number is used
 * as-is, "large" matches the large ActivityIndicator (36), and
 * "small" / unset / a size token matches the small one (20) — the
 * same sizes the indeterminate spinner renders at.
 */
function ringSizePx(size: SpinnerProps["size"]): number {
  if (typeof size === "number") {
    return size;
  }
  return size === "large" ? 36 : 20;
}

/**
 * The determinate mode: a progress ring in the brand primary over the
 * theme's progressTrack — the same two colors as ProgressBar's fill
 * and track.
 *
 * Why the arc is built from bordered views instead of an SVG circle
 * (the shuoink original's technique): Spinner is exported from the
 * package root, and the root entry must stay importable in plain Node
 * — the reason the icons module, the one react-native-svg consumer,
 * lives behind the ./icons subpath. An SVG import here would drag
 * react-native's untranspiled sources into the root graph and break
 * that import (verified: the dist root fails to load in Node with
 * react-native-svg in this file).
 *
 * So the arc is two half-clipped rings. A ring whose border is colored
 * on two adjacent sides shows a semicircle (each border side paints a
 * quarter arc; two adjacent sides paint the half between their outer
 * diagonals). Clipped to one half of the circle and rotated, each
 * semicircle reveals exactly its half of the progress:
 *
 * - right half: the bottom+left semicircle, rotated (f + 45)° where f
 *   is the progress angle capped at 180°, shows the arc [0°, f];
 * - left half: the top+right semicircle, rotated (g + 45)° where g is
 *   the angle past 180°, shows the arc [180°, 180° + g].
 *
 * The 45° offsets are where the border sides' arcs meet (the box
 * diagonals). Rotation is around each ring's own center, which both
 * wrappers position on the ring's center.
 *
 * One deliberate deviation from the shuoink original: it drew the arc
 * alone at 25% opacity, with no track. The ring here carries the full
 * track circle underneath, matching ProgressBar's fill-over-track
 * language, so the unfilled remainder reads as intentional at every
 * value — including 0, where the original rendered nothing at all.
 */
function ProgressRing({
  label,
  color = "$primary",
  size,
  value,
  accessible,
  accessibilityElementsHidden,
  accessibilityHint,
  accessibilityLabel,
  accessibilityLabelledBy,
  accessibilityLiveRegion,
  accessibilityRole,
  accessibilityState,
  accessibilityValue,
  ...rest
}: SpinnerProps & { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  const px = ringSizePx(size);
  // The shuoink stroke ratio: a tenth of the diameter.
  const strokeWidth = px / 10;
  const angle = (clamped / 100) * 360;
  const rightAngle = Math.min(angle, 180);
  const leftAngle = Math.max(angle - 180, 0);

  const ringStyle = {
    width: px,
    height: px,
    borderRadius: px / 2,
    borderWidth: strokeWidth,
  } as const;

  // progressbar semantics with the current value, through the shared
  // translator (ProgressBar's pattern): on web the RN props become
  // aria-value*, on native they pass through. The component's `label`
  // is the accessible name unless the caller supplied their own.
  const a11yProps = platformAccessibilityProps({
    accessible,
    accessibilityElementsHidden,
    accessibilityHint,
    accessibilityLabel: accessibilityLabel ?? label,
    accessibilityLabelledBy,
    accessibilityLiveRegion,
    accessibilityRole: accessibilityRole ?? "progressbar",
    accessibilityState,
    accessibilityValue: accessibilityValue ?? { min: 0, max: 100, now: Math.round(clamped) },
  });

  return (
    <View position="relative" width={px} height={px} {...a11yProps} {...rest}>
      <View {...ringStyle} borderColor="$progressTrack" />
      <View position="absolute" left={px / 2} top={0} width={px / 2} height={px} overflow="hidden">
        <View
          {...ringStyle}
          position="absolute"
          left={-px / 2}
          top={0}
          borderTopColor="transparent"
          borderRightColor="transparent"
          borderBottomColor={color}
          borderLeftColor={color}
          style={{ transform: [{ rotate: `${rightAngle + 45}deg` }] }}
        />
      </View>
      <View position="absolute" left={0} top={0} width={px / 2} height={px} overflow="hidden">
        <View
          {...ringStyle}
          position="absolute"
          left={0}
          top={0}
          borderTopColor={color}
          borderRightColor={color}
          borderBottomColor="transparent"
          borderLeftColor="transparent"
          style={{ transform: [{ rotate: `${leftAngle + 45}deg` }] }}
        />
      </View>
    </View>
  );
}

/**
 * Loading indicator in the brand primary color. Provide `label` (e.g.
 * "Loading recipes") so screen readers announce what is loading.
 *
 * Two modes: with no `value` it spins indefinitely (an open-ended
 * wait); with a `value` (0–100) it renders a determinate progress
 * ring instead (a wait with known progress — uploads, AI generation),
 * announced as a progress bar with the current percentage.
 */
export function Spinner({ label = "Loading", color = "$primary", value, ...rest }: SpinnerProps) {
  if (value !== undefined) {
    return <ProgressRing label={label} color={color} value={value} {...rest} />;
  }
  // Tamagui's Spinner resolves `color` by looking the value up as a theme
  // key (no "$" prefix) and drops the result verbatim into the SVG's
  // `stroke` attribute. Forwarding "$primary" therefore produced
  // stroke="$primary", which computes to `stroke: none` — an invisible
  // spinner. Strip the token prefix so the theme lookup succeeds and the
  // stroke becomes var(--primary); raw CSS colors pass through unchanged.
  const resolvedColor = typeof color === "string" && color.startsWith("$") ? color.slice(1) : color;
  return <TamaguiSpinner color={resolvedColor} aria-label={label} {...rest} />;
}
