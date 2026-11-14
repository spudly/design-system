import { createContext } from "react";

/**
 * The DS modal registry (#394): the internal record of the
 * modal layers currently presented by DS components — Dialog
 * layers while open, StepOverlay shells while mounted. It
 * exists for web focus arbitration only; it renders nothing
 * and styles nothing.
 *
 * Why a registry: "which presented modal layer is the ACTIVE
 * layer" — the one whose focus containment governs Tab — used
 * to be inferred where it was needed, and every inference
 * broke when focus was not the carrier (review rounds on
 * PR #392, issue #394):
 *
 * - Dialog's open-dialog stack recorded REGISTRATION order,
 *   but simultaneously-open nested Dialogs register
 *   child-before-parent (React effect order) while presenting
 *   parent-below-child, so the covered parent was treated as
 *   the active layer and could swallow Tab away from the
 *   nested dialog on top of it.
 * - The foreign-modal stand-down keyed on the FOCUSED
 *   element: a Dialog mounted inside a new StepOverlay
 *   recorded its host before the overlay's mount effect
 *   focused its shell, so the stand-down treated the covered
 *   overlay as active and Tab never reached the Dialog; and a
 *   covering StepOverlay with focus resting on the body never
 *   stood the covered Dialog down at all, so the Dialog
 *   pulled focus back into itself. (A focus-keyed stand-down
 *   survives in Dialog for FOREIGN aria-modal elements only —
 *   host-built modals with no registry record; DS layers,
 *   whose roots registeredModalRoots reports, are exempt from
 *   it and arbitrated here.)
 *
 * The registry replaces both inferences with one recorded
 * fact per layer, taken when the layer is presented:
 *
 * - `presentedAt` — a monotonic stamp from when the layer was
 *   presented (Dialog: its open transition; StepOverlay: its
 *   mount). For layers that do not contain one another,
 *   presentation order IS stacking order: a layer presented
 *   later covers the ones presented before it. This is the
 *   covering-StepOverlay case — it holds wherever focus sits,
 *   the body included.
 * - `parentToken` — the token of the DS modal layer this
 *   layer was presented FROM WITHIN, read from
 *   ModalLayerContext at render. A layer composed inside
 *   another layer's children is presented above that ancestor
 *   however the two registered: the nested Dialog over its
 *   parent (the simultaneous-mount case), a Dialog over the
 *   StepOverlay hosting it, a StepOverlay over the Dialog
 *   containing it.
 *
 * Arbitration (isActiveModalLayer) consults only these
 * recorded facts — never the focused element, never the
 * order effects happened to run in. Dialog's Tab containment
 * and StepOverlay's Tab wrap both stand down while a layer
 * above theirs is active.
 *
 * The registry is internal to the DS package: it is not
 * exported from the package root, no component's props
 * change, and consumers do nothing differently (Stephen's
 * Option A ruling on #394 — no public stacking contract).
 */
export type ModalLayer = {
  /** The presenting component's stable identity — the same
   * symbol it provides to its children through
   * ModalLayerContext, so a layer presented from within it
   * can record (and the registry can resolve) its parent. A
   * registration minted its own symbol instead until CodeRabbit
   * review on PR #398: children recorded the PROVIDED token as
   * their parent, which no registered layer carried, so
   * ancestry never resolved and simultaneous mounts fell back
   * to stamps — the parent, registering second, won. */
  token: symbol;
  parentToken: symbol | null;
  presentedAt: number;
  /** The layer's rendered content root (Dialog: its content
   * element; StepOverlay: its shell), synced as it attaches. */
  root: Element | null;
  /** Dialog only: the native <dialog> frame the content is
   * portalled into, so the foreign-frame scan in Dialog's
   * containment can recognize (and skip) DS frames. Null for
   * other layer kinds. */
  frame: Element | null;
};

/** The token of the DS modal layer the rendering component
 * was composed inside, or null at the top level. Dialog and
 * StepOverlay provide their own token to their children. */
