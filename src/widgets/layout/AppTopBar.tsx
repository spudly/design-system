import { Anchor, isWeb, styled, useTheme } from "tamagui";
import { Col } from "./Col.js";
import { Row } from "./Row.js";
import { BrandMark, type BrandMarkName } from "../../icons/BrandMark.js";
import { iconsByName, type IconName } from "../../icons/iconRegistry.js";
import { tokens } from "../../tokens/index.js";
import { navigationRoleProps, platformAccessibilityProps } from "../accessibility.js";
import { BrandLink } from "../actions/BrandLink.js";
import { PageContentColumn } from "./PageContentColumn.js";
import { Button } from "../actions/Button.js";
import { LinkOverlay } from "../linkOverlay.js";
import { Text } from "../data/Text.js";
import { SearchField } from "../form/SearchField.js";

/**
 * AppTopBar (#437): the shared top-bar composition both DS frame
 * pages render — the routed shell (AppShellPage) and the tabbed
 * shell (TabbedShellPage, whose title-only header is this bar
 * with no nav and no actions) — so the two shells are one chrome,
 * not two. The bar owns its design; the brand, nav, and actions
 * are caller DATA (the app owns content, per the ownership
 * model). A view (#438 Part 2's category): internal to this
 * package, NOT exported from the package root; pages compose it.
 *
 * Composition: the brand on the left (a BrandLink home when the
 * brand carries an href — the wordmark always navigates home, a
 * canonical destination, so the link form always applies there;
 * a plain brand treatment when it does not, the TabbedShellPage
 * title case), the nav as a row of real links under a navigation
 * landmark, and the header actions on the right.
 *
 * Nav items navigate to other pages, so every item is a LINK
 * with an href (#248's navigation rule) — there is no callback
 * form. An item may carry an icon NAME (#438 Part 4's registry —
 * data, never a component), resolved here and rendered with
 * the label (left of it on native's row frame, centered over
 * it in the web column stack, #627), decorative (the label is
 * the item's accessible name). The active item — the host derives it from its route
 * and passes `activeItemId` — carries the primary-filled
 * treatment Eciperay's host shell uses today (a primary fill
 * with on-primary ink) and is marked current: `aria-current`
 * on web, the selected accessibility state on native.
 *
 * A nav item is a multi-child link surface (glyph + label), so
 * it renders the established split (see LinkOverlay): on web a
 * real Anchor wraps the row; on native a row frame lays the
 * content out and a childless LinkOverlay stretched over it
 * carries the href and the item's one accessibility stop, with
 * the visible label marked decorative.
 *
 * Header actions follow the same href-vs-callback split as
 * every DS control (#248): an action with an `href` navigates
 * and renders the Button link form; an action with `onPress`
 * acts in place and renders the Button callback form. Both take
 * the ghost treatment — header actions are chrome, not page
 * calls to action.
 *
 * Header search (#542) is caller DATA too, not a render slot:
 * the host supplies the field's accessible name, placeholder,
 * and controlled value plus change/submit callbacks, and the
 * bar renders the DS SearchField between the nav and the
 * actions inside a search landmark (web `role="search"`).
 * Submit is a callback under #248's dynamic-destination
 * exemption — the destination is built from the typed term.
 */

type AppTopBarBrand = {
  /** The brand's wordmark text — the caller's app/site name, as content. */
  label: string;
  /**
   * The brand's home destination. When supplied the wordmark is
   * a BrandLink (a real link home); when omitted it renders in
   * the brand treatment as plain text (the frame-title case:
   * TabbedShellPage's app title, which navigates nowhere).
   */
  href?: string;
  /**
   * The brand's graphic mark, named as data (#726): when the
   * brand has a DS-owned mark, the host names it here and the
   * DS renders its own artwork before the wordmark (inside the
   * BrandLink when the brand carries an href; beside the plain
   * brand treatment when it does not). Brand identity is data
   * only — never a caller-supplied element (Stephen's
   * 2026-11-19 logos ruling). Omit it for a brand with no mark
   * (Memorize, today): the brand renders exactly as before,
   * with no placeholder or empty slot.
   */
  mark?: BrandMarkName;
};

export type AppTopBarNavItem = {
  /** The item's identity — the value `activeItemId` names. */
  id: string;
  /** The item's visible label — also its accessible name. */
  label: string;
  /**
   * The item's destination — a nav item navigates, so it is a
   * link with an href (#248). Native contract (shared by every
   * DS href form): the href is forwarded verbatim to the
   * platform link path, which requires a scheme-bearing URL an
   * installed app can open; root-relative paths are web-form
   * destinations.
   */
  href: string;
  /** The item's icon, as a NAME from the semantic icon set — data, never a component. */
  icon?: IconName;
};

