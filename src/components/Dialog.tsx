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

// Activation order of the currently open DS dialogs (web
// containment, #391): portal frames mount in tree order, which
// is not necessarily the order dialogs were opened in, so the
// topmost-modal test cannot rely on document order alone among
// DS dialogs themselves. Each open Dialog registers an entry
// here for as long as it is open — its identity plus the portal
// frame it renders into, so the document-order fallback for
// foreign modals can recognize (and skip) DS frames; the last
// registered entry is the topmost DS dialog.
type OpenDialogEntry = { token: symbol; frame: Element | null };
const openDialogStack: OpenDialogEntry[] = [];

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
 * The tracker reads the current active element rather than a focus
 * event's target, which can be stale after a synchronous focus
 * redirect nested inside another element's focus handling, and a
 * focus event observed with focus on the body clears the candidate
 * (a nested blur left no control holding focus).
 * A tracked element that loses focus to the body while the dialog is
 * closed stops being a candidate (focus history alone is not an
 * opener) — including when that blur and a programmatic opening land
 * in the same task: the blur is recorded as it happens and consumed
 * by the opening commit, so racing the open does not forgive it; a
 * successful restore retains its target (an already-
 * focused opener emits no focusin to re-track it), and the deferred
 * re-asserts a restore schedules are generation-guarded so
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
  const reassertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reassertRafRef = useRef<number | null>(null);
  const unmountRestoreRef = useRef(false);
  const blurredTargetRef = useRef<HTMLElement | null>(null);
  const stackEntryRef = useRef<OpenDialogEntry>({ token: Symbol("dialog"), frame: null });

  // Restore helper: focus the tracked element if it is still in the
  // document and focusable, and clear the target either way so a
  // later open tracks fresh.
  const restoreFocus = useCallback(() => {
    const fromUnmount = unmountRestoreRef.current;
    unmountRestoreRef.current = false;
    const restoreTarget = restoreTargetRef.current;
    restoreTargetRef.current = null;
    // Every restore supersedes the deferred re-asserts of any
    // earlier one: with overlapping dismissals (close, reopen,
    // close again) a stale retry must never focus an opener a
    // newer close has already replaced, so the re-asserts below
    // carry this restore's generation and no-op once it moves on.
    const restoreGen = ++restoreGenRef.current;
    lastRestoreTargetRef.current = restoreTarget;
    if (!isWeb || typeof document === "undefined") {
      return;
    }
    // Respect focus a host deliberately placed in the closing
    // commit: if focus already rests on a real control outside
    // this dialog — an autoFocus input the host mounted as it
    // closed the dialog, say — that placement wins over returning
    // focus to the opener. Focus inside the dialog's own content
    // or portal frame is not such a placement: it is where the
    // trap left focus, and the restore proceeds as usual. This
    // runs BEFORE the target-validity guard below: a missing or
    // detached opener must not discard the host's placement,
    // whose own focusin was ignored while the dialog was still
    // open — dropping it would leave a reopening from that
    // still-focused control with no restore target at all
    // (Copilot review on PR #386, head b298361).
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
    if (
      !restoreTarget ||
      !document.contains(restoreTarget) ||
      typeof restoreTarget.focus !== "function"
    ) {
      return;
    }
    // Retain the target BEFORE focusing it: when the element
    // already held focus at close time (a host focused the opener
    // itself in the closing commit), focus() emits no focusin, so
    // nothing else would repopulate the tracker — and a reopening
    // from that still-focused opener, again with no focus change
    // to track, would dismiss to the body. Retaining first also
    // lets a synchronous focus redirection supersede it: if a host
    // focus handler moves focus from the opener to another control
    // during focus(), that control's focusin re-tracks it as the
    // target, and a reopening from it dismisses back to it rather
    // than to the opener (Copilot review on PR #386, head
    // 47ca297). Retention is safe alongside the staleness rule: if
    // the retained element later loses focus to the body while
    // closed, the focusout check retires it as usual.
    restoreTargetRef.current = restoreTarget;
    restoreTarget.focus();
    // Re-assert on a deferred tick: an overlay-click dismissal's
    // own pointer sequence resets focus to the body AFTER this
    // restore runs (manual QA on PR #386: Cancel/Delete/Escape
    // restored, overlay click did not). The re-assert fires only
    // while focus sits on the body, so it never steals focus from
    // a control the user has actually moved to in the meantime.
    // A restore scheduled from unmount schedules NO re-asserts:
    // teardown has removed the focus listener whose intervening-
    // activity check is what retires a stale retry, so a retry
    // scheduled then could steal focus back after the user has
    // moved on (Copilot review on PR #386, head aeea1fb).
    if (!fromUnmount) {
      const reassert = () => {
        if (restoreGenRef.current !== restoreGen) {
          return;
        }
        if (document.activeElement === document.body && document.contains(restoreTarget)) {
          restoreTarget.focus();
        }
      };
      reassertRafRef.current = requestAnimationFrame(reassert);
      reassertTimerRef.current = setTimeout(() => {
        // The long retry must not reclaim a target the staleness
        // check has since retired — an intentional blur of the
        // restored opener after the animation-frame retry (focus
        // to the body, target cleared) means focus was
        // deliberately surrendered, and refocusing would steal it
        // back. The overlay's own focus reset is unaffected: the
        // frame retry's recovery re-tracks the opener through its
        // focusin, so the target matches again by the time this
        // runs (Copilot review on PR #386, head b298361).
        if (restoreTargetRef.current !== restoreTarget) {
          return;
        }
        reassert();
      }, 350);
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
      // A fresh (re)focus supersedes any recorded blur of an older
      // target: the record names a candidate this focus replaces.
      blurredTargetRef.current = null;
      restoreTargetRef.current = target;
    };
    // Mount sample: if the opener already holds focus when this
    // dialog mounts already open, its focusin predates the listener
    // below, so sample the active element once here. This setup runs
    // in the same committed effect flush as the primitive's own
    // mount handling but before its idle-delayed focus move into
    // the dialog, so the sampled element is still the opener.
    trackTarget(document.activeElement as HTMLElement | null);
    const handleFocusIn = () => {
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
      // Track the CURRENT active element, never the event's own
      // target: the target can be stale by the time this listener
      // runs. If a host's focus handler for element A synchronously
      // redirects focus to B, B's focusin reaches this listener
      // first, then A's original event resumes bubbling and would
      // overwrite the tracked target with A — yet focus rests on
      // B, and a one-shot redirect means reopening from the
      // still-focused B emits no new focusin, so dismissal would
      // restore A instead of B. document.activeElement is the
      // ground truth at listener time in both orders (Copilot
      // review on PR #386, head d2abcf5).
      const currentTarget = document.activeElement as HTMLElement | null;
      // Intervening focus activity supersedes a pending deferred
      // re-assert from the last close: once focus has moved to a
      // different element than the one just restored, the retry
      // must not pull it back later if that element blurs to the
      // body inside the retry window. (The restore's own focus()
      // lands here with the restored element itself as the target
      // and does not invalidate.)
      if (lastRestoreTargetRef.current && currentTarget !== lastRestoreTargetRef.current) {
        restoreGenRef.current++;
        lastRestoreTargetRef.current = null;
      }
      // A focus event observed with focus on the body means no
      // control holds focus, so any saved candidate is stale:
      // focus moved A -> B and B's focus handler immediately
      // blurred B (B.blur() in onFocus). Neither focusout guard
      // catches that sequence — A's focusout names B as its
      // relatedTarget, and B's focusout does not name the tracked
      // target — so without this clear, a later programmatic
      // opening and dismissal would restore A even though focus
      // was on the body when the dialog opened (Copilot review
      // on PR #386, head 7ee1f4e).
      if (currentTarget === document.body) {
        restoreTargetRef.current = null;
      }
      trackTarget(currentTarget);
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
    // The blur itself is recorded synchronously, though: if the
    // host blurs the opener and opens the dialog in the same task
    // (`button.blur(); setOpen(true)`), the opening commits before
    // the deferred check runs and the check's open guard would
    // forgive a blur that genuinely preceded the open — dismissal
    // would then focus an element focus had already left before
    // the dialog ever appeared. The opening commit consumes the
    // record instead (see the open-transition effect). This does
    // not misfire on the primitive's own opening autofocus: that
    // focus move out of the opener either carries a relatedTarget
    // inside the dialog (rejected by the guard below) or happens
    // while the dialog is already open (the handler above returns
    // first), so it never records a blur (Copilot review on PR
    // #386, head 39e9223).
    const handleFocusOut = (event: FocusEvent) => {
      if (openRef.current) {
        return;
      }
      if (!restoreTargetRef.current || event.target !== restoreTargetRef.current) {
        return;
      }
      if (event.relatedTarget && event.relatedTarget !== document.body) {
        return;
      }
      const blurredTarget = restoreTargetRef.current;
      blurredTargetRef.current = blurredTarget;
      setTimeout(() => {
        if (blurredTargetRef.current === blurredTarget) {
          blurredTargetRef.current = null;
        }
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
      // Teardown also cancels any deferred re-assert a close
      // scheduled: with the focus listener gone, nothing remains
      // to invalidate a stale retry, so it must not fire at all
      // after unmount (Copilot review on PR #386, head aeea1fb).
      if (reassertTimerRef.current !== null) {
        clearTimeout(reassertTimerRef.current);
        reassertTimerRef.current = null;
      }
      if (reassertRafRef.current !== null) {
        cancelAnimationFrame(reassertRafRef.current);
        reassertRafRef.current = null;
      }
    };
  }, []);

  // Register in the open-dialog stack while open (see
  // openDialogStack above). The cleanup removes exactly this
  // registration, so a StrictMode replay (cleanup + setup) nets
  // a single entry.
  useEffect(() => {
    if (!open || !isWeb) {
      return;
    }
    const entry = stackEntryRef.current;
    const content = contentRef.current as unknown as HTMLElement | null;
    entry.frame =
      content && typeof content.closest === "function" ? content.closest("dialog") : null;
    openDialogStack.push(entry);
    return () => {
      const index = openDialogStack.indexOf(entry);
      if (index >= 0) {
        openDialogStack.splice(index, 1);
      }
    };
  }, [open]);

  // Focus containment for a dialog with nothing tabbable (#391):
  // the primitive's focus scope traps Tab between the dialog's
  // tabbable descendants, and when there are none its own landing
  // wrapper is the only stop — sequential navigation then escapes
  // to the page behind the overlay on the next Tab (and a first
  // Shift+Tab lands directly on the opener). While the dialog is
  // open on web, a capture-phase keydown listener therefore takes
  // over Tab handling ONLY when the content holds no effectively
  // tabbable element: the keypress's default traversal is
  // prevented so focus stays on the wrapper inside the dialog,
  // and if focus somehow sits outside the dialog it is pulled
  // back onto that wrapper. Propagation is deliberately NOT
  // stopped: a control inside the dialog that handles Tab itself
  // (an editor that indents, say) must still receive the key —
  // preventing the default is what keeps focus from escaping,
  // and with no tabbable candidates the scope has nowhere to
  // move focus either. Dialogs with
  // tabbable content are untouched — the primitive already wraps
  // Cancel <-> Delete correctly there (manual QA on PR #386).
  // Refinements from review rounds on PR #392: (1) tabbability
  // is effective, not selector-shaped — a hidden input, a
  // disabled or visibility-hidden control (the :disabled
  // pseudo-class carries the fieldset semantics, first-legend
  // exception included, and never matches links), a control
  // inside an inert subtree, a negative-tabindex-only control,
  // or an unrendered element is not a Tab stop, while native
  // stops a naive selector misses (summary, iframe, media
  // controls, genuinely editable content) are; an element marked
  // contenteditable="false" is not a stop either, and an
  // image-map area counts only when the image using its map is
  // rendered (the area itself has no layout box). (2) Only
  // the topmost modal intercepts — a covered dialog's listener
  // must not swallow Tab for the dialog above it. Among DS
  // dialogs, covered is decided by the open-dialog stack's
  // activation order (frames mount in tree order, not open
  // order); for foreign frames it means a LATER, still-modal
  // frame (aria-modal or the :modal state — a merely open,
  // modeless dialog covers nothing — and actually rendered): a closed
  // dialog element parked later in the document — or nested
  // inside this dialog — covers nothing. (3) A details
  // element with no summary child counts as a stop (its UA
  // fallback summary is tabbable but not in the DOM), and the
  // fallback landing itself must be focusable: the content
  // carries tabIndex={-1} on web so the pull-back focus()
  // actually lands inside the dialog when the frame has no
  // landing wrapper of its own (CodeRabbit review on PR #392,
  // head fbf5aea).
  useEffect(() => {
    if (!open || !isWeb || typeof document === "undefined") {
      return;
    }
    const handleTabContainment = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }
      const content = contentRef.current as unknown as HTMLElement | null;
      if (!content || typeof content.querySelectorAll !== "function") {
        return;
      }
      const ownEntry = stackEntryRef.current;
      const stackIndex = openDialogStack.indexOf(ownEntry);
      if (stackIndex >= 0 && stackIndex < openDialogStack.length - 1) {
        return;
      }
      const frame = typeof content.closest === "function" ? content.closest("dialog") : null;
      ownEntry.frame = frame;
      if (frame) {
        const dsFrames = new Set(
          openDialogStack.map((entry) => entry.frame).filter((entryFrame) => entryFrame !== null),
        );
        const covered = Array.from(document.querySelectorAll("dialog")).some((other) => {
          if (other === frame || frame.contains(other) || dsFrames.has(other)) {
            return false;
          }
          if ((frame.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING) === 0) {
            return false;
          }
          const isOpenModal =
            other.getAttribute("aria-modal") === "true" || other.matches(":modal");
          return isOpenModal && other.getClientRects().length > 0;
        });
        if (covered) {
          return;
        }
      }
      const candidates = content.querySelectorAll(
        'a[href], area[href], button, input, select, textarea, details, summary, iframe, audio[controls], video[controls], [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"], [tabindex]',
      );
      const hasTabbable = Array.from(candidates).some((candidate) => {
        if (candidate.hasAttribute("disabled") || candidate.matches(":disabled")) {
          return false;
        }
        if (candidate.closest("[inert]")) {
          return false;
        }
        if (candidate instanceof HTMLInputElement && candidate.type === "hidden") {
          return false;
        }
        const tabStopAttr = candidate.getAttribute("tabindex");
        if (tabStopAttr !== null && Number.parseInt(tabStopAttr, 10) < 0) {
          return false;
        }
        const editableAttr = candidate.getAttribute("contenteditable");
        const independentlyTabbable =
          candidate.matches(
            "a[href], area[href], button, input, select, textarea, details, summary, iframe, audio[controls], video[controls]",
          ) ||
          (tabStopAttr !== null && Number.parseInt(tabStopAttr, 10) >= 0);
        if (editableAttr !== null && editableAttr !== "false" && !independentlyTabbable) {
          let host: Element | null = candidate.parentElement;
          while (host && host !== content) {
            const hostAttr = host.getAttribute("contenteditable");
            if (hostAttr !== null) {
              if (hostAttr === "false") {
                return false;
              }
              break;
            }
            host = host.parentElement;
          }
        }
        if (candidate instanceof HTMLDetailsElement && tabStopAttr === null) {
          // A details element with no summary child gets a UA
          // fallback summary that IS a Tab stop — but it is not
          // in the DOM, so the details element itself must stand
          // in for it here. With an explicit summary child, the
          // summary is the stop (counted on its own candidate
          // pass) and the details element is not (Copilot review
          // on PR #392, head fbf5aea).
          const hasOwnSummary = Array.from(candidate.children).some(
            (child) => child.tagName === "SUMMARY",
          );
          if (hasOwnSummary) {
            return false;
          }
        }
        if (candidate instanceof HTMLAreaElement) {
          const mapName = candidate.closest("map")?.getAttribute("name");
          if (!mapName) {
            return false;
          }
          return Array.from(content.querySelectorAll("img[usemap]")).some((image) => {
            if (image.getAttribute("usemap") !== `#${mapName}`) {
              return false;
            }
            if (image.closest("[inert]")) {
              return false;
            }
            return image.getClientRects().length > 0;
          });
        }
        const style = window.getComputedStyle(candidate);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.visibility === "collapse"
        ) {
          return false;
        }
        return candidate.getClientRects().length > 0;
      });
      if (hasTabbable) {
        return;
      }
      event.preventDefault();
      const activeElement = document.activeElement as HTMLElement | null;
      const inside = Boolean(
        activeElement &&
        (content.contains(activeElement) || (frame && frame.contains(activeElement))),
      );
      if (!inside) {
        const wrapper = frame
          ? (frame.querySelector('[tabindex="-1"]') as HTMLElement | null)
          : null;
        const landing = wrapper ?? content;
        if (typeof landing.focus === "function") {
          landing.focus();
        }
      }
    };
    document.addEventListener("keydown", handleTabContainment, true);
    return () => {
      document.removeEventListener("keydown", handleTabContainment, true);
    };
  }, [open]);

  // Restore on close: when `open` flips true -> false, return focus
  // to the tracked element. This effect is this component's own, so
  // it runs after the primitive's close-time focus handling in the
  // same commit — the restore is the last focus move.
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    openRef.current = open;
    if (!wasOpen && open) {
      // An explicit blur of the tracked element to the body that
      // landed before this opening (same-task blur + open) retires
      // that element: focus was on the body when the dialog
      // opened, so a close has nothing it should return to. The
      // record is consumed either way — a later opening starts
      // from whatever the tracker holds then.
      if (
        blurredTargetRef.current !== null &&
        blurredTargetRef.current === restoreTargetRef.current
      ) {
        restoreTargetRef.current = null;
      }
      blurredTargetRef.current = null;
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
      // The unmount flag is set only when the timer actually
      // fires, never in this cleanup: a StrictMode replay runs
      // cleanup (schedule) + setup (cancel), and a flag set here
      // would survive that cancel — the first real close would
      // then read fromUnmount, skip its deferred re-asserts, and
      // an overlay dismissal (whose pointer sequence resets focus
      // to the body after the restore) would strand focus on the
      // body (Copilot + CodeRabbit review on PR #386, head
      // 8ac05f4).
      pendingRestoreTimerRef.current = setTimeout(() => {
        pendingRestoreTimerRef.current = null;
        unmountRestoreRef.current = true;
        restoreFocus();
      }, 0);
    };
  }, [restoreFocus]);

  return (
    <TamaguiDialog open={open} onOpenChange={onOpenChange}>
      <TamaguiDialog.Portal>
        <StyledOverlay />
        <StyledContent ref={contentRef} {...(isWeb ? { tabIndex: -1 } : {})}>
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
