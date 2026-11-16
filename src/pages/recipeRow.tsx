import type { ReactNode } from "react";
import { Anchor, View, XStack, YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "../widgets/accessibility.js";
import { Badge } from "../widgets/Badge.js";
import { Card } from "../widgets/Card.js";
import { LinkOverlay } from "../widgets/linkOverlay.js";
import { Text } from "../widgets/Text.js";
import { Thumbnail } from "../widgets/Thumbnail.js";

/**
 * The shared recipe row (#657): the row composition RecipesPage's
 * own section and HomePage's recently-viewed list both render —
 * one internal module, never exported from the package (the
 * pages-only rule, #298: consumers consume pages, never the row
 * directly). Extracted from RecipesPage, where it lived as the
 * page-local MediaRow / RatingStars compositions, when HomePage
 * became its second consumer; rendering is unchanged.
 */

/** One own-section recipe row's view-model. The app formats
 * `subtitle` (its list meta line — servings · time ·
 * rating/satiety); the view only renders it. Own-section items
 * are the user's created recipes and the recipes shared with
 * them, in the caller's order (preferred placement is the
 * section's, ordering inside it is the caller's). */
export type RecipeRowItem = {
  id: string;
  /** The recipe's destination (#248's navigation rule: the row
   * navigates, so it is a link): the host composes it from the
   * recipe id — for a shared-with-me recipe, the recipe's
   * permalink. Both of the row's targets (thumbnail and text
   * block) render as links carrying this href. */
  href: string;
  title: string;
  subtitle?: string;
  /** Display rating, 0–5, or null/absent when the recipe is
   * unrated. The app computes it by its display-rating rule
   * (the owner's star rating, else the community average); the
   * view renders it as the row's log-cook control — a rated
   * recipe's stars are the control, an unrated recipe gets an
   * icon-only button — and never formats it into the subtitle,
   * so an app that passes `rating` keeps the rating text out
   * of `subtitle`. */
  rating?: number | null;
  imageUrl?: string | null;
  /** Caller-supplied marker distinguishing this item inside the
   * own section — the shared-with-me badge (#415): the host
   * passes its shared label (e.g. "Shared with you") for
   * recipes someone shared with the user and omits it for
   * recipes the user created. The view renders it as a badge
   * on the row and folds it into the row's accessible name; it
   * never invents the copy or decides which items earn it. */
  badgeLabel?: string;
  /** Whether the user may log a cook for this item. The host
   * sets it `false` for rows the user cannot log cooks for —
   * shared-with-me rows (cook logs are owner-only in the host)
   * — and the row then renders no log-cook control at all; the
   * row stays a link with its badge and accessory behavior
   * unchanged. Absent or `true` keeps the control, exactly as
   * before. This is a capability the host computes, deliberately
   * NOT inferred from `badgeLabel`: the badge is a display
   * marker, and a badged-but-cookable row must stay expressible. */
  canLogCook?: boolean;
};

type RecipeRowProps = {
  item: RecipeRowItem;
  /** Log-cook callback (the RecipesPage semantics): absent, or
   * the item's `canLogCook` false, renders no log-cook control;
   * an accessory also suppresses it (the accessory owns the
   * row's action surface). */
  onLogCookPress?: ((recipeId: string) => void) | undefined;
  accessory?: ReactNode;
};

/**
 * One recipe row: a link to the item's href carrying the shared
 * MediaRow composition, with the RatingStars log-cook control as
 * its subtitle action — pressable stars on a rated recipe, a
 * single icon-only star button on an unrated one. No Delete
 * control and no "Log cook" text button exist in the row
 * (Stephen's 2026-10-24 ruling).
 */
export function RecipeRow({ item, onLogCookPress, accessory }: RecipeRowProps) {
  const hasAccessory = accessory !== null && accessory !== undefined;
  return (
    <MediaRow
      href={item.href}
      title={item.title}
      subtitle={item.subtitle}
      badgeLabel={item.badgeLabel}
      imageUrl={item.imageUrl}
      subtitleAction={
        onLogCookPress && !hasAccessory && item.canLogCook !== false ? (
          <RatingStars
            rating={item.rating}
            accessibilityLabel={
              item.rating !== null && item.rating !== undefined && item.rating > 0
                ? `Log a cook of ${item.title}, rated ${item.rating} out of 5 stars`
                : `Log a cook of ${item.title}`
            }
            onPress={() => {
              onLogCookPress(item.id);
            }}
          />
        ) : undefined
      }
      accessory={hasAccessory ? accessory : undefined}
    />
  );
}

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
export const textBlockStyle = { flexGrow: 1, flexShrink: 1, flexBasis: 60, minWidth: 0 } as const;

type MediaRowProps = {
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
  /** Optional caller-supplied marker (the item's `badgeLabel` —
   * the shared-with-me badge, #415): rendered as a Badge under
   * the subtitle line and folded into the text link's
   * accessible name after the subtitle, so the row announces
   * its marker ("Title, Subtitle, Shared with you") instead of
   * leaving it as unannounced decoration inside a link whose
   * label overrides its content. */
  badgeLabel?: string | undefined;
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
 * The own section's media row: an elevated card holding a 64px
 * thumbnail (or the placeholder well), the title and optional
 * subtitle, an optional caller-supplied badge under the
 * subtitle, and an optional accessory after the row. Composed
 * here in the page from the shared Card, Thumbnail, Text,
 * Badge, and LinkOverlay components (Stephen's tranche rule,
 * 2026-10-29: single-page compositions live in the page, not
 * the library); the row renderer supplies only domain content
 * (href, title, subtitle, badge, image) and slots
 * (subtitleAction, accessory).
 *
 * Both navigation targets are links carrying the row's href
 * (#248) and an accessible name built from the title: the media
 * target wraps only an image (or an empty placeholder), so
 * without the label a screen reader meets an unidentified link
 * for every row; the text target's label also carries the
 * subtitle and the badge when present. A subtitleAction is a
 * third press target nested in the text block's subtitle flow.
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
function MediaRow({
  href,
  title,
  subtitle,
  badgeLabel,
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
  // presses. The badge is display-only, so its row is
  // pointer-transparent on native for the same reason.
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
      {badgeLabel ? (
        <XStack
          paddingTop="$1"
          accessible={native ? false : undefined}
          importantForAccessibility={native ? "no-hide-descendants" : undefined}
          pointerEvents={native ? "none" : undefined}
        >
          <Badge tone="info">{badgeLabel}</Badge>
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
  const labelParts = [title];
  if (subtitle) labelParts.push(subtitle);
  if (badgeLabel) labelParts.push(badgeLabel);
  const textLabel = labelParts.join(", ");
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

const STAR_STEPS = [1, 2, 3, 4, 5] as const;

type RatingStarsBase = {
  /** Display rating, 0–5, or null/absent when unrated. The app
   * computes it by its display-rating rule; the composition
   * renders it and never formats it into text. */
  rating?: number | null | undefined;
};

type RatingStarsProps =
  | (RatingStarsBase & { onPress?: undefined; accessibilityLabel?: string | undefined })
  | (RatingStarsBase & { onPress: () => void; accessibilityLabel: string });

/**
 * A five-star display rating in the DS star language (the
 * StarRatingInput glyph treatment at reading size): ★ in
 * warning amber when filled, gray when not. The rating is a
 * display average as often as a personal star count, so the
 * stars fill by rounding to the nearest whole star. No
 * lineHeight is set on the glyphs (the #162 containment rule).
 *
 * With `onPress` the stars become the button for an action on
 * the rated item — a list row whose rating is its log-cook
 * control is the shape this serves. A rated item renders its
 * five stars as the button; an unrated item renders a single
 * unfilled star, no text — one glyph, same tone. The press
 * handler cancels the click's default action before firing:
 * the control typically renders inside a link (a row's text
 * target), and on web the platform press handling stops the
 * click's propagation but does not cancel its default, so
 * without the cancellation the wrapping anchor would also
 * navigate. On native the call is inert — the innermost press
 * target wins the responder. The button form requires its
 * accessible name in the type (the stars alone would announce
 * as a rating, not as the action they trigger), and it is
 * keyboard-operable on web: a focus stop with Enter/Space
 * activation (the CardRow pattern — a plain stack with onPress
 * is not a tab stop).
 */
function RatingStars(props: RatingStarsProps) {
  if (!props.onPress) {
    return <RatingStarRow rating={props.rating} />;
  }
  const { rating, onPress, accessibilityLabel } = props;
  const handlePress = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    onPress();
  };
  const handleKeyDown = (event: { key: string; preventDefault: () => void; repeat?: boolean }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      // A held key repeats keydown — activate once, not per repeat.
      if (!event.repeat) onPress();
    }
  };
  return (
    // Touch-target geometry for the pressable form: a ≥44dp
    // target centering its glyphs (the StarRatingInput
    // precedent).
    <YStack
      minWidth={44}
      minHeight={44}
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      onPress={handlePress}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...platformAccessibilityProps({
        accessibilityRole: "button",
        accessibilityLabel,
      })}
    >
      {rating !== null && rating !== undefined && rating > 0 ? (
        <RatingStarRow rating={rating} />
      ) : (
        <Text style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.gray.gray4 }}>
          ★
        </Text>
      )}
    </YStack>
  );
}

/** The five glyphs themselves, filled by the rounded rating. */
function RatingStarRow({ rating }: { rating?: number | null | undefined }) {
  const filled =
    rating !== null && rating !== undefined && rating > 0
      ? Math.min(5, Math.max(1, Math.round(rating)))
      : 0;
  return (
    <XStack gap={tokens.spacing[1]} alignItems="center">
      {STAR_STEPS.map((star) => (
        <Text
          key={star}
          style={{
            fontSize: tokens.typography.fontSize.lg,
            color: star <= filled ? tokens.colors.warning.warning6 : tokens.colors.gray.gray4,
          }}
        >
          ★
        </Text>
      ))}
    </XStack>
  );
}
