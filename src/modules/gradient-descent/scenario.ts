export type GradientPreset = {
  id: "creep" | "converge" | "overshoot";
  label: string;
  description: string;
  learningRate: number;
  momentum: number;
};

export const gradientPresets: GradientPreset[] = [
  {
    id: "creep",
    label: "Creep",
    description: "Tiny steps keep improving, slowly.",
    learningRate: 0.08,
    momentum: 0,
  },
  {
    id: "converge",
    label: "Converge",
    description: "A useful step lands near the valley.",
    learningRate: 0.42,
    momentum: 0.18,
  },
  {
    id: "overshoot",
    label: "Overshoot",
    description: "Big steps launch across the minimum.",
    learningRate: 1.55,
    momentum: 0.36,
  },
];

export const defaultPreset = gradientPresets[1];
