import type { ReactNode } from "react";
import { Anchor, View, XStack, YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Card } from "./Card.js";
import { LinkOverlay } from "./linkOverlay.js";
import { Text } from "./Text.js";
import { Thumbnail } from "./Thumbnail.js";

// Structural flex only: the card's text block expands and may shrink
// within the row (mirrors the app's ThumbnailListCard). The explicit
// flexBasis matters (eciperay #205): with a plain `flex: 1` the basis
// is 0, so on narrow viewports (e.g. a phone at the largest display
// size, ~314dp wide) the row's fixed child — the 64dp thumbnail —
// and any trailing row item consume the entire row and the text
// block collapses to ~0dp wide. Text measured at ~0 width paints
// nothing yet measures extremely tall, which stretched the card past
// the viewport with only the thumbnail visible. A 60dp basis gives
// the row a real line-breaking size, and the text block grows to
// fill its line. (A row action is not a row item at all — it renders
// inline inside this block; see subtitleAction.) At ordinary widths
// nothing changes — the basis is below the width the block already
// gets, so it still just expands.
const textBlockStyle = { flexGrow: 1, flexShrink: 1, flexBasis: 60, minWidth: 0 } as const;

export type MediaRowProps = {
  /** Row detail href. Both the media and the title/subtitle
   * text are links to it (two independent targets, per the
   * design system's link rules — cards are never pressable). */
  href: string;
  /** The row's title — the accessible name of the media link,
   * and the lead of the text link's composed name. */
  title: string;
  /** Optional secondary line under the title (counts, times,
   * attribution — the caller composes the string). It joins
   * the text link's accessible name ("Title, Subtitle"): a
   * title-only label would override the name React Native
   * derives from its Text children and drop the subtitle
   * announcement. */
  subtitle?: string | undefined;
  /** Optional image URL; absent renders the placeholder well. */
  imageUrl?: string | null | undefined;
  /** Optional control rendered inline in the subtitle flow
   * (after the subtitle text, wrapping with it) — a row action
   * that reads as part of the subtitle line, e.g. a RatingStars
   * log-cook control. It renders inside the text link, so it
   * must cancel its press's default action (the RatingStars
   * contract) to keep the press from also navigating. */
  subtitleAction?: ReactNode;
  /** Optional accessory rendered after the row, inside the list
   * item — an expanded inline form belongs to the row it
   * belongs to. It renders in the same under-row padded wrapper
   * shape the card itself sits in. */
  accessory?: ReactNode;
};

/**
 * A media list row: an elevated card holding a 64px thumbnail
 * (or the placeholder well), the title and optional subtitle,
 * and an optional accessory after the row. Extracted from the
 * recipe list (#119) — the cookbook / media-catalog row shape,
 * domain-free: the caller supplies title, subtitle, image, and
 * the detail href.
 *
 * Both navigation targets are links carrying the row's href
 * (#248) and an accessible name built from the title: the media
 * target wraps only an image (or an empty placeholder), so
 * without the label a screen reader meets an unidentified link
 * for every row; the text target's label also carries the
 * subtitle when present. A subtitleAction is a third press
 * target nested in the text block's subtitle flow.
 *
 * On native the anchors are Texts and cannot carry these view
 * subtrees (the text block's texts would flow inline and the
 * thumbnail would be measured as text), so both targets
 * platform-split (see LinkOverlay): view-level frames carry the
 * content, and childless anchors stretched over the frames
 * carry the hrefs. The media frame's overlay renders last
 * (topmost, the standard layering); the text frame nests the
 * subtitle action, so its overlay renders underneath and the
 * frame's non-interactive content is pointer-transparent — the
 * action stays nested in the subtitle flow and keeps its own
 * presses.
 */
export function MediaRow({
  href,
  title,
  subtitle,
  imageUrl,
  subtitleAction,
  accessory,
}: MediaRowProps) {
  // The native rendering (`native` true) makes two adjustments
  // for the text frame's LinkOverlay: the visible texts are
  // decorative for accessibility (the overlay's composed label
  // is the row's one stop) and pointer-transparent, so native
  // hit testing falls through them to the overlay beneath,
  // while the subtitle action — which keeps the default pointer
  // events inside the box-none flow — still takes its own
  // presses.
  const renderTextContent = (native: boolean) => (
    <>
      <Text
        fontWeight={tokens.typography.fontWeight.semibold}
        accessible={native ? false : undefined}
        importantForAccessibility={native ? "no-hide-descendants" : undefined}
        pointerEvents={native ? "none" : undefined}
      >
        {title}
      </Text>
      {/* The subtitle line is a wrapping inline flow inside the
        text block: the subtitle text first, the subtitle action
        immediately after it (right after the subtitle's final
        segment). The action flows with the text — when the line
        is full it wraps onto the next line of the block, at the
        block's full width — instead of sitting in the card row
        as a third flex item whose fixed width starved this
        block (the #205 failure, seen again in PR #120's narrow
        captures). */}
      {subtitle || subtitleAction ? (
        <XStack
          flexWrap="wrap"
          alignItems="center"
          gap="$1"
          paddingTop="$1"
          pointerEvents={native ? "box-none" : undefined}
        >
          {subtitle ? (
            <Text
              variant="hint"
              accessible={native ? false : undefined}
              importantForAccessibility={native ? "no-hide-descendants" : undefined}
              pointerEvents={native ? "none" : undefined}
            >
              {subtitle}
            </Text>
          ) : null}
          {subtitleAction}
        </XStack>
      ) : null}
    </>
  );
  const textContent = renderTextContent(false);
  const media = imageUrl ? (
    <Thumbnail src={imageUrl} variant="row" />
  ) : (
    <View
      width="$16"
      height="$16"
      borderRadius={tokens.radii.md}
      backgroundColor={tokens.colors.gray.gray2}
    />
  );
  const textLabel = subtitle ? `${title}, ${subtitle}` : title;
  return (
    <>
      <YStack paddingBlockEnd="$3">
        <Card variant="elevated" flexDirection="row" flexWrap="wrap" alignItems="center" gap="$3">
          {isWeb ? (
            <Anchor
              href={href}
              textDecorationLine="none"
              display="web:flex"
              {...platformAccessibilityProps({
                accessibilityRole: "link",
                accessibilityLabel: title,
              })}
            >
              {media}
            </Anchor>
          ) : (
            <View position="relative">
              {media}
              <LinkOverlay href={href} accessibilityRole="link" accessibilityLabel={title} />
            </View>
          )}
          {isWeb ? (
            <Anchor
              href={href}
              textDecorationLine="none"
              display="web:flex"
              flexDirection="column"
              style={textBlockStyle}
              {...platformAccessibilityProps({
                accessibilityRole: "link",
                accessibilityLabel: textLabel,
              })}
            >
              {textContent}
            </Anchor>
          ) : (
            <YStack style={textBlockStyle} position="relative">
              <LinkOverlay href={href} accessibilityRole="link" accessibilityLabel={textLabel} />
              {renderTextContent(true)}
            </YStack>
          )}
        </Card>
      </YStack>
      {accessory ? <YStack paddingBlockEnd="$3">{accessory}</YStack> : null}
    </>
  );
}
