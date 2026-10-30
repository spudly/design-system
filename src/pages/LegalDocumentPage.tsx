import type { ReactNode } from "react";
import { Anchor, XStack, YStack } from "tamagui";
import { DocumentFooter } from "../components/DocumentFooter.js";
import { DocumentHeader } from "../components/DocumentHeader.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";
import { listItemRoleProps, listRoleProps } from "../components/accessibility.js";
import { tokens } from "../tokens/index.js";

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
 * frame's header and footer are the shared DocumentHeader /
 * DocumentFooter, and the document itself renders through the
 * page-local prose renderer below (Stephen's no-new-components
 * rule for tranche PRs, 2026-10-29). An earlier tranche cut
 * extracted the renderer as a ProseDocument library component;
 * it had no second consumer, so it was folded back into the
 * page — the model types live here under the page's public
 * names, so the contract below is unchanged.
 *
 * Stays app-side: the legal text itself, routing, document
 * head/SEO, and the analytics consent banner.
 */

/** A prose span: the document's inline semantics — plain text,
 * strong emphasis, code, and links (a link span's href navigates,
 * so it renders as a real anchor). */
export type LegalDocumentSpan =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; label: string; href: string };

/** A prose block: a paragraph of spans, or a bulleted list whose
 * items are span runs. */
export type LegalDocumentBlock =
  | { type: "paragraph"; spans: LegalDocumentSpan[] }
  | { type: "list"; items: LegalDocumentSpan[][] };

/** A document section: a titled run of blocks. */
export type LegalDocumentSection = {
  title: string;
  blocks: LegalDocumentBlock[];
};

/** A frame link: the label renders, the href is where it goes. */
export type LegalDocumentLink = {
  label: string;
  href: string;
};

/**
 * The document's prose column width: the same 768px (the web
 * layout's max-w-3xl) centered column the other public surfaces
 * render into (PublicFrameLayout's COLUMN_MAX_WIDTH), so the
 * prose stays readable on wide viewports. The frame header and
 * footer stay outside the column, spanning the container as
 * before; on phone-width viewports the cap does not bind.
 */
const PROSE_MAX_WIDTH = 768;

function renderSpan(span: LegalDocumentSpan, key: number): ReactNode {
  switch (span.type) {
    case "text":
      return span.text;
    case "strong":
      return (
        <Text key={key} fontWeight={tokens.typography.fontWeight.bold}>
          {span.text}
        </Text>
      );
    case "code":
      return (
        <Text key={key} fontFamily={tokens.typography.fontFamily.mono}>
          {span.text}
        </Text>
      );
    case "link":
      return (
        <Anchor
          key={key}
          href={span.href}
          color="$link"
          fontWeight={tokens.typography.fontWeight.medium}
          textDecorationLine="underline"
        >
          {span.label}
        </Anchor>
      );
  }
}

function renderSpans(spans: LegalDocumentSpan[]): ReactNode {
  return spans.map((span, index) => renderSpan(span, index));
}

function renderBlock(block: LegalDocumentBlock, key: number): ReactNode {
  if (block.type === "paragraph") {
    return <Text key={key}>{renderSpans(block.spans)}</Text>;
  }
  return (
    <YStack key={key} gap="$2" {...listRoleProps}>
      {block.items.map((item, index) => (
        <XStack key={index} gap="$2" {...listItemRoleProps}>
          <Text>{"•"}</Text>
          <Text flex={1}>{renderSpans(item)}</Text>
        </XStack>
      ))}
    </YStack>
  );
}

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
      <YStack width="100%" maxWidth={PROSE_MAX_WIDTH} alignSelf="center" gap="$4">
        <YStack gap="$3">
          <Text variant="heading">{title}</Text>
          <Text variant="hint">{`Last updated: ${lastUpdated}`}</Text>
        </YStack>
        {sections.map((section) => (
          <YStack key={section.title} gap="$3">
            <Text variant="subheading">{section.title}</Text>
            {section.blocks.map((block, index) => renderBlock(block, index))}
          </YStack>
        ))}
      </YStack>
      <DocumentFooter links={footerLinks} />
    </ScreenContainer>
  );
}
