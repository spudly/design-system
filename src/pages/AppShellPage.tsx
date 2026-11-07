import type { ReactNode } from "react";
import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { AppTopBar, type AppTopBarAction, type AppTopBarNavItem } from "../views/AppTopBar.js";
import { LazySlot } from "../views/LazySlot.js";

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
 * - Nav items as DATA: `{ id, label, href, icon? }[]` plus
 *   `activeItemId` — every nav item navigates, so every item is
 *   a link with an href (#248's navigation rule); the active
 *   item (the host derives it from its route) carries the
 *   primary-filled treatment. Icons are registry NAMES only
 *   (#438 Part 4) — the host never passes a component, which is
 *   what lets eciperay retire its temporary host-sourced icon
 *   set (eciperay #451, blocked on this page).
 * - Header actions (optional): caller-supplied data for the
 *   top-bar's right side (e.g. Sign in / account), following
 *   the same href-vs-callback split — an `href` action
 *   navigates (link form), an `onPress` action acts in place
 *   (button form).
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
 * barrel like every page's prop types; the icon NAME union they
 * reference stays internal (no icon name or component is a
 * package export) — hosts pass name literals as nav data.
 */

export type AppShellPageNavItem = AppTopBarNavItem;

export type AppShellPageAction = AppTopBarAction;

export type AppShellPageProps = {
  /** The brand wordmark: its label and its home destination. */
  brand: { label: string; href: string };
  /** The routed nav items as data, in display order. */
  navItems: AppShellPageNavItem[];
  /** The nav list's accessible name (e.g. "Eciperay sections"). */
  navLabel?: string;
  /**
   * The active nav item's id — the host derives it from its
   * route — or null when no item is current.
   */
  activeItemId: string | null;
  /** The top-bar's right-side actions (e.g. Sign in / account). */
  actions?: AppShellPageAction[];
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
  actions,
  footer,
  onReload,
  contentKey,
  children,
}: AppShellPageProps) {
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer scrollable={false}>
        <AppTopBar
          brand={brand}
          navItems={navItems}
          activeItemId={activeItemId}
          {...(navLabel !== undefined ? { navLabel } : null)}
          {...(actions !== undefined ? { actions } : null)}
        />
        <LazySlot
          key={contentKey ?? activeItemId ?? "page"}
          {...(onReload !== undefined ? { onReload } : null)}
        >
          {children}
        </LazySlot>
      </ScreenContainer>
    </BigFooterShell>
  );
}
