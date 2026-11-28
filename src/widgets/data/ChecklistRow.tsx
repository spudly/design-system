import { Checkbox as TamaguiCheckbox, styled } from "tamagui";

import { Row } from "../layout/Row.js";
import { Col } from "../layout/Col.js";
import { tokens } from "../../tokens/index.js";
import { platformAccessibilityProps } from "../accessibility.js";

import { Text } from "./Text.js";

const StyledCheckbox = styled(TamaguiCheckbox, {
  name: "ChecklistCheckbox",

  width: tokens.spacing[6],
  height: tokens.spacing[6],
  borderRadius: tokens.radii.sm,
  borderWidth: 2,
  // Visual direction (#713): the box is unfilled in both states with
  // a $primary outline in both states — no fill, no outline change;
  // the checked/unchecked distinction is carried by the $primary
  // check glyph, matching CheckboxField's shared box treatment.
  borderColor: "$primary",
  backgroundColor: "$surface",
  alignItems: "center",
  justifyContent: "center",
});

// The box aligns to the label's first line, not to the row's full
// height: with a metadata line under the label, row-centering left
// the box ~9px below the first line's glyph center (measured on
// the rendered Checked story, #713 fix round). The box sits in a
// container shortened by twice the ~4px line-box/ink-center offset
// (see CheckboxField's list shape), so the centered box lands on
// the first line's ink center.
const FIRST_LINE_HEIGHT = tokens.typography.fontSize.md * tokens.typography.lineHeight.normal;
const FIRST_LINE_BOX_CONTAINER_HEIGHT = FIRST_LINE_HEIGHT - 8;

export type ChecklistRowProps = {
  label: string;
  metadata?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

/**
 * Checkbox row: a real Tamagui Checkbox (focusable, with `role="checkbox"`
 * semantics) next to a label. The label area is also pressable so the whole
 * row is an easy target, and the row keeps a 44px minimum height. The label
 * gets a strikethrough and muted color when checked. The box carries the
 * shared visual-direction treatment (#713): unfilled in both states,
 * $primary outline in both states, $primary check glyph when checked.
 */
export function ChecklistRow({ label, metadata, checked, onCheckedChange }: ChecklistRowProps) {
  const toggle = () => onCheckedChange(!checked);

  return (
    <Row top gap="m" minHeight={44} py="xs">
      <Row height={FIRST_LINE_BOX_CONTAINER_HEIGHT} middle center>
        <StyledCheckbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          {...platformAccessibilityProps({ accessibilityLabel: label })}
        >
          <TamaguiCheckbox.Indicator>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: "$primary" }}>✓</Text>
          </TamaguiCheckbox.Indicator>
        </StyledCheckbox>
      </Row>
      <Col grow shrink onPress={toggle} cursor="pointer">
        <Text
          style={
            checked
              ? {
                  textDecorationLine: "line-through",
                  color: "$textMuted",
                }
              : undefined
          }
        >
          {label}
        </Text>
        {metadata ? <Text variant="hint">{metadata}</Text> : null}
      </Col>
    </Row>
  );
}
