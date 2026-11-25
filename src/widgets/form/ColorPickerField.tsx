import { useId } from "react";
import { Row } from "../layout/Row.js";
import { Col } from "../layout/Col.js";
import type { ColProps } from "../layout/Col.js";
import { tokens } from "../../tokens/index.js";
import type { TagColorName } from "../../themes/tagColors.js";
import { groupRoleProps, platformAccessibilityProps } from "../accessibility.js";
import { useTagColorResolver } from "../tagColors.js";
import { Alert } from "../feedback/Alert.js";
import { Text } from "../data/Text.js";
import { useVoice } from "../../voice/index.js";

/**
 * One color swatch (#746, Option B): a 44px round Col whose
 * ring darkens when selected — the former styled variant is a
 * conditional borderColor prop in code. The press and a11y
 * props ride Col's passthrough from the use site.
 */
type SwatchProps = Omit<
  ColProps,
  | "width"
  | "height"
  | "borderRadius"
  | "borderWidth"
  | "borderColor"
  | "cursor"
  | "center"
  | "middle"
> & {
  /** The selected swatch's ring darkens (gray10 over gray3). */
  selected: boolean;
};

function Swatch({ selected, ...rest }: SwatchProps) {
  return (
    <Col
      center
      middle
      width={44}
      height={44}
      borderRadius={tokens.radii.full}
      borderWidth={2}
      borderColor={selected ? tokens.colors.gray.gray10 : tokens.colors.gray.gray3}
      cursor="pointer"
      {...rest}
    />
  );
}

export type ColorPickerFieldProps = {
  label?: string;
  /**
   * Tag color token names to choose from (e.g. "blue", "pink"). Each
   * swatch renders the active theme's hex for its name (#207).
   */
  colors: TagColorName[];
  /**
   * The selected value: a tag color token name (strictly typed — a
   * raw hex is a compile error; stored data converts through
   * `tagColorNameForHex` first).
   */
  value?: TagColorName;
  onChange?: (color: TagColorName) => void;
  error?: string;
  /** When true, every swatch is inert and the group is dimmed. */
  disabled?: boolean;
  id?: string;
};

/**
 * Labeled tag-color selector. Each swatch is a ≥44px round button
 * showing the active theme's hex for its token name, with
 * `aria-pressed` reflecting selection and an accessible label like
 * "Select color blue". The selected swatch gets a visible dark ring.
 * Error wiring matches TextField. The swatch container's grouping
 * role is web-only — `group` is not a valid React Native
 * `accessibilityRole` (see `accessibility.ts`,
 * spudly/eciperay#156); on native the accessible name carries the
 * grouping.
 */
export function ColorPickerField({
  label,
  colors,
  value,
  onChange,
  error,
  disabled = false,
  id: idProp,
}: ColorPickerFieldProps) {
  const voice = useVoice();
  const autoId = useId();
  const id = idProp ?? autoId;
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const resolveTagColor = useTagColorResolver();
  const resolvedValue = value ? resolveTagColor(value) : undefined;

  return (
    <Col gap="s" grow shrink minWidth={0}>
      {label ? (
        <Text id={labelId} style={{ fontSize: tokens.typography.fontSize.sm }}>
          {label}
        </Text>
      ) : null}
      <Row
        wrap
        gap="s"
        opacity={disabled ? 0.5 : 1}
        {...groupRoleProps}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : voice.colorPickerField.chooseColorLabel}
        aria-describedby={error ? errorId : undefined}
      >
        {colors.map((color) => {
          const resolvedColor = resolveTagColor(color);
          const selected = resolvedColor === resolvedValue;
          return (
            <Swatch
              key={color}
              selected={selected}
              backgroundColor={resolvedColor}
              {...platformAccessibilityProps({
                accessibilityRole: "button",
                accessibilityLabel: voice.colorPickerField.selectColorLabel(color),
                accessibilityState: { disabled },
              })}
              aria-pressed={selected}
              aria-disabled={disabled || undefined}
              disabled={disabled}
              tabIndex={disabled ? -1 : 0}
              onPress={
                disabled
                  ? undefined
                  : () => {
                      onChange?.(color);
                    }
              }
            />
          );
        })}
      </Row>
      {error ? <Alert severity="error" message={error} id={errorId} /> : null}
    </Col>
  );
}
