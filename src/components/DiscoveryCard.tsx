import { Anchor, Image, View, YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Card } from "./Card.js";
import { Text } from "./Text.js";

/**
 * DiscoveryCard (#168): one public-catalog recipe as a standalone
 * widget — thumbnail, title, and the app's pre-formatted subtitle
 * line ("By {author} · {rating} · {satiety}") — that DiscoverPage
 * composes into its list and other discovery surfaces can reuse
 * (it is the natural card for a MasonryGrid discovery layout).
 * Stephen's decision (2026-10-28) made the card a widget in its
 * own right rather than a row composed privately inside the page.
 *
 * Navigation is a real link, per the navigation rule (Stephen,
 * 2026-10-28: a control that navigates to another page is a link
 * with an href; anything else is a button with a callback). The
 * host builds the permalink (`/recipe/{id}/{slug}`) and passes it
 * in as `href` — the slug never enters this component's props,
 * and there is deliberately no press callback: on web the card
 * renders a real anchor, so crawlers can follow it and readers
 * keep open-in-new-tab / copy-link. In-page actions belong on
 * buttons elsewhere; this card has none.
 *
 * Platform shape: on web the whole card is Tamagui's Anchor (a
 * real `<a href>` element) wrapping the card surface. On native
 * an href has no router to resolve against — the public catalog
 * is a web-only surface and no native screen consumes this
 * widget today — so the same card surface renders inside a plain
 * view carrying link semantics (role + the "title, subtitle"
 * accessible name, the RecipesPage row-label rule), for storybook
 * and visual-regression parity. The widget cannot open the URL
 * itself on native: components may not import react-native (the
 * root entry must stay importable in plain Node), so Linking is
 * out of reach here by design.
 *
 * The text block carries the RecipesPage rows' narrow-width
 * geometry (#205): flexBasis 60 with shrink, so on a ~314dp-wide
 * viewport the fixed 64dp thumbnail cannot starve the text column
 * to zero width.
 */
export type DiscoveryCardProps = {
  /** The recipe's title — the card's primary line and, with the
   * subtitle, its accessible name. */
  title: string;
  /** App-formatted single line: "By {author} · {rating} ·
   * {satiety}". The app composes it with its own helpers (author
   * fallback, rating/satiety labels); the card never formats raw
   * fields. Absent renders the title alone. */
  subtitle?: string;
  /** Thumbnail URL, or null/absent for the placeholder block. */
  imageUrl?: string | null | undefined;
  /** The recipe's permalink, built by the host (e.g.
   * `/recipe/{id}/{slug}`). The card is an anchor to this URL on
   * web — see the header note. */
  href: string;
};

// Structural flex only, mirroring the RecipesPage rows: the text
// block expands and may shrink within the row, and the explicit
// flexBasis is the #205 guard — with a plain `flex: 1` the basis
// is 0, so on narrow viewports the fixed thumbnail consumes the
// row and the text block collapses to ~0dp wide (text paints
// nothing yet measures extremely tall). A 60dp basis gives the
// block a real line-breaking size; at ordinary widths nothing
// changes.
const textBlockStyle = { flexGrow: 1, flexShrink: 1, flexBasis: 60, minWidth: 0 } as const;

function Thumbnail({ imageUrl }: { imageUrl?: string | null | undefined }) {
  return imageUrl ? (
    <Image
      src={imageUrl}
      alt=""
      width="$16"
      height="$16"
      borderRadius={tokens.radii.md}
      backgroundColor={tokens.colors.gray.gray1}
      objectFit="cover"
    />
  ) : (
    <View
      width="$16"
      height="$16"
      borderRadius={tokens.radii.md}
      backgroundColor={tokens.colors.gray.gray2}
    />
  );
}

export function DiscoveryCard({ title, subtitle, imageUrl, href }: DiscoveryCardProps) {
  const card = (
    <Card variant="elevated" flexDirection="row" flexWrap="wrap" alignItems="center" gap="$3">
      <Thumbnail imageUrl={imageUrl} />
      <YStack style={textBlockStyle} gap="$1">
        <Text fontWeight={tokens.typography.fontWeight.semibold}>{title}</Text>
        {subtitle ? <Text variant="hint">{subtitle}</Text> : null}
      </YStack>
    </Card>
  );
  if (isWeb) {
    // The anchor is the card's link: no underline (this is a card,
    // not prose) and no color of its own — the card's texts carry
    // their own ink. The browser gives the anchor its accessible
    // name from the card's text content.
    return (
      <Anchor href={href} textDecorationLine="none">
        {card}
      </Anchor>
    );
  }
  return (
    <View
      {...platformAccessibilityProps({
        accessibilityRole: "link",
        accessibilityLabel: subtitle ? `${title}, ${subtitle}` : title,
      })}
    >
      {card}
    </View>
  );
}
