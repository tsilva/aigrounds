export type TestOption = { id: string; label: string };
type QuestionBase = {
  id: string;
  objective: string;
  level: "foundation" | "application";
  family: string;
  prompt: string;
  context?: string;
  explanation: string;
};
export type TestQuestion = QuestionBase & (
  | { type: "choice"; options: readonly TestOption[]; correct: string }
  | { type: "multiple"; options: readonly TestOption[]; correct: readonly string[] }
  | { type: "number"; correct: number; tolerance?: number }
  | { type: "slider"; correct: number; min: number; max: number; step: number }
  | { type: "text"; correct: readonly string[] }
);
export type TestBank = {
  slug: string;
  version: number;
  title: string;
  objectives: readonly { id: string; label: string }[];
  questions: readonly TestQuestion[];
};
export type TestAnswer = string | string[];
export type TestAttempt = {
  id: string;
  seed: number;
  questionIds: string[];
  answers: Record<string, TestAnswer>;
  index: number;
  submittedAt?: number;
};
export type TestHistory = {
  version: number;
  started: number;
  seen: Record<string, number>;
  recent: string[][];
  active?: TestAttempt;
  passedAt?: number;
  best: number;
};
export const questionsPerObjective = 2;
export const emptyTestHistory = (bank: TestBank): TestHistory => ({ version: bank.version, started: 0, seen: {}, recent: [], best: 0 });
export function normalizeTestText(value: string) {
  return value.trim().toLowerCase().replace(/[.!?]+$/, "").trim();
}
function numericAnswer(answer: TestAnswer | undefined) {
  if (typeof answer !== "string" || !answer.trim() || !/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(answer.trim())) return undefined;
  const value = Number(answer.trim().replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}
export function isTestAnswerComplete(question: TestQuestion, answer: TestAnswer | undefined): boolean {
  switch (question.type) {
    case "choice": return typeof answer === "string" && question.options.some(option => option.id === answer);
    case "multiple": return Array.isArray(answer) && answer.length > 0 && new Set(answer).size === answer.length && answer.every(id => question.options.some(option => option.id === id));
    case "text": return typeof answer === "string" && answer.trim().length > 0 && answer.length <= 200;
    case "number": return numericAnswer(answer) !== undefined;
    case "slider": {
      const value = numericAnswer(answer);
      return value !== undefined && value >= question.min && value <= question.max && Math.abs((value - question.min) / question.step - Math.round((value - question.min) / question.step)) < 1e-8;
    }
  }
}
export function isTestAnswerCorrect(question: TestQuestion, answer: TestAnswer | undefined): boolean {
  if (!isTestAnswerComplete(question, answer)) return false;
  switch (question.type) {
    case "choice": return answer === question.correct;
    case "multiple": return Array.isArray(answer) && answer.length === question.correct.length && question.correct.every(id => answer.includes(id));
    case "text": return typeof answer === "string" && question.correct.some(value => normalizeTestText(value) === normalizeTestText(answer));
    case "number": case "slider": return Math.abs(numericAnswer(answer)! - question.correct) <= (question.type === "number" ? question.tolerance ?? 1e-9 : 1e-9);
  }
}
export function shuffled<T>(items: readonly T[], seed: number): T[] {
  const result = [...items];
  let state = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = Math.floor(state / 4294967296 * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function createTestAttempt(bank: TestBank, history: TestHistory, seed: number, id: string): TestHistory {
  const selected: TestQuestion[] = [];
  const previousFamilies = new Set((history.recent[0] ?? []).map(id => bank.questions.find(q => q.id === id)?.family));
  for (const objective of bank.objectives) {
    for (const level of ["foundation", "application"] as const) {
      const candidates = shuffled(bank.questions.filter(q => q.objective === objective.id && q.level === level), seed + selected.length);
      candidates.sort((a, b) => {
        // Prefer unseen items, then avoid the last three attempts and adjacent
        // question families. Reuse least-recently-seen items when needed.
        const aSeen = history.seen[a.id] ?? 0, bSeen = history.seen[b.id] ?? 0;
        const aRecent = history.recent.some(ids => ids.includes(a.id)), bRecent = history.recent.some(ids => ids.includes(b.id));
        return Number(aSeen > 0) - Number(bSeen > 0) || Number(aRecent) - Number(bRecent)
          || Number(previousFamilies.has(a.family)) - Number(previousFamilies.has(b.family))
          || aSeen - bSeen;
      });
      const first = candidates[0];
      const preferred = candidates.filter(q => Boolean(history.seen[q.id]) === Boolean(first && history.seen[first.id])
        && history.recent.some(ids => ids.includes(q.id)) === history.recent.some(ids => ids.includes(first?.id)));
      const question = preferred.find(q => !selected.some(item => item.family === q.family)) ?? first;
      if (!question) throw new Error(`Missing ${level} questions for ${objective.id}`);
      selected.push(question);
    }
  }
  const questionIds = shuffled(selected, seed ^ 0x9e3779b9).map(q => q.id);
  const started = history.started + 1;
  return { ...history, started, seen: { ...history.seen, ...Object.fromEntries(questionIds.map(id => [id, started])) },
    recent: [questionIds, ...history.recent].slice(0, 3),
    active: { id, seed, questionIds, answers: {}, index: 0 } };
}
export function gradeTest(bank: TestBank, attempt: TestAttempt) {
  const expected = bank.objectives.length * questionsPerObjective;
  const questions = attempt.questionIds.map(id => bank.questions.find(q => q.id === id));
  const balanced = bank.objectives.every(objective => ["foundation", "application"].every(level =>
    questions.filter(q => q?.objective === objective.id && q.level === level).length === 1));
  const valid = attempt.questionIds.length === expected && new Set(attempt.questionIds).size === expected && balanced;
  const complete = valid && questions.every(q => q && isTestAnswerComplete(q, attempt.answers[q.id]));
  const correct = questions.filter(q => q && isTestAnswerCorrect(q, attempt.answers[q.id])).length;
  return { complete, correct, total: expected, passed: complete && correct === expected };
}
export function submitTest(bank: TestBank, history: TestHistory, now: number): TestHistory {
  if (!history.active || history.active.submittedAt) return history;
  const result = gradeTest(bank, history.active);
  if (!result.complete) return history;
  return { ...history, active: { ...history.active, submittedAt: now }, best: Math.max(history.best, result.correct),
    passedAt: result.passed ? history.passedAt ?? now : history.passedAt };
}
export function parseTestHistory(raw: string, bank: TestBank): TestHistory {
  const empty = emptyTestHistory(bank);
  try {
    const value = JSON.parse(raw) as TestHistory;
    if (!value || value.version !== bank.version || !Number.isSafeInteger(value.started) || value.started < 0) return empty;
    const known = new Set(bank.questions.map(q => q.id));
    const seen = Object.fromEntries(Object.entries(value.seen ?? {}).filter(([id, time]) => known.has(id) && Number.isSafeInteger(time) && time > 0 && time <= value.started));
    const recent = Array.isArray(value.recent) ? value.recent.filter(ids => Array.isArray(ids) && ids.every(id => known.has(id))).slice(0, 3) : [];
    const passedAt = typeof value.passedAt === "number" && Number.isFinite(value.passedAt) && value.passedAt > 0 ? value.passedAt : undefined;
    const best = Number.isInteger(value.best) && value.best >= 0 && value.best <= bank.objectives.length * questionsPerObjective ? value.best : 0;
    const result: TestHistory = { version: bank.version, started: value.started, seen, recent, passedAt, best };
    const a = value.active;
    if (!a || typeof a.id !== "string" || a.id.length > 100 || !Number.isInteger(a.seed) || !Array.isArray(a.questionIds)
      || !Number.isInteger(a.index) || a.index < 0 || a.index >= bank.objectives.length * questionsPerObjective
      || !a.answers || typeof a.answers !== "object" || Array.isArray(a.answers)) return result;
    const probe = { ...a, answers: {} };
    // A blank attempt must still have the exact, balanced set of known items.
    const questions = a.questionIds.map(id => bank.questions.find(q => q.id === id));
    if (a.questionIds.length !== bank.objectives.length * questionsPerObjective || new Set(a.questionIds).size !== a.questionIds.length
      || questions.some(q => !q) || !bank.objectives.every(o => ["foundation", "application"].every(level => questions.filter(q => q?.objective === o.id && q.level === level).length === 1))) return result;
    const answers: Record<string, TestAnswer> = {};
    for (const question of questions) {
      const answer = a.answers[question!.id];
      if (typeof answer === "string" && answer.length <= 200 || Array.isArray(answer) && answer.length <= 20 && answer.every(item => typeof item === "string" && item.length < 100)) answers[question!.id] = answer;
    }
    result.active = { ...probe, answers, submittedAt: typeof a.submittedAt === "number" && Number.isFinite(a.submittedAt) && a.submittedAt > 0 ? a.submittedAt : undefined };
    if (result.active.submittedAt && !gradeTest(bank, result.active).complete) result.active = undefined;
    return result;
  } catch { return empty; }
}
