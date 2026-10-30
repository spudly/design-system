import { Anchor, XStack, YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { LinkOverlay } from "./linkOverlay.js";
import { Text } from "./Text.js";

type CardRowOwnProps = {
  /** The row's title. */
  title: string;
  /** The row's meta line, pre-composed by the caller; omit to
   * render the title alone. */
  subtitle?: string;
  /** Optional trailing action: the action button renders only
   * when both the label and the callback are provided. */
  actionLabel?: string;
  /** Optional trailing action press. */
  onActionPress?: () => void;
  /** The action button's treatment: `neutral` (the default) is
   * the plain secondary button; `danger` inks it in the soft
   * danger tones for destructive actions. */
  actionTone?: "danger" | "neutral";
};

/**
 * The row's two activation forms, discriminated by `href` (the
 * Button pattern, #248's navigation rule):
 * - Press form: pass `onPress`; the text block is a pressable
 *   view carrying the button role.
 * - Link form: pass `href` (and no `onPress`); the row
 *   navigates, so the text block renders as a real link — an
 *   anchor on web, and on native a view frame with a LinkOverlay
 *   carrying the href (see LinkOverlay for why).
 */
export type CardRowProps = CardRowOwnProps &
  ({ onPress: () => void; href?: undefined } | { href: string; onPress?: never });

/**
 * A titled card row for lists (MealPlansPage's plan rows render
 * through it): an elevated card whose text block — title over an
 * optional meta line — is the activation target, with an optional
 * trailing action button beside it. The row owns its layout, its
 * activation area, and the action's treatment so pages compose
 * rows without styling them (#119); all content — title, meta
 * line, action label — is caller-supplied, so the row serves any
 * app's lists. The row carries no spacing outside its card:
 * separation between rows is the composing stack's (CardStack's
 * gap), never the row's own padding.
 *
 * The press form's text block is a Tamagui view, not a React
 * Native Pressable/TouchableOpacity: those map
 * accessibilityRole="button" to a native <button> element on web,
 * whose UA styles center the row's text. A Tamagui pressable
 * renders a div carrying the role (the OptionCard pattern) and
 * keeps the layout. flex/minWidth are structural only: the block
 * expands and may shrink within the row.
 *
 * The link form follows #248's rule — a control that navigates
 * to another page is a link with an href. On web the text block
 * is a Tamagui Anchor (a real link, keyboard-operable by
 * default). On native the anchor is a Text and the stacked texts
 * would flow inline inside it, so the block platform-splits (see
 * LinkOverlay): a YStack frame carries the texts marked
 * decorative, and a childless anchor stretched over it carries
 * the href and the composed label — title and subtitle — as the
 * row's one accessibility stop.
 */
export function CardRow({
  title,
  subtitle,
  onPress,
  href,
  actionLabel,
  onActionPress,
  actionTone = "neutral",
}: CardRowProps) {
  // Web keyboard support for the press form (the TextLink
  // pattern): a div carrying the button role is not
  // keyboard-operable on its own, so it is made focusable and
  // the button activation keys — Enter and Space — invoke the
  // same callback as a press. `tabIndex` and `onKeyDown` are
  // web-only props in Tamagui and are ignored on native, where
  // onPress is the activation path. The link form needs none of
  // this: a real anchor is keyboard-operable by default.
  const handleKeyDown = (event: { key: string; repeat?: boolean; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      // A held key repeats keydown events; a native button does not
      // re-activate on repeats, so only the first event presses.
      if (!event.repeat) {
        onPress?.();
      }
    }
  };
  // `decorative` marks the visible texts non-accessible for the
  // native link rendering, whose LinkOverlay carries the composed
  // label as the row's one accessibility stop (see LinkOverlay).
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
      {href !== undefined ? (
        isWeb ? (
          <Anchor
            flex={1}
            minWidth={0}
            gap="$1"
            href={href}
            textDecorationLine="none"
            display="web:flex"
            flexDirection="column"
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
        )
      ) : (
        <YStack
          flex={1}
          minWidth={0}
          gap="$1"
          {...platformAccessibilityProps({ accessibilityRole: "button" })}
          onPress={onPress}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          cursor="web:pointer"
        >
          {textContent}
        </YStack>
      )}
      {onActionPress && actionLabel ? (
        <XStack paddingInlineStart="$3" alignItems="center">
          <Button
            variant="secondary"
            size="sm"
            {...(actionTone === "danger"
              ? {
                  backgroundColor: tokens.colors.danger.danger1,
                  color: tokens.colors.danger.danger8,
                }
              : {})}
            onPress={onActionPress}
          >
            {actionLabel}
          </Button>
        </XStack>
      ) : null}
    </Card>
  );
}
