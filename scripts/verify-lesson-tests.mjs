import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(path, globals = {}) {
  const exports = {};
  const output = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(output, { exports, ...globals }, { filename: path });
  return exports;
}
const engine = load("src/lib/lesson-test.ts");
const { meanMedianModeTestBank: bank } = load("src/modules/mean-median-mode/test-bank.ts");
let checks = 0;
function equal(actual, expected, message) {
  const plain = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  assert.deepEqual(plain(actual), plain(expected), message); checks++;
}
function ok(value, message) { assert.ok(value, message); checks++; }
const question = id => bank.questions.find(q => q.id === id);
const solution = q => q.type === "multiple" ? [...q.correct] : q.type === "text" ? q.correct[0] : String(q.correct);
const average = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
const median = xs => { const v = [...xs].sort((a, b) => a - b); return (v[Math.floor((v.length - 1) / 2)] + v[Math.floor(v.length / 2)]) / 2; };
const modes = xs => { const counts = xs.map(v => [v, xs.filter(x => x === v).length]); const max = Math.max(...counts.map(([, n]) => n)); return [...new Set(counts.filter(([, n]) => n === max && max > 1).map(([v]) => v))]; };

equal(bank.questions.length, 48, "48 authored items");
equal(new Set(bank.questions.map(q => q.id)).size, 48, "unique question IDs");
for (const o of bank.objectives) for (const level of ["foundation", "application"]) {
  equal(bank.questions.filter(q => q.objective === o.id && q.level === level).length, 8, `${o.id} ${level} reservoir`);
}
for (const q of bank.questions) {
  ok(q.prompt && q.explanation && q.family && q.objective, `${q.id} has teaching metadata`);
  ok(engine.isTestAnswerCorrect(q, solution(q)), `${q.id} accepts authored correct answer`);
  equal(engine.isTestAnswerCorrect(q, undefined), false, `${q.id} rejects missing answer`);
  if (q.datasets) {
    const presented = q.datasets.map(row => row.values.map(String));
    const authored = q.context.split("\n").map(row => row.replace(/^[A-Za-z]+:\s*/, "").replaceAll("−", "-").split(/,\s*/));
    equal(presented, authored, `${q.id} visual data preserves every authored value and its order`);
    for (const row of q.datasets) ok(row.emphasized?.every(i => Number.isInteger(i) && i >= 0 && i < row.values.length) ?? true, `${q.id} valid emphasized values`);
  }
  if (q.type === "choice" || q.type === "multiple") {
    equal(new Set(q.options.map(o => o.id)).size, q.options.length, `${q.id} unique options`);
    const correct = q.type === "choice" ? [q.correct] : q.correct;
    ok(correct.every(id => q.options.some(o => o.id === id)), `${q.id} correct choices exist`);
    ok(q.options.some(o => !correct.includes(o.id)), `${q.id} includes a distractor`);
  }
}

