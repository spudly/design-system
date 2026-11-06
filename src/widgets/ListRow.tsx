import { Anchor, YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { LinkOverlay } from "./linkOverlay.js";
import { Text } from "./Text.js";

type ListRowOwnProps = {
  /** Optional caller-supplied lead-in rendered in the title line
   * before the title (e.g. a kind label, "Meal · "). */
  prefix?: string;
  /** The row's title. */
  title: string;
  /** Optional caller-supplied suffix rendered in the title line
   * after the title (e.g. " (unavailable)"). */
  titleSuffix?: string;
  /** The row's meta line, pre-composed by the caller; omit to
   * render the title line alone. */
  subtitle?: string;
  /** A disabled row: it does not activate in either form, is
   * not focusable, and is marked disabled for assistive
   * technology. */
  isDisabled?: boolean;
};

/**
 * The row's two activation forms, discriminated by `href` (the
 * Button pattern, #248's navigation rule):
 * - Press form: pass `onPress`; the row is a pressable view
 *   carrying the button role.
 * - Link form: pass `href` (and no `onPress`); the row
 *   navigates, so it renders as a real link — an anchor on web,
 *   and on native a view frame with a LinkOverlay carrying the
 *   href (see LinkOverlay for why).
 */
export type ListRowProps = ListRowOwnProps &
  ({ onPress: () => void; href?: undefined } | { href: string; onPress?: never });

/**
 * A hairline list row (MealPlanDetailPage's entry rows render
 * through it): a title line — an optional caller-supplied prefix,
 * the title, an optional caller-supplied suffix — over an
 * optional meta line, with a hairline below. The row owns its
 * activation area, hairline, and disabled treatment so pages
 * compose rows without styling them (#119); all content is
 * caller-supplied, so the row serves any app's lists.
 *
 * The link form's native rendering marks the visible texts
 * decorative and gives the LinkOverlay the composed label —
 * prefix, title, and suffix, then the subtitle — as the row's
 * one accessibility stop (see LinkOverlay). A disabled row
 * renders as neither form: no activation, no link.
 */
export function ListRow({
  prefix,
  title,
  titleSuffix,
  subtitle,
  isDisabled = false,
  onPress,
  href,
}: ListRowProps) {
  // Web keyboard support for the press form (the CardRow
  // pattern): a view carrying the button role is made focusable
  // and the button activation keys — Enter and Space — invoke
  // the same callback as a press. Web-only props, ignored on
  // native. The link form needs none of this: a real anchor is
  // keyboard-operable by default. A disabled row is not
  // activatable at all: no press, no focus, marked disabled.
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPress?.();
    }
  };
  // `decorative` marks the visible texts non-accessible for the
  // native link rendering, whose LinkOverlay carries the composed
  // label as the row's one accessibility stop (see LinkOverlay).
  const renderRowContent = (decorative: boolean) => (
    <>
      <Text
        accessible={decorative ? false : undefined}
        importantForAccessibility={decorative ? "no-hide-descendants" : undefined}
        fontSize={tokens.typography.fontSize.md}
        fontWeight={tokens.typography.fontWeight.medium}
      >
        {prefix}
        {title}
        {titleSuffix}
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
  const rowContent = renderRowContent(false);
  return (
    <YStack borderBottomWidth={1} borderBottomColor={tokens.colors.gray.gray2}>
      {href !== undefined && !isDisabled ? (
        isWeb ? (
          // The row navigates, so it renders as a real anchor
          // carrying the href (#248) — keyboard-operable on web
          // by default. The anchor is pinned to a web flex column
          // (the BackLink lesson: a text-based anchor is inline
          // on web and would not hold the row's stacked layout).
          <Anchor
            href={href}
            textDecorationLine="none"
            display="web:flex"
            flexDirection="column"
            paddingVertical="$3"
          >
            {rowContent}
          </Anchor>
        ) : (
          // Native: the anchor is a Text, so the stacked row
          // content would flow inline inside it (see
          // LinkOverlay). The row renders in a plain YStack
          // frame, with a childless anchor stretched over it
          // carrying the href; the overlay's label composes the
          // title line and the subtitle when present.
          <YStack paddingVertical="$3" position="relative">
            {renderRowContent(true)}
            <LinkOverlay
              href={href}
              accessibilityRole="link"
              accessibilityLabel={`${prefix ?? ""}${title}${titleSuffix ?? ""}${
                subtitle ? `, ${subtitle}` : ""
              }`}
            />
          </YStack>
        )
      ) : (
        <YStack
          paddingVertical="$3"
          {...(isDisabled
            ? platformAccessibilityProps({ accessibilityState: { disabled: true } })
            : {
                ...platformAccessibilityProps({ accessibilityRole: "button" }),
                onPress,
                tabIndex: 0,
                onKeyDown: handleKeyDown,
                cursor: "web:pointer",
              })}
        >
          {rowContent}
        </YStack>
      )}
    </YStack>
  );
}