export type AppTopBarAction =
  | {
      /** The action's identity (its list key). */
      id: string;
      /** The action's visible label — also its accessible name. */
      label: string;
      /** The action navigates (#248): it renders the link form. */
      href: string;
      onPress?: never;
    }
  | {
      /** The action's identity (its list key). */
      id: string;
      /** The action's visible label — also its accessible name. */
      label: string;
      /** The action acts in place (#248): it renders the button form. */
      onPress: () => void;
      href?: never;
    };

export type AppTopBarSearch = {
  /** The search input's accessible name — host content (e.g. "Search recipes"). */
  label: string;
  /** The input's placeholder copy. */
  placeholder?: string;
  /**
   * The current term, controlled: the host seeds and reflects
   * it from its route state (Eciperay's host shell reflects the
   * Recipes browse's `q` param), exactly as the host shell
   * does today.
   */
  value: string;
  /** Controlled change out — the SearchField contract. */
  onValueChange: (value: string) => void;
  /**
   * Submit (Enter in the field). A callback, not an href: the
   * destination is built from the term typed at runtime, so no
   * static href exists to link to (#248's dynamic-destination
   * exemption, the same reason create-a-draft is a callback on
   * RecipeDetailPage). The host reads its current value and
   * navigates.
   */
  onSubmit: () => void;
};

export type AppTopBarProps = {
  /** The brand at the bar's left. */
  brand: AppTopBarBrand;
  /** The nav items, in display order. Omit for a brand-only bar. */
  navItems?: AppTopBarNavItem[];
  /** The nav list's accessible name (e.g. "Eciperay sections"). */
  navLabel?: string;
  /** The active nav item's id, or null when no item is current. */
  activeItemId?: string | null;
  /**
   * The header search, as data (#542): when supplied, the bar
   * renders the DS SearchField between the nav and the actions
   * inside a search landmark. Omit or pass null for no search —
   * the bar renders exactly as before.
   */
  search?: AppTopBarSearch | null;
  /** The header actions at the bar's right, in display order. */
  actions?: AppTopBarAction[];
};

const navItemFrameStyles = {
  flexDirection: "row",
  alignItems: "center",
  gap: tokens.spacing[2],
  paddingHorizontal: tokens.spacing[3],
  paddingVertical: tokens.spacing[2],
  minHeight: 44,
  justifyContent: "center",
  borderRadius: tokens.radii.md,
} as const;

const StyledNavLink = styled(Anchor, {
  name: "AppTopBarNavLink",
  ...navItemFrameStyles,
  fontSize: tokens.typography.fontSize.md,
  // A web anchor carries the UA link underline; nav labels have
  // none (the Tabs link-tab pin).
  textDecorationLine: "none",

  variants: {
    active: {
      true: {
        backgroundColor: "$primary",
        color: "$onPrimary",
        fontWeight: tokens.typography.fontWeight.semibold,
      },
      false: {
        color: "$textMuted",
        fontWeight: tokens.typography.fontWeight.regular,
      },
    },
  } as const,
});

/**
 * The web nav item's inner layout (#627): a centered column
 * stack — glyph over label — inside the anchor. The glyph and
 * the raw label string must NOT be direct children of the
 * anchor: a raw text child is laid out inline, not as a flex
 * item, so the glyph landed left of the label's center by an
 * amount that varied with label width. Inside this stack both
 * are real flex items sharing one centered axis. #746 (Option
 * B): the stack is a Col rendered inline at the use site —
 * `center middle gap="xs"` — no styled root.
 */

/**
 * The concrete glyph inks for nav items: the label's theme
 * colors resolved through the active theme (the glyph renders
 * in SVG, where theme token strings do not resolve), with the
 * same fallbacks Tabs' glyph ink uses. Active items take the
 * on-primary role (their label sits on the primary fill);
 * inactive items take $textMuted, their label's color.
 */
function useNavGlyphInks(): { active: string; inactive: string } {
  const theme = useTheme();
  const roleValue = (key: string): string | undefined => {
    const variable = theme[key];
    return typeof variable?.val === "string" ? variable.val : undefined;
  };
  return {
    active: roleValue("onPrimary") ?? "#ffffff",
    inactive: roleValue("textMuted") ?? tokens.colors.gray.gray10,
  };
}