// Independent arithmetic/counting oracles for every authored numeric response.
const numeric = {
  "mean-01": average([2, 4, 6]), "mean-03": 6 * 3 - 2 - 4,
  "mean-05": average([10, 10, 20, 20]), "mean-06": 56 / 7,
  "mean-08": 12 * 5, "mean-10": (20 - 8) / 4, "mean-12": 8 * 3 - 3 - 6,
  "mean-14": average([1, 3, 5, 7, 9]),
  "median-01": median([9, 2, 5, 1, 7]), "median-03": median([2, 4, 8, 10]),
  "median-05": median([-8, -1, 2, 4, 9]), "median-07": median([10, 12, 20, 22]),
  "median-09": median([1, 3, 5, 7, 99]), "median-10": median([18, 2, 11, 7, 4]),
  "median-11": 8, "median-12": median([2, 4, 6, 8]),
  "median-14": median([1, 2, 10, 4, 5]), "median-16": median([1, 2, 3, 1000]),
  "mode-01": modes([1, 2, 2, 3, 4])[0], "mode-06": [5, 5, 5, 8, 8].filter(v => v === 5).length,
  "mode-08": modes([7, 3, 7, 2, 3, 7])[0], "mode-09": modes([1, 1, 2, 3, 3, 3])[0],
  "mode-10": modes([2, 2, 5, 5, 2])[0], "mode-11": modes([2, 2, 3, 4, 99])[0], "mode-14": 3,
};
for (const q of bank.questions.filter(q => q.type === "number" || q.type === "slider")) {
  equal(q.correct, numeric[q.id], `${q.id} independent numeric answer`);
}
// Exhaust the bounded slider domains: no ambiguous extra passing positions.
for (const q of bank.questions.filter(q => q.type === "slider")) {
  let accepted = [];
  for (let v = q.min; v <= q.max; v += q.step) if (engine.isTestAnswerCorrect(q, String(v))) accepted.push(v);
  equal(accepted, [numeric[q.id]], `${q.id} has exactly one accepted slider position`);
  if (q.id === "median-11") equal(Array.from({ length: 21 }, (_, i) => i).filter(x => median([2, 4, x, 10, 12]) === 8), accepted, "median target is mathematically unique");
  if (q.id === "mode-14") equal(Array.from({ length: 9 }, (_, i) => i).filter(x => JSON.stringify(modes([1, 2, 2, 3, x]).sort()) === "[2,3]"), accepted, "mode target is mathematically unique");
}
equal(engine.isTestAnswerCorrect(question("median-16"), "2,5"), true, "decimal comma");
equal(engine.isTestAnswerCorrect(question("median-02"), "  MeDiAn.  "), true, "text normalization");
for (const blank of ["", " ", "0x4", "Infinity", "4junk"]) equal(engine.isTestAnswerComplete(question("mean-01"), blank), false, `reject malformed numeric ${blank}`);
equal(engine.isTestAnswerCorrect(question("mode-03"), ["0"]), false, "incomplete multiple-select fails");
equal(engine.isTestAnswerCorrect(question("mode-03"), ["0", "2", "1"]), false, "extra multiple-select fails");
equal(engine.isTestAnswerCorrect(question("mode-03"), ["0", "2", "2"]), false, "duplicate multiple-select fails");

for (let seed = 0; seed < 100; seed++) {
  let history = engine.emptyTestHistory(bank);
  const seen = new Set();
  for (let round = 0; round < 16; round++) {
    const before = JSON.stringify(history);
    const previous = history;
    history = engine.createTestAttempt(bank, history, seed * 100 + round, `${seed}-${round}`);
    equal(JSON.stringify(previous), before, "selection does not mutate history");
    equal(history.active.questionIds.length, 6, "six per attempt");
    equal(new Set(history.active.questionIds).size, 6, "no duplicates within attempt");
    for (const o of bank.objectives) for (const level of ["foundation", "application"]) {
      equal(history.active.questionIds.filter(id => question(id).objective === o.id && question(id).level === level).length, 1, "balanced objective and difficulty");
    }
    equal(history.active.questionIds.some(id => previous.recent.some(ids => ids.includes(id))), false, "no repeat from previous three attempts");
    if (round < 8) for (const id of history.active.questionIds) { ok(!seen.has(id), "no repeats before initial reservoir exhaustion"); seen.add(id); }
    equal(engine.gradeTest(bank, history.active).passed, false, "blank test cannot pass");
  }
  equal(seen.size, 48, "all 48 questions exposed over eight attempts");
}

