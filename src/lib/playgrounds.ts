import { type ComponentType } from "react";
import { AutogradGraphsPlayground } from "@/modules/autograd-graphs/AutogradGraphsPlayground";
import { BayesRulePlayground } from "@/modules/bayes-rule/BayesRulePlayground";
import { BackpropagationInspectorPlayground } from "@/modules/backpropagation-inspector/BackpropagationInspectorPlayground";
import { BatchNormalizationPlayground } from "@/modules/batch-normalization/BatchNormalizationPlayground";
import { BernoulliCategoricalBinomialPlayground } from "@/modules/bernoulli-categorical-binomial/BernoulliCategoricalBinomialPlayground";
import { BytePairEncodingPlayground } from "@/modules/byte-pair-encoding/BytePairEncodingPlayground";
import { CategoricalCrossEntropyPlayground } from "@/modules/categorical-cross-entropy/CategoricalCrossEntropyPlayground";
import { ConditionalProbabilityPlayground } from "@/modules/conditional-probability/ConditionalProbabilityPlayground";
import { ConfusionMatrixThresholdsPlayground } from "@/modules/confusion-matrix-thresholds/ConfusionMatrixThresholdsPlayground";
import { ExpectedValueRiskPlayground } from "@/modules/expected-value-risk/ExpectedValueRiskPlayground";
import { GradientDescentPlayground } from "@/modules/gradient-descent/GradientDescentPlayground";
import { KlDivergencePlayground } from "@/modules/kl-divergence/KlDivergencePlayground";
import { LabelMixingImageTransformsPlayground } from "@/modules/label-mixing-image-transforms/LabelMixingImageTransformsPlayground";
import { LayerNormalizationPlayground } from "@/modules/layer-normalization/LayerNormalizationPlayground";
import { LinearQuantizationInt4Playground } from "@/modules/linear-quantization-int4/LinearQuantizationInt4Playground";
import { MatrixMultiplicationPlayground } from "@/modules/matrix-multiplication/MatrixMultiplicationPlayground";
import { MeanMedianModePlayground } from "@/modules/mean-median-mode/MeanMedianModePlayground";
import { MnistMlpInferenceDebuggerPlayground } from "@/modules/mnist-mlp-inference-debugger/MnistMlpInferenceDebuggerPlayground";
import { MonteCarloTreeSearchPlayground } from "@/modules/monte-carlo-tree-search/MonteCarloTreeSearchPlayground";
import { OverfittingPlayground } from "@/modules/overfitting/OverfittingPlayground";
import { ProbabilityRulesPlayground } from "@/modules/probability-rules/ProbabilityRulesPlayground";
import { PytorchImageAugmentationsPlayground } from "@/modules/pytorch-image-augmentations/PytorchImageAugmentationsPlayground";
import { RangeQuartilesIqrPlayground } from "@/modules/range-quartiles-iqr/RangeQuartilesIqrPlayground";
import { ShapeSkewOutliersPlayground } from "@/modules/shape-skew-outliers/ShapeSkewOutliersPlayground";
import { SoftmaxTemperaturePlayground } from "@/modules/softmax-temperature/SoftmaxTemperaturePlayground";
import { TensorShapeBroadcastingPlayground } from "@/modules/tensor-shape-broadcasting/TensorShapeBroadcastingPlayground";
import { TransformerAttentionPlayground } from "@/modules/transformer-attention/TransformerAttentionPlayground";
import { VarianceStandardDeviationPlayground } from "@/modules/variance-standard-deviation/VarianceStandardDeviationPlayground";
import { WaitingArrivalDistributionsPlayground } from "@/modules/waiting-arrival-distributions/WaitingArrivalDistributionsPlayground";
import { ZeroKnowledgeProofsPlayground } from "@/modules/zero-knowledge-proofs/ZeroKnowledgeProofsPlayground";
import {
  activePlaygroundMetadata,
  dashboardLessonPlanOrder,
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
  "probability-rules": ProbabilityRulesPlayground,
  "conditional-probability": ConditionalProbabilityPlayground,
  "bayes-rule": BayesRulePlayground,
  "expected-value-risk": ExpectedValueRiskPlayground,
  "bernoulli-categorical-binomial": BernoulliCategoricalBinomialPlayground,
  "waiting-arrival-distributions": WaitingArrivalDistributionsPlayground,
  overfitting: OverfittingPlayground,
  "confusion-matrix-thresholds": ConfusionMatrixThresholdsPlayground,
  "softmax-temperature": SoftmaxTemperaturePlayground,
  "categorical-cross-entropy": CategoricalCrossEntropyPlayground,
  "kl-divergence": KlDivergencePlayground,
  "gradient-descent": GradientDescentPlayground,
  "monte-carlo-tree-search": MonteCarloTreeSearchPlayground,
  "matrix-multiplication": MatrixMultiplicationPlayground,
  "tensor-shape-broadcasting": TensorShapeBroadcastingPlayground,
  "byte-pair-encoding": BytePairEncodingPlayground,
  "transformer-attention": TransformerAttentionPlayground,
  "linear-quantization-int4": LinearQuantizationInt4Playground,
  "pytorch-image-augmentations": PytorchImageAugmentationsPlayground,
  "label-mixing-image-transforms": LabelMixingImageTransformsPlayground,
  "mnist-mlp-inference-debugger": MnistMlpInferenceDebuggerPlayground,
  "autograd-graphs": AutogradGraphsPlayground,
  "backpropagation-inspector": BackpropagationInspectorPlayground,
  "zero-knowledge-proofs": ZeroKnowledgeProofsPlayground,
  "batch-normalization": BatchNormalizationPlayground,
  "layer-normalization": LayerNormalizationPlayground,
};

export const activePlaygrounds: ActivePlayground[] = activePlaygroundMetadata.map(
  (metadata) => ({
    ...metadata,
    component: playgroundComponents[metadata.slug],
  }),
);

export { dashboardLessonPlanOrder, upcomingPlaygrounds };

export function getActivePlayground(slug: string) {
  return activePlaygrounds.find((playground) => playground.slug === slug);
}
