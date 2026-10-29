import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

export type CheckRowProps = {
  /** The row's label: the bold lead of its text line, and the
   * base of the row's accessible name. */
  label: string;
  /** Optional detail rendered after the label on the same line
   * as a muted segment ("2 lb · optional" — the caller composes
   * the segments; the row joins them to the label with the
   * middle-dot separator) and composed into the accessible
   * name after the label. Omit when the label stands alone. */
  detail?: string | null;
  /** The row's checked state, controlled by the caller. */
  checked: boolean;
  /** Reports the toggle intent; the row itself is the press
   * target and carries the checkbox semantics. */
  onToggle: () => void;
};

/**
 * A check-off row whose whole body is the checkbox (#119): a
 * drawn box and a rich text line — a bold label with muted
 * detail segments on the same line — over a hairline, the
 * shopping-list shape. The row carries the checkbox semantics
 * itself (`accessibilityRole="checkbox"` with its checked
 * state, routed through the platform translator so web renders
 * role/aria-checked instead of raw RN attributes, #237), and
 * web keyboard activation: a view carrying a role is made
 * focusable and Enter / Space invoke the same callback as a
 * press (web-only props, ignored on native). Checked rows
 * render struck through and muted.
 *
 * ChecklistRow is the sibling shape, not a variant of this
 * one: there a real Checkbox control sits beside a pressable
 * label whose metadata stacks below it. Here there is no
 * separate control — the row is the control — and the detail
 * stays inline, which is what a check-off list scans by.
 */
export function CheckRow({ label, detail, checked, onToggle }: CheckRowProps) {
  // Web keyboard support (the MealPlansPage row pattern): a
  // view carrying a role is made focusable and the activation
  // keys — Enter and Space — invoke the same callback as a
  // press. A held key's repeats still prevent the default (a
  // held Space must not scroll) but do not re-toggle: one press
  // is one toggle. Web-only props, ignored on native.
  const handleKeyDown = (event: { key: string; repeat?: boolean; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!event.repeat) {
        onToggle();
      }
    }
  };
  // The row's accessible name composes the detail after the
  // label (the row family's standing rule — ListRow's composed
  // label): with the row as the one accessibility stop, a
  // name-only label would drop the quantity from the
  // announcement.
  const accessibleName = detail ? `${label}, ${detail}` : label;
  return (
    <XStack
      alignItems="flex-start"
      gap="$3"
      borderBottomWidth={1}
      borderBottomColor={tokens.colors.gray.gray2}
      paddingVertical="$3"
      {...platformAccessibilityProps({
        accessibilityRole: "checkbox",
        accessibilityState: { checked },
        accessibilityLabel: accessibleName,
      })}
      onPress={onToggle}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      cursor="web:pointer"
    >
      <YStack paddingTop={2}>
        <YStack
          width={tokens.spacing[6]}
          height={tokens.spacing[6]}
          borderRadius={tokens.radii.sm}
          borderWidth={2}
          borderColor={checked ? "$primary" : "$textMuted"}
          backgroundColor={checked ? "$primary" : "$surface"}
          alignItems="center"
          justifyContent="center"
        >
          {checked ? (
            <Text fontSize={tokens.typography.fontSize.sm} color="$onPrimary">
              ✓
            </Text>
          ) : null}
        </YStack>
      </YStack>
      <Text
        flex={1}
        {...(checked ? { color: "$textMuted" } : {})}
        textDecorationLine={checked ? "line-through" : "none"}
      >
        <Text
          fontWeight={tokens.typography.fontWeight.medium}
          {...(checked ? { color: "$textMuted" } : {})}
        >
          {label}
        </Text>
        {detail ? (
          <Text color="$textMuted" fontSize={tokens.typography.fontSize.sm}>
            {" "}
            · {detail}
          </Text>
        ) : null}
      </Text>
    </XStack>
  );
}
