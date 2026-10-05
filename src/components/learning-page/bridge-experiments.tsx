"use client";

import { GuidedExperiment, type GuidedExperimentContent } from "./guided-experiment";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult } from "./learning-page";
import styles from "./learning-page.module.css";

// Presentation only. Each module owns its parameters, baseline, target and answers.
export function BridgeExperiments({ experiments, index, prediction, explanation, reached,
  onPredict, onExplain, onNext, transfer, transferReached, transferAnswer, onTransfer, onRestart }: {
  experiments: readonly GuidedExperimentContent[]; index: number; prediction: string | null;
  explanation: string | null; reached: boolean; onPredict: (id: string) => void;
  onExplain: (id: string) => void; onNext: () => void; onRestart: () => void;
  transfer: { title: string; action: string; question: string; choices: readonly { id: string; label: string }[]; retry: string; takeaway: string };
  transferReached: boolean; transferAnswer: string | null; onTransfer: (id: string) => void;
}) {
  const experiment = experiments[index];
  if (experiment) return <GuidedExperiment label={`Experiment ${index + 1} of ${experiments.length}`} experiment={experiment}
    prediction={prediction} explanation={explanation} reached={prediction !== null && reached}
    complete={prediction !== null && reached && explanation === "0"}
    onPredict={onPredict} onExplain={onExplain} onNext={onNext}
    predictionName="bridge-prediction" explanationName="bridge-explanation"
    predictionHelp={<>Choosing a prediction restores this experiment&apos;s starting state. Reset restarts it.</>}
    observation={prediction === "0" ? "The evidence matches your prediction." : "The evidence challenges your prediction. Use the live values to investigate."}
    nextLabel={index === experiments.length - 1 ? "Try the transfer check" : "Next experiment"} />;
  if (index === experiments.length) return <ExperimentRail label="Transfer check" title={transfer.title}>
    <p>Try this different case without Guide help. {transfer.action}</p>
    {transferReached && <><h3>{transfer.question}</h3><ExperimentChoices legend="Transfer explanation" name="bridge-transfer"
      choices={transfer.choices} value={transferAnswer} onChange={onTransfer} />
      {transferAnswer !== null && (transferAnswer === "0"
        ? <><ExperimentResult title="Transfer explained">{transfer.takeaway}</ExperimentResult><ExperimentButton onClick={onNext}>Explore freely</ExperimentButton></>
        : <p role="status" className={styles.feedback}>Try again. {transfer.retry}</p>)}
    </>}
  </ExperimentRail>;
  return <ExperimentRail label="Free exploration" title="Test another case">
    <p>Change one setting, predict what will change, then explain the evidence. Use the exact tables when needed.</p>
    <ExperimentButton onClick={onRestart}>Restart experiments</ExperimentButton>
  </ExperimentRail>;
}
