import type { ReactNode } from "react";
import { Anchor, ScrollView, isWeb, styled, useTheme } from "tamagui";
import { Row } from "../layout/Row.js";
import { Col } from "../layout/Col.js";
import { tokens } from "../../tokens/index.js";
import { SocialFacebookIcon } from "../../icons/SocialFacebookIcon.js";
import { SocialGithubIcon } from "../../icons/SocialGithubIcon.js";
import { SocialInstagramIcon } from "../../icons/SocialInstagramIcon.js";
import { SocialLinkedinIcon } from "../../icons/SocialLinkedinIcon.js";
import { SocialTwitterIcon } from "../../icons/SocialTwitterIcon.js";
import { SocialYoutubeIcon } from "../../icons/SocialYoutubeIcon.js";
import type { IconComponentProps } from "../../icons/Icon.js";
import { AppStoreBadge } from "../../icons/AppStoreBadge.js";
import { BrandMark, type BrandMarkName } from "../../icons/BrandMark.js";
import { GooglePlayBadge } from "../../icons/GooglePlayBadge.js";
import { PageContentColumn } from "../layout/PageContentColumn.js";
import {
  AppTopBar,
  type AppTopBarAction,
  type AppTopBarNavItem,
  type AppTopBarSearch,
} from "../layout/AppTopBar.js";
import { Text } from "../data/Text.js";
import { TextLink } from "../actions/TextLink.js";
import { contentInfoRoleProps, platformAccessibilityProps } from "../accessibility.js";

/**
 * BigFooter (#410): the fat footer every design-system page renders
 * last — a big brand wordmark, multi-column link lists, app-store
 * links, and social icon links, all from ONE caller-supplied
 * `footer` data object (Stephen's plan adjustments, 2026-11-03).
 *
 * Ownership (standing DS rules): the DS owns the design — this
 * component owns its layout and styles completely and accepts no
 * styling props — and the app owns the content: brand, columns,
 * links, store URLs, and social URLs are caller-supplied data
 * ({label, href} shapes, the #320 ruling); nothing app-specific
 * is hardcoded here. The Legal column is a caller-data convention,
 * not a hardcoded column: a host that wants Privacy / Terms /
 * "Do Not Sell or Share My Personal Information" links passes a
 * column titled "Legal" carrying them.
 *
 * Navigation = real links with hrefs (#248): the wordmark, every
 * column link, every store link, and every social entry renders
 * as a real anchor carrying its href. Social entries are icon
 * links whose accessible name is the entry's label.
 *
 * Brand logo (#688, Stephen's #679 ruling): logos are owned by
 * the design system — BigFooter renders the brand wordmark itself
 * (the brand label as text, inside the brand anchor). The host
 * never supplies rendered logo UI; brand identity reaches the
 * footer as data only (label + href). Since #726 the identity
 * may also name the brand's DS-owned graphic mark (`mark`), which
 * the footer renders from its own artwork beside the wordmark —
 * still data only, never a host-supplied element.
 *
 * Store links (#466, Option A): each entry names its store and
 * renders that store's OFFICIAL badge artwork — Apple's
 * "Download on the App Store" badge or Google's "Get it on
 * Google Play" badge, bundled in the DS (src/icons/AppStoreBadge,
 * src/icons/GooglePlayBadge) at the stores' required sizes with
 * no recoloring or stretching — wrapped in a real anchor whose
 * accessible name is the entry's label. Never a plain text
 * button.
 *
 * Social icons are Feather icons (#410, Stephen's adjustment):
 * an entry names one of the Feather social glyphs the DS ships
 * (facebook, instagram, twitter, youtube, github, linkedin) and
 * the glyph renders through the icons module. Production hosts
 * ship an EMPTY socialLinks array today (no socials exist yet);
 * the component supports the entries whenever a host has them.
 *
 * Layout (#467): below the brand wordmark, a wrapping row holds
 * the link columns on the left and a right-hand column carrying
 * the store links at its top and the social icon row pinned to
 * its bottom (space-between within the stretched column). The
 * right column renders only when it has content.
 *
 * Mobile collapse (Stephen's addendum, 2026-11-03): the link
 * columns live in a wrapping row whose columns carry a 300px
 * flex basis (BIG_FOOTER_COLUMN_BASIS). Below the named stack
 * breakpoint — a 640px-wide footer container
 * (BIG_FOOTER_STACK_BREAKPOINT) — two columns no longer fit side
 * by side, so the columns wrap into a stacked, single-column
 * arrangement, and the right-hand store/social column wraps
 * below the link columns the same way (store links first,
 * socials after). There is no horizontal scroll
 * at any width and every link stays at its full tappable size.
 * Verify in Storybook at a 430px (mobile) width: one column,
 * stacked.
 *
 * Placement: BigFooter is an INTERNAL component — it is not
 * exported from the components barrel or the package (#298,
 * pages-only surface). Page components render it from the page's
 * `footer` prop; the footer data types ARE re-exported from the
 * pages barrel, because page props are the public contract hosts
 * supply data through.
 */

