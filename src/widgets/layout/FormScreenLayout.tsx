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
