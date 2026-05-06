import { type ComponentType } from "react";
import { CategoricalCrossEntropyPlayground } from "@/modules/categorical-cross-entropy/CategoricalCrossEntropyPlayground";
import { ConditionalProbabilityPlayground } from "@/modules/conditional-probability/ConditionalProbabilityPlayground";
import { ConfusionMatrixThresholdsPlayground } from "@/modules/confusion-matrix-thresholds/ConfusionMatrixThresholdsPlayground";
import { GradientDescentPlayground } from "@/modules/gradient-descent/GradientDescentPlayground";
import { MeanMedianModePlayground } from "@/modules/mean-median-mode/MeanMedianModePlayground";
import { OverfittingPlayground } from "@/modules/overfitting/OverfittingPlayground";
import { ProbabilityRulesPlayground } from "@/modules/probability-rules/ProbabilityRulesPlayground";
import { RangeQuartilesIqrPlayground } from "@/modules/range-quartiles-iqr/RangeQuartilesIqrPlayground";
import { ShapeSkewOutliersPlayground } from "@/modules/shape-skew-outliers/ShapeSkewOutliersPlayground";
import { SoftmaxTemperaturePlayground } from "@/modules/softmax-temperature/SoftmaxTemperaturePlayground";
import { VarianceStandardDeviationPlayground } from "@/modules/variance-standard-deviation/VarianceStandardDeviationPlayground";
import {
  activePlaygroundMetadata,
  upcomingPlaygrounds,
  type PlaygroundMetadata,
} from "@/lib/playground-metadata";

export type ActivePlaygroundSlug =
  (typeof activePlaygroundMetadata)[number]["slug"];

export type ActivePlayground = PlaygroundMetadata & {
  slug: ActivePlaygroundSlug;
  component: ComponentType;
};

const playgroundComponents: Record<ActivePlaygroundSlug, ComponentType> = {
  "mean-median-mode": MeanMedianModePlayground,
  "range-quartiles-iqr": RangeQuartilesIqrPlayground,
  "variance-standard-deviation": VarianceStandardDeviationPlayground,
  "shape-skew-outliers": ShapeSkewOutliersPlayground,
  "categorical-cross-entropy": CategoricalCrossEntropyPlayground,
  "probability-rules": ProbabilityRulesPlayground,
  "conditional-probability": ConditionalProbabilityPlayground,
  "softmax-temperature": SoftmaxTemperaturePlayground,
  "gradient-descent": GradientDescentPlayground,
  "confusion-matrix-thresholds": ConfusionMatrixThresholdsPlayground,
  overfitting: OverfittingPlayground,
};

export const activePlaygrounds: ActivePlayground[] = activePlaygroundMetadata.map(
  (metadata) => ({
    ...metadata,
    component: playgroundComponents[metadata.slug],
  }),
);

export { upcomingPlaygrounds };

export function getActivePlayground(slug: string) {
  return activePlaygrounds.find((playground) => playground.slug === slug);
}
