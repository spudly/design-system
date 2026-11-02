import { useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Dialog as TamaguiDialog, XStack, YStack, isWeb, styled } from "tamagui";
import type { TamaguiElement } from "tamagui";
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
 * the dialog therefore tracks the element that most recently held focus
 * outside the dialog and returns focus to it on close (and on unmount
 * while open), when that element is still in the document and focusable.
 * The mechanism is this component's own (see the effects below): an
 * earlier version rode the primitive's autofocus events, which manual
 * Storybook QA on PR #386 showed do not restore focus in the shipped
 * build. On native there is no DOM focus to restore.
 */
export function Dialog({ open, onOpenChange, title, description, children, actions }: DialogProps) {
  const restoreTargetRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<TamaguiElement>(null);
  const wasOpenRef = useRef(false);
  const pendingRestoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore helper: focus the tracked element if it is still in the
  // document and focusable, and clear the target either way so a
  // later open tracks fresh.
  const restoreFocus = useCallback(() => {
    const restoreTarget = restoreTargetRef.current;
    restoreTargetRef.current = null;
    if (
      isWeb &&
      restoreTarget &&
      typeof document !== "undefined" &&
      document.contains(restoreTarget) &&
      typeof restoreTarget.focus === "function"
    ) {
      restoreTarget.focus();
    }
  }, []);

  // Track the restore target from real focus events (web): while
  // this component is mounted, a `focusin` anywhere outside the
  // dialog's own content names the element focus would return to —
  // in practice the control the user last used, which is the opener
  // when they open the dialog from it. Because the target comes from
  // committed focus events, an abandoned or suspended render can
  // never leave a stale one behind, and effect replays (StrictMode)
  // only re-register the listener. Focus inside the dialog (the
  // trap moving it between the dialog's controls) never updates the
  // target; the body and non-focusable elements (the overlay, layout
  // containers) are not useful targets, so they are ignored too.
  useEffect(() => {
    if (!isWeb || typeof document === "undefined") {
      return;
    }
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target === document.body || target.tabIndex < 0) {
        return;
      }
      const content = contentRef.current as unknown as HTMLElement | null;
      if (content && typeof content.contains === "function" && content.contains(target)) {
        return;
      }
      restoreTargetRef.current = target;
    };
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, []);

  // Restore on close: when `open` flips true -> false, return focus
  // to the tracked element. This effect is this component's own, so
  // it runs after the primitive's close-time focus handling in the
  // same commit — the restore is the last focus move.
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    if (!wasOpen || open) {
      return;
    }
    restoreFocus();
  }, [open, restoreFocus]);

  // Unmount while open: the close effect above never sees a closed
  // state, so the restore is scheduled from this cleanup instead —
  // deferred by a tick, and the effect's own setup cancels a pending
  // schedule. That cancel is what a StrictMode effect replay runs
  // into: replay = cleanup (schedule) + setup (cancel), so the
  // opener is neither restored prematurely while the dialog is still
  // open nor lost; a real unmount has no following setup, so the
  // scheduled restore fires.
  useEffect(() => {
    if (pendingRestoreTimerRef.current !== null) {
      clearTimeout(pendingRestoreTimerRef.current);
      pendingRestoreTimerRef.current = null;
    }
    return () => {
      if (!isWeb) {
        return;
      }
      pendingRestoreTimerRef.current = setTimeout(() => {
        pendingRestoreTimerRef.current = null;
        restoreFocus();
      }, 0);
    };
  }, [restoreFocus]);

  return (
    <TamaguiDialog open={open} onOpenChange={onOpenChange}>
      <TamaguiDialog.Portal>
        <StyledOverlay />
        <StyledContent ref={contentRef}>
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
