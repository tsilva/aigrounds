"use client";

import { useMemo, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonAction, LessonRangeControl, LessonSummaries, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { analyzeBpe, formatMerge, formatPair, formatReduction, type PairCount, type TokenizedWord } from "./byte-pair-encoding-engine";
import { bpeScenarios, initialMergeSteps, maxMergeSteps, type BpeScenarioId } from "./scenario";
import { bpeDefaults, bpeExperiments, bpeToolbarScenarios, bpeTransferStart, bpeTransferTarget, type BpeState } from "./learning-experiments";
import styles from "./playground.module.css";

function Tokens({ tokens, learned }: { tokens: string[]; learned: string[] }) {
  return <div className={styles.tokens}>{tokens.map((token, i) => <span className={styles.token} data-learned={learned.includes(token)} key={`${i}-${token}`}>{token}</span>)}</div>;
}
function Words({ words, learned }: { words: TokenizedWord[]; learned: string[] }) {
  return <div className={styles.wordList}>{words.map((word, i) => <div className={styles.word} key={`${i}-${word.source}`}><strong>{word.source}</strong><Tokens tokens={word.tokens} learned={learned} /></div>)}</div>;
}
function Candidates({ candidates, label }: { candidates: PairCount[]; label: string }) {
  return <div className={styles.scroller} role="region" aria-label={label} tabIndex={0}><table><caption>Counts of adjacent symbol pairs across current training words, including repeated occurrences.</caption><thead><tr><th scope="col">Pair</th><th scope="col">Count</th><th scope="col">Frequency status</th></tr></thead><tbody>{candidates.map(candidate => <tr key={JSON.stringify(candidate.pair)}><th scope="row">{formatPair(candidate.pair)}</th><td>{candidate.count}</td><td>{candidate.isTop ? candidates.filter(c => c.isTop).length > 1 ? "Tied maximum" : "Unique maximum" : "Below maximum"}</td></tr>)}</tbody></table></div>;
}
const same = (a: BpeState, b: BpeState) => a.scenario === b.scenario && a.merges === b.merges;

export function BytePairEncodingPlayground() {
  const [state, setState] = useState<BpeState>(bpeDefaults);
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const scenario = bpeScenarios.find(s => s.id === state.scenario)!;
  const analysis = useMemo(() => analyzeBpe(scenario, state.merges), [scenario, state.merges]);
  const experiment = bpeExperiments[index], transfer = index === 3;
  const reached = !!experiment && !!prediction && same(state, experiment.target);
  const complete = reached && explanation === experiment?.correctExplanation;
  const transferReached = same(state, bpeTransferTarget);
  const last = analysis.activeMerges.at(-1);
  const learned = analysis.activeMerges.map(m => m.token);
  const highest = analysis.nextCandidates.filter(c => c.isTop);
  function clear() { setExplanation(null); setTransferAnswer(null); }
  function edit(next: BpeState) { setState(next); clear(); }
  function start(next = index) {
    setIndex(next); setState(bpeExperiments[next]?.baseline ?? bpeTransferStart);
    setPrediction(null); clear();
  }
  const rail = experiment ? <GuidedExperiment label={`Experiment ${index + 1} of 3`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="bpe-prediction" explanationName="bpe-explanation"
    onPredict={id => { start(); setPrediction(id); }} onExplain={setExplanation}
    predictionHelp={<>Choosing a different prediction restores this experiment’s corpus and merge count. Reset restarts it.</>} observation={prediction === experiment.correctPrediction ? "Your prediction matches the evidence." : "The training replacement and inspection counts challenge your prediction."}
    onNext={() => start(index + 1)} nextLabel={index === 2 ? "Try the transfer check" : "Next experiment"} /> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Apply rules to a new whole word" : "Follow any merge prefix"}>
    {transfer ? <><p>Names starts at 0 merges. Set Merge steps to 2, then open Compare original examples. Compare annabel with max. Why does only one become shorter?</p><ExperimentChoices legend="Transfer explanation" name="bpe-transfer" choices={[{ id: "rules", label: "annabel reuses a + n then an + n, giving ann a b e l </w> (6 tokens). max remains m a x </w> (4). The known alphabet supports both without retraining." }, { id: "learn", label: "Inspecting annabel trains a new whole-word rule, so the training text changes." }, { id: "meaning", label: "BPE understands which names have similar meanings and joins them." }]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (!transferReached ? <p className={sharedStyles.feedback} role="status">First keep Names selected and set Merge steps to 2. Reset restores the transfer starting state.</p> : transferAnswer !== "rules" ? <p className={sharedStyles.feedback} role="status">Try again. Use the ordered learned pairs and the actual token sequences; inspection does not retrain the rules.</p> : <><ExperimentResult title="Transfer explained">The unseen whole word annabel uses learned ann and known characters. It falls from 8 to 6 tokens; max stays at 4. Vocabulary is 30 symbols for both texts.</ExperimentResult><ExperimentButton onClick={() => setIndex(4)}>Explore freely</ExperimentButton></>)}</> : <><p>Keep the learned rules fixed and compare all original examples, or switch among the three corpora and their prefixes. Look for unchanged token counts, ties and pieces that are not meaningful words.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;

  return <LearningPage title="Byte Pair Encoding Lab" subtitle="Count neighbors. Learn a merge. Test another word." rail={rail}>
    <LessonToolbar label="Training corpora" scenarios={bpeToolbarScenarios} selectedId={state.scenario} onSelect={id => edit({ scenario: id as BpeScenarioId, merges: initialMergeSteps })} onReset={() => start(experiment || transfer ? index : 0)} />
    <p className={styles.context}>A token is one symbol or learned piece. This is character-based, within-word BPE. The fixed alphabet has a–z, = and {"</w>"}: 28 symbols, covering every example. {"</w>"} is one word-end symbol. Whitespace separates words and is not encoded. This is not a byte-level or production tokenizer.</p>
    <section className={sharedStyles.evidence} aria-label="Training text and merge controls"><h2>Your training text</h2><p>{scenario.description} Each repeated word occurrence contributes to frequency.</p><pre className={styles.corpus}>{scenario.trainingText}</pre>
      <LessonRangeControl label="Merge steps" value={state.merges} min={0} max={maxMergeSteps} step={1} onChange={merges => edit({ ...state, merges })} help="Select a prefix of the learned rules, from 0 through 8. Exact edits commit with Enter or on blur. Inspection text never trains new rules." />
      <div className={styles.actions}><LessonAction disabled={state.merges === 0} onClick={() => edit({ ...state, merges: state.merges - 1 })}>Previous merge</LessonAction><LessonAction disabled={state.merges === maxMergeSteps} onClick={() => edit({ ...state, merges: state.merges + 1 })}>Next merge</LessonAction></div>
    </section>
    <section className={sharedStyles.evidence} aria-label="Highest-frequency next pairs"><h2>Highest-frequency next pairs</h2><Candidates candidates={highest} label="Scrollable highest-frequency pairs" /><p>Ties use a fixed preset preference, then code-unit order as a fallback. Frequency alone does not pick a unique winner. These counts come from training, not the inspection words.</p>{state.merges === 8 && <p>The lab stops at 8 learned rules; these are candidates for further training outside this budget.</p>}</section>
    <section className={sharedStyles.evidence} aria-label="Last training replacement"><h2>Last training replacement</h2>{last ? <><p className={styles.selected}>Step {last.index}: {formatMerge(last)} · counted occurrences: {last.count}</p><p>Training tokens: {analysis.beforeLastTraining.count} → {analysis.afterTraining.count}. Replace non-overlapping matches left to right within every word. Adjacent frequency can include overlaps in general, so it need not equal the number of replacements.</p><div className={styles.scroller} role="region" aria-label="Scrollable training replacement" tabIndex={0}><table><caption>Training occurrences before and after the last applied rule. Earlier rules remain applied.</caption><thead><tr><th scope="col">Word occurrence</th><th scope="col">Before last merge</th><th scope="col">After last merge</th></tr></thead><tbody>{analysis.afterTraining.words.map((word, i) => <tr key={i}><th scope="row">{i + 1}. {word.source}</th><td><Tokens tokens={analysis.beforeLastTraining.words[i].tokens} learned={learned.slice(0, -1)} /></td><td><Tokens tokens={word.tokens} learned={learned} /></td></tr>)}</tbody></table></div></> : <p>No rule applied yet. Training words begin as characters plus one {"</w>"} each.</p>}</section>
    <section className={sharedStyles.evidence} aria-label="Current inspection"><h2>Inspection: {scenario.inspectionText}</h2><p>Apply the same ordered rules to these words. Learned pieces have a pale fill; each outlined piece counts as one token.</p><Words words={analysis.afterInspection.words} learned={learned} /></section>
    <LessonSummaries label="Token and vocabulary counts" summaries={[{ label: "Inspection tokens", value: String(analysis.afterInspection.count), color: "#5031dc", definition: "Number of current inspection pieces, including word-end symbols.", formula: `${analysis.afterInspection.words.map(w => w.tokens.length).join(" + ")} = ${analysis.afterInspection.count}`, comparison: `At 0 merges: ${analysis.beforeInspection.count}. ${formatReduction(analysis.tokenReduction)} fewer tokens.` }, { label: "Vocabulary symbols", value: String(analysis.vocabularySize), color: "#1760db", definition: "Fixed base symbols plus unique learned pieces; original symbols remain available.", formula: `28 + ${analysis.vocabularySize - 28} = ${analysis.vocabularySize}`, comparison: "Token count is not a measurement of bytes, memory use or semantic understanding." }]} />
    <section className={styles.optional} aria-label="Supporting BPE evidence">
      <details><summary>Compare original examples</summary><p>Apply the current rules without retraining. New whole words can still use known base characters; learned pieces need not have linguistic meaning.</p><div className={styles.scroller} role="region" aria-label="Scrollable example comparison" tabIndex={0}><table><caption>All original comparison strings, with exact before/after token counts including end symbols.</caption><thead><tr><th scope="col">Text</th><th scope="col">Current pieces</th><th scope="col">Tokens at 0 → now</th><th scope="col">Reduction</th></tr></thead><tbody>{analysis.compareAnalyses.map(entry => <tr key={entry.example.text}><th scope="row">{entry.example.text}</th><td><Tokens tokens={entry.after.tokens} learned={learned} /></td><td>{entry.before.count} → {entry.after.count}</td><td>{formatReduction(entry.reduction)}</td></tr>)}</tbody></table></div></details>
      <details><summary>All pair frequencies and learned rules</summary><Candidates candidates={analysis.nextCandidates} label="Scrollable all pair frequencies" /><p>Only already-applied rules appear below; future selections are not shown. Preset preferences break ties only among maximum-frequency pairs.</p><div className={styles.scroller} role="region" aria-label="Scrollable learned rules" tabIndex={0}><table><thead><tr><th scope="col">Step</th><th scope="col">Learned rule</th><th scope="col">Frequency before merge</th></tr></thead><tbody>{analysis.activeMerges.map(m => <tr key={m.index}><th scope="row">{m.index}</th><td>{formatMerge(m)}</td><td>{m.count}</td></tr>)}</tbody></table></div></details>
      <details><summary>Counts across merge prefixes</summary><p>Both quantities use counts, with no independent rescaling. For these preset corpora every rule adds a distinct vocabulary symbol, but some inspection counts stay unchanged.</p><div className={styles.scroller} role="region" aria-label="Scrollable prefix counts" tabIndex={0}><table><thead><tr><th scope="col">Merge prefix</th><th scope="col">Inspection tokens</th><th scope="col">Vocabulary symbols</th></tr></thead><tbody>{analysis.tradeoff.map(point => <tr key={point.mergeCount} aria-current={point.mergeCount === state.merges ? "step" : undefined}><th scope="row">{point.mergeCount}{point.mergeCount === state.merges ? " · Current" : ""}</th><td>{point.tokenCount}</td><td>{point.vocabularySize}</td></tr>)}</tbody></table></div></details>
    </section>
    <p className={styles.context}>The alphabet covers the listed lowercase examples and =; arbitrary Unicode or unknown characters are outside this lab. Fewer tokens do not guarantee a better model, smaller stored vocabulary or lower total memory cost.</p>
    <p role="status" aria-live="polite" aria-atomic="true" className={sharedStyles.liveUpdate}>{scenario.label}, {state.merges} merges. Inspection {analysis.afterInspection.count} tokens; vocabulary {analysis.vocabularySize} symbols. {last ? `Last rule ${formatMerge(last)}, count ${last.count}. Training tokens ${analysis.beforeLastTraining.count} to ${analysis.afterTraining.count}.` : "No rule applied."}</p>
  </LearningPage>;
}
