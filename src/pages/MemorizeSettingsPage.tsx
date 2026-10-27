import { XStack } from "tamagui";
import { Button } from "../components/Button.js";
import { InlineAlert } from "../components/InlineAlert.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionCard } from "../components/SectionCard.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";

/**
 * MemorizeSettingsPage (#127, B4): Memorize's Settings screen
 * as a controlled @spudly/ui page component — the last of the
 * app's screens to move (Verses, Search, Review, and Drill
 * moved in the #49 rewires). The app keeps all state and
 * business logic — the API-key store actions, the Google
 * Drive OAuth flow, and the sync/conflict machinery in
 * @memorize/core — and drives this view entirely through
 * props. Nothing here imports an app package.
 *
 * Placement: src/pages behind the `@spudly/ui/pages` subpath
 * export, not the package root — see RecipesPage.tsx for why
 * (react-native imports must stay out of the Node-importable
 * root entry).
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
 * - The "Google Drive sync" card: the hint composes around
 *   the app's folder name — the name crosses as raw data (a
 *   stored setting with its app-side default applied), not a
 *   pre-composed line, because nothing about it is formatted;
 *   pre-composition is for locale-formatted strings (the
 *   MyVersesPage next-review precedent). Below it, one button
 *   whose label and intent follow connection state: "Connect
 *   Google Drive" until connected, "Sync with Drive" after.
 *   Connect disables until the app's auth flow is ready or
 *   while a sync runs; Sync disables while a sync runs.
 * - Feedback renders as the app renders it: the auth flow's
 *   error as an error alert, the sync outcome as an info
 *   alert — or a warning while a conflict awaits resolution,
 *   with the Keep-this-device / Keep-Drive pair under it.
 *
 * Deliberate contract shapes, all dictated by the app screen:
 * - The key field is controlled (value + change callback),
 *   the VerseSearchPage query precedent and the form pages'
 *   per-field rule: the host holds the input state because
 *   its Save handler reads it.
 * - The conflict pair is two named callbacks, not one
 *   outcome-union callback — the MemorizeReviewPage
 *   precedent: each button's intent stays named at the
 *   boundary, and the sync directions ("push" / "pull") are
 *   the app's business vocabulary, not the view's.
 * - No loading member. The app gates store readiness one
 *   level up (App renders a full-screen spinner until the
 *   store is ready), so this screen never renders a loading
 *   state of its own; an in-flight sync is display state
 *   (`isSyncing`) that disables the sync controls, exactly
 *   as the app's busy flag does.
 *
 * No render slot, by audit: the app screen renders no
 * app-owned content inside itself — its sections are DS
 * cards, fields, buttons, and alerts over display state —
 * so every action is a pure callback, which is the honest
 * contract for this view. (The web settings tab's "Get a
 * key" link is web-only surface; it is not in this screen
 * and does not enter the contract.)
 */
export interface MemorizeSettingsPageProps {
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
  /** The Drive folder the app syncs to, with the app's
   * default applied — a stored setting, raw data; the sync
   * card's hint composes its sentence around it. */
  driveFolderName: string;
  /** Whether the app holds a Drive connection — selects
   * the sync card's button (Connect vs. Sync). */
  driveConnected: boolean;
  /** Whether the app's Drive auth flow can start a
   * connection yet — Connect disables until it is ready. */
  driveConnectReady: boolean;
  /** Whether a sync (or conflict resolution) is in flight —
   * disables the sync and conflict controls, as the app's
   * busy flag does. */
  isSyncing: boolean;
  /** The Drive auth flow's current error, if any — renders
   * as an error alert under the sync button. */
  driveError?: string | null;
  /** The last sync outcome message, if any — renders as an
   * info alert, or a warning while a conflict is unresolved. */
  syncMessage?: string | null;
  /** Whether the last sync found both sides changed and a
   * resolution choice is outstanding. */
  syncConflict: boolean;
  /** "Connect Google Drive" action: the host starts its
   * OAuth flow. */
  onConnectDrivePress: () => void;
  /** "Sync with Drive" action: the host runs a sync. */
  onSyncDrivePress: () => void;
  /** "Keep this device" action: the host resolves the
   * conflict in this device's favor (its push). */
  onKeepDevicePress: () => void;
  /** "Keep Drive" action: the host resolves the conflict
   * in Drive's favor (its pull). */
  onKeepDrivePress: () => void;
}

/**
 * Full-page Memorize settings view: the heading and the
 * scripture-source and Drive-sync cards, in the fixed shell
 * the app's tab screens share. Controlled — see the file
 * header for the contract and the screen inventory it
 * mirrors.
 */
export function MemorizeSettingsPage({
  apiKeyValue,
  onApiKeyValueChange,
  hasSavedApiKey,
  onSaveApiKeyPress,
  onClearApiKeyPress,
  driveFolderName,
  driveConnected,
  driveConnectReady,
  isSyncing,
  driveError,
  syncMessage,
  syncConflict,
  onConnectDrivePress,
  onSyncDrivePress,
  onKeepDevicePress,
  onKeepDrivePress,
}: MemorizeSettingsPageProps) {
  return (
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
        <XStack gap="$2" marginTop="$3">
          <Button size="sm" onPress={onSaveApiKeyPress} disabled={!apiKeyValue.trim()}>
            Save key
          </Button>
          {hasSavedApiKey ? (
            <Button size="sm" variant="secondary" onPress={onClearApiKeyPress}>
              Clear key
            </Button>
          ) : null}
        </XStack>
      </SectionCard>

      <SectionCard title="Google Drive sync">
        <Text variant="hint">
          Syncs your verse list (never your API key) to memorize-data.json in the “{driveFolderName}
          ” Drive folder.
        </Text>
        {driveConnected ? (
          <Button marginTop="$3" onPress={onSyncDrivePress} disabled={isSyncing}>
            Sync with Drive
          </Button>
        ) : (
          <Button
            marginTop="$3"
            onPress={onConnectDrivePress}
            disabled={!driveConnectReady || isSyncing}
          >
            Connect Google Drive
          </Button>
        )}
        {driveError ? <InlineAlert severity="error">{driveError}</InlineAlert> : null}
        {syncMessage ? (
          <InlineAlert severity={syncConflict ? "warning" : "info"}>{syncMessage}</InlineAlert>
        ) : null}
        {syncConflict ? (
          <XStack gap="$2" marginTop="$3">
            <Button size="sm" onPress={onKeepDevicePress} disabled={isSyncing}>
              Keep this device
            </Button>
            <Button size="sm" variant="secondary" onPress={onKeepDrivePress} disabled={isSyncing}>
              Keep Drive
            </Button>
          </XStack>
        ) : null}
      </SectionCard>
    </ScreenContainer>
  );
}
