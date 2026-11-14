import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Popover, View, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";

type DropdownSide = "top" | "bottom";
export type DropdownAlign = "start" | "end";

type DropdownContextValue = {
  open: boolean;
  toggle: () => void;
  close: () => void;
  /** Which side of the trigger the panel opens on (the shell's `side`). */
  side: DropdownSide;
  /** Panel alignment against the trigger (the shell's `align`). */
  align: DropdownAlign;
  /**
   * The trigger's laid-out width in px, measured by the shell on
   * the trigger wrapper's onLayout; null until it has laid out.
   */
  triggerWidth: number | null;
  /**
   * The panel's laid-out width in px, measured by the shell on the
   * panel itself; null until the open panel has laid out.
   */
  panelWidth: number | null;
};

/** Per-corner radius overrides for one element's touching edge. */
export type TouchingCornerRadii = {
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
};

/**
 * Whether one element's FAR corner on the touching edge actually
 * touches the other element of the dropdown pair (#474): the far
 * corner touches iff this element's far edge lies within the other
 * element's span — this element's laid-out width no greater than
 * the other's, within the 1px tolerance layout widths have always
 * been compared with here. Each element answers for itself: the
 * panel's far corner touches when the panel is no wider than the
 * trigger (its far edge lands on the trigger's facing edge); the
 * trigger's far corner touches when the trigger is no wider than
 * the panel. Equal widths answer true for both, so all four
 * touching corners square. An unmeasured width (null — the panel
 * has not laid out yet) answers false: only the aligned corner
 * squares until layout reports.
 */
export function farCornerTouches(ownWidth: number | null, otherWidth: number | null): boolean {
  return ownWidth !== null && otherWidth !== null && ownWidth <= otherWidth + 1;
}

/**
 * The connected-surface radii for one element of the dropdown pair
 * (#474): while the menu is open, the trigger and the panel read as
 * ONE surface, so the corners where they touch lose their radius —
 * but only the corners that actually touch. The two widths are
 * independent (the trigger is content-sized; the panel is
 * content-sized with a 200px minimum), so on the touching edge only
 * ONE vertical edge coincides by construction: the edge `align`
 * selects ("start" lines the leading edges up, "end" the trailing
 * edges). That aligned corner is always squared. The far corner
 * squares only when it actually touches — when this element's far
 * edge lies within the other element's span, which the caller
 * answers with `farCornerTouches` for its own width against the
 * other's. Squaring a far corner that overhangs the other element
 * (this element wider) would cut a notch into a corner that
 * touches nothing; leaving one rounded when its edge does land on
 * the other element leaves a stray radius breaking the connected
 * surface.
 *
 * `touchingEdge` is the edge of THIS element that meets the other:
 * the panel's top edge when it opens below the trigger, its bottom
 * edge when it opens above; the trigger's edges mirror that.
 */
