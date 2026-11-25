import { useId } from "react";
import type { ReactNode } from "react";
import { Checkbox as TamaguiCheckbox, Label, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { Row } from "../layout/Row.js";
import { Col } from "../layout/Col.js";
import { tokens } from "../../tokens/index.js";
import { platformAccessibilityProps } from "../accessibility.js";
import { Text } from "../data/Text.js";
import { FieldError } from "./FieldError.js";

/**
 * The ✓ glyph must NOT get an explicit lineHeight: it previously
 * received one equal to its font size (14), which Tamagui's style
 * engine resolves as a multiplier of the font size — the same defect
 * that stretched SearchField's row to full screen height on Android
 * (spudly/eciperay#162; see the note in SearchField.tsx). With no
 * lineHeight prop the glyph takes the font's line height, and
 * CheckboxBox's fixed size + hidden overflow keep it inside the box.
 */

const StyledCheckbox = styled(TamaguiCheckbox, {
  name: "Checkbox",

  // 44px touch target; the 24px visual box is centered inside.
  width: 44,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
  borderWidth: 0,
});

/**
 * The checkbox's visual box (#746, Option B): a 24px Row —
 * the $primary outline and surface fill are the visual
 * direction's constants, applied at the one use site before;
 * they live here as the box's own props.
 */
function CheckboxBox({ children }: { children: ReactNode }) {
  return (
    <Row
      middle
      center
      width={24}
      height={24}
      overflow="hidden"
      borderWidth={2}
      borderRadius={tokens.radii.sm}
      borderColor="$primary"
      backgroundColor="$surface"
    >
      {children}
    </Row>
  );
}

// The list shape's first-line height: the label renders at the md
// size with the normal line height, so its first line box is
// fontSize.md × lineHeight.normal tall. The box aligns to the
// label's first line — including when the label wraps — with no
// hand-tuned padding offset (#713; this replaces CheckRow's
// paddingTop={2} nudge).
const FIRST_LINE_HEIGHT = tokens.typography.fontSize.md * tokens.typography.lineHeight.normal;

// Centering the box on the line BOX still leaves it visibly low:
// the glyph run's ink center sits ~4px above the line box's center
// (measured on the rendered ListShape stories, #713 fix round —
// box center +4px vs first-line ink center). The box container is
// therefore shortened by twice that offset: the 24px checkbox
// overflows the container symmetrically, so its center lands on
// the first line's ink center instead of the line box's center.
const FIRST_LINE_BOX_CONTAINER_HEIGHT = FIRST_LINE_HEIGHT - 8;

type StyledCheckboxProps = GetProps<typeof StyledCheckbox>;

export type CheckboxFieldProps = Omit<StyledCheckboxProps, "checked" | "onCheckedChange"> & {
  label: string;
  /**
   * Supporting text under the label. A plain string renders in the hint
   * style; richer text content (a fragment mixing strings with DS `Text`
   * / `TextLink` elements — e.g. a consent line with an inline Privacy
   * Policy link) renders in the same hint style wrapped around the
   * nodes, so inline links stay pressable. Block-level content does not
   * belong here — use `children` for that.
   */
  description?: ReactNode;
  /**
   * Optional detail rendered after the label on the same line as a
   * muted segment ("2 lb · optional" — the caller composes the
   * segments; the field joins them to the label with the middle-dot
   * separator) and composed into the accessible name after the
   * label. This is the shopping-list scan shape folded in from the
   * retired CheckRow (#713): passing `detail` (or `separator` /
   * `strikeWhenChecked`) selects the list shape — the whole row
   * becomes the press target and the box aligns to the label's
   * first line. Mutually exclusive in practice with `description`
   * (stacked); both remain available, callers pick one.
   */
  detail?: string | null;
  /** The hairline under the row, in the list shape (#713). */
  separator?: boolean;
  /**
   * Opt-in checked text treatment for the list shape (#713,
   * option A): when checked, the label line renders struck
   * through and muted — a checked-off shopping item reads as
   * done. The default (form / ingredient usage) does NOT strike,
   * following the visual direction.
   */
  strikeWhenChecked?: boolean;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
  id?: string;
  /**
   * Extra content slotted below the field, inside its layout stack —
   * e.g. an environment warning shown under the description. Rendered
   * as-is; the caller styles it (typically with DS `Text`).
   */
  children?: ReactNode;
};

/**
 * Labeled checkbox with optional description and error text — the
 * one unified checkbox widget (#713: CheckRow was retired into
 * this field).
 *
 * The checkbox itself is the single interactive element and the
 * single accessibility stop (44px touch target with a 24px visual
 * box centered inside in the form shape), so there is exactly one
 * toggle per press on web and native. The label toggles the
 * checkbox via `onPress` (Tamagui's `htmlFor` only focuses on
 * native, it does not toggle), and is programmatically associated
 * with `aria-labelledby`.
 *
 * The box follows the visual direction in both shapes: unfilled in
 * both states, a `$primary` outline in both states, and a
 * `$primary` check glyph when checked — no fill, and the
 * checked/unchecked distinction is carried by the glyph, not by a
 * border or fill change.
 *
 * List shape (`detail` / `separator` / `strikeWhenChecked`): the
 * shopping-list row CheckRow used to render — a medium-weight
 * label with an inline muted detail segment, the whole row as the
 * press target, an optional hairline, and opt-in strikethrough
 * when checked. The real Tamagui Checkbox remains the single
 * accessibility stop (one checkbox role, one name — the name
 * composes the detail after the label, per the row family's
 * standing rule), and its box sits in a container sized to center
 * it on the first line's glyph run so it stays aligned to the
 * first line when the label wraps.
 */
export function CheckboxField({
  label,
  description,
  detail,
  separator = false,
  strikeWhenChecked = false,
  checked,
  onCheckedChange,
  error,
  id: idProp,
  children,
  disabled,
  accessible,
  accessibilityElementsHidden,
  accessibilityHint,
  accessibilityLabel,
  accessibilityLabelledBy,
  accessibilityLiveRegion,
  accessibilityRole,
  accessibilityState,
  accessibilityValue,
  ...rest
}: CheckboxFieldProps) {
  const a11yProps = platformAccessibilityProps({
    accessible,
    accessibilityElementsHidden,
    accessibilityHint,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityLiveRegion,
    accessibilityRole,
    accessibilityState,
    accessibilityValue,
  });
  const autoId = useId();
  const id = idProp ?? autoId;
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const toggle = () => onCheckedChange(!checked);
  const listShape = detail !== undefined || separator || strikeWhenChecked;
  // The list shape's accessible name composes the detail after the
  // label (the row family's standing rule — ListItem's composed
  // label): with the checkbox as the one accessibility stop, a
  // name-only label would drop the quantity from the announcement.
  const accessibleName = detail ? `${label}, ${detail}` : label;
  const struck = checked && strikeWhenChecked;

  const checkbox = (
    <StyledCheckbox
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      {...(disabled !== undefined ? { disabled } : {})}
      {...(listShape
        ? { "aria-label": accessibilityLabel ?? accessibleName }
        : { "aria-labelledby": labelId })}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      {...a11yProps}
      {...rest}
      {...(listShape ? { width: FIRST_LINE_HEIGHT, height: FIRST_LINE_HEIGHT } : {})}
    >
      {/* Visual direction (#713): the box is unfilled in both
          states with a $primary outline in both states and a
          $primary check glyph — no fill, no outline change. (This
          supersedes the earlier WCAG 1.4.11 $textMuted-border
          treatment: the checked/unchecked distinction is carried
          by the glyph, per Stephen's direction.) */}
      <CheckboxBox>
        <TamaguiCheckbox.Indicator>
          <Text
            aria-hidden
            style={{
              color: "$primary",
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.bold,
            }}
          >
            ✓
          </Text>
        </TamaguiCheckbox.Indicator>
      </CheckboxBox>
    </StyledCheckbox>
  );

  if (listShape) {
    return (
      <Col gap="xs">
        <Row
          top
          gap="m"
          py="m"
          {...(separator
            ? { borderBottomWidth: 1, borderBottomColor: tokens.colors.gray.gray2 }
            : {})}
          onPress={disabled ? undefined : toggle}
          cursor={disabled ? undefined : "pointer"}
        >
          <Row height={FIRST_LINE_BOX_CONTAINER_HEIGHT} middle center>
            {checkbox}
          </Row>
          <Text
            flex={1}
            {...(struck ? { color: "$textMuted" } : {})}
            textDecorationLine={struck ? "line-through" : "none"}
          >
            <Text
              fontWeight={tokens.typography.fontWeight.medium}
              {...(struck ? { color: "$textMuted" } : {})}
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
        </Row>
        {children}
        {error ? <FieldError error={error} id={errorId} /> : null}
      </Col>
    );
  }

  return (
    <Col gap="xs">
      <Row middle gap="m" minHeight={44}>
        {checkbox}
        <Col grow shrink gap="xs">
          <Label id={labelId} onPress={toggle} fontSize={tokens.typography.fontSize.md}>
            {label}
          </Label>
          {description ? <Text variant="hint">{description}</Text> : null}
        </Col>
      </Row>
      {children}
      {error ? <FieldError error={error} id={errorId} /> : null}
    </Col>
  );
}
