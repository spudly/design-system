import { useRef } from "react";
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
 * element is still in the document and focusable. Capture and restore ride
 * the primitive's autofocus events (see the handlers below), so they happen
 * at committed lifecycle points only. On native there is no DOM focus to
 * restore.
 */
export function Dialog({ open, onOpenChange, title, description, children, actions }: DialogProps) {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Capture and restore ride the primitive's own autofocus events,
  // which the FocusScope inside Tamagui's Dialog dispatches at the
  // committed lifecycle points:
  //
  // - `onOpenAutoFocus` fires in the FocusScope's mount effect,
  //   after it has read document.activeElement but before it moves
  //   focus into the dialog — so the element read here is still the
  //   opener, never a control inside the dialog. Capturing here
  //   (not during render, not in this component's own effects)
  //   means an abandoned or suspended render can never leave a
  //   stale target behind, and a StrictMode effect replay simply
  //   re-dispatches the same pair of events. The body is not a
  //   useful restore target (a programmatically opened dialog),
  //   so it is never captured.
  const handleOpenAutoFocus = () => {
    if (!isWeb || typeof document === "undefined") {
      return;
    }
    const activeElement = document.activeElement as HTMLElement | null;
    if (activeElement && activeElement !== document.body) {
      previouslyFocusedRef.current = activeElement;
    }
  };

  // - `onCloseAutoFocus` fires from the FocusScope's cleanup, on
  //   every close path AND when the scope unmounts while the dialog
  //   is still open — there is no separate unmount effect to lose
  //   the opener to a StrictMode replay. Tamagui's modal content
  //   composes its own handler after this one: it cancels the
  //   FocusScope's fallback restore and focuses the trigger ref,
  //   which is empty here (the host owns the trigger), so the
  //   restore below is the focus move that stands. The event is
  //   deliberately NOT canceled from here before that composition
  //   runs. The captured element is restored only while it is
  //   still in the document and focusable; the ref is cleared
  //   either way so a later open captures fresh.
  const handleCloseAutoFocus = () => {
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

  return (
    <TamaguiDialog open={open} onOpenChange={onOpenChange}>
      <TamaguiDialog.Portal>
        <StyledOverlay />
        <StyledContent onOpenAutoFocus={handleOpenAutoFocus} onCloseAutoFocus={handleCloseAutoFocus}>
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
