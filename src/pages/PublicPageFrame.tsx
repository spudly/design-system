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
 * RecipeDetailPage), while the destinations are the host's.
 * Navigation leaves as hrefs throughout, per #248's rule: every
 * control here navigates to another page — the brand wordmark
 * home, Sign in to the login route, Privacy/Terms to the legal
 * routes — so each crosses as a real link's href, never as an
 * intent callback (Stephen's rulings on PR #311 and the #320
 * dedupe: a control that navigates is a link with an href, and
 * the footer's legal links are caller-supplied {label, href}
 * data). Nothing here imports an app package or fetches anything.
 *
 * This is the wide public counterpart to PageFrame (the 430px
 * phone frame the app-page stories render in): the content column
 * is the web layout's max-w-3xl (768px), centered, and the frame
 * itself does not scroll — the page inside owns its scroll, the
 * same split as the web PublicPageLayout it replaces, whose header
 * and footer sit outside the scrolling document flow.
 *
 * The composition (#119, deduped in #320): the frame is assembled
 * from the shared frame components — PublicFrameLayout owns the
 * shell and the column, PublicFrameHeader / PublicFrameFooter own
 * the bands and their link treatments, BrandLink owns the
 * wordmark — and this file keeps what is the frame's own: the
 * navigation contract (the hrefs) and the DS-owned copy
 * constants, passed into the bands as data (the footer receives
 * its legal links as the {label, href} array its contract takes,
 * built here from the frame's labels and the host's hrefs).
 *
 * Placement: page components live in src/pages behind the
 * `@spudly/ui/pages` subpath export, not the package root.
 */

export type PublicPageFrameProps = {
  /** The brand wordmark's href — the host's home route (the wordmark navigates, so it is a link). */
  brandHref: string;
  /** The Sign in link's href — the host's login route. */
  signInHref: string;
  /** The Privacy Policy link's href — the host's privacy route. */
  privacyHref: string;
  /** The Terms of Service link's href — the host's terms route. */
  termsHref: string;
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
  signInHref,
  privacyHref,
  termsHref,
  children,
}: PublicPageFrameProps) {
  return (
    <PublicFrameLayout
      header={
        <PublicFrameHeader
          brandLabel={BRAND_LABEL}
          brandHref={brandHref}
          signInLabel={SIGN_IN_LABEL}
          signInHref={signInHref}
        />
      }
      footer={
        <PublicFrameFooter
          note={FOOTER_NOTE}
          links={[
            { label: PRIVACY_LABEL, href: privacyHref },
            { label: TERMS_LABEL, href: termsHref },
          ]}
        />
      }
    >
      {children}
    </PublicFrameLayout>
  );
}
