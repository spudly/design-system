import type { ReactNode } from "react";
import { XStack, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledWeekDayColumns = styled(XStack, {
  name: "WeekDayColumns",

  gap: tokens.spacing[3],
  flexWrap: "wrap",
  alignItems: "flex-start",
});

type StyledWeekDayColumnsProps = GetProps<typeof StyledWeekDayColumns>;

export type WeekDayColumnsProps = Omit<
  StyledWeekDayColumnsProps,
  "gap" | "alignItems" | "flexWrap"
>;

/**
 * The wrapping row of a week view's day columns (#660): the
 * columns sit side-by-side on a wide surface and wrap to
 * full-width days on narrow (phone/native) surfaces. There is
 * deliberately no horizontal scrolling — the page-scroll model
 * (#547) bans nested scrollers, so wrapping is the only compliant
 * overflow treatment. Call sites pass only the WeekDayColumns'
 * WeekDayColumn children: the gap and wrapping live here.
 */
export function WeekDayColumns({ ...rest }: WeekDayColumnsProps) {
  return <StyledWeekDayColumns {...rest} />;
}

const StyledWeekDayColumn = styled(YStack, {
  name: "WeekDayColumn",

  gap: tokens.spacing[3],
  flex: 1,
  minWidth: 180,
});

type StyledWeekDayColumnProps = GetProps<typeof StyledWeekDayColumn>;

export type WeekDayColumnProps = Omit<StyledWeekDayColumnProps, "gap" | "flex" | "minWidth"> & {
  /** The day's heading (the host composes it, e.g. "Monday"). */
  label: string;
  /** The day's date line, pre-composed by the host; omit to hide it. */
  dateLabel?: string;
  /** The day's content: its entry rows, then its totals strip. */
  children: ReactNode;
};

/**
 * One day column of a week view (#660): the day's heading and
 * optional date line above the content the page supplies (the
 * day's entries and its per-day totals strip). The column owns
 * its internal spacing and its share of the WeekDayColumns row
 * (an equal flex share with a 180px floor, below which the row
 * wraps it to its own line); call sites pass only content — no
 * styling props, by design (#119).
 */
export function WeekDayColumn({ label, dateLabel, children, ...rest }: WeekDayColumnProps) {
  return (
    <StyledWeekDayColumn {...rest}>
      <Text variant="subheading">{label}</Text>
      {dateLabel ? <Text variant="hint">{dateLabel}</Text> : null}
      {children}
    </StyledWeekDayColumn>
  );
}
