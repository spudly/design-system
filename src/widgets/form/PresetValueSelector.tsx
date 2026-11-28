/* eslint-disable max-lines -- single cohesive selector component (props, styles, render in one definition); splitting it would scatter one component across files (#902 T4) */
import { useId, useRef, useState } from "react";
import type { ComponentProps, Ref } from "react";
import { isWeb } from "tamagui";
import type { TamaguiElement } from "tamagui";

import { Row } from "../layout/Row.js";
import type { RowProps } from "../layout/Row.js";
import { Spacer } from "../layout/Spacer.js";
import { tokens } from "../../tokens/index.js";
import { groupRoleProps, platformAccessibilityProps } from "../accessibility.js";
import { Button } from "../actions/Button.js";
import { Text } from "../data/Text.js";
import { Col } from "../layout/Col.js";

import { TextField } from "./TextField.js";
import { FieldError } from "./FieldError.js";

export type PresetValueOption = {
  value: string;
  label: string;
};

export type PresetValueSelectorProps = {
  /** The selector's label (e.g. "Scale"). */
  label: string;
  /** The preset options. */
  options: PresetValueOption[];
  /**
   * The selected value: one of the preset option values, or
   * any other string once a custom value has been committed.
   */
  value: string;
  /**
   * Selection changes: a preset's value when a preset button is
   * pressed, or the committed custom entry (a positive number
   * as a plain string) when the custom editor commits.
   */
  onChange: (value: string) => void;
  /** The custom slot's resting label (e.g. "Custom"). */
  customLabel: string;
  /**
   * The custom slot's accessible name, doubling as the custom
   * editor's label (e.g. "Custom scale"). When a custom value
   * is selected, the formatted value joins the name, so the
   * selected amount is announced, not just the word Custom.
   */
  customAccessibilityLabel: string;
  /**
   * Formats a committed custom value for the selected button's
   * visible label and accessible name (e.g. appending a unit
   * suffix). Defaults to the value itself.
   */
  formatCustomValue?: (value: string) => string;
  /** When true, the whole selector is inert and dimmed: presets and the custom slot cannot change the value. */
  disabled?: boolean;
  /**
   * Validation error (#804): rendered below the selector
   * through the shared FieldError (an Alert); the group
   * carries `aria-invalid` / `aria-describedby` pointing at it.
   */
  error?: string;
  id?: string;
};

/**
 * A preset-or-custom value selector (#119 dedupe): a labeled,
 * non-wrapping row of preset toggle Buttons plus one trailing
 * button that turns into a number input when pressed — any
 * value beyond the presets is directly enterable, and once
 * committed the button shows the applied custom value
 * selected. The generic shape for a preset-or-custom quantity
 * (a scale, a duration, an amount).
 *
 * This is the Button-based successor to the recipedetail
 * tranche's EditableChipGroup, rebuilt when the chip
 * components were retired (Stephen's ruling on the #119
 * dedupe: chips are removed entirely; buttons everywhere). The
 * presets and the custom slot are Button's toggle form
 * (`selected`, announced via aria-pressed / the accessibility
 * state) at the small size in the secondary resting treatment,
 * which also retires the hand-rolled chip frame, its separate
 * keyboard shim, and its duplicated toggle a11y — a real
 * button is keyboard-operable by construction.
 *
 * The editing state is ephemeral view state the selector
 * owns: whether the custom slot is currently a number input,
 * and the input's uncommitted text. Committing an entry
 * applies it through the same `onChange` the presets use; an
 * empty, non-numeric, or non-positive entry commits nothing
 * and the slot restores the current value.
 *
 * Commit timing (#315): the entry commits on submit, and on
 * blur ONLY when focus leaves the selector entirely. A blur
 * whose focus lands inside the group — on a preset button,
 * above all — must not commit: the blur fires before the
 * preset's press, so committing there would apply the draft
 * through `onChange` ahead of (and potentially instead of)
 * the preset the user actually chose. That blur instead ends
 * the edit WITHOUT committing (the slot restores the current
 * value), and the preset's own press then applies the preset.
 * On web the destination is the blur event's `relatedTarget`,
 * tested against the group element; native blur events carry
 * no `relatedTarget` (buttons there take no focus), so the
 * presets' `onPressIn` — which fires ahead of the input's
 * blur for a touch — stands in for it.
 */
