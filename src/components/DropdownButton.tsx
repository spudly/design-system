import { forwardRef } from "react";
import type { ComponentProps, ComponentType, ReactElement } from "react";
import { useTheme, type TamaguiElement } from "tamagui";
import { CollapsibleIcon } from "../icons/CollapsibleIcon.js";
import type { IconComponentProps } from "../icons/Icon.js";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { useDropdownContext } from "./Dropdown.js";

type DropdownButtonCommonProps = {
  /** Button variant, rendered by the DS Button the trigger is built on. Defaults to "secondary" — a menu trigger is a secondary action. */
  variant?: "primary" | "secondary" | "ghost" | "danger";
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
        /** Optional leading glyph: a DS icon component from `@spudly/ui/icons`. Content, not styling — Button's icon slot owns its rendering. */
        icon?: ComponentType<IconComponentProps>;
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
        icon: ComponentType<IconComponentProps>;
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
function useChevronInk(variant: string): string {
  const theme = useTheme();
  const roleValue = (key: string): string | undefined => {
    const variable = theme[key];
    return typeof variable?.val === "string" ? variable.val : undefined;
  };
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
  const chevronInk = useChevronInk(variant);
  const glyphSize = glyphSizes[size];

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
      size={size}
      disabled={disabled}
      {...(icon ? { icon } : null)}
      {...(accessibilityLabel !== undefined ? { accessibilityLabel } : null)}
      accessibilityState={{ expanded: open }}
      aria-haspopup="dialog"
      gap={tokens.spacing[2]}
      onPress={() => {
        context?.toggle();
      }}
    >
      {content}
    </Button>
  );
});
