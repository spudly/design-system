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
 * Content model (Stephen's decision, 2026-10-28, superseding the
 * structured section/block/span contract this page first shipped
 * with the same day): the document crosses as ONE markdown string.
 * No view-model tree and no app JSX crosses the boundary: the app
 * owns the words, the DS owns how markdown renders. The supported
 * subset is exactly what the two real documents use:
 *
 *   - `## ` (or `# `) at line start opens a section; its text is
 *     the section heading, rendered at heading level 2 — the page
 *     title stays the document's only level-1 heading. Content
 *     before the first heading renders without one.
 *   - Blank lines separate blocks; consecutive plain lines join
 *     into one paragraph.
 *   - Lines starting with `- ` (or `* `) form a bullet list.
 *   - Inline: `**strong**`, `` `code` ``, and `[label](href)`.
 *
 * Inline links (Stephen's decision, 2026-10-28): a markdown link
 * renders as a real link (a web anchor with the href from the
 * markdown, `mailto:` included) — the navigation rule applied to
 * prose. There is deliberately no press callback for content
 * links: the page never routes, opens mail clients, or maps link
 * ids; the href says where the link goes and the platform follows
 * it.
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

/**
 * The parse tree for the supported markdown subset — internal to
 * this module. The markdown string is the contract; these shapes
 * never cross the page boundary.
 */
type MarkdownSpan =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; label: string; href: string };

type MarkdownBlock =
  { type: "paragraph"; spans: MarkdownSpan[] } | { type: "list"; items: MarkdownSpan[][] };

type MarkdownSection = {
  title: string | null;
  blocks: MarkdownBlock[];
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
  /** The document body as one markdown string (subset above). */
  markdown: string;
  /** Brand wordmark in the frame header, linking to the host's home. */
  brandLabel: string;
  brandHref: string;
  /** Sign-in link in the frame header. */
  signInLabel: string;
  signInHref: string;
  /** The frame footer's links (the privacy/terms links today). */
  footerLinks: LegalDocumentLink[];
};

const INLINE_PATTERN = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;
const HEADING_PATTERN = /^#{1,2}\s+(.*)$/;
const LIST_ITEM_PATTERN = /^[-*]\s+(.*)$/;

function parseInline(text: string): MarkdownSpan[] {
  const spans: MarkdownSpan[] = [];
  INLINE_PATTERN.lastIndex = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      spans.push({ type: "text", text: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      spans.push({ type: "strong", text: match[1] });
    } else if (match[2] !== undefined) {
      spans.push({ type: "code", text: match[2] });
    } else {
      spans.push({ type: "link", label: match[3] ?? "", href: match[4] ?? "" });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    spans.push({ type: "text", text: text.slice(lastIndex) });
  }
  return spans;
}

function parseMarkdown(markdown: string): MarkdownSection[] {
  const sections: MarkdownSection[] = [];
  let section: MarkdownSection = { title: null, blocks: [] };
  let paragraphLines: string[] = [];
  let listItems: MarkdownSpan[][] | null = null;

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      section.blocks.push({ type: "paragraph", spans: parseInline(paragraphLines.join(" ")) });
      paragraphLines = [];
    }
  };
  const flushList = () => {
    if (listItems !== null) {
      section.blocks.push({ type: "list", items: listItems });
      listItems = null;
    }
  };
  const flushSection = () => {
    flushParagraph();
    flushList();
    if (section.title !== null || section.blocks.length > 0) {
      sections.push(section);
    }
  };

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();
    const heading = HEADING_PATTERN.exec(line);
    if (heading) {
      flushSection();
      section = { title: (heading[1] ?? "").trim(), blocks: [] };
      continue;
    }
    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }
    const item = LIST_ITEM_PATTERN.exec(line);
    if (item) {
      flushParagraph();
      (listItems ??= []).push(parseInline(item[1] ?? ""));
      continue;
    }
    flushList();
    paragraphLines.push(line);
  }
  flushSection();
  return sections;
}

function renderSpan(span: MarkdownSpan, key: number): ReactNode {
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

function renderSpans(spans: MarkdownSpan[]): ReactNode {
  return spans.map((span, index) => renderSpan(span, index));
}

function MarkdownBlockView({ block }: { block: MarkdownBlock }) {
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
  markdown,
  brandLabel,
  brandHref,
  signInLabel,
  signInHref,
  footerLinks,
}: LegalDocumentPageProps) {
  const sections = parseMarkdown(markdown);
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
      {sections.map((section, sectionIndex) => (
        <YStack key={section.title ?? sectionIndex} gap="$3">
          {section.title ? <Text variant="subheading">{section.title}</Text> : null}
          {section.blocks.map((block, index) => (
            <MarkdownBlockView key={index} block={block} />
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
