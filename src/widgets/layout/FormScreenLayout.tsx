import { Col } from "./Col.js";
import type { ColProps } from "./Col.js";

export type FormScreenLayoutProps = ColProps;

/**
 * Centered narrow column for forms and auth screens: content is capped at
 * 480px wide and centered horizontally, with comfortable vertical padding.
 *
 * #746 (Option B): both layers render Col directly — the outer
 * layer's centering is Col's `center`, the 16px horizontal /
 * 32px vertical padding is px "l" / py "xxl", and the inner
 * column's 16px rhythm is gap "l". No styled roots.
 *
 * Form clearance (#857): the outer layer's py "xxl" is the shared
 * form layout's trailing bottom clearance — every form page built
 * on this layout ends its submit action a full xxl step above
 * whatever follows (the shell's footer), and BigFooterShell adds
 * its own token clearance gap on top of it. RecipeFormPage, which
 * composes ScrollRegion instead, is covered by the shell gap.
 */
export function FormScreenLayout({ children, ...rest }: FormScreenLayoutProps) {
  return (
    <Col width="100%" center px="l" py="xxl" {...rest}>
      <Col width="100%" maxWidth={480} gap="l">
        {children}
      </Col>
    </Col>
  );
}
