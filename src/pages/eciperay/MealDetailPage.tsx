import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import { LoadingScope } from "../../contexts/LoadingScope.js";
import { TextSkeleton } from "../../widgets/feedback/TextSkeleton.js";
import { Button } from "../../widgets/actions/Button.js";
import { ButtonRow } from "../../widgets/actions/ButtonRow.js";
import { ListItem } from "../../widgets/data/ListItem.js";
import { MarkableRow } from "../../widgets/data/MarkableRow.js";
import { Col } from "../../widgets/layout/Col.js";
import { ScreenContainer } from "../../widgets/layout/ScreenContainer.js";
import { SectionCard } from "../../widgets/content/SectionCard.js";
import { Text } from "../../widgets/data/Text.js";

/**
 * MealDetailPage (#125, B3b): Eciperay's meal detail screen
 * as a controlled @spudly/ui page — the split view half of
 * `MealDetailView` (the B2 audit's page-view disposition;
 * #125's parenthetical placed this page in #49, but no
 * MealDetailPage shipped there — the discrepancy is recorded
 * on #125, and the audit governs). The app screen keeps the
 * meal query and navigation; this view renders a meal
 * view-model and reports presses.
 *
 * The screen inventory this mirrors, in render order: the
 * meal title, its notes, a nutrition summary line, the
 * Cook meal / Edit action row, and the "Recipes" section —
 * one row per member recipe. The boundary is pre-composed
 * strings (the MealPlanDetailPage precedent): the app's
 * nutrition formatter and its servings line stay app-side,
 * and their output crosses as the page-level
 * `nutritionLabel` and each member's `subtitle`.
 *
 * A member whose access was lost renders its "(unavailable)"
 * suffix and does not press — the page renders the suffix
 * from the member's `isUnavailable` flag, mirroring the app
 * view's disabled row (and MealPlanDetailPage's entry rows).
 *
 * One deliberate treatment difference, as in
 * MealPlanDetailPage: member titles take the theme-aware
 * foreground instead of the app's fixed gray10, which is
 * unreadable on a dark theme's card surface.
 *
 * Loading (#874, following the #278 pattern): while
 * `loading`, the page renders a skeleton mirroring the ready
 * layout — a title bone, two meta-line bones, the Cook meal /
 * Edit action row as inert skeleton buttons inside a
 * LoadingScope, and the Recipes section holding exactly 3
 * dummy member rows rendered through ListItem's loading
 * state. No real meal content renders in this state, so the
 * host can mount the page before the meal query resolves
 * instead of gating on a spinner. The direct-ingredients
 * section is omitted while loading: whether the meal has any
 * is itself part of the pending data.
 *
 * De-styled for #119: the page composes DS components only —
 * the sections stack in a Col at gap xxl (wrappers that existed
 * only to space content are gone; separation is the stack's,
 * at its uniform rhythm), the title is Text's `title`
 * variant, the notes and nutrition lines are `hint` text,
 * the actions sit in ButtonRow, and each member renders
 * through ListItem's link form: the row passes its href
 * always and adds ListItem's disabled state plus the
 * "(unavailable)" title suffix only for a member whose
 * access was lost (the MealPlanDetailPage pattern), so the
 * row's link semantics — a real anchor on web, a LinkOverlay
 * carrying the composed label on native — are the generic
 * row's, not the page's.
 */

export type MealDetailPageMember = {
  recipeId: string;
  /** The recipe's destination (#248's navigation rule: the row
   * navigates, so it is a link): the host composes it from the
   * recipe id. The row renders as a link carrying this href;
   * an unavailable member's row does not render as a link. */
  href: string;
  title: string;
  /** Pre-composed meta line ("6 servings · 640 cal · 42g
   * protein · satiety 74"); the app composes the servings
   * pluralization and the nutrition summary. */
  subtitle: string;
  /** Access to this recipe was lost: the title gains its
   * "(unavailable)" suffix and the row does not press. */
  isUnavailable?: boolean;
};

