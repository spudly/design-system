import { BigFooterShell, type BigFooterData } from "../components/BigFooter.js";
import { Button } from "../components/Button.js";
import { ButtonRow } from "../components/ButtonRow.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionCard } from "../components/SectionCard.js";
import { Text } from "../components/Text.js";
import { TextField } from "../views/TextField.js";

/**
 * MemorizeSettingsPage (#127, B4): Memorize's Settings screen
 * as a controlled @spudly/ui page component — the last of the
 * app's screens to move (Verses, Search, Review, and Drill
 * moved in the #49 rewires). The app keeps all state and
 * business logic — the API-key store actions in
 * @memorize/core — and drives this view entirely through
 * props. Nothing here imports an app package.
 *
 * The "Google Drive sync" card this page originally carried
 * was removed entirely in #424: Stephen removed Drive sync
 * from Memorize (the feature never worked; memorize#96), so
 * the page renders only the "Scripture source" card and its
 * props carry no Drive members at all.
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
 * The composition mirrors the app screen exactly:
 * - The "Scripture source" card: the app's hint copy verbatim,
 *   the secure API-key field, and the Save / Clear pair. Save
 *   disables on an empty (whitespace-only) field value — the
 *   app's rule, derived here from the controlled value, as
 *   the app derives it from its input state. Clear renders
 *   only when a key is saved (`hasSavedApiKey`).
 * Deliberate contract shapes, all dictated by the app screen:
 * - The key field is controlled (value + change callback),
 *   the VerseSearchPage query precedent and the form pages'
 *   per-field rule: the host holds the input state because
 *   its Save handler reads it.
 * - No loading member. The app gates store readiness one
 *   level up (App renders a full-screen spinner until the
 *   store is ready), so this screen never renders a loading
 *   state of its own.
 *
 * No render slot, by audit: the app screen renders no
 * app-owned content inside itself — its sections are DS
 * cards, fields, buttons, and alerts over display state —
 * so every action is a pure callback, which is the honest
 * contract for this view. (The web settings tab's "Get a
 * key" link is web-only surface; it is not in this screen
 * and does not enter the contract.)
 *
 * De-styled for #119: the page renders no layout primitives
 * and sets no styling props. The cards' contents are direct
 * SectionCard children — the card owns the 12px rhythm
 * between them that the page's inner stacks used to carry —
 * and the two button pairs are ButtonRows.
 */
export type MemorizeSettingsPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  /** The API-key field's current text. The host holds this
   * state; its Save handler reads it. */
  apiKeyValue: string;
  /** Key field change: the host records the new text. */
  onApiKeyValueChange: (value: string) => void;
  /** Whether a key is currently saved — the Clear action
   * renders only then, as in the app. */
  hasSavedApiKey: boolean;
  /** "Save key" action: the host stores the trimmed field
   * value as the app's API key. */
  onSaveApiKeyPress: () => void;
  /** "Clear key" action: the host clears the field and the
   * stored key. */
  onClearApiKeyPress: () => void;
};

/**
 * Full-page Memorize settings view: the heading and the
 * scripture-source card, in the fixed shell the app's tab
 * screens share. Controlled — see the file header for the
 * contract and the screen inventory it mirrors.
 */
export function MemorizeSettingsPage({
  apiKeyValue,
  onApiKeyValueChange,
  hasSavedApiKey,
  onSaveApiKeyPress,
  onClearApiKeyPress,
  footer,
}: MemorizeSettingsPageProps) {
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer scrollable={false}>
        <Text variant="heading">Settings</Text>

        <SectionCard title="Scripture source">
          <Text variant="hint">
            A gospel-engine API key unlocks full-library search. The key stays on this device and is
            never synced.
          </Text>
          <TextField
            label="API key"
            value={apiKeyValue}
            onChangeText={onApiKeyValueChange}
            placeholder="gospel-engine API key"
            secureTextEntry
            autoCapitalize="none"
          />
          <ButtonRow>
            <Button size="sm" onPress={onSaveApiKeyPress} disabled={!apiKeyValue.trim()}>
              Save key
            </Button>
            {hasSavedApiKey ? (
              <Button size="sm" variant="secondary" onPress={onClearApiKeyPress}>
                Clear key
              </Button>
            ) : null}
          </ButtonRow>
        </SectionCard>
      </ScreenContainer>
    </BigFooterShell>
  );
}
