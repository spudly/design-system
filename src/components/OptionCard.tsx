import { Anchor, XStack, YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Card, type CardProps } from "./Card.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { LinkOverlay } from "./linkOverlay.js";
import { Text } from "./Text.js";

export type OptionCardProps = Omit<CardProps, "onPress"> & {
  title: string;
  description?: string;
} & (
    | {
        /** The press (button) form: an in-app action with a callback. */
        onPress: () => void;
        href?: never;
      }
    | {
        /**
         * The href (link) form (#248's navigation rule: a control
         * that navigates to another page is a link with an href):
         * renders a real anchor carrying the href on web; on native
         * a press opens the href through the platform link path.
         * Native contract (shared by every DS href form): the href
         * is forwarded verbatim to `Linking.openURL`, so native
         * hosts pass a scheme-bearing absolute URL (the app's deep
         * link or an https URL), while root-relative paths are web
         * destinations; the host composes the per-platform href.
         */
        href: string;
        onPress?: never;
      }
  );

/**
 * Card that navigates somewhere (e.g. "Manual entry", "Import from
 * URL"). Two forms (#248): pass `href` and the whole card renders
 * inside a real anchor with the link role; pass `onPress` and it
 * is a pressable with `accessibilityRole="button"`. Either way the
 * card keeps a minimum 44px height and a trailing chevron signals
 * navigation.
 */
export function OptionCard({
  title,
  description,
  onPress,
  href,
  accessible,
  accessibilityElementsHidden,
  accessibilityHint,
  accessibilityLabel,
  accessibilityLabelledBy,
  accessibilityLiveRegion,
  accessibilityRole,
  accessibilityState,
  accessibilityValue,
  ...rest
}: OptionCardProps) {
  // `decorative` marks the visible texts non-accessible: the
  // native href form's LinkOverlay carries the card's composed
  // label as the one accessibility stop, so the texts it names
  // must not also surface as separate stops (see LinkOverlay).
  const renderContent = (decorative: boolean) => (
    <XStack alignItems="center" justifyContent="space-between" gap={tokens.spacing[3]}>
      <YStack flex={1} gap={tokens.spacing[1]}>
        <Text variant="subheading" accessible={decorative ? false : undefined}>
          {title}
        </Text>
        {description ? (
          <Text variant="hint" accessible={decorative ? false : undefined}>
            {description}
          </Text>
        ) : null}
      </YStack>
      <Text
        aria-hidden
        accessible={decorative ? false : undefined}
        style={{
          fontSize: tokens.typography.fontSize.xl,
          color: tokens.colors.gray.gray5,
        }}
      >
        ›
      </Text>
    </XStack>
  );
  const content = renderContent(false);
  if (href !== undefined) {
    // The anchor is the card's link: no underline (this is a card,
    // not prose) and no color of its own — the card's texts carry
    // their own ink. The link role and any caller accessibility
    // props ride on the anchor itself (the DiscoveryCard pattern);
    // the card inside is a plain surface.
    const linkA11yProps = platformAccessibilityProps({
      accessible,
      accessibilityElementsHidden,
      accessibilityHint,
      accessibilityLabel,
      accessibilityLabelledBy,
      accessibilityLiveRegion,
      accessibilityRole: accessibilityRole ?? "link",
      accessibilityState,
      accessibilityValue,
    });
    if (isWeb) {
      return (
        // The anchor must be a block-level flex box on web (the
        // BackLink lesson): Anchor is text-based with `display:
        // inline` there, which would shrink the card to its content
        // instead of the press form's full-width row. As a column
        // flex container it stretches the card across, unchanged.
        <Anchor
          href={href}
          textDecorationLine="none"
          display="web:flex"
          flexDirection="column"
          {...linkA11yProps}
        >
          <Card minHeight={44} {...rest}>
            {content}
          </Card>
        </Anchor>
      );
    }
    // Native: the anchor is a Text and cannot hold the card's view
    // subtree (see LinkOverlay) — the card itself is the frame and
    // a childless anchor stretched over it carries the href. The
    // overlay's label defaults to the card's title and description
    // (the name the web anchor derives from its content) when the
    // caller supplied none.
    return (
      <Card minHeight={44} {...rest} position="relative">
        {renderContent(true)}
        <LinkOverlay
          href={href}
          accessible={accessible}
          accessibilityElementsHidden={accessibilityElementsHidden}
          accessibilityHint={accessibilityHint}
          accessibilityLabel={
            accessibilityLabel ?? (description ? `${title}, ${description}` : title)
          }
          accessibilityLabelledBy={accessibilityLabelledBy}
          accessibilityLiveRegion={accessibilityLiveRegion}
          accessibilityRole={accessibilityRole ?? "link"}
          accessibilityState={accessibilityState}
          accessibilityValue={accessibilityValue}
        />
      </Card>
    );
  }
  const a11yProps = platformAccessibilityProps({
    accessible,
    accessibilityElementsHidden,
    accessibilityHint,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityLiveRegion,
    accessibilityRole: accessibilityRole ?? "button",
    accessibilityState,
    accessibilityValue,
  });
  return (
    <Card onPress={onPress} {...a11yProps} minHeight={44} {...rest}>
      {content}
    </Card>
  );
}
