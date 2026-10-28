import { useState, type ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
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
 * Sections are separate framed blocks stacked with the parent's gap:
 * the spec's joined/docked edges conflict with the DS spacing rule
 * (parents space children with gap/padding, never margins — #209),
 * which the #178 audit already flagged and rejected. Candidate homes:
 * settings groups, recipe detail sections, help content.
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
    <YStack gap={tokens.spacing[2]}>
      {sections.map((section) => (
        <AccordionSection
          key={section.value}
          title={section.title}
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
