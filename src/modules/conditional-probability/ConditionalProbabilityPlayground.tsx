"use client";

import { useMemo, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { analyzeConditionalProbability, filterLabels, type FilterView, type ScenarioId } from "./conditional-probability-engine";
import { conditionalScenarios } from "./scenario";
import { conditionalExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

const views: FilterView[] = ["all", "a", "b", "intersection", "b-given-a"];
const scenarios = ["dependent", "independent", "base-rate"].map((id) => {
  const scenario = conditionalScenarios.find((entry) => entry.id === id)!;
  return { ...scenario, label: scenario.title };
});
function percentage(value: number, unit = "%") {
  const scaled = value * 100;
  const rounded = Math.round(scaled * 10) / 10;
  return `${Math.abs(scaled - rounded) > 1e-9 ? "≈ " : ""}${rounded}${unit}`;
}

export function ConditionalProbabilityPlayground() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("dependent");
  const [view, setView] = useState<FilterView>("intersection");
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const analysis = useMemo(() => analyzeConditionalProbability(scenarioId, view), [scenarioId, view]);
  const scenario = conditionalScenarios.find((entry) => entry.id === scenarioId)!;
  const experiment = conditionalExperiments[index];
  const reached = !!prediction && scenarioId === experiment?.scenario && view === "b-given-a";
  const complete = reached && explanation === experiment?.correctExplanation;
  const transfer = index === conditionalExperiments.length;
  function clearAnswers() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) {
    const step = conditionalExperiments[next];
    setIndex(next); setScenarioId(step?.scenario ?? "dependent"); setView(step?.start ?? "all");
    setPrediction(null); clearAnswers();
  }
  const counts = analysis.counts;
  const cells = [
    { inA: true, inB: true, count: counts.intersection },
    { inA: true, inB: false, count: counts.a - counts.intersection },
    { inA: false, inB: true, count: counts.b - counts.intersection },
    { inA: false, inB: false, count: counts.total - counts.a - counts.b + counts.intersection },
  ];
  function selected(inA: boolean, inB: boolean) {
    return view === "all" || (view === "a" ? inA : view === "b" ? inB : inA && inB);
  }
  function denominator(inA: boolean) { return view !== "b-given-a" || inA; }
  const rail = experiment ? <GuidedExperiment label={`Experiment ${index + 1} of 3`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="conditional-prediction" explanationName="conditional-explanation"
    onPredict={(id) => { start(); setPrediction(id); }} onExplain={setExplanation}
    predictionHelp={<>Choosing a prediction restores this experiment’s scenario and starting view.</>} observation={prediction === experiment.correctPrediction ? "Your prediction matches the evidence." : "The evidence challenges your prediction. Compare the counts and reference groups."}
    action={<div className={sharedStyles.actionPrompt}><p><strong>Now try it.</strong> {experiment.action}</p><p className={sharedStyles.small}>Use {conditionalScenarios.find((entry) => entry.id === experiment.scenario)!.title}. Reset starts this experiment again.</p></div>}
    onNext={() => start(index + 1)} nextLabel={index === 2 ? "Try the transfer check" : "Next experiment"} /> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Choose the other reference group" : "Explore all five views"}>
    {transfer ? <><p>Choose Dependent and B. Now use the table to find the probability of B among people outside A. Which fraction uses that reference group?</p><ExperimentChoices legend="Transfer explanation" name="conditional-transfer" choices={[{ id: "outside", label: "8/60: the 8 B people outside A, out of all 60 outside A." }, { id: "whole", label: "8/100: outside A still means everyone." }, { id: "reverse", label: "8/30: divide by all B people." }]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (scenarioId !== "dependent" || view !== "b" ? <p role="status" className={sharedStyles.feedback}>First select Dependent and B, then inspect the Outside A row.</p> : transferAnswer !== "outside" ? <p role="status" className={sharedStyles.feedback}>Try again. Outside A contains 8 B people and 52 people outside B. Which total is eligible?</p> : <><ExperimentResult title="Transfer explained">Conditioning on outside A gives 8/(8 + 52) = 8/60 ≈ 13.3%. Name the eligible group before choosing the denominator.</ExperimentResult><ExperimentButton onClick={() => setIndex(4)}>Explore freely</ExperimentButton></>)}</> : <><p>Compare every scenario and view. Use the table and optional person grid to explain which groups enter each fraction.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  return <LearningPage title="Conditional Probability" subtitle="Keep the overlap. Change who counts." rail={rail}>
    <LessonToolbar scenarios={scenarios} selectedId={scenarioId} onSelect={(id) => { setScenarioId(id as ScenarioId); clearAnswers(); }} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={styles.facts} aria-label="Event definitions"><p>{scenario.eventA}</p><p>{scenario.eventB}</p><p>Choose one of the 100 fictional people at random. Each person is equally likely; changing views never changes their facts.</p></section>
    <LessonToggleGroup label="View" choices={views.map((id) => ({ id, label: filterLabels[id] }))} value={view} onChange={(id) => { setView(id as FilterView); clearAnswers(); }} />
    <section className={styles.population} aria-label="Population counts"><h2>Your population</h2><p>✓ marks groups counted in the numerator. Outlined groups are eligible for the denominator; excluded groups say Outside denominator.</p>
      <table className={styles.counts}><caption>100 people, partitioned by their two facts. Row and column labels define each group.</caption><thead><tr><th scope="col">Group</th><th scope="col">B</th><th scope="col">Outside B</th><th scope="col">Total</th></tr></thead><tbody>{[true, false].map((inA) => <tr key={String(inA)}><th scope="row">{inA ? "A" : "Outside A"}</th>{cells.filter((cell) => cell.inA === inA).map((cell) => <td key={String(cell.inB)} data-numerator={selected(cell.inA, cell.inB)} data-denominator={denominator(cell.inA)}><strong>{cell.count}</strong><span>{selected(cell.inA, cell.inB) ? "✓ Counted" : denominator(cell.inA) ? "Eligible" : "Outside denominator"}</span></td>)}<td>{inA ? counts.a : counts.total - counts.a}</td></tr>)}</tbody><tfoot><tr><th scope="row">Total</th><td>{counts.b}</td><td>{counts.total - counts.b}</td><td>{counts.total}</td></tr></tfoot></table>
      <p className={styles.selected}>Selected: {filterLabels[view]} = {counts.numerator}/{counts.denominator}; {percentage(analysis.filterProbability)}</p>
      <p>{view === "b-given-a" ? `The denominator is the ${counts.a} people in A; the numerator is the ${counts.intersection} people in both A and B.` : `The denominator is all ${counts.total} people. The selected view counts ${counts.numerator} of them.`}</p>
      <details><summary>Show all 100 people</summary><p>A+B means both facts; — means neither. ✓ means counted; × means outside the denominator. Person numbers identify fixed people, not a time sequence.</p><ol className={styles.people} aria-label="100 person memberships">{analysis.members.map((member) => <li key={member.id} data-numerator={member.isInNumerator} data-denominator={member.isInDenominator} aria-label={`Person ${member.index + 1}; ${member.inA ? "in A" : "outside A"}; ${member.inB ? "in B" : "outside B"}; ${member.isInDenominator ? "eligible denominator" : "outside denominator"}; ${member.isInNumerator ? "counted numerator" : "not counted"}`}><small>{member.index + 1}</small><strong>{member.inA && member.inB ? "A+B" : member.inA ? "A" : member.inB ? "B" : "—"}</strong><span>{member.isInNumerator ? "✓" : member.isInDenominator ? "·" : "×"}</span></li>)}</ol></details>
    </section>
    <LessonSummaries label="Compare three probabilities" summaries={[
      { label: "P(B)", color: "#22715d", value: `${counts.b}/${counts.total}`, definition: "Marginal: B out of everyone.", formula: percentage(analysis.probabilities.pB) },
      { label: "P(B given A)", color: "#5031dc", value: view === "b-given-a" ? `${counts.intersection}/${counts.a}` : "—", definition: "Conditional: B only inside A.", formula: view === "b-given-a" ? percentage(analysis.probabilities.pBGivenA) : "Choose B given A to compare." },
      { label: "P(A ∩ B)", color: "#976000", value: `${counts.intersection}/${counts.total}`, definition: "Joint: both facts out of everyone.", formula: percentage(analysis.probabilities.pAAndB) },
    ]} />
    <section className={styles.comparison} aria-label="Check independence"><h2>Does knowing A change the rate of B?</h2>{view === "b-given-a" ? <><p>{analysis.isIndependent ? "Independent: P(B given A) = P(B)." : "Dependent: P(B given A) ≠ P(B)."} {scenario.intuition}</p>{[{ label: "B out of everyone", value: analysis.probabilities.pB }, { label: "B inside A", value: analysis.probabilities.pBGivenA }].map((bar) => <div key={bar.label} className={styles.barRow}><span>{bar.label}: {percentage(bar.value)}</span><div className={styles.track} aria-hidden="true"><div style={{ width: `${bar.value * 100}%` }} /></div></div>)}<p>Change: {percentage(analysis.independenceDelta, " percentage points")}.</p></> : <p>Predict first, then choose B given A to compare the two rates.</p>}<p>These fixed populations show association; they do not establish cause and effect.</p></section>
    <p role="status" aria-live="polite" aria-atomic="true" className={sharedStyles.liveUpdate}>{scenario.title}; {filterLabels[view]} counts {counts.numerator} out of {counts.denominator}. {view === "b-given-a" ? analysis.isIndependent ? "Independent events." : "Dependent events." : ""}</p>
  </LearningPage>;
}