export const ModalLayerContext = createContext<symbol | null>(null);

const modalLayers: ModalLayer[] = [];
let presentationCounter = 0;

export function registerModalLayer(token: symbol, parentToken: symbol | null): ModalLayer {
  const layer: ModalLayer = {
    token,
    parentToken,
    presentedAt: ++presentationCounter,
    root: null,
    frame: null,
  };
  modalLayers.push(layer);
  return layer;
}

export function unregisterModalLayer(layer: ModalLayer): void {
  const index = modalLayers.indexOf(layer);
  if (index >= 0) {
    modalLayers.splice(index, 1);
  }
}

function layerByToken(token: symbol | null): ModalLayer | null {
  if (token === null) {
    return null;
  }
  return modalLayers.find((layer) => layer.token === token) ?? null;
}

// The stamps from the root layer down to `layer`, built by
// walking its recorded ancestry; an ancestor that has since
// unregistered ends the walk — its layer is gone, so the path
// just stops there. Each layer's presentation path extends
// its ancestor's path, so a layer always sorts above the
// ancestors it was presented from.
function presentationPath(layer: ModalLayer): number[] {
  const path: number[] = [];
  let current: ModalLayer | null = layer;
  while (current) {
    path.unshift(current.presentedAt);
    current = layerByToken(current.parentToken);
  }
  return path;
}

// Is layer `a` presented above layer `b`? Layers compare by
// their full presentation paths: ancestors sort below their
// descendants (a descendant's path extends the ancestor's),
// and unrelated branches sort by their stamps at the first
// level where their paths differ — for unrelated layers that
// is simply presentation order. Comparing pairwise ancestry
// and stamps instead is NOT transitive (CodeRabbit review on
// PR #398): a re-presented ancestor (fresh stamp), its
// still-registered descendant (older stamp), and an unrelated
// layer stamped between them form a cycle — descendant above
// ancestor by ancestry, ancestor above unrelated by stamp,
// unrelated above descendant by stamp — in which NO layer is
// active and every containment stands down. The path order
// is a total order, so exactly one layer is active whenever
// any layer is registered.
/**
 * @public — intentional exception (#586 phase 2): exercised directly by tests through internal module/dist imports that knip cannot trace; not part of the package's public entry.
 */
export function isAboveModalLayer(a: ModalLayer, b: ModalLayer): boolean {
  if (a === b) {
    return false;
  }
  const pathA = presentationPath(a);
  const pathB = presentationPath(b);
  const shared = Math.min(pathA.length, pathB.length);
  for (let i = 0; i < shared; i++) {
    const stampA = pathA[i]!;
    const stampB = pathB[i]!;
    if (stampA !== stampB) {
      return stampA > stampB;
    }
  }
  return pathA.length > pathB.length;
}

// The active layer is the one no other registered layer is
// above: its containment governs Tab.
export function isActiveModalLayer(layer: ModalLayer): boolean {
  return modalLayers.every((other) => other === layer || !isAboveModalLayer(other, layer));
}

// The native <dialog> frames of the registered Dialog layers
// — the DS frames a foreign-frame scan must recognize as
// already arbitrated by this registry and skip.
export function registeredModalFrames(): Set<Element> {
  const frames = new Set<Element>();
  for (const layer of modalLayers) {
    if (layer.frame) {
      frames.add(layer.frame);
    }
  }
  return frames;
}

// The content roots of the registered layers — the elements
// that ARE DS modal layers (a Dialog's content, a StepOverlay
// shell). Dialog's stand-down for a FOREIGN aria-modal element
// (one with no registry record: a host-built modal) exempts
// these: a DS layer is arbitrated by the registry above, never
// by that focus-keyed rule.
export function registeredModalRoots(): Set<Element> {
  const roots = new Set<Element>();
  for (const layer of modalLayers) {
    if (layer.root) {
      roots.add(layer.root);
    }
  }
  return roots;
}
