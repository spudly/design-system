import { Button } from "../components/Button.js";
import { ButtonRow } from "../components/ButtonRow.js";
import { ListRow } from "../components/ListRow.js";
import { ListStack } from "../components/ListStack.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionCard } from "../components/SectionCard.js";
import { SectionStack } from "../components/SectionStack.js";
import { Text } from "../components/Text.js";

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
 * De-styled for #119: the page composes DS components only —
 * the sections stack in SectionStack (wrappers that existed
 * only to space content are gone; separation is the stack's,
 * at its uniform rhythm), the title is Text's `title`
 * variant, the notes and nutrition lines are `hint` text,
 * the actions sit in ButtonRow, and each member renders
 * through ListRow's link form: the row passes its href
 * always and adds ListRow's disabled state plus the
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

export type MealDetailPageProps = {
  title: string;
  /** The meal's notes; omit or pass null to hide the line. */
  notes?: string | null;
  /** The meal's nutrition summary, pre-composed by the
   * app's formatter; omit when the meal has no summary. */
  nutritionLabel?: string | null;
  members: MealDetailPageMember[];
  /** The cooking-mode destination (#248: navigation crosses as
   * an href, not a press callback). */
  cookHref: string;
  /** The edit destination (#248). */
  editHref: string;
};

export function MealDetailPage({
  title,
  notes,
  nutritionLabel,
  members,
  cookHref,
  editHref,
}: MealDetailPageProps) {
  return (
    <ScreenContainer>
      <SectionStack>
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
          <ListStack>
            {members.map((member) => (
              <ListRow
                key={member.recipeId}
                title={member.title}
                subtitle={member.subtitle}
                href={member.href}
                {...(member.isUnavailable
                  ? { isDisabled: true, titleSuffix: " (unavailable)" }
                  : {})}
              />
            ))}
          </ListStack>
        </SectionCard>
      </SectionStack>
    </ScreenContainer>
  );
}
