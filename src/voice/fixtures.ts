import type { Voice } from "./Voice.js";

/**
 * Storybook fixture voice (#539) — fixtures ONLY, never defaults.
 *
 * The DS ships no default strings; this complete fixture object
 * exists so stories can render, under the same determinism rules as
 * src/pages/fixtures.ts. Its type is Voice, so a missing slot is a
 * compile error — that is the parity gate for the fixture.
 *
 * The strings here are neutral placeholder copy for Storybook, not
 * either app's voice: Eciperay and Memorize each author their real
 * voice object in their own repo.
 */
export const fixtureVoice: Voice = {
  common: {
    cancelLabel: "Cancel",
    saveLabel: "Save",
    deleteLabel: "Delete",
    editLabel: "Edit",
    closeLabel: "Close",
    retryLabel: "Retry",
    loadingLabel: "Loading",
  },
  commentItem: {
    editLabel: "Edit",
    saveLabel: "Save",
    cancelLabel: "Cancel",
    deleteLabel: "Delete",
  },
  ratingsCard: {
    communityRatingLabel: "Community rating",
    noCommunityRatingsLabel: "No community ratings yet",
    yourRatingLabel: "Your rating",
    staleCommunityRatingHint:
      "Some community ratings were left on earlier recipe versions and count at half weight in the average.",
    staleViewerRatingHint:
      "Your rating was left on an earlier version of the recipe. Tap a star to update it for the current version.",
  },
  nutritionPanel: {
    perServingLabel: "Per Serving",
    refreshLabel: "Refresh",
    refreshingLabel: "Refreshing\u2026",
    estimateLabel: "Estimate nutrition",
    unavailableLabel: "Nutrition is not available yet.",
  },
};

/** Pseudo-localize one string the en-XA way: bracketed, accented, lengthened. */
function pseudoLocalize(value: string): string {
  const accented = value.replace(/[aeiou]/gi, (ch) => {
    const map: Record<string, string> = { a: "à", e: "ë", i: "ï", o: "ö", u: "ü", A: "À", E: "Ë", I: "Ï", O: "Ö", U: "Ü" };
    return map[ch] ?? ch;
  });
  return `⟦${accented} ⟧`;
}

function pseudoLocalizeVoice(voice: Voice): Voice {
  const walk = (node: unknown): unknown => {
    if (typeof node === "string") return pseudoLocalize(node);
    if (node !== null && typeof node === "object") {
      return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, walk(v)]));
    }
    return node;
  };
  return walk(voice) as Voice;
}

/**
 * The en-XA pseudo-locale fixture voice (#539): every slot of the
 * fixture voice pseudo-localized, so any string NOT supplied through
 * the voice object shows up untransformed in a Storybook pass.
 */
export const fixtureVoicePseudoLocale: Voice = pseudoLocalizeVoice(fixtureVoice);
