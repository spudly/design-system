import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { MarkableRow } from "./MarkableRow.js";
import { Col } from "../layout/Col.js";

const meta: Meta<typeof MarkableRow> = {
  title: "Widgets/Data Display/MarkableRow",
  component: MarkableRow,
};

export default meta;
type Story = StoryObj<typeof MarkableRow>;

export const Default: Story = {
  render: () => {
    const [marked, setMarked] = useState<Record<string, boolean>>({ rice: true });
    const toggle = (id: string) => {
      setMarked((current) => ({ ...current, [id]: !current[id] }));
    };
    return (
      <YStack maxWidth={430}>
        <Col>
          <MarkableRow
            label="1 1/2 lb chicken thighs"
            isMarked={marked["chicken"] ?? false}
            onPress={() => toggle("chicken")}
          />
          <MarkableRow
            label="2 cups jasmine rice"
            isMarked={marked["rice"] ?? false}
            onPress={() => toggle("rice")}
          />
          <MarkableRow
            label="1 tsp smoked paprika"
            trailingNote="optional"
            isMarked={marked["paprika"] ?? false}
            onPress={() => toggle("paprika")}
          />
          <MarkableRow label="Salt to taste" />
        </Col>
      </YStack>
    );
  },
};
