import type { ReactNode } from "react";
import { Text as TamaguiText, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledSection = styled(YStack, {
  name: "LegalSection",

  gap: tokens.spacing[3],
});

const StyledTitle = styled(TamaguiText, {
  name: "LegalSectionTitle",

  fontSize: tokens.typography.fontSize.lg,
  fontWeight: tokens.typography.fontWeight.semibold,
  color: tokens.colors.gray.gray10,
});

/**
 * LegalSection (#119): a page's legal-links block — a small
 * section title over the host's legal links, as one component
 * that owns the block's layout (the title's treatment and the
 * 12px title-to-links separation the app profile screen
 * renders). The links themselves are the host's content (the
 * URLs are app constants — the B2 audit keeps `LegalLinks`
 * app-side), so they cross as children; the section frames
 * them the way the app screen's legal section does.
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
      <StyledTitle>{title}</StyledTitle>
      {children}
    </StyledSection>
  );
}