const wrongAnswer = q => q.type === "choice" ? q.options.find(o => o.id !== q.correct).id : q.type === "multiple" ? q.options.map(o => o.id) : q.type === "text" ? "wrong" : String(q.type === "slider" ? (q.correct === q.min ? q.max : q.min) : 999);
function checkAnswer(history, answer) {
  const id = engine.currentTestQuestionId(history.active);
  const draft = { ...history, active: { ...history.active, answers: { ...history.active.answers, [id]: answer } } };
  const before = JSON.stringify(draft);
  const checked = engine.checkTestAnswer(bank, draft);
  equal(JSON.stringify(draft), before, "checking does not mutate the draft");
  return checked;
}
function completeFirstPass(history, wrongIds = []) {
  for (let index = 0; index < 6; index++) {
    const id = engine.currentTestQuestionId(history.active);
    equal(engine.advanceTest(bank, history, 2000), history, "cannot advance before checking an answer");
    history = checkAnswer(history, wrongIds.includes(id) ? wrongAnswer(question(id)) : solution(question(id)));
    equal(engine.checkTestAnswer(bank, history), history, "duplicate submit does not change first answers");
    equal(engine.parseTestHistory(JSON.stringify(history), bank), history, "feedback and first answer survive reload");
    history = engine.advanceTest(bank, history, 2000);
  }
  return history;
}
let history = engine.createTestAttempt(bank, engine.emptyTestHistory(bank), 12345, "attempt");
for (const id of history.active.questionIds) {
  const altered = structuredClone(history); altered.active.answers[id] = solution(question(id));
  equal(engine.gradeTest(bank, altered.active).correct, 0, "unsubmitted drafts do not affect score");
  equal(engine.submitTest(bank, altered, 1000).active.submittedAt, undefined, "incomplete attempt cannot be submitted");
}
const selectedId = history.active.questionIds[0];
let failing = completeFirstPass(structuredClone(history), [selectedId]);
equal(engine.gradeTest(bank, failing.active), { complete: true, correct: 5, total: 6, passed: false }, "5/6 does not pass");
equal(failing.active.reviewIds, [selectedId], "mistakes return after the first six questions");
equal(engine.submitTest(bank, failing, 1000), failing, "pending corrections must be practiced before finishing");
const originalWrong = structuredClone(failing.active.firstAnswers[selectedId]);
failing = checkAnswer(failing, wrongAnswer(question(selectedId)));
failing = engine.advanceTest(bank, failing, 2500);
equal(failing.active.reviewIds, [selectedId], "another wrong correction stays in the queue");
failing = checkAnswer(failing, solution(question(selectedId)));
equal(failing.active.firstAnswers[selectedId], originalWrong, "correction never overwrites the first submission");
equal(engine.parseTestHistory(JSON.stringify(failing), bank), failing, "checked correction survives reload");
failing = engine.advanceTest(bank, failing, 3000);
equal(failing.active.submittedAt, 3000, "last corrected mistake completes the attempt");
equal(engine.gradeTest(bank, failing.active).correct, 5, "corrected answers still score 5/6");
equal(failing.passedAt, undefined, "correcting mistakes cannot turn a failed test into a pass");
history = completeFirstPass(history);
equal(engine.gradeTest(bank, history.active), { complete: true, correct: 6, total: 6, passed: true }, "six correct first submissions pass");
equal(history.passedAt, 2000, "pass is recorded after final feedback continuation");
equal(engine.submitTest(bank, history, 3000), history, "submission is idempotent");
let later = engine.createTestAttempt(bank, history, 12345, "later");
later = completeFirstPass(later, [later.active.questionIds[0]]);
later = checkAnswer(later, solution(question(engine.currentTestQuestionId(later.active))));
later = engine.advanceTest(bank, later, 4000);
equal(later.passedAt, 2000, "later failure does not revoke earlier pass");
equal(engine.parseTestHistory(JSON.stringify(history), bank), history, "submitted attempt survives reload");
let resume = engine.createTestAttempt(bank, history, 54321, "resume");
resume = checkAnswer(resume, solution(question(engine.currentTestQuestionId(resume.active))));
resume = engine.advanceTest(bank, resume, 5000);
equal(engine.parseTestHistory(JSON.stringify(resume), bank), resume, "partial answers, seed and current question survive reload");
const legacyDraft = structuredClone(resume);
delete legacyDraft.active.firstAnswers; delete legacyDraft.active.checked;
legacyDraft.active.index = 5;
const migrated = engine.parseTestHistory(JSON.stringify(legacyDraft), bank);
equal(migrated.active.index, 0, "legacy free-navigation drafts restart at question one");
equal(migrated.active.answers, legacyDraft.active.answers, "migration preserves draft answers");
equal(migrated.active.firstAnswers, {}, "old drafts have no first submissions yet");
const legacyResult = structuredClone(history);
delete legacyResult.active.firstAnswers; delete legacyResult.active.checked; delete legacyResult.active.reviewIds;
equal(engine.gradeTest(bank, engine.parseTestHistory(JSON.stringify(legacyResult), bank).active).passed, true, "legacy submitted results retain their score");
let twoMistakes = engine.createTestAttempt(bank, engine.emptyTestHistory(bank), 431, "two");
const mistakes = twoMistakes.active.questionIds.slice(0, 2);
twoMistakes = completeFirstPass(twoMistakes, mistakes);
twoMistakes = engine.advanceTest(bank, checkAnswer(twoMistakes, wrongAnswer(question(mistakes[0]))), 6000);
equal(twoMistakes.active.reviewIds, [mistakes[1], mistakes[0]], "failed practice moves behind other mistakes");
for (let i = 0; i < 2; i++) twoMistakes = engine.advanceTest(bank, checkAnswer(twoMistakes, solution(question(engine.currentTestQuestionId(twoMistakes.active)))), 6000);
equal(engine.gradeTest(bank, twoMistakes.active).correct, 4, "multiple corrections preserve 4/6 first-answer accuracy");
const multi = bank.questions.find(q => q.type === "multiple");
let copyProbe = engine.createTestAttempt(bank, engine.emptyTestHistory(bank), 77, "copy");
copyProbe.active.questionIds[0] = multi.id;
const input = solution(multi);
copyProbe = checkAnswer(copyProbe, input);
input.pop();
equal(copyProbe.active.firstAnswers[multi.id], solution(multi), "first multiple-select response is copied independently");
for (const raw of ["bad json", "null", "{}", JSON.stringify({ ...history, version: 999 })]) equal(engine.parseTestHistory(raw, bank), engine.emptyTestHistory(bank), "invalid or different-version storage resets safely");
for (const mutate of [a => a.questionIds.fill(a.questionIds[0]), a => a.questionIds[0] = "unknown", a => a.index = 99]) {
  const broken = structuredClone(history); mutate(broken.active);
  equal(engine.parseTestHistory(JSON.stringify(broken), bank).active, undefined, "corrupt active attempt is discarded");
}
for (const mutate of [
  a => { a.reviewIds = ["unknown"]; },
  a => { a.reviewIds = [a.questionIds[0]]; },
  a => { delete a.submittedAt; a.reviewIds = []; },
  a => { a.firstAnswers = []; },
]) {
  const broken = structuredClone(history); mutate(broken.active);
  equal(engine.parseTestHistory(JSON.stringify(broken), bank).active, undefined, "corrupt correction state is discarded without trapping the learner");
}
const forged = structuredClone(history.active); forged.questionIds.fill(forged.questionIds[0]);
equal(engine.gradeTest(bank, forged).passed, false, "duplicate IDs cannot create a pass");

