import { useState } from "react";
import { Adapt, Popover, Sheet, XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

/**
 * One help entry (#699): a syntax token (or phrase pattern) and
 * what it does, both supplied by the host as DATA. The widget
 * bakes in no search language — no qualifier names, operators,
 * or app concepts — so any searchable catalog can describe its
 * own syntax through this shape.
 */
export type SearchHelpEntry = {
  /** The syntax example, rendered in the mono treatment (e.g. a qualifier or operator form). */
  syntax: string;
  /** What the syntax does, in the host's words. */
  description: string;
};

/** The host-supplied help content block (#699), shared by the
 * popover and the catalog surfaces that pass it through. */
export type SearchHelpContent = {
  /** The trigger's visible label (e.g. "Search syntax"). It is
   * also the trigger's accessible name. */
  label: string;
  /** The panel's title. */
  title: string;
  /** Optional lead-in line under the title. */
  intro?: string;
  /** The syntax entries, in display order. */
  entries: SearchHelpEntry[];
};

export type SearchHelpPopoverProps = SearchHelpContent & {
  /** Controlled open state. Omit to let the popover manage its
   * own state; `onOpenChange` reports changes either way. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to false. */
  defaultOpen?: boolean;
  /** Called with the next open state whenever it changes. */
  onOpenChange?: (open: boolean) => void;
};

const StyledContent = styled(Popover.Content, {
  name: "SearchHelpPopoverContent",

  backgroundColor: "$surface",
  borderWidth: 1,
  borderColor: "$borderColor",
  borderRadius: tokens.radii.lg,
  padding: tokens.spacing[4],
  maxWidth: 360,
  shadowColor: tokens.shadows.md.shadowColor,
  shadowOffset: tokens.shadows.md.shadowOffset,
  shadowOpacity: tokens.shadows.md.shadowOpacity,
  shadowRadius: tokens.shadows.md.shadowRadius,
});

/**
 * The search-help popover (#699, Stephen-approved plan, trigger
 * form (a)): a Button trigger — the help glyph from Button's
 * icon slot plus the host-supplied label — opening a Tamagui
 * Popover that lists the host's search-syntax entries as a
 * definition-style list (mono syntax token, then its
 * description). Built on the same Popover pattern as Dropdown:
 * anchored to the trigger, flip/shift at viewport edges, and on
 * touch it adapts to a bottom Sheet (the SelectField Adapt
 * pattern) so the entries stay readable on a phone. The widget
 * owns ALL of its styling; hosts and views pass data only.
 */
export function SearchHelpPopover({
  label,
  title,
  intro,
  entries,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: SearchHelpPopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} placement="bottom-start" allowFlip stayInFrame={{ padding: tokens.spacing[2] }}>
      <Popover.Trigger asChild disablePressTrigger>
        <Button
          variant="secondary"
          size="sm"
          icon="help"
          accessibilityLabel={label}
          aria-expanded={open}
          aria-haspopup="dialog"
          onPress={() => {
            setOpen(!open);
          }}
        >
          {label}
        </Button>
      </Popover.Trigger>
      <Adapt platform="touch">
        <Sheet modal dismissOnSnapToBottom aria-label={title}>
          <Sheet.Overlay />
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
        </Sheet>
      </Adapt>
      <StyledContent onCloseAutoFocus={false} {...platformAccessibilityProps({ accessibilityLabel: title })}>
        <YStack gap={tokens.spacing[3]}>
          <Text variant="subheading">{title}</Text>
          {intro ? <Text variant="hint">{intro}</Text> : null}
          <YStack gap={tokens.spacing[2]}>
            {entries.map((entry) => (
              <XStack key={entry.syntax} gap={tokens.spacing[3]} alignItems="flex-start">
                <Text
                  fontFamily={tokens.typography.fontFamily.mono}
                  fontSize={tokens.typography.fontSize.sm}
                  fontWeight={tokens.typography.fontWeight.semibold}
                  flexShrink={0}
                >
                  {entry.syntax}
                </Text>
                <Text fontSize={tokens.typography.fontSize.sm} flex={1}>
                  {entry.description}
                </Text>
              </XStack>
            ))}
          </YStack>
        </YStack>
      </StyledContent>
    </Popover>
  );
}
