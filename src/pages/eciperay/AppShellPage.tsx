import type { ReactNode } from "react";

import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import { Row } from "../../widgets/layout/Row.js";
import { ScreenContainer } from "../../widgets/layout/ScreenContainer.js";
import type { BrandMarkName } from "../../icons/BrandMark.js";
import {
  AppTopBar,
  type AppTopBarAction,
  type AppTopBarNavItem,
  type AppTopBarNavItemKind,
  type AppTopBarSearch,
} from "../../widgets/layout/AppTopBar.js";
import { LazySlot } from "../../views/shared/LazySlot.js";
import { Button } from "../../widgets/actions/Button.js";
import { StatusMessage } from "../../views/shared/StatusMessage.js";
import {
  ConsentBannerView,
  type ConsentBannerViewProps,
} from "../../views/shared/ConsentBannerView.js";
import {
  InstallBannerView,
  type InstallBannerViewProps,
} from "../../views/shared/InstallBannerView.js";

/**
 * AppShellPage (#437): the routed app shell as a design-system
 * frame page — the chrome Eciperay's web and native hosts each
 * hand-built (a header with the brand wordmark, a routed nav,
 * and a footer band, styled from raw token objects) after the
 * pages-only surface (#298) left host shell chrome with no DS
 * component. Stephen ruled (2026-11-06): the DS provides a
 * shell/top-bar, and it is used by every page. This frame is
 * that shell for routed hosts; TabbedShellPage is the same
 * chrome for same-page tab hosts — both render the one shared
 * top-bar view (AppTopBar), so the shells cannot drift.
 *
 * The frame owns the shell's design; the host owns the content
 * and the routing, per the ownership model (DS owns chrome:
 * header/nav, outer layout; the app owns content):
 *
 * - Brand: `{ label, href }` — the wordmark, rendered as a
 *   BrandLink home (the wordmark always navigates home, a
 *   canonical destination, so it is always a real link —
 *   Stephen's link-naming rule).
 * - Nav items as DATA: `{ id, label, href, kind? }[]` plus
 *   `activeItemId` — every nav item navigates, so every item is
 *   a link with an href (#248's navigation rule); the active
 *   item (the host derives it from its route) carries the
 *   primary-filled treatment. Hosts never select icons (#880):
 *   an item's optional semantic `kind` names the section it
 *   leads to and the top bar picks the glyph, which is what
 *   lets eciperay retire its temporary host-sourced icon
 *   set (eciperay #451, blocked on this page).
 * - Header actions (optional): caller-supplied data for the
 *   top-bar's right side (e.g. Sign in / account), following
 *   the same href-vs-callback split — an `href` action
 *   navigates (link form), an `onPress` action acts in place
 *   (button form).
 * - Header search (optional, #542): caller-supplied data —
 *   the field's accessible name, placeholder, and controlled
 *   value plus change/submit callbacks — rendered by the top
 *   bar as the DS SearchField inside a search landmark, so a
 *   host adopting the shell keeps its header search (the
 *   Eciperay #409 search its hand-built shell carries) without
 *   host-built chrome.
 * - Content: the host's current page as `children`, rendered
 *   through the internal LazySlot exactly as TabbedShellPage
 *   slots its surfaces — Suspense with the DS loading state
 *   plus the internal ChunkErrorBoundary's fallback — so hosts
 *   pass lazy pages in and never import the boundary
 *   (Stephen's ChunkErrorBoundary ruling on #438). The slot is
 *   keyed by the active nav item by default (switching routes
 *   clears a failure, the boundary's keyed-remount contract);
 *   a host that needs finer keys passes `contentKey`.
 * - Footer: optional `BigFooterData` — when supplied, the page
 *   renders the one BigFooter through the standard shell; no
 *   second footer type is introduced.
 * - Banners (#879): the analytics consent banner and the
 *   mobile-app install banner render from this shell — the
 *   host passes each banner's state as DATA (`consentBanner` /
 *   `installBanner`, the banner views' own prop shapes):
 *   presence is visibility, the copy and labels cross as data
 *   (the views' label props fall back to the voice defaults),
 *   and accept / decline / dismiss are bare callbacks. The
 *   consent record, the analytics wiring, and the install
 *   dismissal state stay host-side; the views are NOT exported
 *   for hosts to mount — the shell renders them internally,
 *   after the content slot, exactly where hosts mount their
 *   local banners today (each view pins itself to its screen
 *   edge: install to the top, consent to the bottom), so there
 *   is no visual change. Omit a prop (or pass null) and that
 *   banner does not render.
 *
 * No styling props, no domain concepts: nav labels, hrefs, and
 * actions are caller data; nothing Eciperay- or
 * Memorize-specific is baked in (the extraction reusability
 * rule). The content column is the shell container's own —
 * pages own their inner columns, as they do inside
 * TabbedShellPage.
 *
 * Placement: page components live in src/pages and are exported
 * from the package root (#298) — pages are the package's only
 * exports. The nav/action data types surface through the pages
 * barrel like every page's prop types. No icon name or
 * component is a package export, and none crosses the nav data
 * either (#880) — an item's semantic `kind` is the only icon
 * input, and the top bar picks its glyph.
 */