/** A footer navigation link: caller content, rendered as a real link. */
export type BigFooterLink = {
  label: string;
  /** The link's href — footer links navigate, so they are links. */
  href: string;
};

/** One titled column of footer links (e.g. Product, Company, Legal). */
export type BigFooterColumn = {
  title: string;
  links: BigFooterLink[];
};

/** The stores a store link can point at: the discriminator selects the official badge artwork (#466). */
export type BigFooterStore = "app-store" | "google-play";

/**
 * An app-store link, rendered as a real link wrapping the store's
 * official badge (#466). The label is the badge link's accessible
 * name; `store` selects which official badge renders.
 */
export type BigFooterStoreLink = {
  label: string;
  href: string;
  store: BigFooterStore;
};

/** The Feather social glyphs BigFooter can render for a social link. */
export type BigFooterSocialIcon =
  "facebook" | "instagram" | "twitter" | "youtube" | "github" | "linkedin";

/** A social link: an icon link whose accessible name is its label. */
export type BigFooterSocialLink = {
  label: string;
  href: string;
  icon: BigFooterSocialIcon;
};

/**
 * The brand block: the big wordmark, linking to the host's home.
 *
 * The wordmark is rendered by the DS itself (#688): there is no
 * logo slot — brand identity is data only (`label` + `href`), and
 * the anchor's accessible name is the brand `label`.
 *
 * Graphic brand mark (#726): `mark` names the brand's DS-owned
 * graphic mark as data, the same identity the header brand path
 * (BrandLink / AppTopBar) takes — when named, the DS renders
 * its own mark artwork beside the wordmark, decorative (the
 * anchor's accessible name stays the brand `label`). Omit it
 * for a brand with no mark (Memorize, today): the wordmark
 * renders alone, exactly as before.
 */
export type BigFooterBrand = {
  label: string;
  href: string;
  mark?: BrandMarkName;
};

/**
 * The ONE footer prop object every page takes (#410, Stephen's
 * adjustment): all footer content for a page crosses in this
 * single object, supplied by the app host through the page's
 * props. Every section is data — an empty columns / storeLinks /
 * socialLinks array renders no section, never a hardcoded one.
 */
export type BigFooterData = {
  brand: BigFooterBrand;
  columns: BigFooterColumn[];
  storeLinks: BigFooterStoreLink[];
  socialLinks: BigFooterSocialLink[];
};

export type BigFooterProps = {
  footer: BigFooterData;
};

/**
 * The named mobile stack breakpoint (#410): at or below a 640px
 * footer container the multi-column lists collapse to a stacked
 * single column. The collapse is structural — each column's flex
 * basis (BIG_FOOTER_COLUMN_BASIS, 300px) plus the row gap means
 * two columns need more than 640px, so below it they wrap one
 * per row — rather than a media query, because the DS Tamagui
 * config defines no width breakpoints (the LandingPage
 * precedent): the geometry holds on both targets as written.
 */
const BIG_FOOTER_STACK_BREAKPOINT = 640;
const BIG_FOOTER_COLUMN_BASIS = 300;

