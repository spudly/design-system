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
  /** BackLink widget (tranche 1c): default when no label prop is passed. */
  backLink: {
    label: string;
  };
  /** PrevNextNav widget (tranche 1c): defaults when label props are not passed. */
  prevNextNav: {
    backLabel: string;
    nextLabel: string;
  };
  /** BulkSelectToolbar widget (tranche 1c): defaults when label props are not passed. */
  bulkSelectToolbar: {
    selectAllLabel: string;
    clearSelectionLabel: string;
    /** Search-field placeholder default (tranche 1f). */
    searchPlaceholder: string;
    /** Formatter (tranche 1f): builds the selection-count text from the count. */
    selectedLabel: VoiceFormatter<[count: number]>;
  };
  /** StepOverlay widget (tranche 1c): default when no doneLabel prop is passed. */
  stepOverlay: {
    doneLabel: string;
  };
  /** SecretRevealPanel widget (tranche 1d). */
  secretRevealPanel: {
    title: string;
    copyLabel: string;
    hint: string;
    dismissLabel: string;
  };
  /** RecipeOverviewPanel widget (tranche 1e): stat band labels. */
  recipeOverviewPanel: {
    servingsLabel: string;
    prepLabel: string;
    cookLabel: string;
  };
  /** RecipeIngredientsPanel widget (tranche 1e). */
  recipeIngredientsPanel: {
    servingsLabel: string;
    scaleLabel: string;
    customScaleLabel: string;
    customScaleAccessibilityLabel: string;
    decreaseServingsLabel: string;
    increaseServingsLabel: string;
    missingIngredientsHint: string;
    findingSubstitutionsLabel: string;
    substitutionsTitle: string;
  };
  /** RecipeImageView (tranche 2a): defaults when label / emptyMessage props are not passed, plus the view's own chrome. */
  recipeImageView: {
    label: string;
    emptyMessage: string;
    previewLabel: string;
    browseLabel: string;
    uploadingLabel: string;
    takePhotoLabel: string;
    generateLabel: string;
    generatingLabel: string;
    generateAccessibilityLabel: string;
    removeLabel: string;
  };
  /** RecipeIngredientListView (tranche 2a): defaults when label / emptyMessage / addLabel props are not passed, plus the add action's name. */
  recipeIngredientListView: {
    label: string;
    emptyMessage: string;
    addLabel: string;
    addIngredientLabel: string;
  };
  /** RecipeIngredientRowView (tranche 2a): field placeholders and accessible names built from the row's position. */
  recipeIngredientRowView: {
    quantityPlaceholder: string;
    unitPlaceholder: string;
    namePlaceholder: string;
    /** Formatter: builds the quantity field's accessible name from the row's position. */
    quantityLabel: VoiceFormatter<[position: number]>;
    /** Formatter: builds the unit field's accessible name from the row's position. */
    unitLabel: VoiceFormatter<[position: number]>;
    /** Formatter: builds the name field's accessible name from the row's position. */
    nameLabel: VoiceFormatter<[position: number]>;
    removeLabel: string;
    /** Formatter: builds the remove action's accessible name from the row's position. */
    removeIngredientLabel: VoiceFormatter<[position: number]>;
  };
  /** RecipeInstructionListView (tranche 2a): defaults when label / emptyMessage / addLabel props are not passed, plus the add action's name. */
  recipeInstructionListView: {
    label: string;
    emptyMessage: string;
    addLabel: string;
    addInstructionLabel: string;
  };
  /** RecipeInstructionRowView (tranche 2a): the step field's accessible name and the remove action, built from the row's position. */
  recipeInstructionRowView: {
    /** Formatter: builds the step field's accessible name from the row's position. */
    stepLabel: VoiceFormatter<[position: number]>;
    removeLabel: string;
    /** Formatter: builds the remove action's accessible name from the row's position. */
    removeStepLabel: VoiceFormatter<[position: number]>;
  };
  /** AccessTokensPanel view (tranche 2b): the section's own chrome — title, intro, created-secret panel, create form, and empty state. */
  accessTokensPanel: {
    title: string;
    infoText: string;
    createdSecretTitle: string;
    createdSecretHint: string;
    doneLabel: string;
    tokenNameLabel: string;
    tokenNamePlaceholder: string;
    createLabel: string;
    emptyMessage: string;
  };
  /** AccountDataView (tranche 2b): defaults when title / description / export / delete label props are not passed. */
  accountDataView: {
    title: string;
    description: string;
    exportLabel: string;
    exportPendingLabel: string;
    deleteLabel: string;
    deletePendingLabel: string;
  };
  /** FeedbackPreferenceView (tranche 2b): defaults when title / shortcut / consent / choices label props are not passed. */
  feedbackPreferenceView: {
    title: string;
    shortcutLabel: string;
    shortcutDescription: string;
    consentPromptText: string;
    acceptLabel: string;
    declineLabel: string;
    withdrawLabel: string;
    choicesHintBefore: string;
    choicesLinkLabel: string;
  };
  /** SubscriptionView (tranche 2b): defaults when title / manage / refresh / portal label props are not passed. */
  subscriptionView: {
    title: string;
    manageLabel: string;
    managePendingLabel: string;
    refreshLabel: string;
    refreshPendingLabel: string;
    portalLabel: string;
  };
  /** TransferRecipesView (tranche 2b): defaults when title / hint / import label props are not passed. */
  transferRecipesView: {
    title: string;
    hint: string;
    importLabel: string;
    importPendingLabel: string;
  };
  /** SignInForm view (tranche 2c): the form's field labels, submit action, and footer links — the form has no label props, so its copy reads the voice slots directly. */
  signInForm: {
    emailLabel: string;
    passwordLabel: string;
    submitLabel: string;
    submitPendingLabel: string;
    createAccountLabel: string;
    forgotPasswordLabel: string;
  };
  /** SignUpForm view (tranche 2c): the form's field labels, submit action, and sign-in link — the form has no label props, so its copy reads the voice slots directly. */
  signUpForm: {
    nameLabel: string;
    emailLabel: string;
    passwordLabel: string;
    submitLabel: string;
    submitPendingLabel: string;
    signInLabel: string;
  };
  /** ForgotPasswordForm view (tranche 2c): the form's field label, submit action, and back link — the form has no label props, so its copy reads the voice slots directly. */
  forgotPasswordForm: {
    emailLabel: string;
    submitLabel: string;
    submitPendingLabel: string;
    backToSignInLabel: string;
  };
  /** ResetPasswordForm view (tranche 2c): the form's field label and submit action — the form has no label props, so its copy reads the voice slots directly. */
  resetPasswordForm: {
    passwordLabel: string;
    submitLabel: string;
    submitPendingLabel: string;
  };
  /** RecipeCommentsView (tranche 2d): defaults when title / emptyMessage / composer / post label props are not passed. */
  recipeCommentsView: {
    title: string;
    emptyMessage: string;
    composerLabel: string;
    composerPlaceholder: string;
    postLabel: string;
  };
  /** RecipeSharingView (tranche 2d): defaults when title / consent / save / share-link / permalink label props are not passed. */
  recipeSharingView: {
    title: string;
    consentLabel: string;
    saveLabel: string;
    savePendingLabel: string;
    shareLinkLabel: string;
    rotateShareLinkLabel: string;
    copyShareLinkLabel: string;
    permalinkLabel: string;
    copyPermalinkLabel: string;
  };
  /** NutritionGoalsForm (tranche 2d): the section title, field labels, optional placeholder, and save action — the form has no label props, so its copy reads the voice slots directly. */
  nutritionGoalsForm: {
    title: string;
    caloriesLabel: string;
    proteinLabel: string;
    carbsLabel: string;
    fatLabel: string;
    satietyScoreLabel: string;
    minLabel: string;
    maxLabel: string;
    optionalPlaceholder: string;
    saveLabel: string;
  };
  /** RatingForm (tranche 2d): defaults when title / notesPlaceholder / secondaryLabel props are not passed, plus the save action's text and accessible name. */
  ratingForm: {
    title: string;
    notesPlaceholder: string;
    secondaryLabel: string;
    saveLabel: string;
  };
  /** ChangedListBanner (tranche 2e): the Revert action's label — the banner's summary line is host data, so only the action reads the voice. */
  changedListBanner: {
    revertLabel: string;
  };
  /** ConsentBannerView (tranche 2e): defaults when acceptLabel / declineLabel props are not passed. */
  consentBannerView: {
    acceptLabel: string;
    declineLabel: string;
  };
  /** InstallBannerView (tranche 2e): default when the dismissAriaLabel prop is not passed. */
  installBannerView: {
    dismissLabel: string;
  };
  /** RecipeExportPickerView (tranche 2e): defaults when searchPlaceholder / emptyMessage / exportPendingLabel props are not passed. */
  recipeExportPickerView: {
    searchPlaceholder: string;
    emptyMessage: string;
    exportPendingLabel: string;
  };
  /** SignInPage (tranche 3a): the page heading — the page has no copy props for its heading, so its copy reads the voice slots directly. */
  signInPage: {
    heading: string;
  };
  /** SignUpPage (tranche 3a): the page heading — the page has no copy props for its heading, so its copy reads the voice slots directly. */
  signUpPage: {
    heading: string;
  };
  /** ForgotPasswordPage (tranche 3a): the page heading and intro line — the page has no copy props for them, so its copy reads the voice slots directly. */
  forgotPasswordPage: {
    heading: string;
    description: string;
  };
  /** ResetPasswordPage (tranche 3a): the page heading and intro line — the page has no copy props for them, so its copy reads the voice slots directly. */
  resetPasswordPage: {
    heading: string;
    description: string;
  };
  /** FeedbackPage (tranche 3b): the page title, hint, submitted thanks, field labels and placeholders, bug checkbox, and submit action — the page has no copy props, so its copy reads the voice slots directly. */
  feedbackPage: {
    title: string;
    description: string;
    submittedMessage: string;
    messageLabel: string;
    messagePlaceholder: string;
    replyEmailLabel: string;
    replyEmailPlaceholder: string;
    bugLabel: string;
    submitLabel: string;
    submitPendingLabel: string;
  };
  /** ConsentPreferencesPage (tranche 3b): defaults when the description / hint props are not passed, plus the card title, the current-choice line's prefix and choice labels, and the action labels. */
  consentPreferencesPage: {
    title: string;
    description: string;
    hint: string;
    currentChoiceLabel: string;
    acceptedLabel: string;
    declinedLabel: string;
    notSetLabel: string;
    acceptLabel: string;
    declineLabel: string;
    withdrawLabel: string;
  };
  /** RouteErrorPage (tranche 3b): defaults when the title / message / homeLabel props are not passed, per variant. */
  routeErrorPage: {
    notFoundTitle: string;
    notFoundMessage: string;
    errorTitle: string;
    errorMessage: string;
    homeLabel: string;
  };
  /** PayPage (tranche 3c): the per-status card titles and bodies, the opening state's spinner label and message, the retry actions, and the home button's default label — the page's status copy reads the voice slots directly; the home label stays overridable by the host because it names the host's home. */
  payPage: {
    title: string;
    needsTransactionTitle: string;
    unconfiguredBody: string;
    needsTransactionBody: string;
    openingLabel: string;
    openingMessage: string;
    closedBody: string;
    errorBody: string;
    homeLabel: string;
    reopenLabel: string;
    retryLabel: string;
  };
  /** AddRecipeMenuPage (tranche 3c): the page title — the options are host data, so only the title reads the voice. */
  addRecipeMenuPage: {
    title: string;
  };
  /** ManualEntryPage (tranche 3c): the shell heading around the recipe form. */
  manualEntryPage: {
    heading: string;
  };
  /** LegalDocumentPage (tranche 3c): the last-updated line — a formatter slot because the pre-formatted date is host data only the page combines with the label. */
  legalDocumentPage: {
    lastUpdatedLabel: VoiceFormatter<[lastUpdated: string]>;
  };
  /** AutocompletePicker widget (tranche 1f): search-field defaults and search-state announcements. */
  autocompletePicker: {
    searchPlaceholder: string;
    searchLabel: string;
    searchingLabel: string;
    noResultsMessage: string;
    /** Formatter: builds the results-count announcement from the count only the picker knows. */
    resultsAvailableLabel: VoiceFormatter<[count: number]>;
    removeLabel: string;
    /** Formatter: builds a selected item's Remove accessible name from its label. */
    removeItemLabel: VoiceFormatter<[itemLabel: string]>;
  };
  /** Alert widget (tranche 1f): the dismiss button's accessible name. */
  alert: {
    dismissLabel: string;
  };
  /** FixedActionBanner widget (tranche 1f): the dismiss action's text and accessible name. */
  fixedActionBanner: {
    dismissLabel: string;
  };
  /** CheckboxSelectList widget (tranche 1f): default empty-state message. */
  checkboxSelectList: {
    emptyMessage: string;
  };
  /** SelectField widget (tranche 1f): form-field fallbacks. */
  selectField: {
    placeholder: string;
    selectOptionLabel: string;
  };
  /** ColorPickerField widget (tranche 1f): form-field fallbacks. */
  colorPickerField: {
    chooseColorLabel: string;
    /** Formatter: builds a swatch's accessible name from its color name. */
    selectColorLabel: VoiceFormatter<[color: string]>;
  };
  /** StarRatingInput widget (tranche 1f): form-field fallbacks. */
  starRatingInput: {
    label: string;
    /** Formatter: builds the read-only display's name from the rating value. */
    ratedLabel: VoiceFormatter<[value: number]>;
    /** Formatter: builds one star's accessible name from its star number. */
    rateLabel: VoiceFormatter<[star: number]>;
  };
  /** RemovableField widget (tranche 1f): the remove control's visible text. */
  removableField: {
    removeLabel: string;
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