export type AppShellPageNavItem = AppTopBarNavItem;

export type AppShellPageNavItemKind = AppTopBarNavItemKind;

export type AppShellPageAction = AppTopBarAction;

export type AppShellPageSearch = AppTopBarSearch;

/** The consent banner as data (#879): the ConsentBannerView prop shape, aliased per the page-prop rule. */
export type AppShellPageConsentBanner = ConsentBannerViewProps;

/** The install banner as data (#879): the InstallBannerView prop shape, aliased per the page-prop rule. */
export type AppShellPageInstallBanner = InstallBannerViewProps;

export type AppShellPageProps = {
  /**
   * The brand wordmark: its label and its home destination.
   * `mark` (#726) names the brand's DS-owned graphic mark as
   * data — the top bar renders the DS's own artwork before the
   * wordmark; omit it for a brand with no mark (Memorize,
   * today), which renders the wordmark alone exactly as before.
   */
  brand: { label: string; href: string; mark?: BrandMarkName };
  /** The routed nav items as data, in display order. */
  navItems: AppShellPageNavItem[];
  /** The nav list's accessible name (e.g. "Eciperay sections"). */
  navLabel?: string;
  /**
   * The active nav item's id — the host derives it from its
   * route — or null when no item is current.
   */
  activeItemId: string | null;
  /**
   * The header search, as data (#542): forwarded to the top
   * bar, which renders the DS SearchField between the nav and
   * the actions inside a search landmark. The host supplies
   * the accessible name, placeholder, and controlled value
   * (seeded/reflected from its route state) plus change and
   * submit callbacks. Omit or pass null for no header search.
   */
  search?: AppShellPageSearch | null;
  /** The top-bar's right-side actions (e.g. Sign in / account). */
  actions?: AppShellPageAction[];
  /**
   * An optional non-blocking notice (#765), as data: a message
   * plus an optional recovery action ({ label, onPress } — a
   * callback, never an href, per #248). When present it renders
   * between the top bar and the content slot via the banner Row /
   * StatusMessage (the polite live region announces it); the
   * page content stays mounted underneath. When absent, no
   * notice renders and the shell is unchanged.
   */
  notice?: { message: string; action?: { label: string; onPress: () => void } };
  /**
   * The analytics consent banner as data (#879): when present,
   * the shell renders ConsentBannerView itself (bottom-pinned)
   * after the content slot. The banner's copy crosses as data;
   * its accept/decline labels default to the voice object's
   * consentBannerView labels when omitted. The consent state
   * and its side effects stay host-side — only the accept /
   * decline intents cross. Omit (or pass null) while consent
   * is not outstanding and no banner renders.
   */
  consentBanner?: AppShellPageConsentBanner | null;
  /**
   * The mobile-app install banner as data (#879): when
   * present, the shell renders InstallBannerView itself
   * (top-pinned) after the content slot. The message and the
   * app-store links cross as data (hrefs, per #248); dismissal
   * is a bare callback and the dismissal state stays
   * host-side. Omit (or pass null) once dismissed and no
   * banner renders.
   */
  installBanner?: AppShellPageInstallBanner | null;
  /**
   * The page footer (#410): caller-supplied BigFooter data, in
   * the standard shape every page takes. Omitted, no footer
   * band renders.
   */
  footer?: BigFooterData;
  /**
   * Recovery action for a failed lazy chunk, forwarded to the
   * internal boundary. Omit it where the boundary's default (a
   * full page reload on web) is right.
   */
  onReload?: () => void;
  /**
   * The lazy slot's remount key. Defaults to the active nav
   * item's id (or "page" while no item is current); pass it
   * when routes need finer keys.
   */
  contentKey?: string;
  /** The host's current page, rendered through the lazy slot. */
  children: ReactNode;
};

/**
 * The routed app shell: shared top-bar (brand, nav, actions),
 * the current page slotted through the internal lazy boundary,
 * and the one BigFooter when the host supplies footer data.
 */
export function AppShellPage({
  brand,
  navItems,
  navLabel,
  activeItemId,
  search,
  actions,
  notice,
  consentBanner,
  installBanner,
  footer,
  onReload,
  contentKey,
  children,
}: AppShellPageProps) {
  return (
    <BigFooterShell footer={footer} scrollMode="content">
      <ScreenContainer>
        <AppTopBar
          brand={brand}
          navItems={navItems}
          activeItemId={activeItemId}
          {...(navLabel !== undefined ? { navLabel } : null)}
          {...(search !== undefined ? { search } : null)}
          {...(actions !== undefined ? { actions } : null)}
        />
        {notice ? (
          <Row middle between gap="l">
            <StatusMessage message={notice.message} />
            {notice.action ? (
              <Button onPress={notice.action.onPress}>{notice.action.label}</Button>
            ) : null}
          </Row>
        ) : null}
        <LazySlot
          key={contentKey ?? activeItemId ?? "page"}
          {...(onReload !== undefined ? { onReload } : null)}
        >
          {children}
        </LazySlot>
        {installBanner ? <InstallBannerView {...installBanner} /> : null}
        {consentBanner ? <ConsentBannerView {...consentBanner} /> : null}
      </ScreenContainer>
    </BigFooterShell>
  );
}