type MealDetailPageIngredient = {
  id: string;
  /** The ingredient's name, as the host stores it. */
  name: string;
  /** Pre-composed meta line ("2 cups · 120 cal · 3g protein"):
   * the host composes the quantity/unit line and the nutrition
   * summary, as it does for each member's `subtitle`. */
  subtitle: string;
};

export type MealDetailPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  title: string;
  /** The meal's notes; omit or pass null to hide the line. */
  notes?: string | null;
  /** The meal's nutrition summary, pre-composed by the
   * app's formatter; omit when the meal has no summary. */
  nutritionLabel?: string | null;
  members: MealDetailPageMember[];
  /** The meal's direct ingredients (#440): ingredients entered
   * on the meal itself, not through a member recipe. A direct
   * ingredient has no destination page, so its row is a plain
   * row — no href, no press — never a link-shaped row without
   * a real link (Stephen's link-naming rule). Omit or pass an
   * empty list and the "Ingredients" section is omitted. */
  ingredients?: MealDetailPageIngredient[];
  /** Loading state (#874): the page renders its skeleton
   * layout (see the header's loading note) and no real meal
   * content. The data props may hold placeholder values in
   * this state — none of them render. */
  loading?: boolean;
  /** The cooking-mode destination (#248: navigation crosses as
   * an href, not a press callback). */
  cookHref: string;
  /** The edit destination (#248). */
  editHref: string;
};

// The dummy skeleton rows for the loading Recipes list
// (#874): exactly 3, from a frozen module-level constant —
// never generated per render (the CheckboxSelectList
// convention). Their values never render (a loading ListItem
// renders bones in their place).
const LOADING_MEMBER_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

export function MealDetailPage({
  title,
  notes,
  nutritionLabel,
  members,
  ingredients,
  cookHref,
  editHref,
  footer,
  loading = false,
}: MealDetailPageProps) {
  if (loading) {
    return (
      <BigFooterShell footer={footer}>
        <ScreenContainer>
          <LoadingScope active>
            <Col gap="xxl">
              <TextSkeleton size="2xl" lines={1} />
              <TextSkeleton size="sm" lines={2} />
              <ButtonRow>
                <Button onPress={() => {}}>Cook meal</Button>
                <Button variant="secondary" onPress={() => {}}>
                  Edit
                </Button>
              </ButtonRow>
              <SectionCard title="Recipes" loading>
                <Col>
                  {LOADING_MEMBER_KEYS.map((key) => (
                    <ListItem
                      key={key}
                      title="Recipe"
                      subtitle="Recipe details"
                      onPress={() => {}}
                      loading
                    />
                  ))}
                </Col>
              </SectionCard>
            </Col>
          </LoadingScope>
        </ScreenContainer>
      </BigFooterShell>
    );
  }
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer>
        <Col gap="xxl">
          <Text variant="title">{title}</Text>
          {notes ? <Text variant="hint">{notes}</Text> : null}
          {nutritionLabel ? <Text variant="hint">{nutritionLabel}</Text> : null}
          <ButtonRow>
            <Button href={cookHref}>Cook meal</Button>
            <Button variant="secondary" href={editHref}>
              Edit
            </Button>
          </ButtonRow>
          <SectionCard title="Recipes">
            <Col>
              {members.map((member) => (
                <ListItem
                  key={member.recipeId}
                  title={member.title}
                  subtitle={member.subtitle}
                  href={member.href}
                  {...(member.isUnavailable
                    ? { isDisabled: true, titleSuffix: " (unavailable)" }
                    : {})}
                />
              ))}
            </Col>
          </SectionCard>
          {ingredients && ingredients.length > 0 ? (
            <SectionCard title="Ingredients">
              <Col>
                {ingredients.map((ingredient) => (
                  <MarkableRow
                    key={ingredient.id}
                    label={ingredient.name}
                    subtitle={ingredient.subtitle}
                  />
                ))}
              </Col>
            </SectionCard>
          ) : null}
        </Col>
      </ScreenContainer>
    </BigFooterShell>
  );
}
