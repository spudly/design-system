import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { COLUMN_MAX_WIDTH } from "./PublicFrameLayout.js";
import { Text } from "./Text.js";
import { TextLink } from "./TextLink.js";

export type PublicFrameFooterProps = {
  /** The footer's note (the frame's DS-owned copy, passed in). */
  note: string;
  /** Privacy link label (the frame's DS-owned copy, passed in). */
  privacyLabel: string;
  /** The privacy route's href — the link navigates, so it is a link. */
  privacyHref: string;
  /** Terms link label (the frame's DS-owned copy, passed in). */
  termsLabel: string;
  /** The terms route's href — the link navigates, so it is a link. */
  termsHref: string;
};

/**
 * The public frame's footer band (#119): a surface band with a
 * hairline top border, holding the frame's note and its legal
 * links at the ends of the wide public column (COLUMN_MAX_WIDTH),
 * wrapping when the column is narrow. Extracted from
 * PublicPageFrame for the #119 page de-styling program — the
 * band's fill, border, column geometry, and text treatments are
 * the frame's design, owned here; the copy crosses as props.
 *
 * The legal links are TextLink href forms (#119 dedupe,
 * cluster B7): the tranche's first cut crossed them as intent
 * callbacks while the document surface's footer
 * (DocumentFooter) crossed the same links as `{label, href}`
 * data — two contracts for one job. #248's navigation rule
 * settles it: a control that navigates is a link with an href,
 * so the canonical contract is hrefs in, on both surfaces.
 */
export function PublicFrameFooter({
  note,
  privacyHref,
  termsHref,
  privacyLabel,
  termsLabel,
}: PublicFrameFooterProps) {
  return (
    <YStack backgroundColor="$surface" borderTopWidth={1} borderColor={tokens.colors.gray.gray2}>
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
          <TextLink fontSize={tokens.typography.fontSize.sm} href={privacyHref}>
            {privacyLabel}
          </TextLink>
          <TextLink fontSize={tokens.typography.fontSize.sm} href={termsHref}>
            {termsLabel}
          </TextLink>
        </XStack>
      </XStack>
    </YStack>
  );
}
