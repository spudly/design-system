import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Divider } from "./Divider.js";
import { TextLink } from "./TextLink.js";
import { contentInfoRoleProps } from "./accessibility.js";

export type DocumentFooterLink = {
  label: string;
  /** The link's href — footer links navigate, so they are links. */
  href: string;
};

export type DocumentFooterProps = {
  /** The footer's links (the document surface's legal routes). */
  links: DocumentFooterLink[];
};

/**
 * The document frame's footer (#170, extracted for #119): a
 * divider above a wrapping row of the frame's legal links, each
 * a real link in the link treatment. The divider, the row's wrap
 * behavior, and the link treatment are the frame's design, owned
 * here; the links themselves are the host's content, passed in.
 *
 * The links render as TextLink href forms (#119 dedupe,
 * cluster B7): the tranche's first cut hand-rolled raw Anchors
 * here while the public frame's footer composed TextLinks for
 * the same job — one link treatment for public chrome, owned
 * by TextLink.
 *
 * Landmarks (#366): on web this footer is the page's
 * `contentinfo` landmark (via `contentInfoRoleProps`) —
 * LegalDocumentPage renders it as its outermost footer chrome;
 * native is unaffected.
 */
export function DocumentFooter({ links }: DocumentFooterProps) {
  return (
    <YStack gap="$4" {...contentInfoRoleProps}>
      <Divider />
      <XStack gap="$4" flexWrap="wrap">
        {links.map((link) => (
          <TextLink
            key={link.href}
            href={link.href}
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.medium}
          >
            {link.label}
          </TextLink>
        ))}
      </XStack>
    </YStack>
  );
}
