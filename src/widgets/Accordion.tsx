import { useState, type ReactNode } from "react";
import { YStack } from "tamagui";
import { AccordionSection } from "./AccordionSection.js";

export type AccordionItem = {
  /** Stable identity of the section; the open section is tracked by this value. */
  value: string;
  /** Section header label. */
  title: string;
  /** Section body, shown while the section is open. */
  content: ReactNode;
};

export type AccordionProps = {
  /** The sections to render, in order. */
  sections: AccordionItem[];
  /**
   * Controlled open section: the `value` of the open section, or
   * null when all sections are closed. Omit it to let the accordion
   * manage its own state (see `defaultOpenValue`).
   */
  openValue?: string | null;
  /** Initially open section when uncontrolled. Defaults to null (all closed). */
  defaultOpenValue?: string | null;
  /**
   * Called when a header press changes the open section: the newly
   * opened section's `value`, or null when the open section was
   * closed.
   */
  onOpenValueChange?: (value: string | null) => void;
};

/**
 * A single-open group of expandable sections (spudly/design-system#178,
 * adopting the shuoink/ui Accordion as spec): opening one section
 * closes the previously open one, and pressing the open section's
 * header closes it, leaving all sections closed.
 *
 * Shape deviation from the spec, deliberate: shuoink's Accordion
 * composed AccordionSection children and cloned state into them.
 * The DS house shape is the controlled data contract (the Tabs
 * precedent): sections arrive as data, the open section is a value,
 * and changes report out through a callback — while AccordionSection
 * remains the standalone building block for one-off collapsible
 * sections outside a group.
 *
 * Sections render as one connected stack (#456, Stephen's Storybook
 * review ruling, superseding the #178 audit's separate-blocks shape):
 * flush against each other with no gap, radius only on the stack's
 * outer corners, and a single border dividing neighbouring sections —
 * the position-aware frame lives in AccordionSection via its
 * `stackPosition` prop. Candidate homes: settings groups, recipe
 * detail sections, help content.
 */
export function Accordion({
  sections,
  openValue,
  defaultOpenValue = null,
  onOpenValueChange,
}: AccordionProps) {
  const [internalOpenValue, setInternalOpenValue] = useState<string | null>(defaultOpenValue);
  const resolvedOpenValue = openValue === undefined ? internalOpenValue : openValue;

  const handleSectionChange = (value: string, isOpen: boolean) => {
    const next = isOpen ? value : null;
    if (openValue === undefined) {
      setInternalOpenValue(next);
    }
    onOpenValueChange?.(next);
  };

  return (
    <YStack>
      {sections.map((section, index) => (
        <AccordionSection
          key={section.value}
          title={section.title}
          stackPosition={
            sections.length === 1
              ? "only"
              : index === 0
                ? "first"
                : index === sections.length - 1
                  ? "last"
                  : "middle"
          }
          isOpen={resolvedOpenValue === section.value}
          onOpenChange={(isOpen) => {
            handleSectionChange(section.value, isOpen);
          }}
        >
          {section.content}
        </AccordionSection>
      ))}
    </YStack>
  );
}
