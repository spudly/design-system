import { Anchor, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";

/**
 * The wordmark's brand treatment, carried by the anchor's styled
 * frame: primary ink, semibold, at the large text size, with no
 * underline — a header wordmark is identified by its ink and
 * weight, not by the underline prose links carry (TextLink
 * underlines; the wordmark never did). A web anchor carries the
 * UA link underline, so it is suppressed explicitly (the
 * BackLink pin).
 */
const StyledBrandAnchor = styled(Anchor, {
  name: "BrandLinkAnchor",
  color: "$primary",
  fontSize: tokens.typography.fontSize.lg,
  fontWeight: tokens.typography.fontWeight.semibold,
  textDecorationLine: "none",
});

export type BrandLinkProps = {
  /** The wordmark text — the caller's brand name, as content. */
  label: string;
  /**
   * The brand's destination — the host's home. The wordmark
   * navigates to another page, so it is a link with an href
   * (#248's navigation rule), never a press callback: a
   * component named *Link carrying the link role must be a real
   * link (Stephen's ruling on PR #311, 2026-10-29). The home
   * destination is canonical — every surface the wordmark
   * renders on has one — so the rule's callback exemptions
   * (mutation-then-navigate controls, genuinely dynamic
   * destinations) do not apply here.
   *
   * Native contract (shared by every DS href form): the href
   * is forwarded verbatim to `Linking.openURL`, which requires
   * a scheme-bearing URL an installed app can open — so on
   * native the host passes an absolute URL (the app's deep-link
   * scheme or an https URL); root-relative paths such as "/"
   * are web-form destinations. The design system has no base
   * URL or router to resolve a relative path against, so
   * composing the per-platform destination is the host's part
   * of the contract (the host composes hrefs from its routes,
   * #248).
   */
  href: string;
};

/**
 * The brand wordmark link (#119): a real anchor in the brand
 * treatment (primary ink, semibold, no underline) a site header
 * uses for its wordmark. Extracted from PublicPageFrame for the
 * #119 page de-styling program, so chrome composes the wordmark
 * without setting text styling itself.
 *
 * The rendering is the TextLink href form's: a Tamagui Anchor —
 * a real `<a href>` on web (keyboard-operable by default, so no
 * tabIndex/Enter shim); on native a press opens the href
 * through the platform link path (Tamagui's Anchor calls
 * Linking.openURL internally, so no DS component imports
 * react-native). The label is a single text run, so the anchor
 * carries it directly on both platforms; the view-frame +
 * LinkOverlay split is reserved for multi-child surfaces, whose
 * block children a native Text would flatten into one inline
 * run (see LinkOverlay).
 */
export function BrandLink({ label, href }: BrandLinkProps) {
  return (
    <StyledBrandAnchor
      {...platformAccessibilityProps({ accessibilityRole: "link", accessibilityLabel: label })}
      href={href}
      cursor="web:pointer"
    >
      {label}
    </StyledBrandAnchor>
  );
}
