import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { COLUMN_MAX_WIDTH } from "./PublicFrameLayout.js";
import { contentInfoRoleProps } from "./accessibility.js";
import { Text } from "./Text.js";
import { TextLink } from "./TextLink.js";

export type PublicFrameFooterLink = {
  label: string;
  /** The link's href — footer links navigate, so they are links. */
  href: string;
};

export type PublicFrameFooterProps = {
  /** The footer's note (the frame's DS-owned copy, passed in). */
  note: string;
  /** The footer's links (the host's legal routes and any other
   * footer navigation), rendered in the order given. Which
   * links exist — privacy, terms, anything else — is the host's
   * content decision, never the component's: no link label or
   * href is hardcoded here (Stephen's ruling on PR #320; the
   * same caller-supplied-data contract as DocumentFooter). */
  links: PublicFrameFooterLink[];
};

/**
 * The public frame's footer band (#119): a surface band with a
 * hairline top border, holding the frame's note and its links
 * at the ends of the wide public column (COLUMN_MAX_WIDTH),
 * wrapping when the column is narrow. Extracted from
 * PublicPageFrame for the #119 page de-styling program — the
 * band's fill, border, column geometry, and text treatments are
 * the frame's design, owned here; the copy crosses as props.
 *
 * The links are TextLink href forms (#119 dedupe, cluster B7):
 * the tranche's first cut crossed them as intent callbacks
 * while the document surface's footer (DocumentFooter) crossed
 * the same links as `{label, href}` data — two contracts for
 * one job. #248's navigation rule settles it: a control that
 * navigates is a link with an href, so the canonical contract
 * is hrefs in, on both surfaces — and which links those are is
 * the caller's data, so the footer takes the `links` array
 * rather than naming any route itself.
 *
 * Landmarks (#366): on web this band is the page's
 * `contentinfo` landmark (via `contentInfoRoleProps`); native
 * is unaffected.
 */
export function PublicFrameFooter({ note, links }: PublicFrameFooterProps) {
  return (
    <YStack
      backgroundColor="$surface"
      borderTopWidth={1}
      borderColor={tokens.colors.gray.gray2}
      {...contentInfoRoleProps}
    >
      <XStack
        width="100%"
        maxWidth={COLUMN_MAX_WIDTH}
        alignSelf="center"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        gap="$3"
        paddingHorizontal="$6"
        paddingVertical="$4"
      >
        <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray6}>
          {note}
        </Text>
        <XStack flexWrap="wrap" gap="$4">
          {links.map((link) => (
            <TextLink key={link.href} fontSize={tokens.typography.fontSize.sm} href={link.href}>
              {link.label}
            </TextLink>
          ))}
        </XStack>
      </XStack>
    </YStack>
  );
}
