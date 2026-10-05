"use client";

import Link from "next/link";
import { ArrowPathIcon, ArrowRightIcon, ChatBubbleLeftRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useId, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import { useOpenPlaygroundAssistant } from "@/lib/playground-assistant-context";
import { LessonJourneyIntro, LessonNext, TransferCompletion } from "@/components/curriculum/lesson-journey";
import styles from "./learning-page.module.css";

export function LearningPage({ title, subtitle, children, rail }: {
  title: string;
  subtitle: string;
  children: ReactNode;
  rail: ReactNode;
}) {
  return <main className={styles.page}>
    <nav className={styles.nav} aria-label="Playground navigation">
      <Link href="/" aria-label="AI Grounds home">AI Grounds</Link>
      <Link href="/" className={styles.allLessons}>← All lessons</Link>
    </nav>
    <div className={styles.layout}>
      <div className={styles.workbench}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Guided discovery</p>
          <h1>{title}</h1><p>{subtitle}</p>
        </header>
        <LessonJourneyIntro />
        {children}
      </div>
      {rail}
    </div>
  </main>;
}

export function ExperimentProgress({ phase }: { phase: number }) {
  return <ol className={styles.steps} aria-label="Experiment progress">
    {["Predict", "Try", "Explain"].map((step, index) =>
      <li key={step} aria-current={phase === index ? "step" : undefined} data-active={phase >= index}>
        <span>{index + 1}</span>{step}
      </li>)}
  </ol>;
}

export function LessonToolbar({ scenarios, selectedId, onSelect, onReset, label = "Dataset scenarios" }: {
  scenarios: readonly { id: string; label: string; shortLabel: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  onReset: () => void;
  label?: string;
}) {
  return <div className={styles.toolbar}>
    <div className={styles.presets} aria-label={label}>
      {scenarios.map((scenario) => <button key={scenario.id} type="button"
        aria-pressed={selectedId === scenario.id} onClick={() => onSelect(scenario.id)}>
        <strong>{scenario.label}</strong><span>{scenario.shortLabel}</span>
      </button>)}
    </div>
    <button type="button" className={styles.reset} onClick={onReset}><ArrowPathIcon aria-hidden="true" />Reset</button>
  </div>;
}

export function DatasetHeading() {
  return <div className={styles.chartHeading}><h2>Your dataset</h2><span>Drag a dot to change its value</span></div>;
}

export function PointValueEditor({ label, value, helpId, onChange, inputRef, inputId }: {
  label: string;
  value: number;
  helpId: string;
  onChange: (value: number) => void;
  inputRef?: Ref<HTMLInputElement>;
  inputId?: string;
}) {
  return <div className={styles.pointEditor}>
    <label>Point {label} value<input ref={inputRef} id={inputId} type="number"
      min={0} max={100} step={1} value={value} onChange={(event) => {
        if (Number.isFinite(event.currentTarget.valueAsNumber)) onChange(event.currentTarget.valueAsNumber);
      }} /></label>
    <p id={helpId}>Focus a dot and use arrow keys. Shift moves by 10; Home / End moves to 0 / 100.</p>
  </div>;
}

// The lesson owns its experiment state and content; the shell owns placement.
export function ExperimentRail({ label, title, phase, children }: {
  label: string;
  title: string;
  phase?: 0 | 1 | 2;
  children: ReactNode;
}) {
  return <aside className={styles.rail} aria-label={phase === undefined ? "Free exploration" : "Guided experiment"}>
    <p className={styles.eyebrow}>{label}</p><h2 className={styles.experimentTitle}>{title}</h2>
    {phase !== undefined && <ExperimentProgress phase={phase} />}
    <div className={styles.exercise}>{children}</div>
    <GuideInvitation />
    <LessonNext />
  </aside>;
}

export function ExperimentChoices({ legend, name, choices, value, onChange }: {
  legend: string;
  name: string;
  choices: readonly { id: string; label: string }[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return <fieldset className={styles.choices}><legend className={styles.srOnly}>{legend}</legend>
    {choices.map((choice) => <label key={choice.id} data-checked={value === choice.id}>
      <input type="radio" name={name} value={choice.id} checked={value === choice.id} onChange={() => onChange(choice.id)} />{choice.label}
    </label>)}
  </fieldset>;
}

export function ExperimentResult({ title = "Experiment explained", children, compact = false }: {
  title?: string;
  children: ReactNode;
  compact?: boolean;
}) {
  const next = title === "Transfer explained" ? <TransferCompletion /> : null;
  if (compact) return <><div className={styles.success} role="status"><strong>{title}</strong><p>{children}</p></div>{next}</>;
  return <><div className={styles.takeaway} role="status"><CheckCircleIcon aria-hidden="true" /><div><h3>{title}</h3><p>{children}</p></div></div>{next}</>;
}

export function ExperimentButton({ children, onClick, disabled, arrow = false }: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  arrow?: boolean;
}) {
  return <button type="button" className={arrow ? styles.nextButton : styles.primary} disabled={disabled} onClick={onClick}>
    {children}{arrow && <ArrowRightIcon aria-hidden="true" />}
  </button>;
}

export function LessonSelect({ label, choices, value, onChange }: {
  label: string;
  choices: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return <label className={styles.controlField}>{label}<select value={value}
    onChange={(event) => onChange(event.currentTarget.value)}>
    {choices.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
  </select></label>;
}

export function LessonToggleGroup({ label, choices, value, onChange }: {
  label: string;
  choices: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return <div className={styles.toggleGroup} role="group" aria-label={label}>
    {choices.map((choice) => <button key={choice.id} type="button" aria-pressed={choice.id === value}
      onClick={() => onChange(choice.id)}>{choice.label}</button>)}
  </div>;
}

export function LessonAction({ children, onClick, disabled = false }: {
  children: ReactNode; onClick: () => void; disabled?: boolean;
}) {
  return <button type="button" className={styles.lessonAction} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function LessonRangeControl({ label, value, min, max, step, unit = "", help, onChange }: {
  label: string; value: number; min: number; max: number; step: number | "any";
  unit?: string; help: string; onChange: (value: number) => void;
}) {
  const helpId = useId();
  const [draft, setDraft] = useState(String(value));
  const [previousValue, setPreviousValue] = useState(value);
  if (value !== previousValue) {
    setPreviousValue(value);
    setDraft(String(value));
  }
  function normalize(next: number) {
    const bounded = Math.min(max, Math.max(min, next));
    if (step === "any") return bounded;
    const snapped = Number((min + Math.round((bounded - min) / step + 1e-9) * step).toFixed(10));
    return Math.min(max, Math.max(min, snapped));
  }
  function commit() {
    if (!draft.trim() || !Number.isFinite(Number(draft))) { setDraft(String(value)); return; }
    const next = normalize(Number(draft));
    setDraft(String(next));
    if (next !== value) onChange(next);
  }
  return <div className={styles.rangeControl}>
    <label>{label}{unit && ` (${unit})`}<input type="number" min={min} max={max} step={step}
      value={draft} aria-describedby={helpId} onChange={(event) => setDraft(event.currentTarget.value)}
      onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commit(); } }} /></label>
    <input type="range" aria-label={`${label} slider`} aria-describedby={helpId}
      min={min} max={max} step={step} value={value} onChange={(event) => onChange(normalize(event.currentTarget.valueAsNumber))} />
    <p id={helpId}>{help} Use arrow keys on the slider. Press Enter or leave the number field to apply an exact edit.</p>
  </div>;
}

export function GuideInvitation() {
  const openGuide = useOpenPlaygroundAssistant();
  return <div className={styles.guideInvitation}>
    <ChatBubbleLeftRightIcon aria-hidden="true" /><h3>Talk it through</h3>
    <p>Ask the AI Guide about your prediction or what changed.</p>
    <button type="button" onClick={openGuide}>Ask the AI Guide<ArrowRightIcon aria-hidden="true" /></button>
  </div>;
}

export type LessonSummary = {
  label: string;
  color: string;
  value: string;
  definition: string;
  formula: string;
  comparison?: string;
};

export function LessonSummaries({ summaries, label }: { summaries: LessonSummary[]; label: string }) {
  return <section className={styles.summaries} aria-label={label}
    style={{ "--summary-count": summaries.length } as CSSProperties}>
    {summaries.map((summary) => <div key={summary.label} className={styles.summary}
      style={{ "--summary-color": summary.color } as CSSProperties}>
      <h2>{summary.label}</h2><p className={styles.definition}>{summary.definition}</p>
      <p className={styles.summaryValue}>{summary.value}</p><p className={styles.formula}>{summary.formula}</p>
      {summary.comparison && <p className={styles.caption}>{summary.comparison}</p>}
    </div>)}
  </section>;
}
