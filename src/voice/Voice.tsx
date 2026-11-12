import { createContext, useContext, type ReactNode } from "react";

/**
 * Voice-as-theme text system (#539; direction decided by Stephen
 * 2026-11-07, plan approved 2026-11-09).
 *
 * The DS defines the typed slot object and the provider — and ships
 * NO default strings. Each app authors its complete voice object in
 * its own repo, in its own voice, and supplies it once at the root
 * through VoiceProvider, the same way it supplies a theme. Internal
 * components and shared views read their text from the object via
 * useVoice(), so a shared component's text is defined once per app,
 * not redefined per page.
 *
 * Boundary rules (from the decided direction):
 * - Strings cross into the DS pre-formatted: plurals, dates, and
 *   numbers are resolved app-side. The only exception is a narrow
 *   typed formatter callback for strings built from values only a
 *   widget knows internally (see VoiceFormatter).
 * - No message IDs and no translate function are passed into the DS,
 *   and the DS takes no i18n library dependency — the library stays
 *   each app's choice.
 * - A page may override an individual voice slot only exceptionally;
 *   overrides are the drift risk this design exists to kill.
 *
 * Missing-voice behavior (approved lean): fail fast. Reading the
 * voice with no VoiceProvider above throws a clear error naming the
 * missing provider, so app wiring mistakes surface immediately
 * instead of silently rendering empty strings.
 */

/** A formatter slot: builds a string from values only the widget knows internally. */
export type VoiceFormatter<Args extends readonly unknown[]> = (...args: Args) => string;

export type Voice = {
  /** Text shared across many surfaces. */
  common: {
    cancelLabel: string;
    saveLabel: string;
    deleteLabel: string;
    editLabel: string;
    closeLabel: string;
    retryLabel: string;
    loadingLabel: string;
  };
  /** CommentItem widget (tranche 1). */
  commentItem: {
    editLabel: string;
    saveLabel: string;
    cancelLabel: string;
    deleteLabel: string;
  };
  /** RatingsCard widget (tranche 1b). */
  ratingsCard: {
    communityRatingLabel: string;
    noCommunityRatingsLabel: string;
    yourRatingLabel: string;
    staleCommunityRatingHint: string;
    staleViewerRatingHint: string;
  };
  /** NutritionPanel widget (tranche 1b). */
  nutritionPanel: {
    perServingLabel: string;
    refreshLabel: string;
    refreshingLabel: string;
    estimateLabel: string;
    unavailableLabel: string;
  };
};

const VoiceContext = createContext<Voice | null>(null);

export type VoiceProviderProps = {
  /** The app's complete voice object. No defaults are supplied by the DS. */
  voice: Voice;
  children?: ReactNode;
};

export function VoiceProvider({ voice, children }: VoiceProviderProps) {
  return <VoiceContext.Provider value={voice}>{children}</VoiceContext.Provider>;
}

/**
 * The app-supplied voice object. Throws when no VoiceProvider is
 * above the caller — fail fast, per the approved plan lean.
 */
export function useVoice(): Voice {
  const voice = useContext(VoiceContext);
  if (voice === null) {
    throw new Error(
      "useVoice: no VoiceProvider found. The design system ships no default strings (#539) — the app must supply its complete voice object once at the root via <VoiceProvider voice={...}>.",
    );
  }
  return voice;
}
