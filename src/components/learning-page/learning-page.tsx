"use client";

import Link from "next/link";
import { ArrowRightIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import type { CSSProperties, ReactNode } from "react";
import { useOpenPlaygroundAssistant } from "@/lib/playground-assistant-context";
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
