import { Children } from "react";
import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";

export type FieldColumnsProps = {
  /** The fields, one per column (typically LabeledFields). */
  children: ReactNode;
};

/**
 * A row of equal-width field columns (#119): each field gets
 * an equal share of the row's width, with the forms' 12px
 * gutter between columns — the shape of a form's short-field
 * row (servings / prep / cook on the recipe form). The columns
 * are the component's own: call sites pass only the fields,
 * and no column widths or gaps cross as props.
 */
export function FieldColumns({ children }: FieldColumnsProps) {
  return (
    <XStack gap={tokens.spacing[3]}>
      {Children.map(children, (child) => (
        <YStack flex={1}>{child}</YStack>
      ))}
    </XStack>
  );
}
