/**
 * The shared web keyboard-activation handler for view-based
 * press targets (the row family: CardRow, CheckRow, MarkableRow).
 *
 * A Tamagui view carrying an accessibility role is not
 * keyboard-operable on its own, so the pressable rows make it
 * focusable (`tabIndex={0}`, a web-only prop ignored on native,
 * where onPress is the activation path) and invoke the same
 * callback as a press on the button activation keys — Enter and
 * Space. A held key repeats keydown events; a native button does
 * not re-activate on repeats, so repeats still prevent the
 * default (a held Space must not scroll) but do not re-fire the
 * callback — one press is one activation.
 */
export type KeyboardActivationEvent = {
  key: string;
  repeat?: boolean;
  preventDefault: () => void;
};

export function keyboardActivationHandler(onActivate: () => void) {
  return (event: KeyboardActivationEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!event.repeat) {
        onActivate();
      }
    }
  };
}
