import { useId } from "react";
import { Label, Slider as TamaguiSlider, View, YStack, isWeb, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

const StyledTrack = styled(TamaguiSlider.Track, {
  name: "SliderTrack",

  height: tokens.spacing[2],
  borderRadius: tokens.radii.full,
  // The unfilled track is the theme's progressTrack role, exactly as
  // on ProgressBar and Spinner's determinate ring: the $primary fill
  // against it holds ≥3:1 (WCAG non-text) in every brand and mode.
  backgroundColor: "$progressTrack",
  overflow: "hidden",
});

const StyledTrackActive = styled(TamaguiSlider.TrackActive, {
  name: "SliderTrackActive",

  backgroundColor: "$primary",
  borderRadius: tokens.radii.full,
});

const StyledThumb = styled(TamaguiSlider.Thumb, {
  name: "SliderThumb",

  // The frame is the touch target (44px, the DS minimum); the visible
  // knob is the centered child circle — the RadioOptionGroup pattern
  // of a 44px target around a 24px visual.
  width: 44,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
  cursor: "pointer",
});

const ThumbKnob = styled(View, {
  name: "SliderThumbKnob",

  width: tokens.spacing[6],
  height: tokens.spacing[6],
  borderRadius: tokens.radii.full,
  backgroundColor: "$surface",
  borderWidth: 1,
  // The knob's boundary needs ≥3:1 against the track and surface
  // (WCAG 1.4.11) — $textMuted, as on TextField's input boundary.
  borderColor: "$textMuted",
});

export type SliderTick = {
  /** The value this label sits under; clamped into the min–max range. */
  value: number;
  label: string;
};

export type SliderProps = {
  /** Current value. Controlled — the host owns it, as on every DS field. */
  value: number;
  onValueChange: (value: number) => void;
  /**
   * Range bounds and step granularity; the Tamagui defaults.
   * Invalid values (non-finite bounds, `max <= min`, a non-positive
   * or non-finite `step`) are normalized inside the component and
   * never forwarded — the primitive divides by both the range and
   * the step when positioning and adjusting the thumb.
   */
  min?: number;
  max?: number;
  step?: number;
  /**
   * Field label, rendered above the slider. It is also the slider's
   * accessible name (routed to the thumb, the focusable element).
   */
  label?: string;
  /**
   * The thumb's accessible name when there is no visible `label`:
   * a bare slider still needs a name, and the primitive gives the
   * thumb no fallback. When both are set, this explicit name wins
   * over `label` (the Button convention for supplied names).
   */
  accessibilityLabel?: string;
  /** Error text under the slider, wired to the thumb as its description. */
  error?: string;
  /** When true, the slider is inert and dimmed; the value cannot change. */
  disabled?: boolean;
  /**
   * Tick labels under the track (the shuoink/ui spec's datalist
   * options): each label renders centered under its value's position
   * along the track, the first and last labels flush with the track
   * ends. Omit for a bare slider.
   */
  ticks?: SliderTick[];
  id?: string;
};

/**
 * Single-value slider field: a labeled, controlled range input built
 * on the Tamagui Slider primitive (drag, keyboard arrows/Home/End,
 * and slider semantics come from the primitive; the native
 * VoiceOver/TalkBack adjust actions are added here because the
 * primitive declares none; the DS owns the track/thumb styling and
 * the field chrome).
 *
 * This is the shuoink/ui Slider re-implemented in DS conventions
 * (design-system #178): the spec's range props (min / max / step /
 * value) and its tick labels carry over; its form-library `meta`
 * integration does not — DS fields carry their own `label` + `error`
 * props instead. Tamagui's array-valued API is adapted to the scalar
 * contract DS fields use (value + onValueChange, as on SelectField
 * and RadioOptionGroup): the array stays inside this component.
 *
 * Horizontal only in v1 — the spec is a horizontal range and no DS
 * consumer needs a vertical slider.
 */
export function Slider({
  value,
  onValueChange,
  min: minProp = 0,
  max: maxProp = 100,
  step: stepProp = 1,
  label,
  accessibilityLabel,
  error,
  disabled = false,
  ticks,
  id: idProp,
}: SliderProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = `${id}-error`;
  // Normalize the range before anything reaches the primitive: it
  // divides by (max - min) to position the thumb and by step to
  // adjust it, so a degenerate range or step is NaN geometry, not
  // an error the host can see. As elsewhere in the DS (Spinner,
  // NumberStepper), out-of-contract numbers are sanitized here
  // rather than forwarded or thrown.
  const min = Number.isFinite(minProp) ? minProp : 0;
  const max = Number.isFinite(maxProp) && maxProp > min ? maxProp : min + 1;
  const step = Number.isFinite(stepProp) && stepProp > 0 ? stepProp : 1;
  const range = max - min;
  const accessibleName = accessibilityLabel ?? label;
  // Native has no described-by relationship: aria-describedby stays web-only,
  // so the error text rides in the native accessible name instead — a native
  // screen reader focusing the thumb hears the error with the field's name.
  const nativeAccessibleName = error
    ? accessibleName
      ? `${accessibleName}: ${error}`
      : error
    : accessibleName;
  // Native adjust actions: the primitive renders the thumb with
  // slider semantics but declares no accessibilityActions, so
  // VoiceOver / TalkBack adjust gestures have nothing to invoke.
  // Native only — on web the primitive already handles the arrow
  // keys, and raw RN accessibility props leak to the DOM as
  // meaningless attributes (#235).
  const nativeAdjustProps: {
    accessibilityActions?: { name: string }[];
    onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
  } = isWeb
    ? {}
    : {
        accessibilityActions: [{ name: "increment" }, { name: "decrement" }],
        onAccessibilityAction: (event) => {
          if (disabled) {
            return;
          }
          const delta =
            event.nativeEvent.actionName === "increment"
              ? step
              : event.nativeEvent.actionName === "decrement"
                ? -step
                : 0;
          if (delta !== 0) {
            onValueChange(Math.min(max, Math.max(min, value + delta)));
          }
        },
      };

  return (
    <YStack gap={tokens.spacing[1]}>
      {label ? (
        <Label htmlFor={id} fontSize={tokens.typography.fontSize.sm}>
          {label}
        </Label>
      ) : null}
      <YStack opacity={disabled ? 0.5 : 1}>
        <TamaguiSlider
          value={[value]}
          onValueChange={(values) => {
            const next = values[0];
            if (next !== undefined) {
              onValueChange(next);
            }
          }}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          height={44}
        >
          <StyledTrack>
            <StyledTrackActive />
          </StyledTrack>
          <StyledThumb
            index={0}
            id={id}
            {...platformAccessibilityProps({
              accessibilityLabel: isWeb ? accessibleName : nativeAccessibleName,
            })}
            {...nativeAdjustProps}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          >
            <ThumbKnob />
          </StyledThumb>
        </TamaguiSlider>
        {ticks && ticks.length > 0 ? (
          <View position="relative" height={tokens.spacing[6]}>
            {ticks.map((tick) => {
              const percent =
                range > 0 ? Math.min(100, Math.max(0, ((tick.value - min) / range) * 100)) : 0;
              return (
                <View
                  key={tick.value}
                  position="absolute"
                  top={0}
                  left={`${percent}%`}
                  style={{
                    transform: [
                      { translateX: percent <= 0 ? "0%" : percent >= 100 ? "-100%" : "-50%" },
                    ],
                  }}
                >
                  <Text variant="hint">{tick.label}</Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </YStack>
      {error ? (
        <Text variant="error" id={errorId}>
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
