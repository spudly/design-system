import { Anchor, View, isWeb } from "tamagui";
import { Col } from "../layout/Col.js";
import { tokens } from "../../tokens/index.js";
import { platformAccessibilityProps } from "../accessibility.js";
import { BoxSkeleton } from "../feedback/BoxSkeleton.js";
import { Card } from "../layout/Card.js";
import { useLoadingScope } from "../../contexts/LoadingScope.js";
import { Dropdown, useDropdownClose } from "../form/Dropdown.js";
import { DropdownButton } from "../form/DropdownButton.js";
import { Row } from "../layout/Row.js";
import { Text } from "../data/Text.js";
import { TextSkeleton } from "../feedback/TextSkeleton.js";
import { Thumbnail } from "../data/Thumbnail.js";

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
 * keep open-in-new-tab / copy-link. Per-card actions (#791) are
 * the one exception, and they are not a press callback on the
 * card: the host passes them as data (`actions`) and the card
 * renders them in its own overflow menu, a sibling of the link —
 * never nested inside it — so choosing an action cannot trigger
 * the card's navigation.
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
/**
 * One per-card action the host offers on a discovery card
 * (spudly/design-system#791): plain data — a stable `id`, the
 * caller-supplied `label` the menu row shows, and the callback
 * fired when the row is chosen. The DS owns the menu's design and
 * behavior; no app domain concepts (no "not interested" / "show
 * less" literals) live in this type — labels and behavior are the
 * host's data, per the DS extraction rule.
 */
export type DiscoveryCardAction = {
  id: string;
  label: string;
  onSelect: () => void;
};

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
  /** Loading state (#278): the card renders a box skeleton at
   * the thumbnail's exact geometry and text skeletons in place
   * of its title/subtitle, with no link. An enclosing
   * composite's LoadingScope can also put the card into this
   * state without prop-drilling. */
  loading?: boolean;
  /** Per-card actions (#791): when present and non-empty, the
   * card renders an overflow-menu button (named "Actions for
   * <title>") over its trailing edge, opening a DS-owned menu of
   * these actions; choosing one fires its `onSelect` and closes
   * the menu. The menu control is a sibling of the card's link —
   * never nested inside it — so activating it cannot trigger the
   * card's navigation. Absent or empty renders the card exactly
   * as before. */
  actions?: DiscoveryCardAction[];
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

// The card's thumbnail slot: the shared Thumbnail's row variant
// when the recipe has an image, the same-size placeholder block
// when it does not. The image is decorative — the card's
// accessible name is its title and subtitle — and it renders
// through the shared component rather than a local Image so it
// carries that component's platform-split decorative treatment:
// `alt=""` on web, no `alt` on native, where React Native's Image
// turns any non-null alt into an accessible element carrying
// that (empty) label. A local `alt=""` Image was verified against
// the Android accessibility tree in #349 to surface as its own
// focusable, unnamed element inside the card — the card's native
// link grouping does not mask it. The row variant's geometry is
// the helper's own (64dp square, cover crop, medium radius, gray
// well), so the render is unchanged.
function CardThumbnail({ imageUrl }: { imageUrl?: string | null | undefined }) {
  return imageUrl ? (
    <Thumbnail src={imageUrl} variant="row" />
  ) : (
    <View
      width="$16"
      height="$16"
      borderRadius={tokens.radii.md}
      backgroundColor={tokens.colors.gray.gray2}
    />
  );
}

/** One row of the card's actions menu (#791): a button carrying
 * the action's caller-supplied label; activation fires the
 * action's callback and closes the menu (the Dropdown family's
 * close-on-select affordance). Mirrors the Dropdown stories'
 * menu-row composition — role, label, Enter/Space activation,
 * and the 44dp minimum row height. */
function DiscoveryCardActionRow({ action }: { action: DiscoveryCardAction }) {
  const close = useDropdownClose();
  const activate = () => {
    action.onSelect();
    close();
  };
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };
  return (
    <Row
      {...platformAccessibilityProps({
        accessibilityRole: "button",
        accessibilityLabel: action.label,
      })}
      onPress={activate}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      cursor="web:pointer"
      middle
      gap="s"
      px="m"
      py="s"
      minHeight={44}
      borderRadius={tokens.radii.md}
    >
      <Text>{action.label}</Text>
    </Row>
  );
}

/** The card's overflow menu (#791): the DS Dropdown shell with an
 * icon-only ghost trigger named for the card ("Actions for
 * <title>"), end-aligned as card-overflow menus are. Focus return
 * to the trigger on close is the shell's own behavior. */
function DiscoveryCardActionsMenu({
  title,
  actions,
}: {
  title: string;
  actions: DiscoveryCardAction[];
}) {
  const label = `Actions for ${title}`;
  return (
    <Dropdown
      accessibilityLabel={label}
      align="end"
      trigger={<DropdownButton icon="more" accessibilityLabel={label} ghost size="sm" />}
    >
      <Col>
        {actions.map((action) => (
          <DiscoveryCardActionRow key={action.id} action={action} />
        ))}
      </Col>
    </Dropdown>
  );
}

export function DiscoveryCard({
  title,
  subtitle,
  imageUrl,
  href,
  loading = false,
  actions,
}: DiscoveryCardProps) {
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    // Loading (#278): the same card geometry — a 64dp box where
    // the thumbnail sits and structured text skeletons at the
    // title's and subtitle's sizes — with no link and the region
    // marked busy.
    return (
      <Card
        variant="elevated"
        flexDirection="row"
        flexWrap="wrap"
        alignItems="center"
        gap="m"
        {...platformAccessibilityProps({ accessibilityState: { busy: true } })}
      >
        <BoxSkeleton width={64} height={64} />
        <Col style={textBlockStyle} gap="xs">
          <TextSkeleton size="md" lines={1} />
          {subtitle ? <TextSkeleton size="sm" lines={1} /> : null}
        </Col>
      </Card>
    );
  }
  const card = (
    <Card variant="elevated" flexDirection="row" flexWrap="wrap" alignItems="center" gap="m">
      <CardThumbnail imageUrl={imageUrl} />
      <Col style={textBlockStyle} gap="xs">
        <Text fontWeight={tokens.typography.fontWeight.semibold}>{title}</Text>
        {subtitle ? <Text variant="hint">{subtitle}</Text> : null}
      </Col>
    </Card>
  );
  const linked = isWeb ? (
    // The anchor is the card's link: no underline (this is a card,
    // not prose) and no color of its own — the card's texts carry
    // their own ink. The browser gives the anchor its accessible
    // name from the card's text content.
    <Anchor href={href} textDecorationLine="none">
      {card}
    </Anchor>
  ) : (
    <View
      {...platformAccessibilityProps({
        accessibilityRole: "link",
        accessibilityLabel: subtitle ? `${title}, ${subtitle}` : title,
      })}
    >
      {card}
    </View>
  );
  if (actions === undefined || actions.length === 0) {
    return linked;
  }
  // With actions (#791): the overflow menu is a SIBLING of the
  // link, overlaid on the card's trailing edge — an interactive
  // control nested inside the card's anchor would be invalid
  // markup and would navigate on activation. The wrapper carries
  // no styling of its own beyond positioning the overlay.
  return (
    <View position="relative">
      {linked}
      <View position="absolute" top={tokens.spacing[2]} right={tokens.spacing[2]}>
        <DiscoveryCardActionsMenu title={title} actions={actions} />
      </View>
    </View>
  );
}
