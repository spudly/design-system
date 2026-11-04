import type { ReactNode } from "react";
import { Anchor, XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { FacebookIcon } from "../icons/FacebookIcon.js";
import { GithubIcon } from "../icons/GithubIcon.js";
import { InstagramIcon } from "../icons/InstagramIcon.js";
import { LinkedinIcon } from "../icons/LinkedinIcon.js";
import { TwitterIcon } from "../icons/TwitterIcon.js";
import { YoutubeIcon } from "../icons/YoutubeIcon.js";
import type { IconComponentProps } from "../icons/Icon.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";
import { TextLink } from "./TextLink.js";
import { contentInfoRoleProps, platformAccessibilityProps } from "./accessibility.js";

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
 * Social icons are Feather icons (#410, Stephen's adjustment):
 * an entry names one of the Feather social glyphs the DS ships
 * (facebook, instagram, twitter, youtube, github, linkedin) and
 * the glyph renders through the icons module. Production hosts
 * ship an EMPTY socialLinks array today (no socials exist yet);
 * the component supports the entries whenever a host has them.
 *
 * Mobile collapse (Stephen's addendum, 2026-11-03): the link
 * columns live in a wrapping row whose columns carry a 300px
 * flex basis (BIG_FOOTER_COLUMN_BASIS). Below the named stack
 * breakpoint — a 640px-wide footer container
 * (BIG_FOOTER_STACK_BREAKPOINT) — two columns no longer fit side
 * by side, so the columns wrap into a stacked, single-column
 * arrangement; the brand block, store links, and social links
 * stack above them the same way. There is no horizontal scroll
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

/** An app-store link (e.g. App Store, Google Play), rendered as a real link. */
export type BigFooterStoreLink = {
  label: string;
  href: string;
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

/** The brand block: the big wordmark, linking to the host's home. */
export type BigFooterBrand = {
  label: string;
  href: string;
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
export const BIG_FOOTER_STACK_BREAKPOINT = 640;
export const BIG_FOOTER_COLUMN_BASIS = 300;

const SOCIAL_ICONS: Record<BigFooterSocialIcon, (props: IconComponentProps) => ReactNode> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  youtube: YoutubeIcon,
  github: GithubIcon,
  linkedin: LinkedinIcon,
};

/**
 * A social icon link's frame: a comfortably tappable padded box
 * (the glyph plus $2 padding on every side) around the Feather
 * glyph, so social entries meet the same tap-target expectations
 * as the footer's other links at every width.
 */
const StyledBigFooterSocialAnchor = styled(Anchor, {
  name: "BigFooterSocialAnchor",
  color: "$primary",
  padding: tokens.spacing[2],
  textDecorationLine: "none",
});

/** The big wordmark's treatment: primary ink, bold, at the heading size, never underlined. */
const StyledBigFooterBrandAnchor = styled(Anchor, {
  name: "BigFooterBrandAnchor",
  color: "$primary",
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
  return (
    <YStack
      backgroundColor="$surface"
      borderTopWidth={1}
      borderColor={tokens.colors.gray.gray2}
      paddingHorizontal="$6"
      paddingVertical="$6"
      gap="$5"
      {...contentInfoRoleProps}
    >
      <YStack gap="$3">
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
        {storeLinks.length > 0 ? (
          <XStack flexWrap="wrap" gap="$3">
            {storeLinks.map((link) => (
              <Button key={link.href} href={link.href} variant="secondary">
                {link.label}
              </Button>
            ))}
          </XStack>
        ) : null}
        {socialLinks.length > 0 ? (
          <XStack flexWrap="wrap" gap="$3">
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
                  <IconGlyph size={24} />
                </StyledBigFooterSocialAnchor>
              );
            })}
          </XStack>
        ) : null}
      </YStack>
      {columns.length > 0 ? (
        <XStack flexWrap="wrap" gap="$5">
          {columns.map((column) => (
            <YStack
              key={column.title}
              flexGrow={1}
              flexShrink={1}
              flexBasis={BIG_FOOTER_COLUMN_BASIS}
              gap="$3"
            >
              <Text variant="label">{column.title}</Text>
              <YStack gap="$2">
                {column.links.map((link) => (
                  <TextLink
                    key={link.href}
                    href={link.href}
                    fontSize={tokens.typography.fontSize.sm}
                  >
                    {link.label}
                  </TextLink>
                ))}
              </YStack>
            </YStack>
          ))}
        </XStack>
      ) : null}
    </YStack>
  );
}

export type BigFooterShellProps = {
  /** The page's footer data, when its host supplied any. */
  footer?: BigFooterData | undefined;
  children: ReactNode;
};

/**
 * The sticky-footer page shell (#410, Stephen's addendum): a
 * full-viewport-height column — min-height 100dvh, the platform
 * equivalent the Tamagui stack resolves on each target — with
 * the page content as the growing region and BigFooter last in
 * flow. On a short page the footer sits at the viewport bottom
 * (the empty space is above it, never below); on a long page it
 * scrolls naturally after the content. This is in-flow layout,
 * never fixed/absolute pinning. Every page renders through this
 * shell with no opt-outs; a page whose host supplied no footer
 * data renders the shell without the footer band until the host
 * supplies it.
 */
export function BigFooterShell({ footer, children }: BigFooterShellProps) {
  return (
    <YStack minHeight="100dvh" flexDirection="column">
      <YStack flexGrow={1} flexShrink={0} flexBasis="auto">
        {children}
      </YStack>
      {footer ? <BigFooter footer={footer} /> : null}
    </YStack>
  );
}
