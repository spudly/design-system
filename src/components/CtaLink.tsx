import { Anchor } from "tamagui";
import { tokens } from "../tokens/index.js";

export type CtaLinkTarget = {
  label: string;
  /** The destination — a CTA navigates, so it renders as a link. */
  href: string;
};

export type CtaLinkProps = {
  /** The call to action: its label and destination. */
  cta: CtaLinkTarget;
  /** Primary (filled brand) or secondary (neutral fill) emphasis. */
  variant: "primary" | "secondary";
};

/**
 * A call-to-action link (#171, extracted for #119): a real anchor
 * wearing the Button variants' styling (primary = filled brand,
 * secondary = muted fill), so the landing's links read as the
 * same calls to action the app's buttons do while keeping native
 * link semantics — an `href` and the link role on web
 * (crawlable, open-in-new-tab); on native the anchor opens the
 * URL. CTAs navigate — the host's sign-up flow, a public page —
 * so a CTA is host DATA (`{ label, href }`), not a callback: the
 * host passes the pair in and this renders the anchor. The shape
 * (padding, radius, semibold label, the two fills) is the CTA's
 * design, owned here.
 */
export function CtaLink({ cta, variant }: CtaLinkProps) {
  return (
    <Anchor
      href={cta.href}
      backgroundColor={variant === "primary" ? "$primary" : tokens.colors.gray.gray3}
      color={variant === "primary" ? "$onPrimary" : tokens.colors.gray.gray10}
      fontSize={tokens.typography.fontSize.md}
      fontWeight={tokens.typography.fontWeight.semibold}
      paddingHorizontal={tokens.spacing[4]}
      paddingVertical={tokens.spacing[3]}
      borderRadius={tokens.radii.md}
      textAlign="center"
      textDecorationLine="none"
    >
      {cta.label}
    </Anchor>
  );
}
