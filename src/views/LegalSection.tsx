import type { ReactNode } from "react";
import { Text as TamaguiText, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
import { platformAccessibilityProps } from "../widgets/accessibility.js";
import { TextSkeleton } from "../widgets/TextSkeleton.js";

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
  /** Loading state (#278): the title renders as a text
   * skeleton at its own (lg) size in the title's line box,
   * inside a wrapper carrying the title's level-2 heading
   * semantics, and the children render inside a loading scope
   * so the host's links skeletonize themselves. An enclosing
   * composite's LoadingScope can also put the section into
   * this state without prop-drilling. */
  loading?: boolean;
};

export function LegalSection({ title, children, loading = false }: LegalSectionProps) {
  const showSkeleton = useLoadingScope(loading);
  return (
    <StyledSection>
      {/* A section title carries level-2 heading semantics, like
          the DS's other section titles (SectionCard's) — the page
          title above it is the level-1 heading. While loading the
          bone sits in the title's line box inside a wrapper that
          keeps those heading semantics. */}
      {showSkeleton ? (
        <YStack {...platformAccessibilityProps({ accessibilityRole: "header", "aria-level": 2 })}>
          <TextSkeleton size="lg" lines={1} />
        </YStack>
      ) : (
        <StyledTitle
          {...platformAccessibilityProps({ accessibilityRole: "header", "aria-level": 2 })}
        >
          {title}
        </StyledTitle>
      )}
      <LoadingScope active={showSkeleton}>{children}</LoadingScope>
    </StyledSection>
  );
}
