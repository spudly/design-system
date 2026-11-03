import { useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ScrollView, YStack, isWeb } from "tamagui";
import type { TamaguiElement } from "tamagui";
import { tokens } from "../tokens/index.js";
import { dialogRoleProps, platformAccessibilityProps } from "./accessibility.js";
import {
  ModalLayerContext,
  isActiveModalLayer,
  registerModalLayer,
  registeredModalRoots,
  unregisterModalLayer,
} from "./modalRegistry.js";
import type { ModalLayer } from "./modalRegistry.js";
import { Text } from "./Text.js";

export type StepOverlayProps = {
  /** The top eyebrow line: the context the steps belong to (a
   * meal's title). */
  title: string;
  /** The second eyebrow line: the current step, pre-composed
   * ("Step 2 of 5") — the overlay renders it verbatim. */
  stepLabel: string;
  /** The step's body text, rendered at reading size. */
  body: string;
  /** The Done pill's label ("Done"). */
  doneLabel?: string;
  /** The Done pill's callback: leaving the steps. */
  onDone: () => void;
  /** The step navigation under the body — progress dots, a
   * prev/next row — composed by the caller; the overlay owns
   * the shell and the header treatment, not the controls. */
  children?: ReactNode;
};

// The scroll region's content container grows to at least
// the region's own height and centers its column (#332):
// short bodies keep the vertically centered treatment, while
// a taller column overflows the grown container and scrolls.
// The centering lives on the container, not on a flexed
// child — the ScrollRegion pattern; a flex={1} child makes
// the native ScrollView size its content to the child's full
// height and paint it past the region's bounds (the Android
// VR LongBody capture on the first #332 head showed exactly
// that). (The shared ScrollRegion cannot be used here — it
// exposes no way to grow its content container, and the
// centered treatment depends on it.)
const scrollContentContainerStyle = { flexGrow: 1, justifyContent: "center" } as const;

/**
 * A full-screen step-reader overlay (#119): a dark, opaque
 * shell that fills its nearest positioned ancestor (so the
 * page beneath does not show through), a translucent Done pill
 * pinned to the top right, and the step's text in a centered
 * column — two eyebrow lines (the context, then the step) over
 * the body at reading size. The caller's step navigation
 * (progress dots, prev/next) composes below the body as
 * children.
 *
 * The column sits in a bounded scroll region (#332): a long
 * step body on a short viewport scrolls — body and navigation
 * together — instead of clipping at both ends of a centered
 * column with the navigation pushed off-screen. Short bodies
 * keep the vertically centered treatment, and the Done pill is
 * a sibling of the region, not part of it, so it stays fixed
 * and reachable at any scroll position. The pill paints the
 * shell's own color as the base under its layered fill, so
 * the composite over the shell is unchanged but scrolled text
 * passing beneath the pill no longer shows through it.
 *
 * The shell manages focus (#332): it carries dialog semantics
 * (dialogRoleProps — a modal dialog named for its title on
 * web, view-modal on iOS) and, on web, moves focus into
 * itself on mount, so a host that mounts it over still-mounted
 * interactive content does not leave that content as the
 * keyboard or screen-reader starting point behind the opaque
 * shell. On web and iOS the host does not need to unmount or
 * inert the covered content; on Android there is no view-modal
 * equivalent, so an Android host must hide covered content
 * from accessibility services or unmount it (see
 * dialogRoleProps). The move happens once per mount, never per
 * step change, so stepping keeps focus where the user put it.
 * Tab and Shift+Tab wrap at the overlay's edges, so keyboard
 * focus cannot escape into the covered content, and when the
 * overlay unmounts focus returns to the element that held it
 * before the overlay opened.
 *
 * The pill is a pressable view with the button semantics
 * routed through the platform translator (#237), and web
 * keyboard activation: it is focusable and Enter / Space invoke
 * the same callback as a press (web-only props, ignored on
 * native).
 *
 * First consumer: MealCookingModePage's cooking steps. Any
 * step-by-step reader — a guided flow, a workout — composes
 * the same shell with its own navigation.
 */

// The shell's effective Tab stops, shared by the shell wrap
// and the outside-Tab containment (#394): the selector also
// matches elements that carry a negative tabIndex (a link
// with tabIndex={-1}), which Tab always skips — counting one
// as the first or last stop would break the wrap.
function shellTabbables(node: HTMLElement): HTMLElement[] {
  return Array.from(
    node.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
    ),
  ).filter(
    (element) =>
      element.tabIndex >= 0 &&
      (element.offsetParent !== null || element === document.activeElement),
  );
}

