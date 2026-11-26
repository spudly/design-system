import type { ComponentType } from "react";
import { AddIcon } from "./AddIcon.js";
import { ErrorIcon } from "./ErrorIcon.js";
import { FeedbackIcon } from "./FeedbackIcon.js";
import { HelpIcon } from "./HelpIcon.js";
import { HomeIcon } from "./HomeIcon.js";
import { InfoIcon } from "./InfoIcon.js";
import type { IconComponentProps } from "./Icon.js";
import { ListIcon } from "./ListIcon.js";
import { MealsIcon } from "./MealsIcon.js";
import { MoreIcon } from "./MoreIcon.js";
import { PrintIcon } from "./PrintIcon.js";
import { ProfileIcon } from "./ProfileIcon.js";
import { RecipesIcon } from "./RecipesIcon.js";
import { ShareIcon } from "./ShareIcon.js";
import { SharedIcon } from "./SharedIcon.js";
import { SuccessIcon } from "./SuccessIcon.js";
import { TagsIcon } from "./TagsIcon.js";
import { WarningIcon } from "./WarningIcon.js";

/**
 * The icon-name registry (#438 Part 4): the design system's icon
 * slots take an icon NAME as data — a string from the semantic name
 * set below — never an icon component. The component that owns the
 * slot (Button's icon slot, DropdownButton's trigger icon) resolves
 * the name through this registry and renders the glyph itself, so
 * callers pass data only and no icon component crosses a prop
 * boundary. Icons stay internal (#298): this module is not exported
 * from the package root, and no icon component is exported anywhere.
 *
 * The names are the DS's own semantic usage names — the per-icon
 * components' names lowercased (AddIcon -> "add") — NOT the Feather
 * set's glyph names and NOT app concepts. Which icon an app surface
 * uses stays app configuration, exactly as the icons module header
 * records (#246): an app passes one of these names into a DS slot;
 * the mapping from the app's own concepts to a name lives in the
 * app. The social brand glyphs keep BigFooter's own name map
 * (BigFooterSocialIcon), and state glyphs a component renders for
 * itself (the disclosure chevrons) stay component-internal — neither
 * is part of this set.
 *
 * Set provenance: the nine names the #438 Part 0 audit found hosts
 * importing as components from the retired `@spudly/ui/icons`
 * subpath (add, feedback, home, meals, profile, recipes, shared,
 * tags, warning), plus "print" and "share" for RecipeDetailPage's
 * Print / Share actions, the icon slot's original call sites (#187),
 * plus "help" for SearchHelpPopover's trigger (#699), plus "list"
 * for SectionHeading's icon form (RecipeDetailPage's Ingredients
 * heading, #721), plus "more" for card overflow-menu triggers
 * (DiscoveryCard's per-card actions, #791), plus "error", "info",
 * and "success" for Alert severity icons and EmptyState (#856).
 * @public — intentional exception (#586 phase 2): exercised directly by tests through internal module/dist imports that knip cannot trace; not part of the package's public entry.
 */
export const iconNames = [
  "add",
  "error",
  "feedback",
  "help",
  "home",
  "info",
  "list",
  "meals",
  "more",
  "print",
  "profile",
  "recipes",
  "share",
  "shared",
  "success",
  "tags",
  "warning",
] as const;

/** One of the design system's semantic icon names — data a caller passes to an icon slot. */
export type IconName = (typeof iconNames)[number];

/** The glyph component each icon name resolves to. Internal: slot owners resolve through this record; callers only ever pass the name. */
export const iconsByName: Record<IconName, ComponentType<IconComponentProps>> = {
  add: AddIcon,
  error: ErrorIcon,
  feedback: FeedbackIcon,
  help: HelpIcon,
  home: HomeIcon,
  info: InfoIcon,
  list: ListIcon,
  meals: MealsIcon,
  more: MoreIcon,
  print: PrintIcon,
  profile: ProfileIcon,
  recipes: RecipesIcon,
  share: ShareIcon,
  shared: SharedIcon,
  success: SuccessIcon,
  tags: TagsIcon,
  warning: WarningIcon,
};
