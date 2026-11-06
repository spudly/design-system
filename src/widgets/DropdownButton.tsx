import { forwardRef } from "react";
import type { ComponentProps, ReactElement } from "react";
import { useTheme, type TamaguiElement } from "tamagui";
import { CollapsibleIcon } from "../icons/CollapsibleIcon.js";
import type { IconName } from "../icons/iconRegistry.js";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { useDropdownContext } from "./Dropdown.js";

type DropdownButtonCommonProps = {
  /** Button variant, rendered by the DS Button the trigger is built on. Defaults to "secondary" — a menu trigger is a secondary action. (The "ghost" value is DEPRECATED, #463 — use the `ghost` prop.) */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** The ghost treatment (#463), passed through to Button: transparent background, no border, ink matching the variant. */
  ghost?: boolean;
  /** Button size. Defaults to "md". */
  size?: "sm" | "md" | "lg";
  /** A disabled trigger does not open its dropdown. */
  disabled?: boolean;
};

export type DropdownButtonProps = DropdownButtonCommonProps &
  (
    | {
        /** The trigger's visible label; it also names the button. */
        label: string;
        /** Optional leading glyph, named from the DS semantic icon set (#438 Part 4): data, not a component — Button's icon slot owns its rendering. */
        icon?: IconName;
        accessibilityLabel?: string;
      }
    | {
        /**
         * Icon-only trigger (card overflow, avatar menus): no visible
         * label, so `accessibilityLabel` is REQUIRED — it is the only
         * name assistive tech can find the trigger by (the Button
         * icon-only rule).
         */
        label?: undefined;
        icon: IconName;
        accessibilityLabel: string;
      }
  );

/**
 * What the Dropdown shell's Popover.Trigger composition injects
 * into its child (asChild): the activation handlers that register
 * the trigger with the floating layer — so the primitive knows the
 * element and returns focus to it when the panel closes. The
 * composed ref arrives the same way, but through `forwardRef` (a
 * props-carried ref never reaches a function component on the
 * supported React 18 peer). NOT caller API: `DropdownButton`
 * accepts these only to forward them to the Button it renders. The
 * expanded state is deliberately not among them (it is
 * DropdownButton's own, driven by the Dropdown context), and
 * neither is the press (the toggle is DropdownButton's own; the
 * shell disables the primitive's press toggle so the two never
 * double-toggle).
 */
type DropdownButtonTriggerProps = {
  onFocus?: ComponentProps<typeof Button>["onFocus"];
  onBlur?: ComponentProps<typeof Button>["onBlur"];
  onPressIn?: ComponentProps<typeof Button>["onPressIn"];
  onMouseEnter?: ComponentProps<typeof Button>["onMouseEnter"];
};

/** Standard glyph size per Button size (mirrors Button's icon-slot table). */
const glyphSizes = {
  sm: 18,
  md: 20,
  lg: 24,
} as const;

/**
 * The chevron's ink per variant: the color Button gives the variant's
 * label, resolved the same way Button resolves its icon slot's ink
 * (theme roles read from the active theme, the fixed ramps read
 * directly), because react-native-svg cannot resolve Tamagui theme
 * variables.
 */
function useChevronInk(variant: string, ghost = false): string {
  const theme = useTheme();
  const roleValue = (key: string): string | undefined => {
    const variable = theme[key];
    return typeof variable?.val === "string" ? variable.val : undefined;
  };
  // The ghost prop's chevron ink follows Button's ghost ink map
  // (#463): the variant's own ink.
  if (ghost) {
    switch (variant) {
      case "secondary":
        return tokens.colors.gray.gray10;
      case "danger":
        return tokens.colors.danger.danger7;
      case "primary":
      default:
        return roleValue("primary") ?? tokens.colors.primary.primary7;
    }
  }
  switch (variant) {
    case "secondary":
      return tokens.colors.gray.gray10;
    case "ghost":
      return roleValue("link") ?? tokens.colors.primary.primary8;
    case "danger":
      return "#ffffff";
    case "primary":
    default:
      return roleValue("onPrimary") ?? "#ffffff";
  }
}

/**
 * The props-described dropdown trigger (spudly/design-system#178,
 * decisions 1–2): the DS renders it — a Button with an optional
 * leading icon, the label, and the disclosure chevron
 * (CollapsibleIcon, flipping with the open state) — so the anchor
 * point and the ARIA wiring (`aria-haspopup="dialog"`, matching the
 * panel's role; the expanded state carried through Button's
 * accessibility translation) stay under DS control and a caller
 * cannot break them with a custom element.
 *
 * It belongs inside a `Dropdown` (or a `DropdownButton`-composed
 * shell): it reads the open state and the toggle from the Dropdown
 * context, and forwards the shell's injected activation props to
 * the Button so the primitive's focus return lands on the real
 * button. Rendered outside one it stays a plain closed button whose
 * press does nothing.
 */
export const DropdownButton = forwardRef<
  TamaguiElement,
  DropdownButtonProps & DropdownButtonTriggerProps
>(function DropdownButton(
  {
    label,
    icon,
    accessibilityLabel,
    variant = "secondary",
    ghost = false,
    size = "md",
    disabled = false,
    onFocus,
    onBlur,
    onPressIn,
    onMouseEnter,
  }: DropdownButtonProps & DropdownButtonTriggerProps,
  ref,
) {
  const context = useDropdownContext();
  const open = context?.open ?? false;
  const chevronInk = useChevronInk(variant, ghost);
  const glyphSize = glyphSizes[size];

  // Focus the trigger as part of activation (onPress, immediately
  // before the toggle) — NOT on press-in: press-in also fires for
  // touch-start / mouse-down, so focusing there would blur the
  // user's active input when they merely start a scroll over the
  // trigger and the menu never opens. The focus exists because
  // Safari never focuses a button on click, and the panel's
  // close-focus restoration returns focus to the element focused
  // before it opened — without this, a Safari trigger-open would
  // hand focus back to the page body on close instead of the
  // trigger. (Chrome/Firefox focus the button on press natively;
  // this just makes every browser behave that way.) On native the
  // press target has no focus() and this is a no-op.
  const handlePress: NonNullable<ComponentProps<typeof Button>["onPress"]> = (event) => {
    const target = (event as { currentTarget?: { focus?: () => void } | null }).currentTarget;
    target?.focus?.();
    context?.toggle();
  };

  // The label (when there is one) plus the disclosure chevron, as a
  // flat child list with no undefined entries — Button's props are a
  // discriminated union over its icon/label shapes and compile under
  // exactOptionalPropertyTypes, so the optional props below are also
  // spread only when defined.
  const content: (string | ReactElement)[] = [];
  if (label !== undefined) {
    content.push(label);
  }
  content.push(<CollapsibleIcon key="chevron" isOpen={open} size={glyphSize} color={chevronInk} />);

  return (
    <Button
      ref={ref}
      onFocus={onFocus}
      onBlur={onBlur}
      onPressIn={onPressIn}
      onMouseEnter={onMouseEnter}
      variant={variant}
      {...(ghost ? { ghost: true } : null)}
      size={size}
      disabled={disabled}
      {...(icon ? { icon } : null)}
      {...(accessibilityLabel !== undefined ? { accessibilityLabel } : null)}
      accessibilityState={{ expanded: open }}
      aria-haspopup="dialog"
      gap={tokens.spacing[2]}
      onPress={handlePress}
    >
      {content}
    </Button>
  );
});
