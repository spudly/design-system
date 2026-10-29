import type { ReactNode } from "react";
import { Anchor, XStack, YStack } from "tamagui";
import { Divider } from "../components/Divider.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";
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
 * Stays app-side: the legal text itself, routing, document
 * head/SEO, and the analytics consent banner.
 */

export type LegalDocumentSpan =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; label: string; href: string };

export type LegalDocumentBlock =
  | { type: "paragraph"; spans: LegalDocumentSpan[] }
  | { type: "list"; items: LegalDocumentSpan[][] };

export type LegalDocumentSection = {
  title: string;
  blocks: LegalDocumentBlock[];
};

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

function LegalDocumentBlockView({ block }: { block: LegalDocumentBlock }) {
  if (block.type === "paragraph") {
    return <Text>{renderSpans(block.spans)}</Text>;
  }
  return (
    <YStack gap="$2">
      {block.items.map((item, index) => (
        <XStack key={index} gap="$2">
          <Text>{"•"}</Text>
          <Text flex={1}>{renderSpans(item)}</Text>
        </XStack>
      ))}
    </YStack>
  );
}

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
      <XStack alignItems="center" justifyContent="space-between" gap="$4">
        <Anchor
          href={brandHref}
          fontSize={tokens.typography.fontSize.lg}
          fontWeight={tokens.typography.fontWeight.bold}
        >
          {brandLabel}
        </Anchor>
        <Anchor href={signInHref} color="$link" fontWeight={tokens.typography.fontWeight.medium}>
          {signInLabel}
        </Anchor>
      </XStack>
      <YStack gap="$3">
        <Text variant="heading">{title}</Text>
        <Text variant="hint">{`Last updated: ${lastUpdated}`}</Text>
      </YStack>
      {sections.map((section) => (
        <YStack key={section.title} gap="$3">
          <Text variant="subheading">{section.title}</Text>
          {section.blocks.map((block, index) => (
            <LegalDocumentBlockView key={index} block={block} />
          ))}
        </YStack>
      ))}
      <YStack gap="$4">
        <Divider />
        <XStack gap="$4" flexWrap="wrap">
          {footerLinks.map((link) => (
            <Anchor
              key={link.href}
              href={link.href}
              color="$link"
              fontSize={tokens.typography.fontSize.sm}
              fontWeight={tokens.typography.fontWeight.medium}
            >
              {link.label}
            </Anchor>
          ))}
        </XStack>
      </YStack>
    </ScreenContainer>
  );
}
