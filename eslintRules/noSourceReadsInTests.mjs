/**
 * design-system/no-source-reads-in-tests — test files must not read
 * JS/TS source files (#772, split from #733).
 *
 * Stephen's decision (2026-11-20, on #733): tests that read a source
 * file with `readFileSync` and pin exact source strings protect
 * spelling, not behavior — a refactor that preserves behavior still
 * fails them, and the pins distort implementations (the #707/#731
 * Badge contortion). Behavioral contracts convert to prop-capture
 * mock tests under #733; this rule is the guard that stops new
 * source scans from being written.
 *
 * What the rule flags, in a file the config scopes it to (test
 * files): a filesystem read — `readFileSync`, `readFile`,
 * `existsSync`, `createReadStream`, or a directory enumeration via
 * `readdirSync` — whose target statically resolves to a JS/TS
 * source file or a source directory:
 *
 * 1. Any string fragment of the target path ends in a source
 *    extension (.ts/.tsx/.js/.jsx/.mts/.cts/.mjs/.cjs), including
 *    template fragments like `${name}.tsx` and `join(...)` segment
 *    lists — UNLESS the target is a declaration file (.d.ts) or
 *    lives under a `dist/` directory: built-output checks are
 *    legitimate (the #733 audit's LEGIT class).
 * 2. The target is built from a variable assigned the result of
 *    `readdirSync` over a source directory (the enumerate-then-read
 *    pattern), or is itself a `readdirSync` over a directory under
 *    `src/`.
 *
 * Reads of data files (.json, .md, .css, .html, package.json) and
 * dist output are NOT flagged — the audit classified those as
 * legitimate and they stay.
 *
 * Adoption (#772): wired at "warn" for test files in
 * eslint.config.ts. Promotion to "error" waits until #733's
 * conversion tranches burn the warnings down. Like the other local
 * rules it is dormant in CI until the TS lint restoration removes
 * the typescriptPendingIgnores block; the rule's own test validates
 * it against the repository's test files directly.
 */

import {
  READ_FUNCTIONS,
  calleeName,
  derivesFromReaddir,
  identifiersIn,
  isLegitTarget,
  isSourceDirectory,
  isSourceTarget,
  sourceFragmentOf,
  stringFragments,
} from "./noSourceReadsInTestsHelpers.mjs";

const enumeratorHelpers = new Set();

const noSourceReadsInTests = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Test files must not read JS/TS source files: source-string pins protect spelling, not behavior. Convert the assertion to a behavioral or prop-capture test instead.",
    },
    messages: {
      sourceRead:
        "Tests must not read source files ('{{target}}'). Source-string pins protect spelling, not behavior — assert the behavior (rendering or prop-capture) instead. See #733/#772.",
      dynamicSourceRead:
        "Tests must not read source files through a directory enumeration. Source-string pins protect spelling, not behavior — assert the behavior (rendering or prop-capture) instead. See #733/#772.",
    },
    schema: [],
  },
  create(context) {
    enumeratorHelpers.clear();
    const variables = new Map();
    // Local source-read helpers: a function whose body passes one of
    // its parameters into a filesystem read (e.g.
    // `const readSource = (rel) => readFileSync(join(root, rel))`).
    // Calls to such a helper with a source-path argument are flagged
    // at the call site, where the target is statically known.
    const helpers = new Map(); // name -> parameter index
    const functionStack = [];
    function registerHelper(paramName) {
      const fn = functionStack.at(-1);
      if (!fn || !fn.name) return;
      const index = fn.params.indexOf(paramName);
      if (index !== -1) helpers.set(fn.name, index);
    }
    function pushFunction(node, name) {
      functionStack.push({
        name: name ?? node.id?.name,
        params: node.params.filter((p) => p.type === "Identifier").map((p) => p.name),
      });
    }
    return {
      FunctionDeclaration(node) {
        pushFunction(node);
      },
      "FunctionDeclaration:exit"() {
        functionStack.pop();
      },
      FunctionExpression(node) {
        pushFunction(node);
      },
      "FunctionExpression:exit"() {
        functionStack.pop();
      },
      ArrowFunctionExpression(node) {
        const parent = node.parent;
        const name =
          parent?.type === "VariableDeclarator" && parent.id.type === "Identifier"
            ? parent.id.name
            : undefined;
        pushFunction(node, name);
      },
      "ArrowFunctionExpression:exit"() {
        functionStack.pop();
      },
      VariableDeclarator(node) {
        if (node.id.type === "ArrayPattern" || node.id.type === "ObjectPattern") {
          // Destructured loop/table variables (e.g. `const [name, rel] of
          // pages`): each element name maps to the whole initializer, so
          // its string fragments stay reachable.
          const init =
            node.init ??
            (node.parent?.parent &&
            (node.parent.parent.type === "ForOfStatement" ||
              node.parent.parent.type === "ForInStatement")
              ? node.parent.parent.right
              : undefined);
          if (init) {
            for (const element of node.id.type === "ArrayPattern" ? node.id.elements : node.id.properties) {
              const target = element?.type === "RestElement" ? element.argument : element;
              const nameNode = target?.type === "Property" ? target.value : target;
              if (nameNode?.type === "Identifier") variables.set(nameNode.name, init);
            }
          }
          return;
        }
        if (node.id.type !== "Identifier") return;
        if (node.init) {
          variables.set(node.id.name, node.init);
        } else if (
          node.parent?.parent &&
          (node.parent.parent.type === "ForOfStatement" || node.parent.parent.type === "ForInStatement")
        ) {
          variables.set(node.id.name, node.parent.parent.right);
        }
      },
      CallExpression(node) {
        const name = calleeName(node.callee);
        if (!name) return;
        if (!READ_FUNCTIONS.has(name)) {
          // A call to a local source-read helper with a source path.
          const paramIndex = helpers.get(name);
          if (paramIndex === undefined) return;
          const arg = node.arguments[paramIndex];
          if (!arg) return;
          const fragments = stringFragments(arg, variables);
          if (!isLegitTarget(fragments) && isSourceTarget(fragments)) {
            context.report({ node, messageId: "dynamicSourceRead" });
          }
          return;
        }
        const target = node.arguments[0];
        if (!target) return;
        // A read through one of the enclosing function's parameters
        // makes that function a source-read helper (flagged at its
        // call sites, where the path is statically known).
        const fn = functionStack.at(-1);
        if (fn) {
          for (const id of identifiersIn(target)) {
            if (fn.params.includes(id)) registerHelper(id);
          }
        }
        const fragments = stringFragments(target, variables);
        if (isLegitTarget(fragments)) return;
        if (isSourceTarget(fragments)) {
          const sourceFragment = sourceFragmentOf(fragments);
          context.report({
            node,
            messageId: "sourceRead",
            data: { target: sourceFragment ?? name },
          });
          return;
        }
        if (name === "readdirSync") {
          if (isSourceDirectory(fragments)) {
            context.report({ node, messageId: "dynamicSourceRead" });
          }
          // A readdir over a parameter makes the enclosing function an
          // enumerator helper: files it yields are source reads at the
          // eventual readFileSync call.
          const fn = functionStack.at(-1);
          if (fn?.name) enumeratorHelpers.add(fn.name);
          return;
        }
        if (derivesFromReaddir(target, variables, enumeratorHelpers) ||
          derivesFromReaddir(node, variables, enumeratorHelpers)) {
          context.report({ node, messageId: "dynamicSourceRead" });
        }
      },
    };
  },
};

export default { rules: { "no-source-reads-in-tests": noSourceReadsInTests } };
