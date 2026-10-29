import { Anchor, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Divider } from "./Divider.js";

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
 * divider above a wrapping row of the frame's legal links, each a
 * real anchor in the link treatment. The divider, the row's wrap
 * behavior, and the link treatment are the frame's design, owned
 * here; the links themselves are the host's content, passed in.
 */
export function DocumentFooter({ links }: DocumentFooterProps) {
  return (
    <YStack gap="$4">
      <Divider />
      <XStack gap="$4" flexWrap="wrap">
        {links.map((link) => (
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
  );
}
