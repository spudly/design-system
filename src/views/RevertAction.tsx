import { Button } from "../widgets/Button.js";

export type RevertActionProps = {
  /** The pre-formatted parent value, rendered after "Revert
   * to: " (the host formats parent values its own way). */
  label: string;
  onPress: () => void;
};

/**
 * The version-diff revert affordance (#119, extracted from
 * RecipeFormPage): a small pressable — the app's RevertButton
 * treatment for a field or list whose value differs from the
 * version it was derived from.
 *
 * The pressable itself is a ghost Button (#464, retiring
 * TextAction): the tranche's first cut hand-built the button
 * role, the web Enter/Space handler, and the focus ring on a
 * raw stack — the shared Button already owns all of that (a
 * real <button> on web, so it renders as a real button role,
 * never a leaked RN prop, and a held key does not
 * re-activate). This component contributes only the
 * "Revert to:" copy shape.
 */
export function RevertAction({ label, onPress }: RevertActionProps) {
  return (
    <Button ghost size="sm" onPress={onPress}>
      {`Revert to: ${label}`}
    </Button>
  );
}
