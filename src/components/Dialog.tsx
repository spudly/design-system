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
 * A tracked element that loses focus to the body while the dialog is
 * closed stops being a candidate (focus history alone is not an
 * opener), and the deferred re-asserts a restore schedules are
 * generation-guarded so
 * a newer restore, a reopening, or intervening focus activity retires
 * them instead of letting a stale retry focus the wrong control. A
 * restore also yields to focus a host deliberately placed on a control
 * outside the dialog in the closing commit itself.
 * The mechanism is this component's own (see the effects below): an
 * earlier version rode the primitive's autofocus events, which manual
 * Storybook QA on PR #386 showed do not restore focus in the shipped
 * build. On native there is no DOM focus to restore.
 */
export function Dialog({ open, onOpenChange, title, description, children, actions }: DialogProps) {
  const restoreTargetRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<TamaguiElement>(null);
  const wasOpenRef = useRef(false);
  const openRef = useRef(open);
  const restoreGenRef = useRef(0);
  const lastRestoreTargetRef = useRef<HTMLElement | null>(null);
  const pendingRestoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore helper: focus the tracked element if it is still in the
  // document and focusable, and clear the target either way so a
  // later open tracks fresh.
  const restoreFocus = useCallback(() => {
    const restoreTarget = restoreTargetRef.current;
    restoreTargetRef.current = null;
    // Every restore supersedes the deferred re-asserts of any
    // earlier one: with overlapping dismissals (close, reopen,
    // close again) a stale retry must never focus an opener a
    // newer close has already replaced, so the re-asserts below
    // carry this restore's generation and no-op once it moves on.
    const restoreGen = ++restoreGenRef.current;
    lastRestoreTargetRef.current = restoreTarget;
    if (
      !isWeb ||
      !restoreTarget ||
      typeof document === "undefined" ||
      !document.contains(restoreTarget) ||
      typeof restoreTarget.focus !== "function"
    ) {
      return;
    }
    // Respect focus a host deliberately placed in the closing
    // commit: if focus already rests on a real control outside
    // this dialog — an autoFocus input the host mounted as it
    // closed the dialog, say — that placement wins over returning
    // focus to the opener. Focus inside the dialog's own content
    // or portal frame is not such a placement: it is where the
    // trap left focus, and the restore proceeds as usual.
    const activeElement = document.activeElement as HTMLElement | null;
    if (activeElement && activeElement !== document.body && activeElement !== restoreTarget) {
      const content = contentRef.current as unknown as HTMLElement | null;
      const frame =
        content && typeof content.closest === "function" ? content.closest("dialog") : null;
      const insideOwnDialog = Boolean(
        (content && typeof content.contains === "function" && content.contains(activeElement)) ||
        (frame && frame.contains(activeElement)),
      );
      if (!insideOwnDialog) {
        // Retain the yielded-to control as the restore target: it
        // holds focus now, outside the dialog, and if it reopens
        // this dialog without a focus change there is no focusin
        // to name it — the next dismissal returns to it just as
        // if it had been tracked all along.
        restoreTargetRef.current = activeElement;
        return;
      }
    }
    restoreTarget.focus();
    // Re-assert on a deferred tick: an overlay-click dismissal's
    // own pointer sequence resets focus to the body AFTER this
    // restore runs (manual QA on PR #386: Cancel/Delete/Escape
    // restored, overlay click did not). The re-assert fires only
    // while focus sits on the body, so it never steals focus from
    // a control the user has actually moved to in the meantime.
    const reassert = () => {
      if (restoreGenRef.current !== restoreGen) {
        return;
      }
      if (document.activeElement === document.body && document.contains(restoreTarget)) {
        restoreTarget.focus();
      }
    };
    requestAnimationFrame(reassert);
    setTimeout(reassert, 350);
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
  // target; the body is not a useful target (a programmatically
  // opened dialog), so it is ignored. A negative-tabIndex element
  // is NOT excluded: it cannot be tabbed to, but a host can focus
  // it programmatically and open the dialog from it, and it can
  // receive focus() on the way back.
  useEffect(() => {
    if (!isWeb || typeof document === "undefined") {
      return;
    }
    const trackTarget = (target: HTMLElement | null) => {
      if (!target || target === document.body) {
        return;
      }
      const content = contentRef.current as unknown as HTMLElement | null;
      if (content && typeof content.contains === "function" && content.contains(target)) {
        return;
      }
      // The portal frame itself (the native <dialog> element the
      // primitive renders the portal into) and everything else in
      // it — the overlay, the focus-scope wrapper — are this
      // dialog's own chrome, not the opener: the frame can receive
      // focus when the primitive shows it, and when the dialog has
      // no focusable descendants the focus scope lands focus on its
      // own wrapper inside the frame. Tracking any of those would
      // replace the opener with an element that unmounts on close
      // (manual QA on PR #386: the no-actions dialog lost its
      // restore target this way while the with-actions one, whose
      // focus lands inside the content, did not).
      const frame =
        content && typeof content.closest === "function" ? content.closest("dialog") : null;
      if (frame && (target === frame || frame.contains(target))) {
        return;
      }
      restoreTargetRef.current = target;
    };
    // Mount sample: if the opener already holds focus when this
    // dialog mounts already open, its focusin predates the listener
    // below, so sample the active element once here. This setup runs
    // in the same committed effect flush as the primitive's own
    // mount handling but before its idle-delayed focus move into
    // the dialog, so the sampled element is still the opener.
    trackTarget(document.activeElement as HTMLElement | null);
    const handleFocusIn = (event: FocusEvent) => {
      // While this dialog is open its restore target is frozen at
      // the opener: focus events from outside the frame in that
      // window belong to something else — a nested dialog's
      // portaled controls, say — and must not replace the opener,
      // which is the only element a close should return to. (The
      // mount sample above is exempt: it runs once at setup, for
      // the already-focused-opener capture.)
      if (openRef.current) {
        return;
      }
      // Intervening focus activity supersedes a pending deferred
      // re-assert from the last close: once focus has moved to a
      // different element than the one just restored, the retry
      // must not pull it back later if that element blurs to the
      // body inside the retry window. (The restore's own focus()
      // lands here with the restored element itself as the target
      // and does not invalidate.)
      if (lastRestoreTargetRef.current && event.target !== lastRestoreTargetRef.current) {
        restoreGenRef.current++;
        lastRestoreTargetRef.current = null;
      }
      trackTarget(event.target as HTMLElement | null);
    };
    // Staleness: a tracked element that loses focus to nowhere
    // (the body) while the dialog is closed stops being a restore
    // candidate — focus history alone is not an opener (focus
    // button A, blur it back to the body, then open the dialog
    // programmatically, and a close has nothing it should return
    // to). The check is deferred a tick and re-verified then, so
    // it can never race an opening commit or the primitive's own
    // focus move into the dialog: an earlier version validated
    // the target inside the open effect itself, which runs after
    // focus has already moved into the dialog, and cleared every
    // legitimate opener (manual QA on PR #386, head 4d775a8: all
    // dismissal paths in all stories left focus on the body).
    const handleFocusOut = (event: FocusEvent) => {
      if (openRef.current) {
        return;
      }
      if (!restoreTargetRef.current || event.target !== restoreTargetRef.current) {
        return;
      }
      if (event.relatedTarget) {
        return;
      }
      setTimeout(() => {
        if (openRef.current) {
          return;
        }
        if (document.activeElement === document.body) {
          restoreTargetRef.current = null;
        }
      }, 0);
    };
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  // Restore on close: when `open` flips true -> false, return focus
  // to the tracked element. This effect is this component's own, so
  // it runs after the primitive's close-time focus handling in the
  // same commit — the restore is the last focus move.
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    openRef.current = open;
    if (!wasOpen && open) {
      // A (re)opening supersedes any deferred re-assert still
      // pending from the previous close.
      restoreGenRef.current++;
      return;
    }
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
      if (!isWeb || !wasOpenRef.current) {
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
