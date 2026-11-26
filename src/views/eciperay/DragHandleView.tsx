import { GripIcon } from "../../icons/GripIcon.js";
import { platformAccessibilityProps } from "../../widgets/accessibility.js";
import { Center } from "../../widgets/layout/Center.js";

export type DragHandleViewProps = {
  /**
   * The grip's accessible name. Defaults to "Drag to reorder":
   * the name names the gesture the grip affords, while the
   * gesture itself stays with the host (see the view's docs).
   */
  accessibilityLabel?: string;
};

/**
 * DragHandleView (#878): the DS-rendered drag handle for
 * reorderable rows — ONLY the grip visual (the six-dot
 * GripIcon centered in its slot), under Stephen's 2026-11-26
 * boundary revision on #878: the design system owns the handle
 * visual, hosts keep drag behavior. The view renders no
 * listeners, takes no drag props, and the design system takes
 * no drag library dependency: a host's drag container supplies
 * the activator behavior around (or instead of, through the
 * list views' `renderDragHandle` override) this visual.
 *
 * The grip is exposed to assistive tech as a labeled image:
 * the surrounding drag activator is the host's element, so
 * this view claims no interactive role of its own.
 */
export function DragHandleView(props: DragHandleViewProps) {
  return (
    <Center
      {...platformAccessibilityProps({
        accessibilityRole: "image",
        accessibilityLabel: props.accessibilityLabel ?? "Drag to reorder",
      })}
    >
      <GripIcon />
    </Center>
  );
}
