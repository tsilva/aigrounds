export type KlCategory = {
  id: string;
  label: string;
};

export type ReferenceScenario = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  values: number[];
};

export const klCategories: KlCategory[] = [
  {
    id: "a",
    label: "A",
  },
  {
    id: "b",
    label: "B",
  },
  {
    id: "c",
    label: "C",
  },
  {
    id: "d",
    label: "D",
  },
];

export const referenceScenarios: ReferenceScenario[] = [
  {
    id: "balanced",
    label: "Balanced",
    shortLabel: "Even mass",
    description: "P = [0.25, 0.25, 0.25, 0.25]",
    values: [0.25, 0.25, 0.25, 0.25],
  },
  {
    id: "peaked",
    label: "Peaked",
    shortLabel: "A matters most",
    description: "P = [0.70, 0.15, 0.10, 0.05]",
    values: [0.7, 0.15, 0.1, 0.05],
  },
  {
    id: "rare-event",
    label: "Rare event",
    shortLabel: "Tiny tail",
    description: "P = [0.88, 0.04, 0.04, 0.04]",
    values: [0.88, 0.04, 0.04, 0.04],
  },
];

export const initialReferenceScenarioId = "peaked";
export const initialApproximation = [0.45, 0.25, 0.2, 0.1];