// Exercise the actual progress reader/writer without rendering React hooks or
// resolving paths. Visits, review and transfer cannot become test passes.
const saved = new Map();
const progress = load("src/lib/learning-progress.ts", {
  require: name => {
    if (name === "react") return {};
    if (name === "@/lib/curriculum") return { getLearningPath: () => undefined };
    throw new Error(`Unexpected dependency ${name}`);
  },
  window: { localStorage: { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) }, dispatchEvent: () => {} },
  Event: class { constructor(type) { this.type = type; } },
});
for (const kind of ["visited", "reviewed", "transfer"]) progress.recordLearningProgress(bank.slug, kind);
let learning = progress.parseLearningProgress(saved.get("aigrounds.learning.v1"));
equal(learning.testPasses, {}, "existing learning signals do not mark a test passed");
const last = learning.last;
progress.recordLearningProgress(bank.slug, "test");
learning = progress.parseLearningProgress(saved.get("aigrounds.learning.v1"));
ok(learning.testPasses[bank.slug] > 0, "separate test-pass record persists");
equal(learning.last, last, "test pass preserves the current learning path");
equal([learning.visited, learning.reviewed], [[bank.slug], [bank.slug]], "old progress flags survive adding a test pass");
equal(progress.parseLearningProgress('{"testPasses":{"mean-median-mode":-1}}').testPasses, {}, "invalid test timestamp ignored");
console.log(`Lesson-test checks passed: ${checks}; 48 authored items, independent numeric oracles and 1,600 balanced draws.`);
