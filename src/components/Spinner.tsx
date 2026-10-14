import { Spinner as TamaguiSpinner } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

type TamaguiSpinnerProps = GetProps<typeof TamaguiSpinner>;

export interface SpinnerProps extends TamaguiSpinnerProps {
  label?: string;
}

/**
 * Loading indicator in the brand primary color. Provide `label` (e.g.
 * "Loading recipes") so screen readers announce what is loading.
 */
export function Spinner({
  label = "Loading",
  color = "$primary",
  ...rest
}: SpinnerProps) {
  return <TamaguiSpinner color={color} aria-label={label} {...rest} />;
}
