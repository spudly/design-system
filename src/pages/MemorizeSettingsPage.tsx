import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { Text } from "../widgets/Text.js";

/**
 * MemorizeSettingsPage (#127, B4): Memorize's Settings screen
 * as a controlled @spudly/ui page component — the last of the
 * app's screens to move (Verses, Search, Review, and Drill
 * moved in the #49 rewires). The app keeps all state and
 * business logic and drives this view entirely through
 * props. Nothing here imports an app package.
 *
 * The two cards this page originally carried are both gone:
 * - The "Google Drive sync" card was removed entirely in
 *   #424: Stephen removed Drive sync from Memorize (the
 *   feature never worked; memorize#96), so the page's props
 *   carry no Drive members at all.
 * - The "Scripture source" card — the secure API-key field
 *   and its Save / Clear pair — was removed entirely in
 *   #439: Stephen ruled (memorize#101, extended to every
 *   platform 2026-11-05) that Memorize search is
 *   server-key-only, so the page renders no API key section
 *   and its props carry no API-key members at all. What
 *   remains is the screen's own heading in the shared shell;
 *   host-side key wiring/storage removal is memorize#101.
 *
 * Placement: src/pages, exported from the package root (#298)
 * — pages are the package's only exports.
 *
 * Which screen this is: the app's Settings tab (SettingsScreen
 * in spudly/memorize packages/app). The app chrome (its
 * "Memorize" title and the tab bar) stays app-side, like the
 * other Memorize pages; the screen's own heading ("Settings")
 * renders here, inside the same shell the other Memorize
 * pages carry (the non-scrolling ScreenContainer — the app
 * renders every tab inside one, and the page brings its own,
 * per the VerseSearchPage contract).
 *
 * No loading member. The app gates store readiness one
 * level up (App renders a full-screen spinner until the
 * store is ready), so this screen never renders a loading
 * state of its own.
 *
 * No render slot, by audit: the app screen renders no
 * app-owned content inside itself, so the contract carries
 * no callbacks at all now that the API-key actions are gone.
 *
 * De-styled for #119: the page renders no layout primitives
 * and sets no styling props.
 */
export type MemorizeSettingsPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
};

/**
 * Full-page Memorize settings view: the heading in the fixed
 * shell the app's tab screens share. Controlled — see the
 * file header for the contract and the screen inventory it
 * mirrors.
 */
export function MemorizeSettingsPage({ footer }: MemorizeSettingsPageProps) {
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer scrollable={false}>
        <Text variant="heading">Settings</Text>
      </ScreenContainer>
    </BigFooterShell>
  );
}
