import { createContext, useContext, useState, type ReactNode } from "react";
import { Popover, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";

export type DropdownSide = "top" | "bottom";
export type DropdownAlign = "start" | "end";

type DropdownContextValue = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

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
   * the menu. The shell anchors the panel to whatever renders here.
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
 * dismissal, and the close affordance its content rows use to close
 * on activation. What goes inside the panel is entirely the caller's
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
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      <Popover
        open={open}
        onOpenChange={setOpen}
        placement={`${side}-${align}`}
        allowFlip
        stayInFrame={{ padding: tokens.spacing[2] }}
      >
        <Popover.Anchor>{trigger}</Popover.Anchor>
        <StyledContent {...platformAccessibilityProps({ accessibilityLabel })}>
          {children}
        </StyledContent>
      </Popover>
    </DropdownContext.Provider>
  );
}
