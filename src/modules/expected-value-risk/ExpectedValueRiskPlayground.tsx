"use client";

import { useMemo, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { analyzeBets, updateBet, type BetAnalysis, type BetId, type BetInput } from "./expected-value-risk-engine";
import { expectedValuePresets, roundOptions } from "./scenario";
import { payoffExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

function money(value: number) {
  return `${value < -1e-9 ? "−" : value > 1e-9 ? "+" : ""}$${Math.abs(value).toFixed(2)}`;
}
const percent = (value: number) => `${Number((value * 100).toFixed(1))}%`;
function sameBets(a: BetInput[], b: BetInput[]) {
  return a.length === b.length && a.every((bet, i) => bet.id === b[i].id && ["probability", "winAmount", "lossAmount"].every((key) => Math.abs(bet[key as "probability"] - b[i][key as "probability"]) < 1e-9));
}
const preset = (id: string) => expectedValuePresets.find((entry) => entry.id === id)!;

function BetEvidence({ bet, edit }: { bet: BetAnalysis; edit: (patch: Partial<Pick<BetInput, "probability" | "winAmount" | "lossAmount">>) => void }) {
  return <section aria-label={`${bet.label} parameters and outcomes`}>
    <h2>{bet.label}</h2>
    <LessonRangeControl label={`${bet.label} win probability`} unit="%" value={Number((bet.probability * 100).toFixed(10))} min={5} max={95} step={1} help="Chance of the positive payoff on each round." onChange={(value) => edit({ probability: value / 100 })} />
    <LessonRangeControl label={`${bet.label} win amount`} unit="$" value={bet.winAmount} min={5} max={240} step={1} help="Net positive payoff on a winning round." onChange={(winAmount) => edit({ winAmount })} />
    <LessonRangeControl label={`${bet.label} loss amount`} unit="$" value={bet.lossAmount} min={-180} max={-5} step={1} help="Net negative payoff on a losing round." onChange={(lossAmount) => edit({ lossAmount })} />
    <h3>Two outcomes, one round</h3>
    <div className={styles.probabilityBar} role="img" aria-label={`${bet.label}: ${percent(bet.probability)} chance of ${money(bet.winAmount)}, ${percent(1 - bet.probability)} chance of ${money(bet.lossAmount)}`}>
      <span data-outcome="win" style={{ width: `${bet.probability * 100}%` }} /><span data-outcome="loss" style={{ width: `${(1 - bet.probability) * 100}%` }} />
    </div>
    <p className={styles.outcomeLabels}>Win: {percent(bet.probability)}, {money(bet.winAmount)}<br />Loss: {percent(1 - bet.probability)}, {money(bet.lossAmount)}</p>
    <p className={styles.arithmetic}>EV = {bet.probability.toFixed(2)} × {money(bet.winAmount)} + {(1 - bet.probability).toFixed(2)} × ({money(bet.lossAmount)})<br /><strong>{money(bet.probability * bet.winAmount)} + ({money((1 - bet.probability) * bet.lossAmount)}) = {money(bet.expectedValue)}</strong></p>
  </section>;
}

function SampleEvidence({ bet, domain }: { bet: BetAnalysis; domain: { min: number; max: number } }) {
  const x = (round: number) => 50 + (round - 1) / Math.max(1, bet.outcomes.length - 1) * 390;
  const y = (value: number) => 20 + (domain.max - value) / (domain.max - domain.min) * 130;
  return <figure className={styles.sample} aria-label={`${bet.label} sample`}>
    <figcaption><strong>{bet.label}</strong> · {bet.wins} wins, {bet.losses} losses<br />Sample average: {money(bet.simulatedAverage)} · total: {money(bet.simulatedTotal)}</figcaption>
    <svg viewBox="0 0 460 190" role="img" aria-label={`${bet.label} running average across ${bet.outcomes.length} rounds. Solid sample line; dotted EV ${money(bet.expectedValue)}. Final sample average ${money(bet.simulatedAverage)}.`}>
      <line x1={50} x2={440} y1={150} y2={150} className={styles.axis} /><line x1={50} x2={50} y1={20} y2={150} className={styles.axis} />
      <text x={43} y={24} textAnchor="end">{domain.max}</text><text x={43} y={154} textAnchor="end">{domain.min}</text><text x={50} y={174}>1</text><text x={440} y={174} textAnchor="end">{bet.outcomes.length} rounds</text>
      <line x1={50} x2={440} y1={y(bet.expectedValue)} y2={y(bet.expectedValue)} className={styles.expectedLine} />
      <polyline points={bet.outcomes.map((outcome) => `${x(outcome.round)},${y(outcome.runningAverage)}`).join(" ")} className={styles.sampleLine} />
    </svg>
    <p>Solid: sample average. Dotted: model EV {money(bet.expectedValue)}. Vertical axis: average payoff in dollars; both charts use the same scale.</p>
    <details><summary>{bet.label} round-by-round values</summary><div className={styles.roundTable} tabIndex={0} role="region" aria-label={`${bet.label} scrollable round values`}><table><caption>Every outcome and its running average; displayed dollars rounded to cents.</caption><thead><tr><th scope="col">Round</th><th scope="col">Outcome</th><th scope="col">Payoff ($)</th><th scope="col">Average ($)</th></tr></thead><tbody>{bet.outcomes.map((outcome) => <tr key={outcome.id}><th scope="row">{outcome.round}</th><td>{outcome.isWin ? "Win" : "Loss"}</td><td>{money(outcome.value)}</td><td>{money(outcome.runningAverage)}</td></tr>)}</tbody></table></div></details>
  </figure>;
}

export function ExpectedValueRiskPlayground() {
  const [bets, setBets] = useState<BetInput[]>(preset("steady").bets);
  const [rounds, setRounds] = useState(60);
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const analysis = useMemo(() => analyzeBets(bets, rounds), [bets, rounds]);
  const experiment = payoffExperiments[index];
  const transfer = index === payoffExperiments.length;
  let target = experiment ? preset(experiment.targetPreset).bets : [];
  if (experiment?.targetWin !== undefined) target = updateBet(target, "risky", { winAmount: experiment.targetWin });
  if (experiment?.targetProbability !== undefined) target = updateBet(target, "risky", { probability: experiment.targetProbability });
  const reached = !!prediction && !!experiment && sameBets(bets, target) && rounds === experiment.rounds;
  const complete = reached && explanation === experiment?.correctExplanation;
  const transferReached = sameBets(bets, updateBet(preset("trap").bets, "risky", { probability: 0.2 }));
  function clearAnswers() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) {
    setIndex(next); setBets(preset(payoffExperiments[next]?.baseline ?? "steady").bets); setRounds(60); setPrediction(null); clearAnswers();
  }
  function choosePreset(id: string) { setBets(preset(id).bets); clearAnswers(); }
  function edit(id: BetId, patch: Partial<Pick<BetInput, "probability" | "winAmount" | "lossAmount">>) { setBets((current) => updateBet(current, id, patch)); clearAnswers(); }
  const rail = experiment ? <GuidedExperiment label={`Experiment ${index + 1} of 4`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="payoff-prediction" explanationName="payoff-explanation"
    onPredict={(id) => { start(); setPrediction(id); }} onExplain={setExplanation}
    predictionHelp={<>Choosing a prediction restores {experiment.baseline === "trap" ? "Bad Long Shot" : "Steady vs Swingy"} and 60 rounds.</>} observation={prediction === experiment.correctPrediction ? "Your prediction matches the evidence." : "The evidence challenges your prediction. Compare the weighted payoffs and sample."}
    action={<div className={sharedStyles.actionPrompt}><p><strong>Now try it.</strong> {experiment.action}</p><p className={sharedStyles.small}>Keep the other parameters at their starting values. Reset starts this experiment again.</p></div>}
    onNext={() => start(index + 1)} nextLabel={index === 3 ? "Try the transfer check" : "Next experiment"} /> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "A positive average, mostly losses" : "Explore your own pair of bets"}>
    {transfer ? <><p>Choose Bad Long Shot. Set Bet B win probability (%) to 20, leaving its win amount at 210 and loss amount at −36. What does its positive EV say about one round?</p><ExperimentChoices legend="Transfer explanation" name="payoff-transfer" choices={[{ id: "weighted", label: "EV is +$13.20 per round in the model, but any round still has an 80% loss chance." }, { id: "next", label: "The next round is guaranteed to earn $13.20." }, { id: "most", label: "A positive EV means more wins than losses." }]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (!transferReached ? <p role="status" className={sharedStyles.feedback}>First choose Bad Long Shot and set Bet B’s win probability to 20, leaving all other values at that preset.</p> : transferAnswer !== "weighted" ? <p role="status" className={sharedStyles.feedback}>Try again. Weight the $210 and −$36 payoffs by 20% and 80%. Neither possible outcome is $13.20.</p> : <><ExperimentResult title="Transfer explained">0.20 × 210 + 0.80 × (−36) = +13.20. That long-run average is between the two possible payoffs; it is not a possible payoff on a single round.</ExperimentResult><ExperimentButton onClick={() => setIndex(5)}>Explore freely</ExperimentButton></>)}</> : <><p>Try all presets, all six parameters and 24, 60 or 120 rounds. Compare the weighted payoff with spread and loss chance. Neither the larger prize nor higher EV alone decides which uncertain choice suits a person.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  const [a, b] = analysis.bets;
  const selectedPreset = expectedValuePresets.find((entry) => sameBets(bets, entry.bets))?.id ?? "";
  const evComparison = Math.abs(a.expectedValue - b.expectedValue) < 1e-9 ? "Both bets have equal EV." : `${a.expectedValue > b.expectedValue ? "Bet A" : "Bet B"} has the higher EV.`;
  const sdComparison = Math.abs(a.standardDeviation - b.standardDeviation) < 1e-9 ? "Both bets have equal SD." : `${a.standardDeviation < b.standardDeviation ? "Bet A" : "Bet B"} has the smaller per-round SD.`;
  return <LearningPage title="Expected Value & Risk" subtitle="Weight each payoff, then compare the average with the spread." rail={rail}>
    <LessonToolbar label="Bet presets" scenarios={expectedValuePresets.map((entry) => ({ ...entry, shortLabel: entry.description }))} selectedId={selectedPreset} onSelect={choosePreset} onReset={() => start(experiment || transfer ? index : 0)} />
    <p className={styles.intro}>Two fictional bets with net payoffs. A random variable is the numerical payoff of one uncertain round. Change a probability or payoff to see its contribution to the average.</p>
    <div className={styles.bets}>{analysis.bets.map((bet) => <BetEvidence key={bet.id} bet={bet} edit={(patch) => edit(bet.id, patch)} />)}</div>
    <section className={styles.comparison} aria-label="Compare average and spread"><h2>Compare the bets</h2><div className={styles.comparisonTable} tabIndex={0} role="region" aria-label="Scrollable bet comparison"><table><caption>Model values for one round; SD and break-even percentages are rounded.</caption><thead><tr><th scope="col">Bet</th><th scope="col">EV ($)</th><th scope="col">SD ($)</th><th scope="col">Loss chance</th><th scope="col">Break-even p</th></tr></thead><tbody>{analysis.bets.map((bet) => <tr key={bet.id}><th scope="row">{bet.label}</th><td>{money(bet.expectedValue)}</td><td>≈ {bet.standardDeviation.toFixed(2)}</td><td>{percent(1 - bet.probability)}</td><td>{bet.breakEvenProbability === null ? "Undefined" : `≈ ${percent(bet.breakEvenProbability)}`}</td></tr>)}</tbody></table></div><p className={styles.scrollHelp}>Scroll the comparison table horizontally to see all columns.</p><p>Standard deviation (SD) measures the spread of one round, in dollars. Loss chance measures how often the negative payoff occurs. Break-even p is the win probability making EV zero.</p><p>{evComparison} {sdComparison} SD is one aspect of risk, not a complete decision rule.</p><details><summary>How spread and break-even are calculated</summary><p>Variance = p × (win − EV)² + (1 − p) × (loss − EV)², in dollars squared. SD = √variance, in dollars. Break-even p = −loss / (win − loss), found by setting EV to zero.</p></details></section>
    <LessonSummaries label="Probability-weighted averages" summaries={analysis.bets.map((bet) => ({ label: `${bet.label} EV`, color: "#5031dc", value: money(bet.expectedValue), definition: "Model average payoff per round.", formula: "p × win + (1 − p) × loss", comparison: "Neither payoff needs to equal the average." }))} />
    <section className={styles.simulation} aria-label="Finite repeatable samples"><h2>Running average</h2><p>Each bet has a seeded pseudorandom sample illustrating independent rounds with unchanged probabilities. Longer runs extend the same outcome sequence. Payoff edits keep wins and losses fixed; probability edits change which draws count as wins.</p><LessonToggleGroup label="Sample length" choices={roundOptions.map((value) => ({ id: String(value), label: `${value} rounds` }))} value={String(rounds)} onChange={(value) => { setRounds(Number(value)); clearAnswers(); }} /><div className={styles.samples}>{analysis.bets.map((bet) => <SampleEvidence key={bet.id} bet={bet} domain={analysis.domain} />)}</div><p>Under independent fixed-probability repeats, the sample average approaches EV in the long run. A finite run need not match it exactly, and adding rounds need not move closer every time.</p></section>
    <p role="status" aria-live="polite" aria-atomic="true" className={sharedStyles.liveUpdate}>{analysis.bets.map((bet) => `${bet.label}: win ${percent(bet.probability)}, EV ${money(bet.expectedValue)}, SD about ${bet.standardDeviation.toFixed(2)} dollars, ${rounds}-round sample average ${money(bet.simulatedAverage)}`).join(". ")}.</p>
  </LearningPage>;
}
