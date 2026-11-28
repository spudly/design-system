import type { ReactNode } from "react";
import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import { Row } from "../../widgets/layout/Row.js";
import { ScreenContainer } from "../../widgets/layout/ScreenContainer.js";
import { Tabs } from "../../widgets/actions/Tabs.js";
import type { IconName } from "../../icons/iconRegistry.js";
import { AppTopBar } from "../../widgets/layout/AppTopBar.js";
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
 * TabbedShellPage (#438 Part 5): the tabbed app shell as a
 * design-system frame page — the chrome Memorize's web and native
 * hosts each hand-rolled from raw Tamagui primitives after #96
 * (flagged as DS #437: at the pages-only surface a host's own
 * shell — heading + tab bar + lazy content region — had no DS
 * component). The frame owns the shell's design; the host owns
 * the content and the state, per the ownership model (DS owns
 * chrome: header/nav, outer layout; the app owns content).
 *
 * The composition mirrors the real Memorize shell it replaces:
 * the app title (the host's `title`, rendered through the shared
 * AppTopBar view as its brand — #437 aligned this frame's header
 * onto the same top-bar composition the routed shell
 * (AppShellPage) renders, so the two shells are one chrome), the
 * tab bar, and the active surface below it, stacked in a
 * non-scrolling ScreenContainer — the tab surfaces own their own
 * scroll, exactly as they do in the host shell today (a scrolling
 * shell around a self-scrolling surface is the nested-shell
 * failure behind #188). There is no footer and no other chrome:
 * the existing shell has none, and none is invented.
 *
 * Tabs are DATA (memorize#100's contract): per tab an `id`, a
 * `label`, and the tab's `content`, the surface the host renders
 * when the tab is active. Hosts never select icons (#880): the
 * page owns icon selection — in the button form it maps the
 * tab's semantic `id` to a glyph from its own icon set
 * (`tabIconsById` below) and renders it left of the label; a tab
 * whose id the page does not know renders with no icon.
 * Navigation follows Stephen's rule, in the Tabs widget's two
 * shipped forms:
 *
 * - Button form (the default; Memorize's shell): tabs switch
 *   in-page content, so they are buttons — the host holds the
 *   active tab and answers `onTabSelect`. A tab's DS-chosen icon
 *   rides this form only, mirroring Button (its href form omits
 *   the icon slot).
 * - Link form (`variant="link"`): each tab carries an `href` and
 *   navigates, so the tabs are links; the host derives
 *   `activeTabId` from its route and renders the current page as
 *   `children`. Link tabs take no content and no icon.
 *
 * Lazy content (Stephen's ChunkErrorBoundary ruling on #438):
 * hosts define lazy components and pass them INTO the page as tab
 * content (or as link-form children); the page renders the active
 * surface through the internal LazySlot view — Suspense with the
 * DS loading state plus the internal ChunkErrorBoundary's
 * failed-to-load/reload fallback — so the host never imports the
 * boundary. The slot is KEYED by the active surface (the
 * boundary's documented contract: switching surfaces clears a
 * failure), which preserves the keyed remount Memorize's shell
 * wired by hand (`key={drillingId ? "drill" : tab}`): the key is
 * the active tab's id, or "override" while an override surface
 * shows; a host that needs finer keys (per-entity surfaces)
 * passes `contentKey`.
 *
 * The drill case (Memorize's canonical `/drill/:id` and
 * `memorize://drill/<id>` destinations, DS #425): while a drill
 * is open, NO tab is selected and the drill surface replaces the
 * tab content. The button form models that directly — the host
 * passes the drill surface as `children` (the override) with
 * `activeTabId: null`; selecting a tab is the host's cue to close
 * the drill (its `onTabSelect` handler owns that state, as
 * today). Deep-link parsing and drill state stay app-side; only
 * the chrome moved.
 *
 * Banners (#879): like AppShellPage, this shell renders the
 * analytics consent banner and the mobile-app install banner
 * itself — the host passes each banner's state as DATA
 * (`consentBanner` / `installBanner`, the banner views' own
 * prop shapes): presence is visibility, copy and labels cross
 * as data (the views' label props fall back to the voice
 * defaults), and accept / decline / dismiss are bare
 * callbacks. The consent record, analytics wiring, and
 * install dismissal state stay host-side; the views are NOT
 * exported for hosts to mount. The banners render after the
 * content slot, exactly where hosts mount their local banners
 * today (each view pins itself to its screen edge: install to
 * the top, consent to the bottom), so there is no visual
 * change. Omit a prop (or pass null) and that banner does not
 * render.
 *
 * (#438's final major removed the `ChunkErrorBoundary` root
 * export once both apps rendered through pages that slot
 * content this way; the boundary is internal now.)
 *
 * Placement: page components live in src/pages and are exported
 * from the package root (#298) — pages are the package's only
 * exports. The tab data types surface through the pages barrel
 * like every page's prop types. No icon name or component is a
 * package export, and none crosses the tab data either (#880) —
 * the tab's `id` is its only identity, and the page picks its
 * glyph.
 */

/**
 * The glyph each known tab id renders with (#880): the page —
 * not the host — selects tab icons, mapping the tab's semantic
 * identity (the `id` the host already passes) to a name in the
 * DS's internal icon set. A tab whose id is absent here renders
 * with NO icon — the documented default for unknown ids (e.g.
 * Memorize's verses / search / review / settings tabs, which
 * render label-only exactly as they did before #880).
 */
const tabIconsById: Partial<Record<string, IconName>> = {
  add: "add",
  feedback: "feedback",
  home: "home",
  meals: "meals",
  profile: "profile",
  recipes: "recipes",
  shared: "shared",
  tags: "tags",
};

export type TabbedShellPageTab = {
  /** The tab's identity — the value `activeTabId` names and `onTabSelect` reports. */
  id: string;
  /** The tab's visible label — also its accessible name. */
  label: string;
  /**
   * The tab's surface: the host's content for this tab (a page,
   * or a lazy component the host defined), rendered through the
   * internal LazySlot while this tab is active.
   */
  content: ReactNode;
};

export type TabbedShellPageLinkTab = {
  /** The tab's identity — the value `activeTabId` names for the current page. */
  id: string;
  /** The tab's visible label — also its accessible name. */
  label: string;
  /**
   * The tab's destination (#248's navigation rule: the tab
   * navigates, so it is a link): forwarded verbatim to the
   * platform link path — on native that requires a scheme-bearing
   * URL an installed app can open (see LinkTabItem's contract).
   */
  href: string;
};

/** The consent banner as data (#879): the ConsentBannerView prop shape, aliased per the page-prop rule. */
export type TabbedShellPageConsentBanner = ConsentBannerViewProps;

/** The install banner as data (#879): the InstallBannerView prop shape, aliased per the page-prop rule. */
export type TabbedShellPageInstallBanner = InstallBannerViewProps;

type TabbedShellPageBaseProps = {
  /** The app title at the shell's head — the host's app name (e.g. "Memorize"). */
  title: string;
  /**
   * An optional non-blocking notice (#765), as data: a message
   * plus an optional recovery action ({ label, onPress } — a
   * callback, never an href, per #248). When present it renders
   * between the top bar / tab bar and the content slot via
   * the banner Row / StatusMessage (the polite live region announces
   * it); the tab content stays mounted underneath. When absent,
   * no notice renders and the shell is unchanged.
   */
  notice?: { message: string; action?: { label: string; onPress: () => void } };
  /**
   * The analytics consent banner as data (#879): when present,
   * the shell renders ConsentBannerView itself (bottom-pinned)
   * after the content slot. Copy crosses as data; the accept /
   * decline labels default to the voice object's
   * consentBannerView labels when omitted. The consent state
   * and its side effects stay host-side — only the accept /
   * decline intents cross. Omit (or pass null) while consent
   * is not outstanding and no banner renders.
   */
  consentBanner?: TabbedShellPageConsentBanner | null;
  /**
   * The mobile-app install banner as data (#879): when
   * present, the shell renders InstallBannerView itself
   * (top-pinned) after the content slot. The message and the
   * app-store links cross as data (hrefs, per #248); dismissal
   * is a bare callback and the dismissal state stays
   * host-side. Omit (or pass null) once dismissed and no
   * banner renders.
   */
  installBanner?: TabbedShellPageInstallBanner | null;
  /** The tab list's accessible name (Memorize's shell: "Memorize sections"). */
  tabsLabel?: string;
  /**
   * The page footer (#410): caller-supplied BigFooter data, in
   * the standard shape every page takes. Omitted — as Memorize's
   * shell runs today — no footer band renders.
   */
  footer?: BigFooterData;
  /**
   * The active tab's id, or null when no tab is selected — the
   * drill case: an override surface (button-form `children`) is
   * showing instead of a tab's content.
   */
  activeTabId: string | null;
  /**
   * Recovery action for a failed lazy chunk, forwarded to the
   * internal boundary. Omit it where the boundary's default (a
   * full page reload on web) is right.
   */
  onReload?: () => void;
  /**
   * The lazy slot's remount key. Defaults to the active surface's
   * own key (the active tab's id, or "override" while an override
   * surface shows); pass it when surfaces need finer keys.
   */
  contentKey?: string;
};

export type TabbedShellPageProps = TabbedShellPageBaseProps &
  (
    | {
        /**
         * Button form (the default): the tabs switch in-page
         * content — buttons with a selection callback, per the
         * navigation rule.
         */
        variant?: "button";
        tabs: TabbedShellPageTab[];
        onTabSelect: (tabId: string) => void;
        /**
         * The override surface (the drill case): when provided it
         * replaces the active tab's content, rendered through the
         * lazy slot like tab content. Omit it to show the active
         * tab's content.
         */
        children?: ReactNode;
      }
    | {
        /**
         * Link form: the tabs navigate to other pages — links with
         * hrefs, per the navigation rule. There is no selection
         * callback, because navigation itself is the activation.
         */
        variant: "link";
        tabs: TabbedShellPageLinkTab[];
        onTabSelect?: never;
        /** The current page's surface, rendered through the lazy slot. */
        children: ReactNode;
      }
  );

/**
 * The tabbed app shell: app title, tab bar, and the active
 * surface slotted through the internal lazy boundary. Controlled —
 * see the file header for the contract and the ownership split.
 */
export function TabbedShellPage(props: TabbedShellPageProps) {
  const { title, tabsLabel, footer, activeTabId, onReload, contentKey, notice, consentBanner, installBanner } =
    props;

  let tabBar: ReactNode;
  let content: ReactNode;
  let surfaceKey: string;
  if (props.variant === "link") {
    tabBar = (
      <Tabs
        variant="link"
        tabs={props.tabs.map((tab) => ({ value: tab.id, label: tab.label, href: tab.href }))}
        value={activeTabId ?? ""}
        {...(tabsLabel !== undefined ? { label: tabsLabel } : null)}
      />
    );
    content = props.children;
    surfaceKey = activeTabId ?? "override";
  } else {
    tabBar = (
      <Tabs
        tabs={props.tabs.map((tab) => {
          const icon = tabIconsById[tab.id];
          return {
            value: tab.id,
            label: tab.label,
            ...(icon !== undefined ? { icon } : null),
          };
        })}
        value={activeTabId ?? ""}
        onValueChange={props.onTabSelect}
        {...(tabsLabel !== undefined ? { label: tabsLabel } : null)}
      />
    );
    const override = props.children;
    const activeTab = props.tabs.find((tab) => tab.id === activeTabId);
    content = override !== undefined ? override : activeTab?.content;
    surfaceKey = override !== undefined ? "override" : (activeTabId ?? "override");
  }

  return (
    <BigFooterShell footer={footer} scrollMode="content">
      <ScreenContainer>
        {installBanner ? <InstallBannerView {...installBanner} pinning="flow" /> : null}
        <AppTopBar brand={{ label: title }} />
        {tabBar}
        {notice ? (
          <Row middle between gap="l">
            <StatusMessage message={notice.message} />
            {notice.action ? (
              <Button onPress={notice.action.onPress}>{notice.action.label}</Button>
            ) : null}
          </Row>
        ) : null}
        {content !== undefined ? (
          <LazySlot
            key={contentKey ?? surfaceKey}
            {...(onReload !== undefined ? { onReload } : null)}
          >
            {content}
          </LazySlot>
        ) : null}
        {consentBanner ? <ConsentBannerView {...consentBanner} /> : null}
      </ScreenContainer>
    </BigFooterShell>
  );
}
