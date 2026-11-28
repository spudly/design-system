import type { ReactNode } from "react";

import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import { BrandLink } from "../../widgets/actions/BrandLink.js";
import { BulletList } from "../../widgets/data/BulletList.js";
import { Row } from "../../widgets/layout/Row.js";
import { Col } from "../../widgets/layout/Col.js";
import { ProseColumn } from "../../widgets/layout/ProseColumn.js";
import { ScreenContainer } from "../../widgets/layout/ScreenContainer.js";
import { Text } from "../../widgets/data/Text.js";
import { TextLink } from "../../widgets/actions/TextLink.js";
import { bannerRoleProps, mainRoleProps } from "../../widgets/accessibility.js";
import { tokens } from "../../tokens/index.js";
import { useVoice } from "../../voice/index.js";

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
 * header row — the brand wordmark (BrandLink) and the sign-in
 * TextLink at the ends of a banner row — renders directly in
 * this page (#473 retired the DocumentHeader /
 * DocumentFooter / public-frame components it once composed;
 * the row's shape is unchanged), its page footer
 * is BigFooter (#410 — the document's own closing link row was
 * retired with it; hosts pass legal links as BigFooter column
 * data through the page's `footer` prop), and the document
 * itself renders through the
 * page-local prose renderer below. An earlier tranche cut
 * extracted the renderer as a ProseDocument library component;
 * it had no second consumer, so it was folded back into the
 * page — the model types live here under the page's public
 * names, so the contract below is unchanged. The renderer's
 * layout primitives are no longer page-local (#119 tranche 2):
 * the banner row is a Row (middle, between, gap l), the prose column is
 * ProseColumn, the title block and each section are
 * a Col at gap m, and list blocks are BulletList — only the span
 * and block rendering stays in this page.
 *
 * Stays app-side: the legal text itself, routing, document
 * head/SEO, and the analytics consent banner.
 *
 * Landmarks (#366): on web the document column is the page's
 * `main` landmark (via `mainRoleProps`), the header row is
 * `banner` (via `bannerRoleProps`), and BigFooter is `contentinfo` — this page
 * renders the full frame itself and is the outermost chrome,
 * so it owns the landmarks; hosts must not wrap it in another
 * landmark-owning frame. Native is unaffected.
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

function renderSpan(span: LegalDocumentSpan, key: number): ReactNode {
  switch (span.type) {
    case "text": {
      return span.text;
    }
    case "strong": {
      return (
        <Text key={key} fontWeight={tokens.typography.fontWeight.bold}>
          {span.text}
        </Text>
      );
    }
    case "code": {
      return (
        <Text key={key} fontFamily={tokens.typography.fontFamily.mono}>
          {span.text}
        </Text>
      );
    }
    case "link": {
      return (
        <TextLink key={key} href={span.href}>
          {span.label}
        </TextLink>
      );
    }
  }
}

function renderSpans(spans: LegalDocumentSpan[]): ReactNode {
  return spans.map((span, index) => renderSpan(span, index));
}

function renderBlock(block: LegalDocumentBlock, key: number): ReactNode {
  if (block.type === "paragraph") {
    return <Text key={key}>{renderSpans(block.spans)}</Text>;
  }
  return <BulletList key={key} items={block.items.map((item) => renderSpans(item))} />;
}

export type LegalDocumentPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  /** Document title, rendered as the page's level-1 heading. */
  title: string;
  /**
   * Pre-formatted by the host, e.g. "July 22, 2026" — the page
   * renders it through the voice's last-updated formatter (#539).
   */
  lastUpdated: string;
  sections: LegalDocumentSection[];
  /** Brand wordmark in the frame header, linking to the host's home. */
  brandLabel: string;
  brandHref: string;
  /** Sign-in link in the frame header. */
  signInLabel: string;
  signInHref: string;
};

export function LegalDocumentPage({
  title,
  lastUpdated,
  sections,
  brandLabel,
  brandHref,
  signInLabel,
  signInHref,
  footer,
}: LegalDocumentPageProps) {
  const voice = useVoice();
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer>
        <Row middle between gap="l" {...bannerRoleProps}>
          <BrandLink label={brandLabel} href={brandHref} />
          <TextLink href={signInHref}>{signInLabel}</TextLink>
        </Row>
        <ProseColumn {...mainRoleProps}>
          <Col gap="m">
            <Text variant="heading">{title}</Text>
            <Text variant="hint">{voice.legalDocumentPage.lastUpdatedLabel(lastUpdated)}</Text>
          </Col>
          {sections.map((section) => (
            <Col gap="m" key={section.title}>
              <Text variant="subheading">{section.title}</Text>
              {section.blocks.map((block, index) => renderBlock(block, index))}
            </Col>
          ))}
        </ProseColumn>
      </ScreenContainer>
    </BigFooterShell>
  );
}
