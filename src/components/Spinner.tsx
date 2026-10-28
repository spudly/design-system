import { Spinner as TamaguiSpinner } from "tamagui";
import type { GetProps } from "tamagui";

type TamaguiSpinnerProps = GetProps<typeof TamaguiSpinner>;

export type SpinnerProps = TamaguiSpinnerProps & {
  label?: string;
};

/**
 * Loading indicator in the brand primary color. Provide `label` (e.g.
 * "Loading recipes") so screen readers announce what is loading.
 */
export function Spinner({ label = "Loading", color = "$primary", ...rest }: SpinnerProps) {
  // Tamagui's Spinner resolves `color` by looking the value up as a theme
  // key (no "$" prefix) and drops the result verbatim into the SVG's
  // `stroke` attribute. Forwarding "$primary" therefore produced
  // stroke="$primary", which computes to `stroke: none` — an invisible
  // spinner. Strip the token prefix so the theme lookup succeeds and the
  // stroke becomes var(--primary); raw CSS colors pass through unchanged.
  const resolvedColor = typeof color === "string" && color.startsWith("$") ? color.slice(1) : color;
  return <TamaguiSpinner color={resolvedColor} aria-label={label} {...rest} />;
}