/** The official badge artwork per store (#466): bundled in the DS, never host-supplied. */
const STORE_BADGES: Record<BigFooterStore, () => ReactNode> = {
  "app-store": AppStoreBadge,
  "google-play": GooglePlayBadge,
};

const SOCIAL_ICONS: Record<BigFooterSocialIcon, (props: IconComponentProps) => ReactNode> = {
  facebook: SocialFacebookIcon,
  instagram: SocialInstagramIcon,
  twitter: SocialTwitterIcon,
  youtube: SocialYoutubeIcon,
  github: SocialGithubIcon,
  linkedin: SocialLinkedinIcon,
};

/**
 * A social icon link's frame: a comfortably tappable padded box
 * (the glyph plus $3 padding on every side) around the Feather
 * glyph, so social entries meet the same tap-target expectations
 * as the footer's other links at every width.
 */
const StyledBigFooterSocialAnchor = styled(Anchor, {
  name: "BigFooterSocialAnchor",
  color: "$onPrimary",
  padding: tokens.spacing[3],
  textDecorationLine: "none",
});

/** A store badge link's frame: the badge artwork at its fixed size, never underlined or recolored. */
const StyledBigFooterStoreAnchor = styled(Anchor, {
  name: "BigFooterStoreAnchor",
  textDecorationLine: "none",
});

/** The big wordmark's treatment: on-primary ink, bold, at the heading size, never underlined. */
const StyledBigFooterBrandAnchor = styled(Anchor, {
  name: "BigFooterBrandAnchor",
  color: "$onPrimary",
  fontSize: tokens.typography.fontSize["3xl"],
  fontWeight: tokens.typography.fontWeight.bold,
  textDecorationLine: "none",
});

/**
 * The fat footer itself. Controlled — see the file header for the
 * contract. Renders nothing when no footer data is supplied is
 * NOT this component's contract: callers pass data; the shell
 * below owns the optional case for pages whose host has not
 * supplied footer data yet.
 */
export function BigFooter({ footer }: BigFooterProps) {
  const { brand, columns, storeLinks, socialLinks } = footer;
  // The social glyphs' ink, resolved to a concrete value: react-native-svg
  // cannot inherit the anchor's text color on native (the Button
  // useVariantGlyphInk precedent), so the on-primary role is read from the
  // active theme and passed to the glyph explicitly.
  const theme = useTheme();
  const socialInk = typeof theme.onPrimary?.val === "string" ? theme.onPrimary.val : "#ffffff";
  // The brand wordmark anchor (#688): the DS renders the
  // wordmark itself, its accessible name the brand label. When
  // the brand names a graphic mark (#726), the DS-owned mark
  // renders beside it in the row below — the anchor itself is
  // the same either way.
  const brandAnchor = (
    <StyledBigFooterBrandAnchor
      {...platformAccessibilityProps({
        accessibilityRole: "link",
        accessibilityLabel: brand.label,
      })}
      href={brand.href}
      cursor="web:pointer"
    >
      {brand.label}
    </StyledBigFooterBrandAnchor>
  );
  return (
    <Col backgroundColor="$footerBackground" p="xl" gap="xl" {...contentInfoRoleProps}>
      {brand.mark !== undefined ? (
        <Row middle gap="m">
          <BrandMark mark={brand.mark} size={40} />
          {brandAnchor}
        </Row>
      ) : (
        brandAnchor
      )}
      <Row wrap gap="xl" stretch>
        {columns.length > 0 ? (
          <Row wrap gap="xl" grow shrink style={{ flexBasis: BIG_FOOTER_COLUMN_BASIS }}>
            {columns.map((column) => (
              <Col
                key={column.title}
                grow
                shrink
                style={{ flexBasis: BIG_FOOTER_COLUMN_BASIS }}
                gap="m"
              >
                <Text variant="label" color="$onPrimary">
                  {column.title}
                </Text>
                <Col gap="s">
                  {column.links.map((link) => (
                    <TextLink
                      key={link.href}
                      href={link.href}
                      color="$onPrimary"
                      fontSize={tokens.typography.fontSize.sm}
                    >
                      {link.label}
                    </TextLink>
                  ))}
                </Col>
              </Col>
            ))}
          </Row>
        ) : null}
        {storeLinks.length > 0 || socialLinks.length > 0 ? (
          <Col shrink between gap="m" testID="big-footer-side-column">
            {storeLinks.length > 0 ? (
              <Col gap="m" left>
                {storeLinks.map((link) => {
                  const Badge = STORE_BADGES[link.store];
                  return (
                    <StyledBigFooterStoreAnchor
                      key={link.href}
                      {...platformAccessibilityProps({
                        accessibilityRole: "link",
                        accessibilityLabel: link.label,
                      })}
                      href={link.href}
                      cursor="web:pointer"
                    >
                      <Badge />
                    </StyledBigFooterStoreAnchor>
                  );
                })}
              </Col>
            ) : null}
            {socialLinks.length > 0 ? (
              <Row wrap gap="m">
                {socialLinks.map((link) => {
                  const IconGlyph = SOCIAL_ICONS[link.icon];
                  return (
                    <StyledBigFooterSocialAnchor
                      key={link.href}
                      {...platformAccessibilityProps({
                        accessibilityRole: "link",
                        accessibilityLabel: link.label,
                      })}
                      href={link.href}
                      cursor="web:pointer"
                    >
                      <IconGlyph size={24} color={socialInk} />
                    </StyledBigFooterSocialAnchor>
                  );
                })}
              </Row>
            ) : null}
          </Col>
        ) : null}
      </Row>
    </Col>
  );
}

