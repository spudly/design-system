import type { ReactNode } from "react";
import { PublicFrameFooter } from "../components/PublicFrameFooter.js";
import { PublicFrameHeader } from "../components/PublicFrameHeader.js";
import { PublicFrameLayout } from "../components/PublicFrameLayout.js";

/**
 * PublicPageFrame (#169): the public (signed-out) page chrome as a
 * design-system building block — header (brand + Sign in), the wide
 * public content column, and footer (the viewed-without-an-account
 * note + Privacy/Terms links) — shared by every public surface
 * (PublicRecipePage here; Discover #168, Legal #170, and the
 * marketing landing #171 reuse it as they land).
 *
 * Ownership model (Stephen, 2026-10-28, confirmed for #168–#171
 * alike): the DS owns the design — this frame included — and the
 * app owns the content. The frame's copy is therefore DS-owned
 * constants that move with the frame (the copy precedent from
 * RecipeDetailPage). Navigation leaves two ways, per #248's
 * rule: the brand wordmark navigates home — a canonical
 * destination — so its href crosses as an href (BrandLink is a
 * real link; Stephen's ruling on PR #311), while the remaining
 * navigation leaves through intent callbacks: the host routes
 * (Sign in → the login route, Privacy/Terms → the legal
 * routes). Nothing here imports an app package or fetches
 * anything.
 *
 * This is the wide public counterpart to PageFrame (the 430px
 * phone frame the app-page stories render in): the content column
 * is the web layout's max-w-3xl (768px), centered, and the frame
 * itself does not scroll — the page inside owns its scroll, the
 * same split as the web PublicPageLayout it replaces, whose header
 * and footer sit outside the scrolling document flow.
 *
 * The composition (#119): the frame is assembled from the shared
 * frame components — PublicFrameLayout owns the shell and the
 * column, PublicFrameHeader / PublicFrameFooter own the bands and
 * their link treatments, BrandLink owns the wordmark — and this
 * file keeps what is the frame's own: the navigation contract
 * (the brand href and the intent callbacks) and the DS-owned
 * copy constants, passed into the bands as data.
 *
 * Placement: page components live in src/pages behind the
 * `@spudly/ui/pages` subpath export, not the package root.
 */

export type PublicPageFrameProps = {
  /** The brand wordmark's href — the host's home route (the wordmark navigates, so it is a link). */
  brandHref: string;
  /** Sign-in intent: the host navigates to the login route. */
  onSignInPress: () => void;
  /** Privacy intent: the host navigates to the privacy policy. */
  onPrivacyPress: () => void;
  /** Terms intent: the host navigates to the terms of service. */
  onTermsPress: () => void;
  children: ReactNode;
};

// Frame copy, DS-owned constants that move with the frame (the
// copy precedent): the brand, the header action, the footer note,
// and the legal link labels, verbatim from the web layout.
const BRAND_LABEL = "Eciperay";
const SIGN_IN_LABEL = "Sign in";
const FOOTER_NOTE = "Recipes shared on Eciperay may be viewed without an account.";
const PRIVACY_LABEL = "Privacy Policy";
const TERMS_LABEL = "Terms of Service";

/**
 * The public chrome: pinned header and footer around the wide
 * centered column the page renders into. Controlled — see the
 * file header for the contract and the ownership split.
 */
export function PublicPageFrame({
  brandHref,
  onSignInPress,
  onPrivacyPress,
  onTermsPress,
  children,
}: PublicPageFrameProps) {
  return (
    <PublicFrameLayout
      header={
        <PublicFrameHeader
          brandLabel={BRAND_LABEL}
          brandHref={brandHref}
          signInLabel={SIGN_IN_LABEL}
          onSignInPress={onSignInPress}
        />
      }
      footer={
        <PublicFrameFooter
          note={FOOTER_NOTE}
          privacyLabel={PRIVACY_LABEL}
          onPrivacyPress={onPrivacyPress}
          termsLabel={TERMS_LABEL}
          onTermsPress={onTermsPress}
        />
      }
    >
      {children}
    </PublicFrameLayout>
  );
}
