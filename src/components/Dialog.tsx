import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Dialog as TamaguiDialog, XStack, YStack, isWeb, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledOverlay = styled(TamaguiDialog.Overlay, {
  name: "DialogOverlay",

  backgroundColor: tokens.colors.gray.gray10,
  opacity: 0.5,
});

const StyledContent = styled(TamaguiDialog.Content, {
  name: "DialogContent",

  backgroundColor: "$surface",
  borderRadius: tokens.radii.lg,
  padding: tokens.spacing[5],
  width: "90%",
  maxWidth: 400,
});

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Optional footer row of buttons (the app composes these). */
  actions?: ReactNode;
};

/**
 * Modal dialog wrapping Tamagui's Dialog (focus trap, Escape-to-close, and
 * overlay dismissal come from the primitive). Controlled via
 * `open`/`onOpenChange`; the app renders its own trigger element and calls
 * `onOpenChange(true)`. The title uses proper heading semantics.
 *
 * Focus restoration (#385): the dialog has no trigger element of its own —
 * the host renders the trigger and flips `open` — and Tamagui cancels its
 * fallback focus restoration while trying to focus that missing trigger, so
 * without help a dismissed dialog leaves keyboard focus nowhere and the user
 * must navigate back through the page to the control that opened it. On web
 * the dialog therefore captures the element that held focus when it opened
 * and returns focus to it on close (and on unmount while open), when that
 * element is still in the document and focusable. On native there is no DOM
 * focus to restore.
 */
export function Dialog({ open, onOpenChange, title, description, children, actions }: DialogProps) {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Capture happens while rendering the open dialog, not in an effect:
  // effects run after Tamagui has already moved focus into the dialog, so
  // an effect-time read of document.activeElement would capture an element
  // inside the dialog instead of the control that opened it. At render
  // time the previously committed tree is still the closed dialog, so the
  // active element is still the opener. The body is not a useful restore
  // target (a programmatically opened dialog), so it is never captured.
  if (isWeb && open && previouslyFocusedRef.current === null && typeof document !== "undefined") {
    const activeElement = document.activeElement as HTMLElement | null;
    if (activeElement && activeElement !== document.body) {
      previouslyFocusedRef.current = activeElement;
    }
  }

  // Restore on close: this effect runs after Tamagui's own close-time
  // focus handling (child effects and cleanups run first), so the restore
  // is the last focus move. The captured element is restored only while
  // it is still in the document and focusable; the ref is cleared either
  // way so a later open captures fresh.
  useEffect(() => {
    if (!isWeb || open) {
      return;
    }
    const previouslyFocused = previouslyFocusedRef.current;
    previouslyFocusedRef.current = null;
    if (
      previouslyFocused &&
      document.contains(previouslyFocused) &&
      typeof previouslyFocused.focus === "function"
    ) {
      previouslyFocused.focus();
    }
  }, [open]);

  // Unmount while open: the close effect above never sees a closed
  // state, so the same restore runs from the unmount cleanup instead.
  useEffect(() => {
    return () => {
      const previouslyFocused = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      if (
        isWeb &&
        previouslyFocused &&
        typeof document !== "undefined" &&
        document.contains(previouslyFocused) &&
        typeof previouslyFocused.focus === "function"
      ) {
        previouslyFocused.focus();
      }
    };
  }, []);

  return (
    <TamaguiDialog open={open} onOpenChange={onOpenChange}>
      <TamaguiDialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <YStack gap={tokens.spacing[3]}>
            <TamaguiDialog.Title
              fontSize={tokens.typography.fontSize.xl}
              fontWeight={tokens.typography.fontWeight.semibold}
              color="$color"
            >
              {title}
            </TamaguiDialog.Title>
            {description ? (
              <TamaguiDialog.Description>
                <Text variant="hint">{description}</Text>
              </TamaguiDialog.Description>
            ) : null}
            <YStack>{children}</YStack>
            {actions ? (
              <XStack gap={tokens.spacing[2]} justifyContent="flex-end">
                {actions}
              </XStack>
            ) : null}
          </YStack>
        </StyledContent>
      </TamaguiDialog.Portal>
    </TamaguiDialog>
  );
}
