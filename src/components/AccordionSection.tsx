import { useState, type ReactNode } from "react";
import { XStack, YStack } from "tamagui";
import { CollapsibleIcon } from "../icons/CollapsibleIcon.js";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Collapsible } from "./Collapsible.js";
import { Text } from "./Text.js";

export type AccordionSectionProps = {
  /** Section header label; also the header button's accessible name. */
  title: string;
  /**
   * Controlled open state. Omit it to let the section manage its own
   * state (see `defaultOpen`); `Accordion` passes this to enforce its
   * single-open contract.
   */
  isOpen?: boolean;
  /** Initial open state when uncontrolled. Defaults to false. */
  defaultOpen?: boolean;
  /** Called with the next open state whenever the header is pressed. */
  onOpenChange?: (isOpen: boolean) => void;
  children?: ReactNode;
};

/**
 * One expandable section (spudly/design-system#178, adopting the
 * shuoink/ui AccordionSection as spec): a bordered frame whose header
 * row is a real button (title + chevron) and whose body expands and
 * collapses with the Collapsible height animation. The chevron is
 * the icons module's CollapsibleIcon — ExpandedIcon while open,
 * CollapsedIcon while closed (Stephen's split, #250).
 *
 * State follows the DS controlled/uncontrolled pair: pass `isOpen`
 * to control it (with `onOpenChange` reporting presses), or omit it
 * and the section toggles itself, starting from `defaultOpen`.
 *
 * Accessibility: the header exposes the button role with its state
 * carried as `expanded` (translated to `aria-expanded` on web by
 * platformAccessibilityProps), a 44px minimum touch height, and —
 * because a div with a role is not keyboard-operable on web — Tab
 * focus with Enter/Space activation (the RecipeDetailPage chip
 * pattern). Inter-item spacing is the frame's padding and the row's
 * gap; no margins anywhere (#209).
 */
export function AccordionSection({
  title,
  isOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: AccordionSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isOpen ?? internalOpen;

  const toggle = () => {
    const next = !open;
    if (isOpen === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  // Web keyboard support: Enter and Space activate the header exactly
  // like a press (a native button's contract); the props are web-only
  // in Tamagui and ignored on native, where onPress is the path.
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <YStack
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={tokens.radii.lg}
      backgroundColor="$surface"
      overflow="hidden"
    >
      <XStack
        {...platformAccessibilityProps({
          accessibilityRole: "button",
          accessibilityLabel: title,
          accessibilityState: { expanded: open },
        })}
        onPress={toggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        cursor="web:pointer"
        alignItems="center"
        justifyContent="space-between"
        gap={tokens.spacing[3]}
        minHeight={44}
        paddingHorizontal={tokens.spacing[4]}
        paddingVertical={tokens.spacing[3]}
      >
        <Text variant="subheading" flex={1}>
          {title}
        </Text>
        <CollapsibleIcon isOpen={open} size={20} color={tokens.colors.gray.gray7} />
      </XStack>
      <Collapsible isOpen={open}>
        <YStack borderTopWidth={1} borderColor="$borderColor" padding={tokens.spacing[4]}>
          {children}
        </YStack>
      </Collapsible>
    </YStack>
  );
}