function NavItem({
  item,
  active,
  glyphInks,
}: {
  item: AppTopBarNavItem;
  active: boolean;
  glyphInks: { active: string; inactive: string };
}) {
  const Glyph = item.icon !== undefined ? iconsByName[item.icon] : undefined;
  const glyph = Glyph ? (
    <Glyph size={20} color={active ? glyphInks.active : glyphInks.inactive} />
  ) : null;
  if (isWeb) {
    return (
      <StyledNavLink
        href={item.href}
        active={active}
        cursor="web:pointer"
        {...platformAccessibilityProps({
          accessibilityRole: "link",
          accessibilityLabel: item.label,
        })}
        {...{ "aria-current": active ? ("page" as const) : undefined }}
      >
        <Col center middle gap="xs">
          {glyph}
          <Text
            style={{
              color: active ? "$onPrimary" : "$textMuted",
              fontWeight: active
                ? tokens.typography.fontWeight.semibold
                : tokens.typography.fontWeight.regular,
            }}
          >
            {item.label}
          </Text>
        </Col>
      </StyledNavLink>
    );
  }
  return (
    // The native item frame (#746, Option B): the nav item
    // frame geometry as Row props — centered row, 8px gap,
    // 12px/8px padding, the 44px minimum height, the medium
    // radius, positioned for the LinkOverlay stretched over it;
    // the active item takes the primary fill. No styled root.
    <Row
      middle
      center
      gap="s"
      px="m"
      py="s"
      minHeight={44}
      borderRadius={tokens.radii.md}
      position="relative"
      {...(active ? { backgroundColor: "$primary" } : null)}
    >
      {glyph}
      <Text
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={{
          color: active ? "$onPrimary" : "$textMuted",
          fontWeight: active
            ? tokens.typography.fontWeight.semibold
            : tokens.typography.fontWeight.regular,
        }}
      >
        {item.label}
      </Text>
      <LinkOverlay
        href={item.href}
        accessibilityRole="link"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: active }}
      />
    </Row>
  );
}

/** The shared top bar: brand, nav links, optional header search, and header actions. */
export function AppTopBar({
  brand,
  navItems,
  navLabel,
  activeItemId,
  search,
  actions,
}: AppTopBarProps) {
  const glyphInks = useNavGlyphInks();
  // Desktop content column (#628): the bar's content — brand,
  // nav, search, actions — constrains to the same centered
  // 1200px column as the page body (PageContentColumn), so the
  // header aligns with the content below it. The bar has no
  // background/frame of its own, so wrapping its row is the
  // whole constraint; on native the column is a pass-through.
  return (
    <PageContentColumn>
      <Row wrap middle gap="m">
        {brand.href !== undefined ? (
          <BrandLink
            label={brand.label}
            href={brand.href}
            {...(brand.mark !== undefined ? { mark: brand.mark } : null)}
          />
        ) : brand.mark !== undefined ? (
          <Row middle gap="s">
            <BrandMark mark={brand.mark} size={28} />
            <Text variant="heading">{brand.label}</Text>
          </Row>
        ) : (
          <Text variant="heading">{brand.label}</Text>
        )}
        {navItems !== undefined && navItems.length > 0 ? (
          // The nav list (#564): items wrap onto multiple lines
          // when the bar is narrow instead of overflowing, and
          // the list shrinks (flexShrink + minWidth 0) so long
          // labels ellipsize inside their items rather than
          // pushing the actions off the bar. #746 (Option B):
          // the geometry is Row props at the use site — no
          // styled root.
          <Row
            wrap
            shrink
            middle
            gap="xs"
            minWidth={0}
            {...navigationRoleProps}
            {...platformAccessibilityProps({ accessibilityLabel: navLabel })}
          >
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                active={item.id === activeItemId}
                glyphInks={glyphInks}
              />
            ))}
          </Row>
        ) : null}
        {search !== undefined && search !== null ? (
          <Row grow shrink {...platformAccessibilityProps({ accessibilityRole: "search" })}>
            <SearchField
              grow
              value={search.value}
              onChangeText={search.onValueChange}
              onSubmitEditing={search.onSubmit}
              {...(search.placeholder !== undefined ? { placeholder: search.placeholder } : null)}
              {...platformAccessibilityProps({ accessibilityLabel: search.label })}
            />
          </Row>
        ) : null}
        {actions !== undefined && actions.length > 0 ? (
          <Row wrap middle gap="s" marginLeft="auto">
            {actions.map((action) =>
              action.href !== undefined ? (
                <Button key={action.id} ghost href={action.href}>
                  {action.label}
                </Button>
              ) : (
                <Button key={action.id} ghost onPress={action.onPress}>
                  {action.label}
                </Button>
              ),
            )}
          </Row>
        ) : null}
      </Row>
    </PageContentColumn>
  );
}
