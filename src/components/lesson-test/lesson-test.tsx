"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { ArrowRightIcon, CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { createTestAttempt, gradeTest, isTestAnswerComplete, isTestAnswerCorrect, questionsPerObjective, submitTest, type TestAnswer, type TestBank, type TestQuestion } from "@/lib/lesson-test";
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
export function TestInvitation({ bank, onOpen }: { bank: TestBank; onOpen: () => void }) {
  const { history } = useTestProgress(bank);
  const inProgress = history.active && !history.active.submittedAt;
  return <section className={styles.invitation} aria-label="Lesson test">
    <h3>{history.passedAt ? <><CheckCircleIcon aria-hidden="true" />Test passed · 100%</> : "Take the test"}</h3>
    <p>{bank.objectives.length * questionsPerObjective} questions · Get every answer correct to pass.</p>
    <button type="button" className={styles.primary} onClick={onOpen}>
      {inProgress ? "Resume test" : history.passedAt ? "View result or test again" : "Take the test"}<ArrowRightIcon aria-hidden="true" />
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
function TestDialog({ bank, onClose, nextLesson }: { bank: TestBank; onClose: () => void; nextLesson?: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const { history, sessionOnly } = useTestProgress(bank);
  const attempt = history.active;
  const submitted = Boolean(attempt?.submittedAt);
  const question = attempt ? bank.questions.find(q => q.id === attempt.questionIds[attempt.index]) : undefined;
  const result = attempt ? gradeTest(bank, attempt) : null;
  const total = bank.objectives.length * questionsPerObjective;
  useEffect(() => {
    const element = dialog.current!;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => { element.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  useEffect(() => { heading.current?.focus(); }, [attempt?.id, attempt?.index, submitted]);
  function start() {
    const seed = window.crypto.getRandomValues(new Uint32Array(1))[0];
    updateTestProgress(bank, current => createTestAttempt(bank, current, seed, window.crypto.randomUUID()));
  }
  function setAnswer(answer: TestAnswer) {
    if (!question || !attempt) return;
    updateTestProgress(bank, current => current.active?.id !== attempt.id || current.active.submittedAt ? current : {
      ...current, active: { ...current.active, answers: { ...current.active.answers, [question.id]: answer } },
    });
  }
  function move(index: number) {
    updateTestProgress(bank, current => current.active?.id !== attempt?.id || !current.active || current.active.submittedAt ? current : { ...current, active: { ...current.active, index } });
  }
  const savedMessage = sessionOnly ? "Storage is unavailable. Progress is kept for this session only." : "Your progress is saved in this browser. No account needed.";
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="lesson-test-title" onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => {
      if (event.key !== "Tab") return;
      const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, a[href]')].filter(element => element.getClientRects().length > 0);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first && last) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last && first) { event.preventDefault(); first.focus(); }
    }}>
    <nav className={styles.nav} aria-label="Test navigation"><span>AI Grounds</span><button type="button" onClick={onClose}>← Back to lesson</button></nav>
    <main className={styles.content}>
      <p className={styles.eyebrow}>{bank.title}</p>
      {!attempt ? <>
        <h1 ref={heading} tabIndex={-1} id="lesson-test-title">Take the test</h1>
        <p className={styles.intro}>Use what you learned on fresh examples. Get all {total} questions correct in one attempt to pass.</p>
        <ul className={styles.rules}><li>Two questions for each learning objective.</li><li>Review and change your answers before submitting.</li><li>Results and explanations appear after submission.</li><li>Retakes draw another balanced set from {bank.questions.length} questions.</li></ul>
        <button type="button" className={styles.primary} onClick={start}>Start test<ArrowRightIcon aria-hidden="true" /></button>
      </> : submitted && result ? <>
        <h1 ref={heading} tabIndex={-1} id="lesson-test-title">{result.passed ? "Test passed" : "Not passed yet"}</h1>
        <p className={styles.score}>{result.correct} / {result.total}<span>{Math.round(result.correct / result.total * 100)}% accuracy</span></p>
        <p className={styles.intro}>{result.passed ? "Every answer was correct. This ground is marked passed." : "Passing requires 100%. Review the explanations, explore again, then try a fresh test."}</p>
        {!result.passed && history.passedAt && <p className={styles.small}>You passed an earlier attempt. That passed status is preserved.</p>}
        <section className={styles.objectives} aria-label="Results by learning objective">{bank.objectives.map(objective => {
          const questions = bank.questions.filter(q => q.objective === objective.id && attempt.questionIds.includes(q.id));
          const count = questions.filter(q => isTestAnswerCorrect(q, attempt.answers[q.id])).length;
          return <div key={objective.id}><span>{objective.label}</span><strong>{count}/{questionsPerObjective}</strong></div>;
        })}</section>
        <div className={styles.resultActions}><button type="button" className={styles.primary} onClick={start}>Take a new test<ArrowRightIcon aria-hidden="true" /></button><button type="button" className={styles.secondary} onClick={onClose}>Back to playground</button></div>
        <section className={styles.review} aria-label="Answer review"><h2>Review your answers</h2>{attempt.questionIds.map((id, index) => {
          const q = bank.questions.find(q => q.id === id)!;
          const correct = isTestAnswerCorrect(q, attempt.answers[id]);
          return <details key={id}><summary><span>{index + 1}. {q.prompt}</span><strong data-correct={correct}>{correct ? "Correct" : "Incorrect"}</strong><ChevronDownIcon aria-hidden="true" /></summary>
            {q.context && <p className={styles.context}>{q.context}</p>}<p><strong>Your answer:</strong> {answerLabel(q, attempt.answers[id])}</p><p>{q.explanation}</p></details>;
        })}</section>
        {nextLesson && <div className={styles.continue}>{nextLesson}</div>}
      </> : question && <>
        <div className={styles.progressLabel}><span>Question {attempt.index + 1} of {total}</span><span>100% to pass</span></div>
        <div className={styles.progress} role="progressbar" aria-label="Test progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={attempt.index}><span style={{ width: `${attempt.index / total * 100}%` }} /></div>
        <h1 ref={heading} tabIndex={-1} id="lesson-test-title">{question.prompt}</h1>
        {question.context && <p className={styles.context}>{question.context}</p>}
        <form onSubmit={event => {
          event.preventDefault();
          if (!isTestAnswerComplete(question, attempt.answers[question.id])) return;
          if (attempt.index < total - 1) move(attempt.index + 1);
          else updateTestProgress(bank, current => {
            if (current.active?.id !== attempt.id) return current;
            const next = submitTest(bank, current, Date.now());
            if (next.active?.submittedAt && gradeTest(bank, next.active).passed) recordLearningProgress(bank.slug, "test");
            return next;
          });
        }}>
          <AnswerWidget key={question.id} question={question} answer={attempt.answers[question.id]} seed={attempt.seed + attempt.index} onChange={setAnswer} />
          <div className={styles.actions}><button type="button" className={styles.secondary} disabled={attempt.index === 0} onClick={() => move(attempt.index - 1)}>Back</button>
            <button type="submit" className={styles.primary} disabled={!isTestAnswerComplete(question, attempt.answers[question.id]) || attempt.index === total - 1 && !result?.complete}>
              {attempt.index === total - 1 ? "Submit test" : "Continue"}<ArrowRightIcon aria-hidden="true" />
            </button></div>
        </form>
        <nav className={styles.questionNav} aria-label="Review test questions">{attempt.questionIds.map((id, index) => {
          const answered = isTestAnswerComplete(bank.questions.find(q => q.id === id)!, attempt.answers[id]);
          return <button key={id} type="button" aria-label={`Question ${index + 1}, ${answered ? "answered" : "unanswered"}`} aria-current={attempt.index === index ? "step" : undefined} onClick={() => move(index)}>{index + 1}{answered && <span aria-hidden="true"> ✓</span>}</button>;
        })}</nav>
        {attempt.index === total - 1 && !result?.complete && <p className={styles.small} role="status">Answer every question before submitting. Use the numbered buttons to return to unanswered questions.</p>}
        <p className={styles.small}>No answers are graded until you submit the complete test.</p>
      </>}
      <p className={styles.storageNote}>{savedMessage}</p>
    </main>
  </dialog>;
}