/**
 * Who owns native scrolling for a page in the shell (#547,
 * CodeRabbit round on PR #556):
 *
 * - "shell" (default): the shell's own ScrollView is the
 *   page's single native scroller. Plain content pages —
 *   forms, detail stacks, settings — use this mode, WITH or
 *   WITHOUT footer data: native scrolling never depends on
 *   whether the host supplied a footer.
 * - "content": the page's content owns native scrolling — a
 *   windowed list (BoundedList's FlatList) or a page-owned
 *   scroll region (ScrollRegion / ScrollShell) inside a
 *   bounded frame. The shell renders NO ScrollView, so the
 *   content's scroller is never nested inside a plain
 *   same-direction ScrollView (which breaks FlatList
 *   windowing and pagination). List pages and self-scrolling
 *   pages use this mode.
 * - "nested": the page is composed inside another shell that
 *   already owns scrolling (a hub page or frame page slotting
 *   this page inside its own scroller / bounded frame). The
 *   shell adds neither a scroller nor a bounded frame — just
 *   the growing column — so the outer shell stays the sole
 *   scroll owner.
 * - "overlay": the page's content IS a full-region overlay
 *   (StepOverlay in the cooking-mode pages, #729). The overlay
 *   anchors to the content region with absolute positioning
 *   and contributes no intrinsic height, so the region must
 *   be bounded to the viewport: on native the shell is the
 *   bounded frame (like "content", no ScrollView of its own);
 *   on web the shell bounds the content region to the full
 *   viewport (minHeight 100dvh, full-width positioned region)
 *   WHETHER OR NOT the host supplied footer data — the
 *   no-footer branch's unbounded growing column would leave
 *   the overlay's region collapsed and covered, and the
 *   #628 column's width cap would leave the page showing
 *   through at the sides of a full-screen shell.
 *
 * Except for "overlay", the mode is a native-only concern:
 * on web the document scrolls the whole page in every other
 * mode (no windowing, the catalogs paginate by scroll
 * sentinel), and the mode never changes the web layout.
 * "overlay" is the one mode that also changes the web
 * layout, as described above. It is a semantic
 * scroll-ownership prop, not a styling prop.
 */
type BigFooterShellScrollMode = "shell" | "content" | "nested" | "overlay";

/**
 * Header data for a standalone page (#857, Stephen's option B):
 * the full AppTopBar (brand + nav + actions) rendered by the shell
 * when a page supplies it — the same data shape AppShellPage pages
 * pass to the top bar. A page with no nav/actions data supplies
 * only its brand; the bar renders with the brand it has and no
 * invented nav or actions.
 */
