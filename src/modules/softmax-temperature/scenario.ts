export type SoftmaxClassId = "rover" | "comet" | "harbor" | "signal";

export type SoftmaxClass = {
  id: SoftmaxClassId;
  label: string;
  color: string;
  mutedColor: string;
};

export type SoftmaxLogits = Record<SoftmaxClassId, number>;

export type SoftmaxPreset = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  logits: SoftmaxLogits;
};

export const softmaxClasses: SoftmaxClass[] = [
  {
    id: "rover",
    label: "Rover",
    color: "#ff3b3b",
    mutedColor: "#fecaca",
  },
  {
    id: "comet",
    label: "Comet",
    color: "#2f7bf5",
    mutedColor: "#bfdbfe",
  },
  {
    id: "harbor",
    label: "Harbor",
    color: "#16a34a",
    mutedColor: "#bbf7d0",
  },
  {
    id: "signal",
    label: "Signal",
    color: "#f59e0b",
    mutedColor: "#fde68a",
  },
];

export const softmaxPresets: SoftmaxPreset[] = [
  {
    id: "balanced",
    label: "Balanced",
    shortLabel: "Almost tied",
    description: "All classes start close, so temperature has room to spread.",
    logits: {
      rover: 0.2,
      comet: 0.05,
      harbor: -0.05,
      signal: -0.2,
    },
  },
  {
    id: "clear-winner",
    label: "Clear Winner",
    shortLabel: "One logit leads",
    description: "Rover has a visible lead before softmax converts scores.",
    logits: {
      rover: 2.4,
      comet: 0.8,
      harbor: -0.2,
      signal: -1,
    },
  },
  {
    id: "close-call",
    label: "Close Call",
    shortLabel: "Tiny margin",
    description: "The winner barely leads, so high confidence is fragile.",
    logits: {
      rover: 1.2,
      comet: 1.05,
      harbor: 0.95,
      signal: 0.7,
    },
  },
];

export const initialTemperature = 0.7;
