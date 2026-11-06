import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";

export type FormSubmitProps = {
  /** The submit action (the form's save button). */
  children: ReactNode;
};

/**
 * A form's submit row (#119): the save action with the extra
 * 16px of separation above it that form screens give the
 * submit row beyond the layout's own rhythm — the button ends
 * the form, and the row's separation from the last field is
 * the row's own, so no page wraps its button to set it.
 */
export function FormSubmit({ children }: FormSubmitProps) {
  return <YStack paddingBlockStart={tokens.spacing[4]}>{children}</YStack>;
}
