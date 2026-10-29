import { Anchor, YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Card } from "./Card.js";
import { LinkOverlay } from "./linkOverlay.js";
import { Text } from "./Text.js";
import { TextAction } from "./TextAction.js";

export type TextActionCardRowProps = {
  /** The row's main line, and the link's accessible name. */
  title: string;
  /** Optional second line under the title (a hint line). The
   * native overlay's label composes it after the title. */
  subtitle?: string | null;
  /** The link's destination: the row's text block always
   * navigates (the #248 navigation rule — a control that
   * navigates is a link with an href). */
  href: string;
  /** The trailing text action's label. */
  actionLabel: string;
  /** The trailing text action's callback — an action, never a
   * navigation, so it renders as a button-role text control
   * (the #248 ruling: an action never renders in link form). */
  onActionPress: () => void;
};

/**
 * A card row whose text block is a link and whose trailing
 * action is a text action (#119): an elevated card holding a
 * title (and optional subtitle) that navigates, beside a
 * lightweight text control — Delete — that acts in place.
 *
 * CardRow is the sibling shape, not a variant of this one:
 * its trailing action is a full Button. Where the design
 * calls for the action to read as text rather than as a
 * button, this is the row (the #248 ruling recorded on
 * MealsHubPage: the row's Delete stays a TextAction).
 *
 * Link forms, per platform (mirrors CardRow): on web the text
 * block is a real anchor element — keyboard-operable by
 * default — pinned to a web flex column (the BackLink lesson:
 * a text-based anchor is inline on web and would not hold the
 * block's stacked layout). On native the anchor is a Text and
 * the stacked texts would flow inline inside it, so the block
 * platform-splits (see LinkOverlay): a YStack frame with the
 * same structural flex carries the texts, marked decorative,
 * and a childless anchor stretched over it carries the href
 * and the row's one accessibility stop, its label composed
 * from the row's content (title, then subtitle).
 *
 * The row carries no separation of its own: lists stack rows
 * in CardStack, which owns the rhythm between them.
 */
export function TextActionCardRow({
  title,
  subtitle,
  href,
  actionLabel,
  onActionPress,
}: TextActionCardRowProps) {
  // `decorative` marks the visible texts non-accessible for the
  // native link rendering, whose LinkOverlay carries the label
  // as the row's one accessibility stop (see LinkOverlay).
  const renderTextContent = (decorative: boolean) => (
    <>
      <Text
        accessible={decorative ? false : undefined}
        importantForAccessibility={decorative ? "no-hide-descendants" : undefined}
        fontSize={tokens.typography.fontSize.md}
        fontWeight={tokens.typography.fontWeight.semibold}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          variant="hint"
          accessible={decorative ? false : undefined}
          importantForAccessibility={decorative ? "no-hide-descendants" : undefined}
        >
          {subtitle}
        </Text>
      ) : null}
    </>
  );
  const textContent = renderTextContent(false);
  return (
    <Card variant="elevated" flexDirection="row" alignItems="center" gap="$3">
      {isWeb ? (
        <Anchor
          flex={1}
          minWidth={0}
          gap="$1"
          href={href}
          textDecorationLine="none"
          display="web:flex"
          flexDirection="column"
          {...platformAccessibilityProps({
            accessibilityRole: "link",
            accessibilityLabel: title,
          })}
        >
          {textContent}
        </Anchor>
      ) : (
        <YStack flex={1} minWidth={0} gap="$1" position="relative">
          {renderTextContent(true)}
          <LinkOverlay
            href={href}
            accessibilityRole="link"
            accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
          />
        </YStack>
      )}
      <TextAction onPress={onActionPress}>{actionLabel}</TextAction>
    </Card>
  );
}
