export const pointIds = ["A", "P", "N"] as const;
export type PointId = typeof pointIds[number];
export type ContrastiveState = { coordinates: [number, number, number]; margin: number };
export const pointRoles = ["Anchor", "Similar partner", "Dissimilar partner"] as const;
export const contrastivePresets: Record<string, ContrastiveState> = {
  near: { coordinates: [40, 60, 50], margin: 30 },
  separated: { coordinates: [40, 40, 80], margin: 30 },
  collapsed: { coordinates: [40, 40, 40], margin: 30 },
};
export const contrastiveScenarios = [
  { id: "near", label: "Near negative", shortLabel: "A40 · P60 · N50" },
  { id: "separated", label: "Separated", shortLabel: "Positive together" },
  { id: "collapsed", label: "Collapsed", shortLabel: "All points coincide" },
];
function bounded(value: number, min: number, max: number, step: number) {
  if (!Number.isFinite(value)) throw new Error("A finite coordinate or margin is required.");
  return Math.min(max, Math.max(min, min + Math.round((Math.min(max, Math.max(min, value)) - min) / step) * step));
}
export function moveContrastivePoint(state: ContrastiveState, id: PointId, value: number): ContrastiveState {
  if (!pointIds.includes(id)) throw new Error("Unknown embedding point.");
  const coordinates: ContrastiveState["coordinates"] = [...state.coordinates];
  coordinates[pointIds.indexOf(id)] = bounded(value, 0, 100, 1);
  return { ...state, coordinates };
}
export function changeContrastiveMargin(state: ContrastiveState, margin: number): ContrastiveState {
  return { ...state, margin: bounded(margin, 10, 100, 10) };
}
export function analyzeContrastive(state: ContrastiveState) {
  if (state.coordinates.length !== 3 || !state.coordinates.every(v => Number.isInteger(v) && v >= 0 && v <= 100) || !Number.isInteger(state.margin) || state.margin < 10 || state.margin > 100 || state.margin % 10) throw new Error("Coordinates must be integers 0..100; margin 10..100 in steps of 10.");
  const [anchor, positive, negative] = state.coordinates;
  const positiveDistance = Math.abs(anchor - positive), negativeDistance = Math.abs(anchor - negative);
  const shortfall = Math.max(0, state.margin - negativeDistance);
  const positiveLoss = positiveDistance ** 2 / 2, negativeLoss = shortfall ** 2 / 2;
  return { positiveDistance, negativeDistance, shortfall, positiveLoss, negativeLoss, mean: (positiveLoss + negativeLoss) / 2, active: shortfall > 0,
    pairs: [
      { id: "AP", name: "A–P", relationship: "Similar", label: 0, distance: positiveDistance, shortfall: null, loss: positiveLoss, formula: `½ × ${positiveDistance}² = ${positiveLoss}`, left: Math.min(anchor, positive), span: positiveDistance, endpoints: [anchor, positive] },
      { id: "AN", name: "A–N", relationship: "Dissimilar", label: 1, distance: negativeDistance, shortfall, loss: negativeLoss, formula: `½ × max(0, ${state.margin} − ${negativeDistance})² = ${negativeLoss}`, left: Math.min(anchor, negative), span: negativeDistance, endpoints: [anchor, negative] },
    ],
  };
}
export function sameContrastive(a: ContrastiveState, b: ContrastiveState) { return a.margin === b.margin && a.coordinates.every((v, i) => v === b.coordinates[i]); }
export function contrastivePresetId(state: ContrastiveState) { return Object.entries(contrastivePresets).find(([, value]) => sameContrastive(state, value))?.[0] ?? "custom"; }
