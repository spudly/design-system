import { useId } from "react";
import {
  platformAccessibilityProps,
  type TranslatableAccessibilityProps,
} from "../widgets/accessibility.js";

/** The accessibility props the labeled text fields accept and
 * translate per platform (see platformAccessibilityProps). */
export type FieldA11yProps = Pick<
  TranslatableAccessibilityProps,
  | "accessible"
  | "accessibilityElementsHidden"
  | "accessibilityHint"
  | "accessibilityLabel"
  | "accessibilityLabelledBy"
  | "accessibilityLiveRegion"
  | "accessibilityRole"
  | "accessibilityState"
  | "accessibilityValue"
>;

/**
 * The identity + accessibility wiring shared by TextField and
 * TextAreaField (#587 phase 3): translate the caller's
 * accessibility props for the platform, resolve the field id
 * (caller-supplied or auto-generated), and derive the error
 * line's id from it. Both fields carried this exact block.
 */
export function useFieldA11y(a11y: FieldA11yProps, idProp?: string | undefined) {
  const a11yProps = platformAccessibilityProps(a11y);
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = `${id}-error`;
  return { a11yProps, id, errorId };
}