export type BigFooterShellHeader = {
  brand: { label: string; href?: string; mark?: BrandMarkName };
  navItems?: AppTopBarNavItem[];
  navLabel?: string;
  activeItemId?: string | null;
  search?: AppTopBarSearch | null;
  actions?: AppTopBarAction[];
};

export type BigFooterShellProps = {
  /** The page's footer data, when its host supplied any. */
  footer?: BigFooterData | undefined;
  /** The page's header data (#857): when supplied, the shell renders the full AppTopBar above the content. */
  header?: BigFooterShellHeader | undefined;
  /** Who owns native scrolling; see BigFooterShellScrollMode. */
  scrollMode?: BigFooterShellScrollMode;
  children: ReactNode;
};

/**
 * The page shell (#547, Stephen's page-scroll model; revised
 * #857, Stephen 2026-11-25): on web the entire page is a flex
 * container with `minHeight: 100dvh` and exactly two children —
 * the page content and the BigFooter. The content region GROWS
 * (flexGrow) so any slack lives inside the content area, in the
 * page background, instead of an empty band between content and
 * footer (the pre-#857 `justifyContent: "space-between"` model
 * put all slack there). A token-level clearance gap (`gap="xl"`,
 * the $6 spacing step) sits between the content region and the
 * footer so content — a form's submit button above all — never
 * touches the footer. If the page (including the footer) is
 * shorter than the viewport, the footer is still pinned to the
 * bottom (the growing content region absorbs the slack); if it
 * is longer, the footer follows directly below the content and
 * the document scrolls the whole page — whole-page scroll, no
 * nested scroller, and the footer is always in flow, never
 * fixed/absolute. The
 * content child keeps `position: "relative"` so an
 * absolutely-positioned full-region child (StepOverlay in
 * MealCookingModePage's ready state) anchors to the content
 * area above the footer.
 *
 * BigFooter is WEB-ONLY (#547 addendum, Stephen 2026-11-09):
 * native never renders it — native uses bottom navigation
 * (the tab shells' tab bar) instead. On native, React Native
 * has no document scroll, so exactly one scroller must own
 * the page: WHICH one is the shell's `scrollMode` (see
 * BigFooterShellScrollMode) — the shell's own ScrollView in
 * the default "shell" mode, the page content's own list or
 * scroll region in "content" mode, or the enclosing shell's
 * scroller in "nested" mode. Native scrolling is independent
 * of footer data: a standalone page with no footer scrolls
 * exactly like one with a footer (PR #556 review: a footerless
 * standalone SignUpPage could not scroll at all when the
 * scroller lived only in the footer branch). ScreenContainer
 * renders no scroller of its own on either platform (#547).
 *
 * Desktop content column (#628): on web the content child
 * renders inside PageContentColumn — a centered column at
 * most 1200px wide — in BOTH web branches (with and without
 * footer data). The BigFooter stays a direct child of the
 * shell, full-width: it is never inside the column. The
 * two-children model above is preserved — the shell's two
 * children are now the column (holding the page content) and
 * the footer. The column is positioned, so the content-area
 * anchoring described above holds through it. Native is
 * unchanged: no column, no footer.
 *
 * On web, a page whose host supplied no footer data renders
 * NO footer band and reserves NO viewport height — just a
 * growing column around its content — so a page can compose
 * inside a shell that already owns the layout (e.g. a hub
 * page composing a nested page): the outer shell is the sole
 * layout owner and the nested page adds neither a second
 * footer nor a full-viewport inner shell. A page composed
 * inside another shell's scroller on native says so with
 * scrollMode "nested" — the same opt-out, for the platform
 * whose scroller is explicit. The one exception is a page
 * whose content is a full-region overlay (the cooking-mode
 * pages): it says scrollMode "overlay" (#729) and the shell
 * bounds its content region to the full viewport with or
 * without footer data, because the overlay contributes no
 * intrinsic height and the unbounded column would collapse
 * its region (and the #628 column cap would leave the page
 * showing through at the sides of a full-screen shell).
 */
