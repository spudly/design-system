---
"@spudly/ui": minor
---

Navigation rule (#248, stage 2): page controls that navigate are now links, and controls that act stay buttons. Hosts pass destinations as hrefs instead of press callbacks, and the affected rows and controls render as real anchors on web (keyboard-operable, right-click / open-in-new-tab behaviour) with link semantics for screen readers; native hosts pass scheme-bearing absolute URLs, which open via Linking.

- OptionCard gains an href form: pass `href` instead of `onPress` and the whole card renders as a link (new `Href` story).
- SignInPage: `onSignUpPress` / `onForgotPasswordPress` are now `signUpHref` / `forgotPasswordHref`. SignUpPage: `onSignInPress` is now `signInHref`. ForgotPasswordPage: `onBackPress` is now `signInHref`. EditVersionPage: `onBack` is now `backHref` (the not-editable state's back control).
- HomePage: `onBrowsePress` / `onAddPress` / `onSharedWithMePress` are now the required `browseHref` / `addHref` / `sharedWithMeHref`.
- ProfilePage: `onManageTagsPress` / `onComponentShowcasePress` are now `tagsHref` / `showcaseHref`.
- AddRecipeMenuPage: options carry `href` instead of `target`, and `onSelect` is removed — each option card is a link.
- RecipeDetailPage: `onStartCooking` is now the required `cookingHref`; `onEditPress` / `onEditDraftPress` are now `editHref` / `editDraftHref`; `onTweakAiPress` is now `tweakAiHref`. "Tweak manually" is unchanged by design: it creates a draft and then opens the editor, and per the #248 ruling a control whose primary job is a mutation stays a callback button.
- RecipesPage: items carry a required `href` and `onRecipePress` is removed — the row thumbnail and text targets are links (link role, same accessible names). The log-cook control is unchanged.
- MealDetailPage: members carry `href`; `onCook` / `onEdit` are now `cookHref` / `editHref`; `onRecipePress` is removed. Unavailable members still render as plain, disabled content.
- MealPlanDetailPage: entries carry `href`; `onSetGoalsPress` / `onShoppingListPress` / `onEditPress` are now `goalsHref` / `shoppingListHref` / `editHref`; `onMealPress` / `onRecipePress` are removed.
- MealPlansPage: items carry `href`; `onPlanPress` is removed and `onCreatePlan` is now `createHref`.
- MealsHubPage: meals carry `href`; `onCreateMeal` / `onCreatePlan` are now `createMealHref` / `createPlanHref`; `onMealPress` / `onPlanPress` are removed. The row Delete is now rendered through TextAction (button role) instead of TextLink — an action never renders in link form; it stays a callback. The Meals/Plans tabs still switch in-page content and keep the button-variant Tabs.
- MyVersesPage: items carry `drillHref` and `onDrillVerse` is removed — Drill renders as a link; Remove stays a callback.

Bump check: re-run Storybook for the pages above and confirm the rows and controls look unchanged, that the named controls above carry real hrefs in the web DOM (anchors, not buttons), and that Drill / Delete / Remove / Tweak manually still behave as before (Delete, Remove, and Tweak manually remain buttons).
