import type { ReactNode } from "react";
import { Label, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { useImeCompositionGuard, type ImeCompositionGuard } from "./useImeCompositionGuard.js";

export type FieldShellGuard = ReturnType<typeof useImeCompositionGuard>;

export type FieldShellProps = ImeCompositionGuard & {
  /** The visible label, associated with the field via `htmlFor`. */
  label?: string | undefined;
  /** The inner field's id — the label's `htmlFor` target. */
  id: string;
  /** Grow to fill the remaining width of a row (see TextField's
   * `grow` note): the shell root takes flex: 1. */
  grow?: boolean;
  /** The field itself (plus any error line), rendered inside the
   * shell with the IME composition guard's prop spreads for its
   * inner input. */
  children: (guard: FieldShellGuard) => ReactNode;
};

/**
 * The labeled-field shell shared by TextField and SearchField
 * (#587 phase 3): the column rhythm, the optional visible label,
 * and the IME composition guard call were identical in both
 * fields — only the inner control differs (a plain input vs the
 * search container). Internal helper, not a view component of
 * its own: NOT exported from the views barrel, exercised through
 * the two fields' stories.
 */
export function FieldShell({
  label,
  id,
  grow = false,
  onCompositionStart,
  onCompositionEnd,
  onSubmitEditing,
  children,
}: FieldShellProps) {
  // IME composition guard (web) — see useImeCompositionGuard.
  const guard = useImeCompositionGuard({
    onCompositionStart,
    onCompositionEnd,
    onSubmitEditing,
  });

  return (
    <YStack gap={tokens.spacing[1]} {...(grow ? { flex: 1 } : {})}>
      {label ? (
        <Label htmlFor={id} fontSize={tokens.typography.fontSize.sm}>
          {label}
        </Label>
      ) : null}
      {children(guard)}
    </YStack>
  );
}
