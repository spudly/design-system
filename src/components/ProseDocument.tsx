import type { ReactNode } from "react";
import { Anchor, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { listItemRoleProps, listRoleProps } from "./accessibility.js";
import { Text } from "./Text.js";

/**
 * A prose document's content model (#170): structured data, not
 * markup. Spans carry the document's own inline semantics — plain
 * text, strong emphasis, code, and links (a link span's href
 * navigates, so it renders as a real anchor; the document
 * surface owns its routes, so the renderer needs no Press
 * callbacks at all). Blocks are paragraphs and bulleted lists of
 * span runs; a section is a titled run of blocks. The same model
 * would render both documents' web DOM and a native surface, and
 * because the copy lives in the model, the documents stay plain
 * data files in the app (reviewable, localizable, without
 * touching the renderer).
 */
export type ProseSpan =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; label: string; href: string };

export type ProseBlock =
  { type: "paragraph"; spans: ProseSpan[] } | { type: "list"; items: ProseSpan[][] };

export type ProseSection = {
  title: string;
  blocks: ProseBlock[];
};

export type ProseDocumentProps = {
  /** The document's title. */
  title: string;
  /** The document's "Last updated" date, pre-formatted. */
  lastUpdated: string;
  /** The document's sections, rendered in order. */
  sections: ProseSection[];
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

function renderSpan(span: ProseSpan, key: number): ReactNode {
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

function renderSpans(spans: ProseSpan[]): ReactNode {
  return spans.map((span, index) => renderSpan(span, index));
}

function ProseBlockView({ block }: { block: ProseBlock }) {
  if (block.type === "paragraph") {
    return <Text>{renderSpans(block.spans)}</Text>;
  }
  return (
    <YStack gap="$2" {...listRoleProps}>
      {block.items.map((item, index) => (
        <XStack key={index} gap="$2" {...listItemRoleProps}>
          <Text>{"•"}</Text>
          <Text flex={1}>{renderSpans(item)}</Text>
        </XStack>
      ))}
    </YStack>
  );
}

/**
 * A structured prose document (#170, extracted for #119): the
 * document's title and "Last updated" line above its sections,
 * each section a subheading over its paragraph and list blocks,
 * typeset into the wide prose column. Extracted from
 * LegalDocumentPage for the #119 page de-styling program — the
 * typography, the column, and the span/block rendering are the
 * document design, owned here; any surface with a structured
 * document (a policy, terms, a help article) renders it by
 * passing the model in.
 */
export function ProseDocument({ lastUpdated, sections, title }: ProseDocumentProps) {
  return (
    <YStack width="100%" maxWidth={PROSE_MAX_WIDTH} alignSelf="center" gap="$4">
      <YStack gap="$3">
        <Text variant="heading">{title}</Text>
        <Text variant="hint">{`Last updated: ${lastUpdated}`}</Text>
      </YStack>
      {sections.map((section) => (
        <YStack key={section.title} gap="$3">
          <Text variant="subheading">{section.title}</Text>
          {section.blocks.map((block, index) => (
            <ProseBlockView key={index} block={block} />
          ))}
        </YStack>
      ))}
    </YStack>
  );
}
