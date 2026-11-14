import { useRef } from "react";
import { Input as TamaguiInput, isWeb } from "tamagui";

type InputProps = React.ComponentProps<typeof TamaguiInput>;

export type ImeCompositionGuard = {
  onCompositionStart?: InputProps["onCompositionStart"];
  onCompositionEnd?: InputProps["onCompositionEnd"];
  onSubmitEditing?: InputProps["onSubmitEditing"];
};

// IME composition guard (web): Tamagui's Input fires
// `onSubmitEditing` from its Enter keydown handler without
// checking composition, so a CJK user confirming a candidate
// with Enter would submit mid-typing. Track composition on
// the field itself and hold submit-editing while it is
// active; composition events do not exist on native, where
// the return key never fires during composition.
//
// The flag alone is not enough: Safari fires
// `compositionend` BEFORE the confirming Enter keydown, so
// the flag is already cleared when Tamagui's handler runs —
// and the event Tamagui passes to `onSubmitEditing` carries
// only the field text (no isComposing/keyCode to check
// here). The guard therefore also holds submit-editing for
// a short grace window after composition ends: the
// confirming keydown follows `compositionend` within the
// same task sequence, while a deliberate Enter press lands
// well after the window.
//
// Shared by TextField and SearchField (first shipped on
// TextField for #562, then mirrored in SearchField) — the
// two copies were the largest shipped-source clone in the
// jscpd baseline for #587 phase 2.
export function useImeCompositionGuard({
  onCompositionStart,
  onCompositionEnd,
  onSubmitEditing,
}: ImeCompositionGuard) {
  const composingRef = useRef(false);
  // Monotonic clock (performance.now): a wall-clock step must
  // not stretch or shrink the grace window. -Infinity means
  // "no composition has ended yet" (performance.now() starts
  // near 0, so 0 would falsely hold submits in the first
  // 100 ms after mount).
  const compositionEndedAtRef = useRef(Number.NEGATIVE_INFINITY);
  const handleCompositionStart: typeof onCompositionStart = (event) => {
    composingRef.current = true;
    onCompositionStart?.(event);
  };
  const handleCompositionEnd: typeof onCompositionEnd = (event) => {
    composingRef.current = false;
    compositionEndedAtRef.current = performance.now();
    onCompositionEnd?.(event);
  };
  const handleSubmitEditing: typeof onSubmitEditing = (event) => {
    if (
      isWeb &&
      (composingRef.current || performance.now() - compositionEndedAtRef.current < 100)
    ) {
      return;
    }
    onSubmitEditing?.(event);
  };
  return { handleCompositionStart, handleCompositionEnd, handleSubmitEditing };
}
