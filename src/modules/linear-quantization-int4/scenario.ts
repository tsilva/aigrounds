export type QuantizationScenarioId = "llm" | "activation" | "sensor";

export type QuantizationScenario = {
  id: QuantizationScenarioId;
  title: string;
  subtitle: string;
  icon: "blocks" | "wave" | "line";
  defaultMin: number;
  defaultMax: number;
  selectedValue: number;
  samples: number[];
};

function buildSamples(
  center: number,
  spread: number,
  lowTail: number,
  highTail: number,
) {
  const offsets = [
    -2.8, -2.45, -2.1, -1.85, -1.65, -1.45, -1.25, -1.05, -0.9, -0.78,
    -0.66, -0.55, -0.44, -0.34, -0.24, -0.15, -0.08, 0, 0.08, 0.16, 0.25,
    0.35, 0.46, 0.58, 0.72, 0.88, 1.06, 1.28, 1.52, 1.8, 2.15, 2.52,
  ];
  const dense = offsets.flatMap((offset, index) => {
    const value = center + offset * spread;
    const repeats = index > 9 && index < 23 ? 4 : index > 5 && index < 27 ? 3 : 2;

    return Array.from({ length: repeats }, () => Number(value.toFixed(4)));
  });

  return [
    lowTail,
    lowTail * 0.92,
    ...dense,
    highTail * 0.88,
    highTail,
  ];
}

export const quantizationScenarios: QuantizationScenario[] = [
  {
    id: "llm",
    title: "LLM weights",
    subtitle: "Transformer layer weights",
    icon: "blocks",
    defaultMin: -0.16,
    defaultMax: 0.14,
    selectedValue: 0.053,
    samples: buildSamples(0, 0.043, -0.19, 0.17),
  },
  {
    id: "activation",
    title: "Activation values",
    subtitle: "Post-layer outputs",
    icon: "wave",
    defaultMin: -0.08,
    defaultMax: 0.28,
    selectedValue: 0.126,
    samples: buildSamples(0.085, 0.052, -0.12, 0.32),
  },
  {
    id: "sensor",
    title: "Tiny sensor model",
    subtitle: "Edge-device weights",
    icon: "line",
    defaultMin: -0.05,
    defaultMax: 0.1,
    selectedValue: 0.037,
    samples: buildSamples(0.018, 0.021, -0.074, 0.118),
  },
];

export const defaultQuantizationScenario = quantizationScenarios[0];