export function touchingCornerRadii(
  touchingEdge: "top" | "bottom",
  align: DropdownAlign,
  farTouches: boolean,
): TouchingCornerRadii {
  const zero = tokens.radii.zero;
  const radii: TouchingCornerRadii = {};
  const squareStart = () => {
    if (touchingEdge === "top") {
      radii.borderTopLeftRadius = zero;
    } else {
      radii.borderBottomLeftRadius = zero;
    }
  };
  const squareEnd = () => {
    if (touchingEdge === "top") {
      radii.borderTopRightRadius = zero;
    } else {
      radii.borderBottomRightRadius = zero;
    }
  };
  if (align === "start") {
    squareStart();
    if (farTouches) {
      squareEnd();
    }
  } else {
    squareEnd();
    if (farTouches) {
      squareStart();
    }
  }
  return radii;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

/**
 * Internal read of the dropdown's context for the family's own
 * trigger (DropdownButton lives in its own module). Returns null
 * outside a Dropdown — the trigger then renders closed and inert.
 */
export function useDropdownContext(): DropdownContextValue | null {
  return useContext(DropdownContext);
}

/**
 * The close affordance for dropdown content: call the returned
 * function when a composed row is activated so the menu closes
 * (close-on-select). This is the direct descendant of the shuoink/ui
 * spec's ExitContext, which carried exactly this `close` to the
 * dropdown's children. Outside a Dropdown it is a no-op, so composed
 * rows stay safe to render standalone (page stories, fixtures).
 */
export function useDropdownClose(): () => void {
  const context = useContext(DropdownContext);
  return context?.close ?? (() => undefined);
}

const StyledContent = styled(Popover.Content, {
  name: "DropdownContent",

  backgroundColor: "$surface",
  borderWidth: 1,
  borderColor: "$borderColor",
  borderRadius: tokens.radii.lg,
  padding: tokens.spacing[2],
  minWidth: 200,
  // The floating panel's shadow: the Toast precedent (the four RN
  // shadow props in the styled config; no `elevation`, which this
  // styled type does not admit).
  shadowColor: tokens.shadows.md.shadowColor,
  shadowOffset: tokens.shadows.md.shadowOffset,
  shadowOpacity: tokens.shadows.md.shadowOpacity,
  shadowRadius: tokens.shadows.md.shadowRadius,
});

export type DropdownProps = {
  /**
   * The trigger element — in practice a `DropdownButton`, which is
   * props-described and DS-rendered (design-system#178, decisions 1–2)
   * and wires itself to this shell through context: it reads the open
   * state for its chevron and expanded state, and its press toggles
   * the menu. The shell composes the trigger through the Popover's
   * own Trigger (asChild, the primitive's press toggle disabled —
   * toggling stays with the trigger itself) so the primitive
   * registers the element as the panel's anchor. When the panel
   * closes, focus returns to the element focused before it opened —
   * the trigger in trigger-activated flows (see the content's
   * `onCloseAutoFocus` note in the render below). The trigger must
   * be a single element that forwards the injected activation props
   * to its focusable element, the way `DropdownButton` does.
   */
  trigger: ReactNode;
  /**
   * Controlled open state. Omit it to let the dropdown manage its
   * own state (see `defaultOpen`); `onOpenChange` reports changes
   * either way.
   */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to false. */
  defaultOpen?: boolean;
  /** Called with the next open state whenever it changes. */
  onOpenChange?: (open: boolean) => void;
  /** Which side of the trigger the panel opens on. Defaults to "bottom". */
  side?: DropdownSide;
  /**
   * Panel alignment against the trigger: "start" lines the panel's
   * leading edge up with the trigger's; "end" (card-overflow and
   * avatar menus) lines up the trailing edges. Defaults to "start".
   */
  align?: DropdownAlign;
  /** Accessible name for the panel (e.g. "Recipe actions"). */
  accessibilityLabel?: string;
  /**
   * The panel's content — the ONE slot (Stephen's directive,
   * design-system#178). The caller composes it from DS building
   * blocks, typically rows that call `useDropdownClose()` when
   * activated; navigation rows are links with an href and action
   * rows are buttons with a callback, per the navigation rule.
   */
  children?: ReactNode;
};

/**
 * An anchored dropdown shell (spudly/design-system#178, adopting the
 * shuoink/ui Dropdown as spec, redirected by Stephen to a shell with
 * a single children slot — no items view-model): the shell owns
 * anchoring/positioning, open/close state, outside-press and Escape
 * dismissal, focus return on close (to the trigger for
 * trigger-activated opens; to the previously focused element for
 * programmatic opens), and the close
 * affordance its content rows use to close on activation. What goes inside the panel is entirely the caller's
 * composition — most often a DS page component composing DS rows.
 *
 * Built on Tamagui's Popover primitive (the floating layer
 * SelectField already wraps) with flip/shift at viewport edges, and
 * deliberately NOT SelectField's touch-adapts-to-bottom-Sheet
 * treatment: a menu's rows are short actions whose meaning depends on
 * staying attached to the thing they act on, and a sheet severs that
 * context. Open state follows the DS controlled/uncontrolled pair
 * (the AccordionSection precedent): pass `open` to control it, or
 * omit it and the shell toggles itself from `defaultOpen`.
 */
export function Dropdown({
  trigger,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "start",
  accessibilityLabel,
  children,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;
  // The connected-surface geometry (#474): both widths are measured
  // through onLayout — the trigger's on its wrapper below, the
  // panel's on the panel itself — and each element squares its far
  // corner only when that corner actually touches the other
  // element (farCornerTouches, judged per element from the pair).
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  const [panelWidth, setPanelWidth] = useState<number | null>(null);

  // The panel unmounts while closed, so a measured panelWidth goes
  // stale across a close (the content may change width while the
  // menu is shut). Reset it on close: until the reopened panel lays
  // out again it reports null, both elements' far corners count as
  // not touching, and only the always-coincident aligned corner
  // squares — no first-frame far-corner flip from a stale width.
  useEffect(() => {
    if (!open) {
      setPanelWidth(null);
    }
  }, [open]);

  const setOpen = (next: boolean) => {
    if (openProp === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const contextValue: DropdownContextValue = {
    open,
    toggle: () => {
      setOpen(!open);
    },
    close: () => {
      setOpen(false);
    },
    side,
    align,
    triggerWidth,
    panelWidth,
  };

  // The panel's touching edge faces the trigger: its top edge when
  // it opens below, its bottom edge when it opens above. Its far
  // corner touches when the panel is no wider than the trigger.
  const panelRadii = touchingCornerRadii(
    side === "bottom" ? "top" : "bottom",
    align,
    farCornerTouches(panelWidth, triggerWidth),
  );

  return (
    <DropdownContext.Provider value={contextValue}>
      <Popover
        open={open}
        onOpenChange={setOpen}
        placement={`${side}-${align}`}
        allowFlip
        stayInFrame={{ padding: tokens.spacing[2] }}
      >
        {/*
          The trigger wrapper exists to measure the trigger (#474):
          its onLayout width is the trigger's laid-out width, kept
          in the shell for the connected-surface geometry. It
          shrink-wraps the trigger (alignSelf flex-start) so it
          never sizes the trigger itself, and the Popover.Trigger
          composition inside it still registers the trigger element
          directly — registration and focus return are unaffected.
        */}
        <View
          alignSelf="flex-start"
          onLayout={(event) => {
            setTriggerWidth(event.nativeEvent.layout.width);
          }}
        >
          <Popover.Trigger asChild disablePressTrigger>
            {trigger}
          </Popover.Trigger>
        </View>
        {/*
          onCloseAutoFocus={false}: the Popover's own close-focus
          composition cancels FocusScope's previous-focus restoration
          and focuses only the trigger target the primitive registered
          on trigger activation (hover/press-in/focus). A panel opened
          programmatically — `defaultOpen`, or a controlled `open`
          flipped by an outside control — has no registered target, so
          that composition strands focus on the unmounting panel.
          Opting out leaves FocusScope's default in place: focus
          returns to the element focused before the panel opened —
          the trigger in trigger-activated flows (it holds focus
          there), and the invoking control for programmatic opens.
        */}
        <StyledContent
          onCloseAutoFocus={false}
          onLayout={(event) => {
            setPanelWidth(event.nativeEvent.layout.width);
          }}
          {...panelRadii}
          {...platformAccessibilityProps({ accessibilityLabel })}
        >
          {children}
        </StyledContent>
      </Popover>
    </DropdownContext.Provider>
  );
}
