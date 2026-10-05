"use client";

import type { ReactNode } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult } from "./learning-page";
import styles from "./learning-page.module.css";

type Choices = readonly { id: string; label: string }[];

export type GuidedExperimentContent = {
  title: string;
  question: string;
  predictions: Choices;
  action: string;
  explanation: string;
  explanations: Choices;
  retry: string;
  takeaway: string;
};

// Presentation only: the lesson decides when a target is reached, whether an
// answer is correct, and how prediction changes, edits, reset and next behave.
export function GuidedExperiment({ label, experiment, reached, complete,
  prediction, explanation, predictionName, explanationName, onPredict, onExplain,
  predictionHelp, observation, action, onNext, nextLabel }: {
  label: string;
  experiment: GuidedExperimentContent;
  reached: boolean;
  complete: boolean;
  prediction: string | null;
  explanation: string | null;
  predictionName: string;
  explanationName: string;
  onPredict: (id: string) => void;
  onExplain: (id: string) => void;
  predictionHelp: ReactNode;
  observation: ReactNode;
  action?: ReactNode;
  onNext: () => void;
  nextLabel: ReactNode;
}) {
  return <ExperimentRail label={label} title={experiment.title}
    phase={prediction === null ? 0 : reached ? 2 : 1}>
    {!reached && <>
      <h3>Make a prediction</h3><p>{experiment.question}</p>
      <ExperimentChoices legend="Your prediction" name={predictionName}
        choices={experiment.predictions} value={prediction} onChange={onPredict} />
      <p className={styles.small}>{predictionHelp}</p>
    </>}
    {prediction !== null && !reached && (action ??
      <p className={styles.actionPrompt}><strong>Now try it.</strong> {experiment.action}</p>)}
    {reached && <>
      <p role="status" className={styles.observation}>{observation}</p>
      <h3>{experiment.explanation}</h3>
      <ExperimentChoices legend="Your explanation" name={explanationName}
        choices={experiment.explanations} value={explanation} onChange={onExplain} />
      {explanation !== null && !complete &&
        <p role="status" className={styles.feedback}>Try again. {experiment.retry}</p>}
    </>}
    {complete && <>
      <ExperimentResult>{experiment.takeaway}</ExperimentResult>
      <ExperimentButton arrow onClick={onNext}>{nextLabel}</ExperimentButton>
    </>}
  </ExperimentRail>;
}
