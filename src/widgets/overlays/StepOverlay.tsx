import { useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ScrollView, isWeb } from "tamagui";
import { Col } from "../layout/Col.js";
import type { ColProps } from "../layout/Col.js";
import type { Ref } from "react";

import { Spacer } from "../layout/Spacer.js";
import type { TamaguiElement } from "tamagui";
import { tokens } from "../../tokens/index.js";
import { dialogRoleProps, platformAccessibilityProps } from "../accessibility.js";
import {
  ModalLayerContext,
  isActiveModalLayer,
  registerModalLayer,
  registeredModalRoots,
  unregisterModalLayer,
} from "../modalRegistry.js";
import type { ModalLayer } from "../modalRegistry.js";
import { Text } from "../data/Text.js";
import { PageContentColumn } from "../layout/PageContentColumn.js";
import { useVoice } from "../../voice/index.js";

/**
 * The overlay shell's root (#746): ColProps carries no ref
 * slot (React 19 ref-as-prop is not in the Tamagui prop
 * types), so the shell root wraps Col with the ref typed in —
 * Col forwards it through its rest spread at runtime.
 */
function ShellCol(props: ColProps & { ref?: Ref<TamaguiElement> }) {
  return <Col {...props} />;
}

export type StepOverlayProps = {
  /** The top eyebrow line: the context the steps belong to (a
   * meal's title). */
  title: string;
  /** The second eyebrow line: the current step, pre-composed
   * ("Step 2 of 5") — the overlay renders it verbatim. Required
   * in step mode; omitted in panel mode (see `panel`). */
  stepLabel?: string;
  /** The step's body text, rendered at reading size. Required
   * in step mode; omitted in panel mode (see `panel`). */
  body?: string;
  /** The Done pill's label ("Done"). */
  doneLabel?: string;
  /** The Done pill's callback: leaving the steps. The pill
   * renders only when this is provided — panel mode omits it,
   * since the panel's own actions are its exits. */
  onDone?: () => void;
  /**
   * Optional panel mode (#871): a self-contained composition
   * (CookingModePage's cook-log form is the first consumer)
   * rendered in the scroll column under the title eyebrow, in
   * place of the step label, body, accessory, and children.
   * The overlay still owns the dark shell, the scroll column,
   * and the dialog/focus containment — the panel replaces a
   * modal overlay's content, so focus must move into it just
   * as it does for steps.
   */
  panel?: ReactNode;
  /**
   * Optional accessory rendered between the step label and
   * the body — a panel belonging to the step as a whole (the
   * recipe cooking mode's scaled-ingredients panel, #438
   * Part 3). The overlay owns only its placement in the
   * column; the accessory's own content and treatment are the
   * caller's composition (a view, in the pages' usage).
   */
  accessory?: ReactNode;
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
 *
 * Panel mode (#871): CookingModePage's cook-log form is the
 * first panel consumer — when the host opens the form, it
 * replaces the step view inside this same shell (dark
 * background, scroll column, focus containment), with no step
 * content and no Done pill.
 */

// The shell's effective Tab stops, shared by the shell wrap
// and the outside-Tab containment (#394): the selector also
// matches elements that carry a negative tabIndex (a link
// with tabIndex={-1}), which Tab always skips — counting one
// as the first or last stop would break the wrap.
// The shell's DOM node, when this overlay's Tab containment
// may act on it (#587 phase 3 — shared by the shell wrap and
// the outside-Tab containment, which each carried this guard
// pair): while a DS layer above this overlay is the active
// layer, the key belongs to that layer, and a shell node that
// cannot be queried cannot be wrapped into — both cases read
// as no node.
function activeShellNode(
  shellRef: { current: TamaguiElement | null },
  layerRef: { current: ModalLayer | null },
): HTMLElement | null {
  const ownLayer = layerRef.current;
  if (ownLayer && !isActiveModalLayer(ownLayer)) {
    return null;
  }
  const node = shellRef.current as unknown as HTMLElement | null;
  if (!node || typeof node.querySelectorAll !== "function") {
    return null;
  }
  return node;
}

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
  doneLabel,
  onDone,
  panel,
  accessory,
  children,
}: StepOverlayProps) {
  const voice = useVoice();
  const resolvedDoneLabel = doneLabel ?? voice.stepOverlay.doneLabel;
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
    // containment govern (see activeShellNode).
    const node = activeShellNode(shellRef, layerRef);
    if (!node) {
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
      const node = activeShellNode(shellRef, layerRef);
      if (!node) {
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
      // for foreign modals. A native <dialog> shown with
      // showModal() carries neither attribute but is just as
      // foreign (and makes the shell inert, so redirecting
      // would strand the key entirely) — the :modal arm of
      // the selector covers it. DS layers are exempt through
      // their registered roots (a covered DS Dialog's focus is
      // this overlay's to reclaim), as are modals containing
      // the shell or contained by it.
      const foreignModal =
        active && typeof active.closest === "function"
          ? active.closest('[role="dialog"][aria-modal="true"], dialog:modal')
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
        onDone?.();
      }
    }
  };
  return (
    // Provide this overlay's layer token to its children: a DS
    // modal layer composed inside the overlay (a Dialog, say)
    // records it as its parent layer, which is what arbitrates
    // it above this overlay (modalRegistry.ts, #394).
    <ModalLayerContext.Provider value={layerToken}>
      <ShellCol
        ref={shellRef}
        position="absolute"
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        backgroundColor={tokens.colors.gray.gray10}
        tabIndex={-1}
        onKeyDown={handleShellKeyDown}
        {...(dialogRoleProps as Record<string, unknown>)}
        {...(platformAccessibilityProps({ accessibilityLabel: title }) as Record<string, unknown>)}
      >
        <ScrollView
          flex={1}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={scrollContentContainerStyle}
        >
          {/* The reading measure lives inside the shell (#729):
              the shell's backdrop fills its full region (in the
              cooking pages' overlay mode that region is the
              full viewport width), while the step content keeps
              the #628 desktop measure — the column caps and
              centers the text inside the full-width backdrop.
              On native the column is a plain full-width stack,
              so the measure is a web-only effect. */}
          <PageContentColumn>
            <Col px="xl" style={{ paddingBlock: 48 }}>
              <Col>
                <Text
                  fontSize={tokens.typography.fontSize.sm}
                  letterSpacing={1.4}
                  color="$surface"
                  opacity={0.6}
                  textTransform="uppercase"
                >
                  {title}
                </Text>
              </Col>
              {panel ? (
                <>
                  <Spacer y="m" />
                  {panel}
                </>
              ) : (
                <>
                  <Spacer y="s" />
                  <Col>
                    <Text
                      fontSize={tokens.typography.fontSize.sm}
                      letterSpacing={1.4}
                      color="$surface"
                      opacity={0.6}
                      textTransform="uppercase"
                    >
                      {stepLabel}
                    </Text>
                  </Col>
                  <Spacer y="m" />
                  {accessory ? (
                    <>
                      {accessory}
                      <Spacer y="m" />
                    </>
                  ) : null}
                  <Col style={{ paddingBlockEnd: 32 }}>
                    <Text fontSize={tokens.typography.fontSize["2xl"]} color="$surface">
                      {body}
                    </Text>
                  </Col>
                  {children}
                </>
              )}
            </Col>
          </PageContentColumn>
        </ScrollView>
        {onDone ? (
          <Col
            position="absolute"
            style={{ right: tokens.spacing[6], top: 48 }}
            borderRadius={tokens.radii.full}
            overflow="hidden"
            backgroundColor={tokens.colors.gray.gray10}
            {...platformAccessibilityProps({
              accessibilityRole: "button",
              accessibilityLabel: resolvedDoneLabel,
            })}
            onPress={onDone}
            tabIndex={0}
            onKeyDown={handleDoneKeyDown}
            cursor="web:pointer"
          >
            <Col
              position="absolute"
              style={{ top: 0, left: 0, right: 0, bottom: 0 }}
              backgroundColor="$surface"
              opacity={0.1}
            />
            <Text
              fontSize={tokens.typography.fontSize.sm}
              color="$surface"
              paddingHorizontal="$4"
              paddingVertical="$2"
            >
              {resolvedDoneLabel}
            </Text>
          </Col>
        ) : null}
      </ShellCol>
    </ModalLayerContext.Provider>
  );
}