export function StepOverlay({
  title,
  stepLabel,
  body,
  doneLabel = "Done",
  onDone,
  children,
}: StepOverlayProps) {
  const shellRef = useRef<TamaguiElement>(null);
  // This overlay's identity and ancestry in the modal
  // registry (#394, see modalRegistry.ts): the token is stable
  // for the component's lifetime so layers composed inside
  // the overlay record it as their parent layer; the parent
  // token is the layer this overlay was itself composed
  // inside, if any. The registered layer (while mounted) lives
  // in layerRef.
  const [layerToken] = useState(() => Symbol("stepOverlayLayer"));
  const parentLayerToken = useContext(ModalLayerContext);
  const layerRef = useRef<ModalLayer | null>(null);

  // Register the shell as a modal layer while mounted (#394):
  // the registry arbitrates this overlay against Dialog layers
  // presented with it — a Dialog composed inside the overlay
  // is the active layer above it, and an overlay mounted over
  // an already-open Dialog is the active layer above that —
  // from recorded presentation, never from the focused
  // element (this replaces the focus-keyed stand-down Dialog
  // used to apply to this shell). The Tab wrap below stands
  // down while a layer above this one is active.
  useEffect(() => {
    if (!isWeb) {
      return;
    }
    const layer = registerModalLayer(layerToken, parentLayerToken);
    layerRef.current = layer;
    layer.root = shellRef.current as unknown as Element | null;
    return () => {
      unregisterModalLayer(layer);
      if (layerRef.current === layer) {
        layerRef.current = null;
      }
    };
  }, [parentLayerToken]);

  // The mount focus move (web): the shell is focusable without
  // being a tab stop (tabIndex={-1} below), and focus lands on
  // it once when the overlay mounts. On native there is no DOM
  // focus to move; dialogRoleProps' view-modal is the iOS half
  // of the containment contract (Android hosts carry it — see
  // dialogRoleProps).
  useEffect(() => {
    if (!isWeb) {
      return;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = shellRef.current as unknown as { focus?: () => void } | null;
    node?.focus?.();
    return () => {
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, []);

  // Focus containment (web): the modal semantics say the
  // covered content is inert, but browsers do not enforce
  // that for the Tab key — without containment, Tab walks
  // out of the overlay into whatever the host left mounted
  // behind it. Tab / Shift+Tab wrap at the overlay's first
  // and last focusable controls instead, so containment does
  // not depend on the host inerting the covered content.
  const handleShellKeyDown = (event: {
    key: string;
    shiftKey: boolean;
    preventDefault: () => void;
  }) => {
    if (!isWeb || event.key !== "Tab") {
      return;
    }
    // A covered overlay does not wrap Tab (#394): while a DS
    // layer above this one is the active layer (a Dialog
    // composed inside the overlay, say), the key belongs to
    // that layer — wrapping here would cycle focus inside the
    // covered overlay instead of letting the active layer's
    // containment govern.
    const ownLayer = layerRef.current;
    if (ownLayer && !isActiveModalLayer(ownLayer)) {
      return;
    }
    const node = shellRef.current as unknown as HTMLElement | null;
    if (!node || typeof node.querySelectorAll !== "function") {
      return;
    }
    const focusables = shellTabbables(node);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) {
      event.preventDefault();
      node.focus();
      return;
    }
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === node)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // Tab containment from OUTSIDE the shell (web, #394
  // sub-case B): the shell wrap above only sees Tab presses
  // that begin inside the shell. When focus rests outside it —
  // on the body, say, after the content under the overlay
  // moved focus — Tab would walk into the covered page behind
  // the overlay, and the covered Dialog's own containment now
  // correctly stands down (the registry says this overlay is
  // the active layer), so nothing else catches the key
  // (CodeRabbit review on PR #398). While this overlay is the
  // active layer, a document-level capture listener lands an
  // outside Tab inside the shell instead: forward Tab on the
  // first tabbable, Shift+Tab on the last, the shell itself
  // when it has none. Focus already inside the shell is left
  // to the wrap; a covered overlay leaves the key to the
  // active layer entirely.
  useEffect(() => {
    if (!isWeb || typeof document === "undefined") {
      return;
    }
    const handleOutsideTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }
      const ownLayer = layerRef.current;
      if (ownLayer && !isActiveModalLayer(ownLayer)) {
        return;
      }
      const node = shellRef.current as unknown as HTMLElement | null;
      if (!node || typeof node.querySelectorAll !== "function") {
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      if (active && node.contains(active)) {
        return;
      }
      // Yield to a FOREIGN modal holding focus (CodeRabbit
      // review on PR #398): a host-built role="dialog"
      // aria-modal element that is not a DS layer has the
      // user's Tab — the same rule Dialog's containment keeps
      // for foreign modals. DS layers are exempt through their
      // registered roots (a covered DS Dialog's focus is this
      // overlay's to reclaim), as are modals containing the
      // shell or contained by it.
      const foreignModal =
        active && typeof active.closest === "function"
          ? active.closest('[role="dialog"][aria-modal="true"]')
          : null;
      if (
        foreignModal &&
        !foreignModal.contains(node) &&
        !node.contains(foreignModal) &&
        !registeredModalRoots().has(foreignModal)
      ) {
        return;
      }
      event.preventDefault();
      const focusables = shellTabbables(node);
      const landing = event.shiftKey
        ? (focusables[focusables.length - 1] ?? node)
        : (focusables[0] ?? node);
      landing.focus();
    };
    document.addEventListener("keydown", handleOutsideTab, true);
    return () => {
      document.removeEventListener("keydown", handleOutsideTab, true);
    };
  }, []);

  // Web keyboard support (the MealPlansPage row pattern): a
  // view carrying a role is made focusable and the activation
  // keys — Enter and Space — invoke the same callback as a
  // press. A held key's repeats still prevent the default but
  // do not re-fire Done. Web-only props, ignored on native.
  const handleDoneKeyDown = (event: {
    key: string;
    repeat?: boolean;
    preventDefault: () => void;
  }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!event.repeat) {
        onDone();
      }
    }
  };
  return (
    // Provide this overlay's layer token to its children: a DS
    // modal layer composed inside the overlay (a Dialog, say)
    // records it as its parent layer, which is what arbitrates
    // it above this overlay (modalRegistry.ts, #394).
    <ModalLayerContext.Provider value={layerToken}>
      <YStack
        ref={shellRef}
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor={tokens.colors.gray.gray10}
        tabIndex={-1}
        onKeyDown={handleShellKeyDown}
        {...dialogRoleProps}
        {...platformAccessibilityProps({ accessibilityLabel: title })}
      >
        <ScrollView
          flex={1}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={scrollContentContainerStyle}
        >
          <YStack paddingHorizontal="$6" paddingVertical="$12">
            <YStack paddingBlockEnd="$2">
              <Text
                fontSize={tokens.typography.fontSize.sm}
                letterSpacing={1.4}
                color="$surface"
                opacity={0.6}
                textTransform="uppercase"
              >
                {title}
              </Text>
            </YStack>
            <YStack paddingBlockEnd="$4">
              <Text
                fontSize={tokens.typography.fontSize.sm}
                letterSpacing={1.4}
                color="$surface"
                opacity={0.6}
                textTransform="uppercase"
              >
                {stepLabel}
              </Text>
            </YStack>
            <YStack paddingBlockEnd="$8">
              <Text fontSize={tokens.typography.fontSize["2xl"]} color="$surface">
                {body}
              </Text>
            </YStack>
            {children}
          </YStack>
        </ScrollView>
        <YStack
          position="absolute"
          right={tokens.spacing[6]}
          top={tokens.spacing[12]}
          borderRadius={tokens.radii.full}
          overflow="hidden"
          backgroundColor={tokens.colors.gray.gray10}
          {...platformAccessibilityProps({
            accessibilityRole: "button",
            accessibilityLabel: doneLabel,
          })}
          onPress={onDone}
          tabIndex={0}
          onKeyDown={handleDoneKeyDown}
          cursor="web:pointer"
        >
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="$surface"
            opacity={0.1}
          />
          <Text
            fontSize={tokens.typography.fontSize.sm}
            color="$surface"
            paddingHorizontal="$4"
            paddingVertical="$2"
          >
            {doneLabel}
          </Text>
        </YStack>
      </YStack>
    </ModalLayerContext.Provider>
  );
}
