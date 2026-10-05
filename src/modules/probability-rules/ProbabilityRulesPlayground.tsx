"use client";

import { useMemo, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonAction, LessonSelect, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { advanceSimulation, analyzeProbabilityRule, type EventRuleId, type RuleView, type SimulationState } from "./probability-rules-engine";
import { eventAOptions, eventBOptions } from "./scenario";
import { ruleExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

const initialSimulation: SimulationState = { seed: 1309, rolls: 0, hits: 0 };
const views: { id: RuleView; label: string }[] = [{ id: "a", label: "A" }, { id: "not-a", label: "Not A" }, { id: "intersection", label: "Both" }, { id: "union", label: "Either" }, { id: "a-only", label: "A only" }, { id: "b-only", label: "B only" }];
const dice = [1, 2, 3, 4, 5, 6];
const membershipLabel = (inA: boolean, inB: boolean) => inA && inB ? "A+B" : inA ? "A" : inB ? "B" : "—";

export function ProbabilityRulesPlayground() {
  const [eventA, setEventA] = useState<EventRuleId>("sum-seven");
  const [eventB, setEventB] = useState<EventRuleId>("first-even");
  const [view, setView] = useState<RuleView>("a");
  const [simulation, setSimulation] = useState(initialSimulation);
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const analysis = useMemo(() => analyzeProbabilityRule(eventA, eventB, view), [eventA, eventB, view]);
  const experiment = ruleExperiments[index];
  const transfer = index === ruleExperiments.length;
  const reached = !!prediction && eventA === "sum-seven" && eventB === "first-even" && view === experiment?.target && simulation.rolls >= (experiment.rolls ?? 0);
  const complete = reached && explanation === experiment?.correctExplanation;
  const transferReached = eventA === "doubles" && eventB === "at-least-one-six" && view === "a-only";
  function clearAnswers() { setExplanation(null); setTransferAnswer(null); }
  function start(nextIndex = index) {
    setIndex(nextIndex); setEventA("sum-seven"); setEventB("first-even");
    setView(ruleExperiments[nextIndex]?.start ?? "union"); setSimulation(initialSimulation);
    setPrediction(null); clearAnswers();
  }
  function chooseView(id: string) { setView(id as RuleView); setSimulation(initialSimulation); clearAnswers(); }
  function roll(count: number) { setSimulation((state) => advanceSimulation(state, eventA, eventB, view, count)); clearAnswers(); }
  const rail = experiment ? <GuidedExperiment label={`Experiment ${index + 1} of ${ruleExperiments.length}`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="rule-prediction" explanationName="rule-explanation"
    onPredict={(id) => { start(index); setPrediction(id); }} onExplain={setExplanation}
    predictionHelp={<>Choosing a prediction restores this experiment’s events, rule and empty sample.</>} observation={prediction === experiment.correctPrediction ? "Your prediction matches the model." : "The evidence challenges your prediction. Compare the grid, formula and sample."}
    action={<div className={sharedStyles.actionPrompt}><p><strong>Now try it.</strong> {experiment.action}</p><p className={sharedStyles.small}>Use Event A = Sum is 7 and Event B = First die even. Reset starts again.</p></div>}
    onNext={() => start(index + 1)} nextLabel={index === 3 ? "Try the transfer check" : "Next experiment"} /> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Apply a rule to new events" : "Explore the sample space"}>
    {transfer ? <><p>Choose Event A = Doubles, Event B = At least one 6, and A only. What fraction is selected, and why?</p><ExperimentChoices legend="Transfer explanation" name="rule-transfer" choices={[{ id: "five", label: "5/36: remove (6,6) from the six doubles." }, { id: "six", label: "6/36: A only keeps every double." }, { id: "one", label: "1/36: A only means both events." }]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (!transferReached ? <p className={sharedStyles.feedback}>First set the three named controls and inspect the selected region.</p> : transferAnswer !== "five" ? <p className={sharedStyles.feedback}>Try again. A only keeps A outcomes that are outside B. Is (6,6) outside B?</p> : <><ExperimentResult title="Transfer explained">Exactly five doubles remain. The same set rule works for a different pair of events; its count depends on the overlap.</ExperimentResult><ExperimentButton onClick={() => setIndex(5)}>Explore freely</ExperimentButton></>)}</> : <><p>Try all event pairs and rules. Count the selected region before simulating it.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  const selectedLabel = views.find((item) => item.id === view)!.label;
  return <LearningPage title="Probability Rules" subtitle="Select outcomes. Count what belongs to each event." rail={rail}>
    <LessonToolbar label="Experiment starting points" scenarios={ruleExperiments} selectedId={experiment?.id ?? ""} onSelect={(id) => start(ruleExperiments.findIndex((item) => item.id === id))} onReset={() => start()} />
    <div className={sharedStyles.controlGrid}>
      <LessonSelect label="Event A" choices={eventAOptions} value={eventA} onChange={(id) => { setEventA(id as EventRuleId); setSimulation(initialSimulation); clearAnswers(); }} />
      <LessonSelect label="Event B" choices={eventBOptions} value={eventB} onChange={(id) => { setEventB(id as EventRuleId); setSimulation(initialSimulation); clearAnswers(); }} />
    </div>
    <LessonToggleGroup label="Rule" choices={views} value={view} onChange={chooseView} />
    <section className={sharedStyles.evidence} aria-label="Dice sample space">
      <h2>Your sample space</h2><p>Two fair, independent dice give 36 equally likely ordered outcomes. A+B means both events; — means neither. ✓ marks outcomes counted by {selectedLabel}.</p>
      <table className={styles.space}><caption>First die = row; second die = column. Each cell is one possible ordered pair.</caption>
        <thead><tr><th scope="col">1st / 2nd</th>{dice.map((die) => <th scope="col" key={die}>{die}</th>)}</tr></thead>
        <tbody>{dice.map((first) => <tr key={first}><th scope="row">{first}</th>{analysis.memberships.filter((item) => item.outcome.first === first).map((item) => <td key={item.outcome.id} data-selected={item.inView} aria-label={`First die ${first}, second die ${item.outcome.second}; ${membershipLabel(item.inA, item.inB) === "—" ? "neither event" : membershipLabel(item.inA, item.inB)}; ${item.inView ? "selected" : "not selected"}`}><span>({first},{item.outcome.second})</span><strong>{membershipLabel(item.inA, item.inB)}</strong>{item.inView && <span className={styles.check} aria-hidden="true">✓</span>}</td>)}</tr>)}</tbody>
      </table>
    </section>
    <section className={styles.construction} aria-label="Build the probability"><h2>Count the selected region</h2><p>{analysis.formula}</p><p>{analysis.expandedFormula}</p><p>{analysis.takeaway}</p></section>
    <LessonSummaries label="Exact event probabilities" summaries={[
      { label: "A", color: "#1760db", value: `${analysis.counts.a}/36`, definition: "Outcomes in event A.", formula: eventAOptions.find((item) => item.id === eventA)!.label },
      { label: "B", color: "#22715d", value: `${analysis.counts.b}/36`, definition: "Outcomes in event B.", formula: eventBOptions.find((item) => item.id === eventB)!.label },
      { label: "Both", color: "#976000", value: `${analysis.counts.intersection}/36`, definition: "The overlapping outcomes.", formula: "A ∩ B" },
      { label: "Selected", color: "#5031dc", value: `${analysis.counts.view}/36`, definition: "Outcomes counted by this rule.", formula: `${selectedLabel}: ≈ ${analysis.decimal}` },
    ]} />
    <section className={styles.simulation} aria-label="Simulated rolls"><h2>Compare exact and observed</h2><p>Each simulated roll samples one ordered pair. Changing events or the rule starts a new sample; Clear rolls also resets the sample.</p>
      <div className={styles.actions}><LessonAction onClick={() => roll(100)}>Roll 100</LessonAction><LessonAction onClick={() => roll(1000)}>Roll 1000</LessonAction><LessonAction onClick={() => { setSimulation(initialSimulation); clearAnswers(); }}>Clear rolls</LessonAction></div>
      <p className={styles.observed}>{simulation.rolls ? `Observed: ${simulation.hits} / ${simulation.rolls} ≈ ${(simulation.hits / simulation.rolls).toFixed(3)}` : "No rolls yet"}</p>
      <p>Exact: {analysis.counts.view} / 36 ≈ {analysis.decimal}. Larger samples reduce sampling noise on average, but need not get closer at every step. Rolls use a repeatable pseudorandom stream, not physical dice.</p>
    </section>
    <p className={sharedStyles.liveUpdate} role="status" aria-live="polite" aria-atomic="true">{selectedLabel} selects {analysis.counts.view} of 36 outcomes. {simulation.rolls} simulated rolls; {simulation.hits} hits.</p>
  </LearningPage>;
}
