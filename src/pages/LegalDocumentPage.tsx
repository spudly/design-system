import { DocumentFooter } from "../components/DocumentFooter.js";
import { DocumentHeader } from "../components/DocumentHeader.js";
import {
  ProseDocument,
  type ProseBlock,
  type ProseSection,
  type ProseSpan,
} from "../components/ProseDocument.js";
import { ScreenContainer } from "../components/ScreenContainer.js";

/**
 * LegalDocumentPage (spudly/design-system#170, B7 public surfaces):
 * the legal document view — one parameterized page serves both the
 * privacy policy and the terms of service, driven entirely by its
 * content props.
 *
 * Content model (Stephen's decision, 2026-10-28): the document
 * crosses as structured view-model data — sections of paragraph and
 * bullet-list blocks, each built from text / strong / code / link
 * spans. No markdown string and no app JSX crosses the boundary:
 * the DS owns how every block renders, the app owns the words. The
 * span inventory covers everything the two real documents use today
 * (paragraphs, bullet lists with strong lead-ins, one code span, and
 * mailto links interpolated mid-sentence); the operator name and
 * contact address are interpolated app-side while building the
 * data, so no app constant enters the DS.
 *
 * Inline links (Stephen's decision, 2026-10-28): a link span
 * carries its `href` in the data and renders as a real link (a web
 * anchor with that href) — the navigation rule applied to prose.
 * There is deliberately no press callback for content links: the
 * page never routes, opens mail clients, or maps link ids; the
 * href says where the link goes and the platform follows it.
 *
 * Frame (Stephen's decision, 2026-10-28 — unify now): the page
 * renders the full DS public frame, not a header-only variant: a
 * header with the brand wordmark and a sign-in link, the document
 * in a prose column, and a footer carrying the host's legal links.
 * The frame's links navigate, so they cross as hrefs too (brand,
 * sign-in, footer) with their labels as props — the app owns the
 * copy and the destinations, the DS owns the frame's design, and
 * the same frame shape serves the other public surfaces.
 *
 * The page composes components and passes data only (#119): the
 * frame's header and footer are DocumentHeader / DocumentFooter
 * and the document itself renders through ProseDocument — the
 * shared prose renderer whose content model the page's public
 * types alias, so the contract below is unchanged.
 *
 * Stays app-side: the legal text itself, routing, document
 * head/SEO, and the analytics consent banner.
 */

/** The document's span model — ProseDocument's, under the page's
 * public names (the #170 contract). */
export type LegalDocumentSpan = ProseSpan;

/** The document's block model — ProseDocument's, under the page's
 * public names (the #170 contract). */
export type LegalDocumentBlock = ProseBlock;

/** The document's section model — ProseDocument's, under the
 * page's public names (the #170 contract). */
export type LegalDocumentSection = ProseSection;

/** A frame link: the label renders, the href is where it goes. */
export type LegalDocumentLink = {
  label: string;
  href: string;
};

export type LegalDocumentPageProps = {
  /** Document title, rendered as the page's level-1 heading. */
  title: string;
  /**
   * Pre-formatted by the host, e.g. "July 22, 2026" — the page
   * renders it as "Last updated: …".
   */
  lastUpdated: string;
  sections: LegalDocumentSection[];
  /** Brand wordmark in the frame header, linking to the host's home. */
  brandLabel: string;
  brandHref: string;
  /** Sign-in link in the frame header. */
  signInLabel: string;
  signInHref: string;
  /** The frame footer's links (the privacy/terms links today). */
  footerLinks: LegalDocumentLink[];
};

export function LegalDocumentPage({
  title,
  lastUpdated,
  sections,
  brandLabel,
  brandHref,
  signInLabel,
  signInHref,
  footerLinks,
}: LegalDocumentPageProps) {
  return (
    <ScreenContainer>
      <DocumentHeader
        brandLabel={brandLabel}
        brandHref={brandHref}
        signInLabel={signInLabel}
        signInHref={signInHref}
      />
      <ProseDocument title={title} lastUpdated={lastUpdated} sections={sections} />
      <DocumentFooter links={footerLinks} />
    </ScreenContainer>
  );
}
