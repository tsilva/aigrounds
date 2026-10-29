"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowLeftIcon, ArrowPathIcon, ArrowRightIcon, CheckCircleIcon, SparklesIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { advanceTest, checkTestAnswer, createTestAttempt, currentTestQuestionId, gradeTest, isTestAnswerComplete, isTestAnswerCorrect, questionsPerObjective, type TestAnswer, type TestAttempt, type TestBank, type TestQuestion } from "@/lib/lesson-test";
import { updateTestProgress, useTestProgress } from "@/lib/lesson-test-progress";
import { recordLearningProgress } from "@/lib/learning-progress";
import { AnswerWidget } from "./answer-widget";
import styles from "./lesson-test.module.css";

const desktopQuery = "(min-width: 768px)";
function subscribeDesktop(notify: () => void) {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}
export function TestInvitation({ bank, onOpen, appearance = "primary" }: { bank: TestBank; onOpen: () => void; appearance?: "primary" | "secondary" }) {
  const { history } = useTestProgress(bank);
  return <section className={styles.invitation} data-appearance={appearance} aria-label="Lesson test">
    <h3>{history.passedAt ? <><CheckCircleIcon aria-hidden="true" />Test passed · 100%</> : appearance === "secondary" ? "Ready to check your understanding?" : "Take the test"}</h3>
    <p>{bank.objectives.length * questionsPerObjective} questions · Get every first answer correct to pass.</p>
    <button type="button" className={styles.primary} onClick={onOpen}>
      {history.passedAt ? "Take test again" : appearance === "secondary" ? "Take lesson test" : "Take the test"}<ArrowRightIcon aria-hidden="true" />
    </button>
  </section>;
}
export function LessonTest({ bank, onClose, nextLesson }: { bank: TestBank; onClose: () => void; nextLesson?: ReactNode }) {
  const desktop = useSyncExternalStore(subscribeDesktop, () => window.matchMedia(desktopQuery).matches, () => false);
  return desktop ? <TestDialog bank={bank} onClose={onClose} nextLesson={nextLesson} /> : null;
}
function answerLabel(question: TestQuestion, answer: TestAnswer | undefined): string {
  if (answer === undefined) return "No answer";
  if (question.type === "choice" || question.type === "multiple") {
    const ids = Array.isArray(answer) ? answer : [answer];
    return ids.map(id => question.options.find(option => option.id === id)?.label ?? id).join("; ");
  }
  return Array.isArray(answer) ? answer.join(", ") : answer;
}
function Celebration({ large = false }: { large?: boolean }) {
  return <span className={styles.celebration} data-large={large} aria-hidden="true">
    {Array.from({ length: large ? 12 : 6 }, (_, i) => <i key={i} style={{ rotate: `${i * (large ? 30 : 60)}deg`, animationDelay: `${i % 3 * 35}ms` }} />)}
  </span>;
}
function TestDialog({ bank, onClose, nextLesson }: { bank: TestBank; onClose: () => void; nextLesson?: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const { history } = useTestProgress(bank);
  const [attempt, setAttempt] = useState<TestAttempt>();
  const submitted = Boolean(attempt?.submittedAt);
  const question = attempt ? bank.questions.find(q => q.id === currentTestQuestionId(attempt)) : undefined;
  const result = attempt ? gradeTest(bank, attempt) : null;
  const total = bank.objectives.length * questionsPerObjective;
  const reviewing = attempt?.reviewIds !== undefined;
  const checked = Boolean(attempt?.checked);
  const correct = Boolean(question && attempt && isTestAnswerCorrect(question, attempt.answers[question.id]));
  const lastFeedback = reviewing ? correct && attempt?.reviewIds?.length === 1 : attempt?.index === total - 1 && result?.passed;
  const completedQuestions = reviewing ? total : (attempt?.index ?? 0) + (checked ? 1 : 0);
  useEffect(() => {
    const element = dialog.current!;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => { element.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    if (dialog.current) dialog.current.scrollTop = 0;
  }, [attempt?.id, attempt?.index, question?.id, reviewing, submitted]);
  useEffect(() => {
    if (checked) actions.current?.scrollIntoView({ block: "nearest" });
  }, [checked, question?.id]);
  function start() {
    const seed = window.crypto.getRandomValues(new Uint32Array(1))[0];
    const next = updateTestProgress(bank, current => createTestAttempt(bank, current, seed, window.crypto.randomUUID()));
    setAttempt(next.active);
  }
  function setAnswer(answer: TestAnswer) {
    if (!question || !attempt) return;
    setAttempt(current => !current || current.id !== attempt.id || current.submittedAt || current.checked || currentTestQuestionId(current) !== question.id ? current : {
      ...current, answers: { ...current.answers, [question.id]: answer },
    });
  }
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="lesson-test-title" onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => {
      if (event.key !== "Tab") return;
      const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, a[href]')].filter(element => element.getClientRects().length > 0);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first && last) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last && first) { event.preventDefault(); first.focus(); }
    }}>
    <nav className={styles.nav} aria-label="Test navigation"><span>AI Grounds</span><button type="button" onClick={onClose}><ArrowLeftIcon aria-hidden="true" />Back to lesson</button></nav>
    <main className={styles.content}>
      <p className={styles.eyebrow}>{bank.title}</p>
      {!attempt ? <>
        <h1 ref={heading} tabIndex={-1} id="lesson-test-title">Take the test</h1>
        <p className={styles.intro}>Use what you learned on fresh examples. Get all {total} questions correct on your first try to pass.</p>
        <ul className={styles.rules}><li>Two questions for each learning objective.</li><li>Submit each answer for immediate feedback.</li><li>Retry mistakes at the end. Corrections help you learn, but your first answers determine the score.</li><li>Retakes draw another balanced set from {bank.questions.length} questions.</li></ul>
        <button type="button" className={styles.primary} onClick={start}>Start test<ArrowRightIcon aria-hidden="true" /></button>
      </> : submitted && result ? <>
        {result.passed && <div className={styles.passCelebration}>
          <div className={styles.trophy}><TrophyIcon aria-hidden="true" /><Celebration large /></div>
          <p><SparklesIcon aria-hidden="true" />Perfect round</p>
        </div>}
        <h1 ref={heading} tabIndex={-1} id="lesson-test-title">{result.passed ? "Test passed" : "Not passed yet"}</h1>
        <p className={styles.score}>{result.correct} / {result.total}<span>{Math.round(result.correct / result.total * 100)}% first-answer accuracy</span></p>
        <p className={styles.intro}>{result.passed ? "Every first answer was correct. This ground is marked passed." : "Passing requires 100% on your first answers. You practiced your mistakes; try a fresh test when you’re ready."}</p>
        {!result.passed && history.passedAt && <p className={styles.small}>You passed an earlier attempt. That passed status is preserved.</p>}
        <div className={styles.resultActions}><button type="button" className={styles.primary} onClick={start}>Take a new test<ArrowRightIcon aria-hidden="true" /></button></div>
        {nextLesson && <div className={styles.continue}>{nextLesson}</div>}
      </> : question && <>
        <div className={styles.progressLabel}>
          <span>{reviewing ? `Review mistakes · ${attempt.reviewIds!.length} remaining` : `Question ${attempt.index + 1} of ${total}`}</span>
          <div className={styles.progress} role="progressbar" aria-label="Test progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completedQuestions}><span style={{ width: `${completedQuestions / total * 100}%` }} /></div>
          <span className={styles.passTarget}>100% to pass</span>
        </div>
        <div key={`${attempt.id}-${question.id}-${reviewing}`} className={styles.questionScene}>
        <h1 ref={heading} tabIndex={-1} id="lesson-test-title">{question.prompt}</h1>
        {question.datasets ? <div className={styles.datasets} role="group" aria-label="Question data">
          {question.datasets.map((dataset, row) => <div className={styles.datasetRow} key={row}>
            <span className={styles.datasetLabel}>{dataset.label}</span>
            <ol aria-label={dataset.label}>{dataset.values.map((value, index) => <li key={index} data-emphasized={dataset.emphasized?.includes(index) || undefined}>{value}</li>)}</ol>
          </div>)}
        </div> : question.context && <p className={styles.context}>{question.context}</p>}
        <form onSubmit={event => {
          event.preventDefault();
          const current = { ...history, active: attempt };
          const next = checked ? advanceTest(bank, current, Date.now()) : checkTestAnswer(bank, current);
          setAttempt(next.active);
          if (next.active?.submittedAt) {
            updateTestProgress(bank, saved => ({ ...saved, best: Math.max(saved.best, next.best), passedAt: saved.passedAt ?? next.passedAt }));
            if (gradeTest(bank, next.active).passed) recordLearningProgress(bank.slug, "test");
          }
        }}>
          <fieldset disabled={checked} className={styles.answerArea} data-feedback={checked ? correct ? "correct" : "incorrect" : undefined} aria-label="Your response">
            <AnswerWidget key={question.id} question={question} answer={attempt.answers[question.id]} seed={attempt.seed + attempt.questionIds.indexOf(question.id)} onChange={setAnswer} />
          </fieldset>
          <div ref={actions} className={styles.response} data-checked={checked}>
          {checked && <section className={styles.feedback} data-correct={correct} role="status" aria-live="polite">
            <div className={styles.feedbackHeading}>
              <span className={styles.feedbackIcon}>{correct ? <CheckCircleIcon aria-hidden="true" /> : <ArrowPathIcon aria-hidden="true" />}{correct && <Celebration />}</span>
              <h2>{correct ? reviewing ? "Corrected!" : "Correct!" : "Not quite"}</h2>
            </div>
            {!correct && <p><strong>Correct answer:</strong> {answerLabel(question, question.type === "multiple" ? [...question.correct] : question.type === "text" ? question.correct[0] : String(question.correct))}</p>}
            <p>{question.explanation}</p>
            {(reviewing || !correct) && <p className={styles.feedbackNote}>{correct ? "Your first answer still counts as incorrect for this test." : reviewing ? "You’ll try this again. Your first-answer score stays the same." : "You’ll retry this at the end. This first answer counts as incorrect."}</p>}
          </section>}
          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={!checked && !isTestAnswerComplete(question, attempt.answers[question.id])}>
              {checked ? lastFeedback ? "See results" : "Continue" : "Submit answer"}<ArrowRightIcon aria-hidden="true" />
            </button>
          </div>
          </div>
        </form>
        </div>
      </>}
    </main>
  </dialog>;
}