export function BigFooterShell({
  footer,
  header,
  scrollMode = "shell",
  children,
}: BigFooterShellProps) {
  // The standalone-page header (#857): the full AppTopBar, rendered
  // once here in the shell layer when the page supplies header data.
  const headerNode = header ? (
    <AppTopBar
      brand={header.brand}
      {...(header.navItems !== undefined ? { navItems: header.navItems } : null)}
      {...(header.navLabel !== undefined ? { navLabel: header.navLabel } : null)}
      {...(header.activeItemId !== undefined ? { activeItemId: header.activeItemId } : null)}
      {...(header.search !== undefined ? { search: header.search } : null)}
      {...(header.actions !== undefined ? { actions: header.actions } : null)}
    />
  ) : null;
  if (!isWeb) {
    // Native (#547 addendum): no BigFooter in any mode — native
    // uses bottom navigation (the tab shells' Tabs) instead.
    if (scrollMode === "content" || scrollMode === "overlay") {
      // The content owns scrolling (a windowed list or a
      // page-owned scroll region): the shell is only the
      // bounded frame that gives that scroller its height —
      // no ScrollView of its own, so the content's scroller
      // is never nested inside a plain ScrollView.
      return (
        <Col grow shrink position="relative">
          {headerNode}
          <Col grow shrink position="relative">
            {children}
          </Col>
        </Col>
      );
    }
    if (scrollMode === "nested") {
      // Composed inside another shell's scroller: add neither
      // a scroller nor a bounded frame — the outer shell is
      // the sole scroll owner.
      return (
        <Col grow position="relative">
          {children}
        </Col>
      );
    }
    // Default "shell" mode: the shell's ONE ScrollView wraps
    // the page content, whether or not the host supplied
    // footer data; its content container grows to at least
    // the viewport height so short pages fill the screen
    // exactly as the web model's space-between shell fills
    // the viewport.
    return (
      <ScrollView flex={1} keyboardShouldPersistTaps="handled">
        <Col grow minHeight="100%" position="relative">
          {headerNode}
          {children}
        </Col>
      </ScrollView>
    );
  }
  if (scrollMode === "overlay") {
    // Web, overlay page (#729): the content is a full-region
    // overlay (StepOverlay) — a dark, opaque, full-screen
    // shell that fills its nearest positioned ancestor so the
    // page beneath does not show through. It anchors to this
    // branch's content region and contributes no intrinsic
    // height, so the region is bounded to the viewport and
    // FULL-WIDTH: the #628 column's 1200px cap would leave
    // the page showing through at the sides on wide
    // viewports, and the no-footer branch's unbounded
    // growing column would leave the region collapsed and
    // covered. The footer, when supplied, stays in flow
    // below the region exactly as in the default shell.
    return (
      <Col minHeight={{ default: "100%", web: "100dvh" }} between>
        <Col grow shrink position="relative">
          {children}
        </Col>
        {footer ? <BigFooter footer={footer} /> : null}
      </Col>
    );
  }
  if (!footer) {
    // Web, no footer data (#628): no footer band, but the
    // content still gets the centered desktop column — a page
    // without footer data is not exempt from the measure.
    return (
      <Col grow position="relative">
        <PageContentColumn>
          {headerNode}
          {children}
        </PageContentColumn>
      </Col>
    );
  }
  // Web (#547, revised #857): a flex column with minHeight 100dvh
  // and exactly two children: the growing content region (the
  // PageContentColumn, positioned, so absolute overlays anchor
  // above the footer) and the BigFooter, separated by the
  // token-level clearance gap (gap "xl" = the $6 spacing step).
  // Short page: the content region grows, the footer stays pinned
  // to the viewport bottom, and the slack lives inside the content
  // area. Long page: the footer follows directly below the
  // content and the document scrolls the whole page — there is
  // no nested scroller.
  return (
    <Col minHeight={{ default: "100%", web: "100dvh" }} gap="xl">
      <Col grow shrink position="relative">
        <PageContentColumn>
          {headerNode}
          {children}
        </PageContentColumn>
      </Col>
      <BigFooter footer={footer} />
    </Col>
  );
}
