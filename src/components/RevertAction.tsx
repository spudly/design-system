import { tokens } from "../tokens/index.js";
import { TextAction } from "./TextAction.js";

export type RevertActionProps = {
  /** The pre-formatted parent value, rendered after "Revert
   * to: " (the host formats parent values its own way). */
  label: string;
  onPress: () => void;
};

/**
 * The version-diff revert affordance (#119, extracted from
 * RecipeFormPage): small warning-tone text, pressable — the
 * app's RevertButton treatment for a field or list whose value
 * differs from the version it was derived from.
 *
 * The pressable itself is TextAction (#119 dedupe): the
 * tranche's first cut hand-built the button role, the web
 * Enter/Space handler, and the focus ring on a raw stack —
 * TextAction's exact job, which the shared component already
 * owns (role through platformAccessibilityProps, #237, so on
 * web it renders as a real button role, never a leaked RN
 * prop, and a held key does not re-activate). This component
 * contributes only the treatment (extra-small, medium,
 * warning-tone, slightly faded) and the "Revert to:" copy
 * shape.
 */
export function RevertAction({ label, onPress }: RevertActionProps) {
  return (
    <TextAction
      onPress={onPress}
      fontSize={tokens.typography.fontSize.xs}
      fontWeight={tokens.typography.fontWeight.medium}
      color={tokens.colors.warning.warning9}
      opacity={0.8}
    >
      {`Revert to: ${label}`}
    </TextAction>
  );
}
