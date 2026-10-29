/**
 * design-system/no-margin-spacing — inter-item spacing belongs to
 * the parent, never to margins on individual elements (#209).
 *
 * Stephen's direction (review on PR #195, recorded on #209):
 *
 * > we need to change how we add space between items. Space between
 * > items should be controlled by the parent (via gap and padding),
 * > not by setting margin on individual elements.
 *
 * So this rule reports margin usage in the files the config scopes
 * it to (src/components/** and src/pages/**):
 *
 * - Any Tamagui margin prop set on an element: `margin`,
 *   `marginTop`, `marginBottom`, `marginLeft`, `marginRight`,
 *   `marginHorizontal`, `marginVertical`, and the logical family
 *   (`marginStart`, `marginEnd`, `marginInline*`, `marginBlock*`).
 *   The set is derived from the Tamagui style-prop table (see
 *   styleProps.mjs), so it tracks Tamagui rather than being
 *   hand-curated. A `$`-token value (`marginTop="$4"`) is the same
 *   prop and is reported the same way.
 * - Any margin key inside a style object carried by a
 *   style-bearing attribute: the `style` prop's object, a
 *   media/variant object (`$gtSm={{ ... }}`), a pseudo-style
 *   object (`hoverStyle`, `pressStyle`, ...), or a spread whose
 *   visible keys include one — whether the spread is the
 *   attribute itself (`{...(cond ? { marginTop: ... } : {})}`)
 *   or nested inside the object (`style={{ ...{ marginTop: 8 } }}`).
 *   Objects the rule cannot see into (opaque spreads, variables)
 *   are not inspected — the same sight limit the no-page-styling
 *   rule documents. An inline object on a NON-style attribute
 *   (e.g. `options={{ ... }}`) is data, not styling, and is
 *   likewise not inspected.
 *
 * Deliberately NOT reported:
 *
 * - Positioning offsets (`top`, `right`, `bottom`, `left`, `inset`,
 *   ...): DismissibleBanner's dismiss placement is done with
 *   relative-position offsets (PR #193), and positioning is not
 *   inter-item spacing.
 * - `styled()` config objects and other non-JSX objects: the
 *   issue scopes the rule to style props and `style` objects.
 *   (Switch's thumb carries a documented 2px top margin inside a
 *   styled() config for optical centering — not inter-item
 *   spacing, and outside this rule's sight by design.)
 * - Padding and gap: those are the parent-side mechanisms this
 *   rule exists to steer code toward.
 *
 * Margins that are not inter-item spacing at all — e.g. an `auto`
 * margin aligning an element inside its row — are still reported:
 * the rule is name-based and cannot judge intent. Such a line
 * carries an eslint-disable comment stating why it stays (see
 * SelectField's item indicator), which is the explicit, in-code
 * call-out #209 asks for instead of a silent exemption.
 *
 * Dormancy: like the #119 rule, this is wired at "error" in
 * eslint.config.ts but cannot fire today — the shared
 * `typescriptPendingIgnores` block ignores every .ts/.tsx file
 * (typescript-eslint has no TypeScript 7 parser yet). It activates
 * with no further change at the TS lint restoration
 * (eslint-config issue #8). The #209 sweep converted the codebase
 * proactively, so activation is a non-event.
 */
import { styleProps } from "./styleProps.mjs";

export const marginProps = new Set([...styleProps].filter((name) => name.startsWith("margin")));

function isMarginKey(key) {
  return typeof key === "string" && marginProps.has(key);
}

function checkObjectKeys(context, node) {
  for (const property of node.properties) {
    if (property.type === "SpreadElement") {
      // A spread inside the object whose argument is visibly an
      // object (or a conditional/logical over objects) carries
      // keys the same way the object's own keys do — look inside
      // it. Opaque spreads (identifiers, calls) stay out of sight.
      checkStyleObject(context, property.argument);
      continue;
    }
    if (property.type !== "Property") continue;
    const key = property.key.name ?? property.key.value;
    if (isMarginKey(key)) {
      context.report({ node: property, messageId: "marginKey", data: { name: key } });
    }
  }
}

function checkStyleObject(context, node) {
  switch (node.type) {
    case "ObjectExpression": {
      checkObjectKeys(context, node);
      break;
    }
    case "ConditionalExpression": {
      checkStyleObject(context, node.consequent);
      checkStyleObject(context, node.alternate);
      break;
    }
    case "LogicalExpression": {
      checkStyleObject(context, node.right);
      break;
    }
    default: {
      // Identifiers, calls, spreads of unseen objects: the rule
      // cannot see their keys, so it stays silent (documented
      // sight limit, mirroring the no-page-styling rule).
      break;
    }
  }
}

function isStyleBearingAttribute(name) {
  // Only style-bearing attributes can style the element: the
  // `style` prop, a `$`-prefixed media/variant object, or the
  // `*Style` family (hoverStyle, pressStyle, contentContainerStyle,
  // ...). An inline object on any other attribute is data, not
  // styling, so its keys are not the rule's business.
  return name === "style" || name.startsWith("$") || name.endsWith("Style");
}

function checkAttribute(context, attribute) {
  if (attribute.type === "JSXSpreadAttribute") {
    checkStyleObject(context, attribute.argument);
    return;
  }
  const { name } = attribute.name;
  if (marginProps.has(name)) {
    context.report({ node: attribute, messageId: "marginProp", data: { name } });
    return;
  }
  // A style-bearing attribute whose value is an inline object —
  // the `style` prop, a `$`-media/variant object, a pseudo-style
  // object — can carry margin keys; check the keys it visibly holds.
  const value = attribute.value;
  if (isStyleBearingAttribute(name) && value?.type === "JSXExpressionContainer") {
    checkStyleObject(context, value.expression);
  }
}

const noMarginSpacing = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Inter-item spacing belongs to the parent (gap/padding), not to margins on individual elements: no margin props and no margin keys in style objects.",
    },
    messages: {
      marginProp:
        "'{{name}}' puts space between items on the element itself. Spacing between items belongs to the parent: use gap on the parent stack or padding on the parent container instead.",
      marginKey:
        "'{{name}}' in a style object puts space between items on the element itself. Spacing between items belongs to the parent: use gap on the parent stack or padding on the parent container instead.",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        for (const attribute of node.attributes) checkAttribute(context, attribute);
      },
    };
  },
};

export default { rules: { "no-margin-spacing": noMarginSpacing } };
