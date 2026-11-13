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
  backLink: {
    label: "Back",
  },
  prevNextNav: {
    backLabel: "Back",
    nextLabel: "Next",
  },
  bulkSelectToolbar: {
    selectAllLabel: "Select all",
    clearSelectionLabel: "Clear selection",
    searchPlaceholder: "Search\u2026",
    selectedLabel: (count: number) => `${count} selected`,
  },
  recipeImageView: {
    label: "Recipe image",
    emptyMessage: "Choose an image from your library or generate one with AI",
    previewLabel: "Recipe preview",
    browseLabel: "Browse images",
    uploadingLabel: "Uploading\u2026",
    takePhotoLabel: "Take photo",
    generateLabel: "Generate with AI",
    generatingLabel: "Generating\u2026",
    generateAccessibilityLabel: "Generate image with AI",
    removeLabel: "Remove image",
  },
  recipeIngredientListView: {
    label: "Ingredients",
    emptyMessage: "No ingredients yet",
    addLabel: "+ Add",
    addIngredientLabel: "Add ingredient",
  },
  recipeIngredientRowView: {
    quantityPlaceholder: "Qty",
    unitPlaceholder: "Unit",
    namePlaceholder: "Name",
    quantityLabel: (position: number) => `Ingredient ${position} quantity`,
    unitLabel: (position: number) => `Ingredient ${position} unit`,
    nameLabel: (position: number) => `Ingredient ${position} name`,
    removeLabel: "Remove",
    removeIngredientLabel: (position: number) => `Remove ingredient ${position}`,
  },
  recipeInstructionListView: {
    label: "Instructions",
    emptyMessage: "No instructions yet",
    addLabel: "+ Add",
    addInstructionLabel: "Add instruction",
  },
  recipeInstructionRowView: {
    stepLabel: (position: number) => `Step ${position}`,
    removeLabel: "Remove",
    removeStepLabel: (position: number) => `Remove step ${position}`,
  },
  accessTokensPanel: {
    title: "API access tokens",
    infoText:
      "Personal access tokens let apps and scripts use the Eciperay API — including the MCP server — without signing in each time. Treat them like passwords.",
    createdSecretTitle: "Copy your new token now — you won't see it again.",
    createdSecretHint: "Long-press the token to copy it.",
    doneLabel: "Done",
    tokenNameLabel: "Token name",
    tokenNamePlaceholder: "e.g. Claude Desktop",
    createLabel: "Create token",
    emptyMessage: "No tokens yet.",
  },
  accountDataView: {
    title: "Your data",
    description: "Download a copy of your recipes and account data, or delete your account.",
    exportLabel: "Download my data",
    exportPendingLabel: "Preparing\u2026",
    deleteLabel: "Delete account",
    deletePendingLabel: "Deleting\u2026",
  },
  feedbackPreferenceView: {
    title: "Preferences",
    shortcutLabel: "Show feedback shortcut",
    shortcutDescription: "Adds a floating shortcut for sending feedback from anywhere in the app.",
    consentPromptText:
      "Share anonymous usage analytics to help improve the app? You can change this any time.",
    acceptLabel: "Accept",
    declineLabel: "Decline",
    withdrawLabel: "Withdraw consent",
    choicesHintBefore: "Manage your choice at any time on the ",
    choicesLinkLabel: "privacy choices page",
  },
  subscriptionView: {
    title: "Subscription",
    manageLabel: "Manage subscription",
    managePendingLabel: "Opening\u2026",
    refreshLabel: "Check again",
    refreshPendingLabel: "Checking\u2026",
    portalLabel: "Open subscription portal",
  },
  transferRecipesView: {
    title: "Transfer recipes",
    hint: "Export recipes to a file you can keep, or import recipes from a file.",
    importLabel: "Import recipes",
    importPendingLabel: "Importing\u2026",
  },
  signInForm: {
    emailLabel: "Email",
    passwordLabel: "Password",
    submitLabel: "Sign In",
    submitPendingLabel: "Signing in\u2026",
    createAccountLabel: "Create an account",
    forgotPasswordLabel: "Forgot password?",
  },
  signUpForm: {
    nameLabel: "Your name",
    emailLabel: "Email",
    passwordLabel: "Password",
    submitLabel: "Create Account",
    submitPendingLabel: "Creating account\u2026",
    signInLabel: "Already have an account? Sign in",
  },
  forgotPasswordForm: {
    emailLabel: "Email",
    submitLabel: "Send Reset Link",
    submitPendingLabel: "Sending\u2026",
    backToSignInLabel: "Back to sign in",
  },
  resetPasswordForm: {
    passwordLabel: "New password",
    submitLabel: "Update password",
    submitPendingLabel: "Updating\u2026",
  },
  recipeCommentsView: {
    title: "Comments",
    emptyMessage: "No comments yet",
    composerLabel: "Add a comment",
    composerPlaceholder: "Share how it turned out\u2026",
    postLabel: "Post comment",
  },
  recipeSharingView: {
    title: "Sharing",
    consentLabel: "Publishing consent",
    saveLabel: "Save visibility",
    savePendingLabel: "Saving\u2026",
    shareLinkLabel: "Anyone with this link can view this recipe.",
    rotateShareLinkLabel: "Generate share link",
    copyShareLinkLabel: "Copy share link",
    permalinkLabel: "Public link",
    copyPermalinkLabel: "Copy public link",
  },
  nutritionGoalsForm: {
    title: "Daily nutrition goals",
    caloriesLabel: "Calories",
    proteinLabel: "Protein (g)",
    carbsLabel: "Carbs (g)",
    fatLabel: "Fat (g)",
    satietyScoreLabel: "Satiety score",
    optionalPlaceholder: "Optional",
    saveLabel: "Save goals",
  },
  ratingForm: {
    title: "How did it go?",
    notesPlaceholder: "Notes (optional)",
    secondaryLabel: "Skip",
    saveLabel: "Save",
  },
  changedListBanner: {
    revertLabel: "Revert",
  },
  consentBannerView: {
    acceptLabel: "Accept",
    declineLabel: "Decline",
  },
  installBannerView: {
    dismissLabel: "Dismiss install banner",
  },
  recipeExportPickerView: {
    searchPlaceholder: "Search recipes\u2026",
    emptyMessage: "No recipes to export yet.",
    exportPendingLabel: "Exporting\u2026",
  },
  autocompletePicker: {
    searchPlaceholder: "Search\u2026",
    searchLabel: "Search",
    searchingLabel: "Searching",
    noResultsMessage: "No results found.",
    resultsAvailableLabel: (count: number) =>
      `${count} ${count === 1 ? "result" : "results"} available`,
    removeLabel: "Remove",
    removeItemLabel: (itemLabel: string) => `Remove ${itemLabel}`,
  },
  alert: {
    dismissLabel: "Dismiss",
  },
  fixedActionBanner: {
    dismissLabel: "Dismiss",
  },
  checkboxSelectList: {
    emptyMessage: "No items found.",
  },
  selectField: {
    placeholder: "Select\u2026",
    selectOptionLabel: "Select an option",
  },
  colorPickerField: {
    chooseColorLabel: "Choose a color",
    selectColorLabel: (color: string) => `Select color ${color}`,
  },
  starRatingInput: {
    label: "Star rating",
    ratedLabel: (value: number) => `Rated ${value} out of 5 stars`,
    rateLabel: (star: number) => `Rate ${star} out of 5 stars`,
  },
  removableField: {
    removeLabel: "Remove",
  },
  stepOverlay: {
    doneLabel: "Done",
  },
  secretRevealPanel: {
    title: "Your secret",
    copyLabel: "Copy",
    hint: "Copy it now — it won't be shown again.",
    dismissLabel: "Dismiss",
  },
  recipeOverviewPanel: {
    servingsLabel: "Servings",
    prepLabel: "Prep",
    cookLabel: "Cook",
  },
  recipeIngredientsPanel: {
    servingsLabel: "Servings",
    scaleLabel: "Scale",
    customScaleLabel: "Custom",
    customScaleAccessibilityLabel: "Custom scale",
    decreaseServingsLabel: "Decrease Servings",
    increaseServingsLabel: "Increase Servings",
    missingIngredientsHint: "Tap an ingredient to mark it missing and see substitutions below.",
    findingSubstitutionsLabel: "Finding substitutions\u2026",
    substitutionsTitle: "Substitutions",
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
    const map: Record<string, string> = {
      a: "à",
      e: "ë",
      i: "ï",
      o: "ö",
      u: "ü",
      A: "À",
      E: "Ë",
      I: "Ï",
      O: "Ö",
      U: "Ü",
    };
    return map[ch] ?? ch;
  });
  return `⟦${accented} ⟧`;
}

function pseudoLocalizeVoice(voice: Voice): Voice {
  const walk = (node: unknown): unknown => {
    if (typeof node === "string") return pseudoLocalize(node);
    if (typeof node === "function") {
      // Formatter slots: forward the arguments and pseudo-localize
      // the returned string, so a formatter's output is transformed
      // the same way a plain string slot is.
      return (...args: unknown[]) => {
        const result = (node as (...a: unknown[]) => unknown)(...args);
        return typeof result === "string" ? pseudoLocalize(result) : result;
      };
    }
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
