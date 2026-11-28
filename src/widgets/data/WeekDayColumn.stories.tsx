import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { DetailRow } from "../../views/eciperay/DetailRow.js";
import { Col } from "../layout/Col.js";

import { ListItem } from "./ListItem.js";
import { Text } from "./Text.js";
import { WeekDayColumn, WeekDayColumns } from "./WeekDayColumn.js";

const meta: Meta<typeof WeekDayColumn> = {
  title: "Widgets/Data Display/WeekDayColumn",
  component: WeekDayColumn,
};

export default meta;
type Story = StoryObj<typeof WeekDayColumn>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={860}>
      <WeekDayColumns>
        <WeekDayColumn label="Monday" dateLabel="2026-10-19">
          <Col>
            <ListItem
              prefix="Meal · "
              title="Sunday Dinner leftovers"
              subtitle="Qty 1 · 3 recipes"
              onPress={() => {}}
            />
            <ListItem
              prefix="Recipe · "
              title="Test Recipe"
              subtitle="Qty 1 · 4 servings · 520 cal"
              onPress={() => {}}
            />
          </Col>
          <DetailRow label="Calories" value="1,850 cal" />
          <DetailRow label="Satiety" value="62" />
        </WeekDayColumn>
        <WeekDayColumn label="Tuesday" dateLabel="2026-10-20">
          <Text variant="hint">No entries</Text>
          <DetailRow label="Calories" value="0 cal" />
        </WeekDayColumn>
      </WeekDayColumns>
    </YStack>
  ),
};