/**
 * The group row with its ref attached (#746): the blur logic
 * needs the group's element (containment checks), and Row's
 * props type does not declare React 19's ref-as-prop — Row
 * forwards it through its rest spread at runtime, so the ref
 * rides the props object here.
 */
function GroupRow({ ref, ...props }: RowProps & { ref?: Ref<TamaguiElement> }) {
  return <Row {...{ ...props, ref }} />;
}

export function PresetValueSelector({
  label,
  options,
  value,
  onChange,
  customLabel,
  customAccessibilityLabel,
  formatCustomValue,
  disabled = false,
  error,
  id: idProp,
}: PresetValueSelectorProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = `${id}-error`;
  const [isCustomEditing, setCustomEditing] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const groupRef = useRef<TamaguiElement>(null);
  // Set by a preset's onPressIn while the custom editor is open
  // (native's stand-in for the web relatedTarget check — see the
  // commit-timing note above); consumed by the blur handler and
  // cleared by the press itself, so it can never suppress a
  // later, unrelated blur.
  const presetPressPendingRef = useRef(false);
  const isPreset = options.some((option) => option.value === value);
  const isCustomSelected = !isPreset && !isCustomEditing;
  const formattedCustom = formatCustomValue ? formatCustomValue(value) : value;

  const startCustomEdit = () => {
    if (disabled) {
      return;
    }
    presetPressPendingRef.current = false;
    setCustomDraft(isPreset ? "" : value);
    setCustomEditing(true);
  };

  const commitCustom = () => {
    if (disabled) {
      setCustomEditing(false);
      return;
    }
    const parsed = Number(customDraft.trim());
    setCustomEditing(false);
    if (Number.isFinite(parsed) && parsed > 0) {
      onChange(String(parsed));
    }
  };

  const handleCustomBlur = (
    event: Parameters<NonNullable<ComponentProps<typeof TextField>["onBlur"]>>[0],
  ) => {
    // #315: focus moving within the group (or a preset press
    // already in flight on native) ends the edit WITHOUT
    // committing the draft — the preset's press applies its
    // own value next. Focus leaving the group entirely falls
    // through to the commit.
    if (presetPressPendingRef.current) {
      presetPressPendingRef.current = false;
      setCustomEditing(false);
      return;
    }
    if (isWeb) {
      // The blur event reaches the field in either of two
      // shapes (the DropdownButton event-cast pattern): the
      // DOM FocusEvent's `relatedTarget` directly, or under
      // `nativeEvent` when the event arrives wrapped.
      const blurEvent = event as {
        relatedTarget?: unknown;
        nativeEvent?: { relatedTarget?: unknown };
      };
      const relatedTarget = blurEvent.relatedTarget ?? blurEvent.nativeEvent?.relatedTarget;
      const groupElement = groupRef.current as unknown as HTMLElement | null;
      if (relatedTarget !== null && relatedTarget !== undefined && groupElement?.contains(relatedTarget as Node)) {
        setCustomEditing(false);
        return;
      }
    }
    commitCustom();
  };

  return (
    <Col gap="xs">
      <GroupRow
        ref={groupRef}
        middle
        gap="s"
        opacity={disabled ? 0.5 : 1}
        {...groupRoleProps}
        {...platformAccessibilityProps({ accessibilityLabel: label })}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      >
        <Row>
          <Text
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.medium}
            color={tokens.colors.gray.gray8}
          >
            {label}
          </Text>
          <Spacer x="xs" />
        </Row>
        {/* #855: the presets row takes a zero basis too — with a
          content-sized basis the buttons' min-content consumed the
          group row's free space and starved the custom slot, whose
          button shrank below its label and spilled the label past
          the viewport edge (2px horizontal overflow at 390px on
          RecipeDetailPage). Zero basis makes the shares between
          this row and the custom slot proportional, as the
          buttons' own basis already is. */}
        <Row grow shrink gap="s" style={{ flexBasis: 0 }}>
          {options.map((option) => (
            <Button
              key={option.value}
              variant="secondary"
              size="sm"
              grow
              // Equal shares of a non-wrapping row need a zero
              // basis: Button's `grow` default is a content-sized
              // basis (the wrapping-row treatment), so this caller
              // passes the zero basis and shrink back — a
              // caller-passed flex wins over `grow` by Button's
              // contract.
              flexBasis={0}
              flexShrink={1}
              selected={value === option.value}
              disabled={disabled}
              onPressIn={() => {
                if (isCustomEditing) {
                  presetPressPendingRef.current = true;
                }
              }}
              onPressOut={() => {
                // #315 cancel path: a press that ends WITHOUT
                // onPress (canceled by a scroll stealing the
                // responder, or by releasing off the button) must
                // not leave the pending flag set — a later genuine
                // blur would read it and wrongly discard the draft
                // instead of committing. The clear is deferred to
                // a microtask: the blur a completed press causes
                // fires during press-in (before press-out), and a
                // completed press's onPress runs synchronously
                // right after press-out and clears the flag itself,
                // so this deferred clear only ever takes effect
                // for a canceled press.
                if (presetPressPendingRef.current) {
                  queueMicrotask(() => {
                    presetPressPendingRef.current = false;
                  });
                }
              }}
              onPointerCancel={() => {
                // #315 web touch-cancel path: Tamagui's web event
                // mapping (getWebEvents) wires onPressOut only to
                // onMouseUp/onTouchEnd — a touch CANCELED by the
                // browser (scroll gesture, gesture takeover) fires
                // neither, so onPressOut never runs and the pending
                // flag would stay set; a later genuine blur outside
                // the group would then discard the draft instead of
                // committing it. The pointer-cancel event is the
                // web-supported cancellation signal: clear the flag
                // here too, with the same deferred microtask (a
                // canceled press produces no onPress, so the defer
                // can only ever take effect for a canceled press).
                if (presetPressPendingRef.current) {
                  queueMicrotask(() => {
                    presetPressPendingRef.current = false;
                  });
                }
              }}
              onPress={() => {
                if (disabled) {
                  return;
                }
                presetPressPendingRef.current = false;
                setCustomEditing(false);
                onChange(option.value);
              }}
            >
              {option.label}
            </Button>
          ))}
        </Row>
        {/* #327: the custom slot's share must leave the small
          Button's label room to sit on one line at the Android
          VR capture width (~430px). At flex 0.25 the slot was
          ~68px and "Custom" wrapped mid-word ("Custo/m"),
          making the button taller than the preset row; the
          presets' labels are short (½×, 1×, …), so the custom
          slot takes the larger share while the presets stay
          equal-width. #746: flex 0.35 is grow={0.35} in the
          subset; the shorthand's zero basis — what makes the
          share proportional rather than extra-space-only —
          rides the style channel. */}
        <Row grow={0.35} shrink style={{ flexBasis: 0 }}>
          {isCustomEditing ? (
            <TextField
              disabled={disabled}
              accessibilityLabel={customAccessibilityLabel}
              keyboardType="decimal-pad"
              inputMode="decimal"
              type="number"
              autoFocus
              value={customDraft}
              onChangeText={setCustomDraft}
              onBlur={handleCustomBlur}
              onSubmitEditing={commitCustom}
            />
          ) : (
            <Button
              variant="secondary"
              size="sm"
              grow
              flexBasis={0}
              flexShrink={1}
              disabled={disabled}
              selected={isCustomSelected}
              accessibilityLabel={
                isCustomSelected
                  ? `${customAccessibilityLabel} ${formattedCustom}`
                  : customAccessibilityLabel
              }
              onPress={startCustomEdit}
            >
              {isCustomSelected ? formattedCustom : customLabel}
            </Button>
          )}
        </Row>
      </GroupRow>
      {error ? <FieldError error={error} id={errorId} /> : null}
    </Col>
  );
}
