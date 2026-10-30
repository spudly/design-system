import type { ReactNode } from "react";
import { Text as TamaguiText, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";

const StyledSection = styled(YStack, {
  name: "LegalSection",

  gap: tokens.spacing[3],
});

const StyledTitle = styled(TamaguiText, {
  name: "LegalSectionTitle",

  fontSize: tokens.typography.fontSize.lg,
  fontWeight: tokens.typography.fontWeight.semibold,
  // The theme's text ink, not a fixed gray step: the ink follows
  // the theme (a fixed near-black step would vanish on the dark
  // themes' backgrounds).
  color: "$color",
});

/**
 * LegalSection (#119): a page's legal-links block — a small
 * section title over the host's legal links, as one component
 * that owns the block's layout (the title's treatment and the
 * 12px title-to-links separation the app profile screen
 * renders). The title carries the DS section-title semantics
 * (a level-2 heading under the page's level-1 title, as
 * SectionCard's titles render) in the app screen's size and
 * weight, inked with the theme's text color so it follows
 * light and dark themes. The links themselves are the host's
 * content (the URLs are app constants — the B2 audit keeps
 * `LegalLinks` app-side), so they cross as children; the
 * section frames them the way the app screen's legal section
 * does.
 */

export type LegalSectionProps = {
  /** The section's title (the host's copy, e.g. "Legal"). */
  title: string;
  /** The host's legal links, rendered under the title. */
  children: ReactNode;
};

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <StyledSection>
      {/* A section title carries level-2 heading semantics, like
          the DS's other section titles (SectionCard's) — the page
          title above it is the level-1 heading. */}
      <StyledTitle
        {...platformAccessibilityProps({ accessibilityRole: "header", "aria-level": 2 })}
      >
        {title}
      </StyledTitle>
      {children}
    </StyledSection>
  );
}
