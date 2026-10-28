"use client";

import { useId } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { shuffled, type TestAnswer, type TestQuestion } from "@/lib/lesson-test";
import styles from "./lesson-test.module.css";

export function AnswerWidget({ question, answer, seed, onChange }: {
  question: TestQuestion; answer?: TestAnswer; seed: number; onChange: (answer: TestAnswer) => void;
}) {
  const id = useId();
  if (question.type === "choice" || question.type === "multiple") {
    const multiple = question.type === "multiple";
    return <fieldset className={styles.choices} data-multiple={multiple}>
      <legend className={styles.fieldLegend}>{multiple ? "Select all that apply" : "Choose one answer"}</legend>
      {shuffled(question.options, seed).map((option, index) => <label key={option.id}>
        <input type={multiple ? "checkbox" : "radio"} name={id} value={option.id}
          checked={multiple ? Array.isArray(answer) && answer.includes(option.id) : answer === option.id}
          onChange={event => {
            if (!multiple) onChange(option.id);
            else { const selected = Array.isArray(answer) ? answer : []; onChange(event.target.checked ? [...selected, option.id] : selected.filter(value => value !== option.id)); }
          }} />
        <span className={styles.choiceNumber} aria-hidden="true">{index + 1}</span>
        <span className={styles.choiceText}>{option.label}</span>
        <CheckIcon className={styles.choiceCheck} aria-hidden="true" />
      </label>)}
    </fieldset>;
  }
  const value = typeof answer === "string" ? answer : "";
  if (question.type === "slider") {
    const sliderValue = value !== "" && Number.isFinite(Number(value)) ? Math.min(question.max, Math.max(question.min, Number(value))) : question.min;
    return <div className={styles.range}>
      <label htmlFor={id}>Your value<input id={id} type="number" min={question.min} max={question.max} step={question.step}
        value={value} placeholder="Set a value" onChange={event => onChange(event.target.value)} aria-describedby={`${id}-help`} /></label>
      <input type="range" aria-label="Your value slider" aria-describedby={`${id}-help`} min={question.min} max={question.max} step={question.step}
        value={sliderValue} onChange={event => onChange(event.target.value)} />
      <div className={styles.rangeEnds}><span>{question.min}</span><span>{question.max}</span></div>
      <p id={`${id}-help`} className={styles.small}>Move the slider or enter an exact value. Arrow keys move the slider by {question.step}.</p>
    </div>;
  }
  return <label className={styles.field} htmlFor={id}>{question.type === "number" ? "Your answer (number)" : "Your answer"}
    <input id={id} type="text" inputMode={question.type === "number" ? "decimal" : "text"} autoComplete="off" autoCapitalize="none" spellCheck={false}
      maxLength={200} value={value} onChange={event => onChange(event.target.value)} placeholder={question.type === "number" ? "Enter a number" : "Fill in the blank"} />
  </label>;
}
