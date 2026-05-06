"use client";

import { useMemo, useState } from "react";
import {
  analyzeConditionalProbability,
  filterLabels,
  type FilterView,
  type PopulationMemberView,
  type ScenarioId,
} from "./conditional-probability-engine";
import {
  conditionalScenarios,
  type ConditionalScenario,
} from "./scenario";

const filterViews: FilterView[] = [
  "all",
  "a",
  "b",
  "intersection",
  "b-given-a",
];

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[14px] border border-[#d8e0f3] bg-white/95 shadow-[0_18px_42px_rgba(26,38,80,0.05)] ${className}`}
    >
      {children}
    </section>
  );
}

function LessonTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[18px] leading-none font-black text-[#352cff] uppercase">
      {children}
    </h2>
  );
}

function formatPercent(value: number) {
  const percent = Math.round(value * 1000) / 10;

  if (Number.isInteger(percent)) {
    return `${percent.toFixed(0)}%`;
  }

  return `${percent.toFixed(1)}%`;
}

function ScenarioButton({
  scenario,
  isSelected,
  onSelect,
}: {
  scenario: ConditionalScenario;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-w-0 rounded-[10px] border p-4 text-left transition ${
        isSelected
          ? "border-[#5636f5] bg-[linear-gradient(180deg,#694bff,#4a27e8)] text-white shadow-[0_14px_24px_rgba(70,39,232,0.2)]"
          : "border-[#d8e0f0] bg-white text-[#0d1429] hover:border-[#b9c4de] hover:bg-[#fbfaff]"
      }`}
    >
      <span className="block text-[12px] font-black uppercase">
        {scenario.shortLabel}
      </span>
      <span className="mt-2 block text-[17px] leading-[1.2] font-black">
        {scenario.title}
      </span>
      <span
        className={`mt-2 block text-[13px] leading-[1.35] ${
          isSelected ? "text-white/85" : "text-[#30446f]"
        }`}
      >
        {scenario.description}
      </span>
    </button>
  );
}

function FactPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[8px] border border-[#dfe4f4] bg-white px-3 py-2">
      <p className="text-[11px] font-black tracking-[0.03em] text-[#7180a5] uppercase">
        {label}
      </p>
      <p className="mt-1 font-mono text-[12px] leading-[1.3] font-bold text-[#071024]">
        {value}
      </p>
    </div>
  );
}

function FilterButton({
  view,
  isSelected,
  onSelect,
}: {
  view: FilterView;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`h-10 rounded-[8px] border px-3 font-mono text-[12px] font-black transition ${
        isSelected
          ? "border-[#5636f5] bg-[#352cff] text-white shadow-[0_10px_18px_rgba(53,44,255,0.18)]"
          : "border-[#d8e0f0] bg-white text-[#263a68] hover:border-[#b9c4de]"
      }`}
    >
      {filterLabels[view]}
    </button>
  );
}

function PopulationGrid({ members }: { members: PopulationMemberView[] }) {
  return (
    <div className="mt-5 overflow-x-auto pb-2">
      <div className="mx-auto grid w-[500px] max-w-full grid-cols-10 gap-2">
        {members.map((member) => (
          <PopulationDot key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

function PopulationDot({ member }: { member: PopulationMemberView }) {
  const fillClass = member.inA
    ? "bg-[#3267ff] text-white"
    : "bg-white text-[#637399]";
  const ringClass = member.inB
    ? "border-[#ff4f62] shadow-[inset_0_0_0_3px_rgba(255,79,98,0.26)]"
    : "border-[#d9e1f2]";
  const focusClass = member.isInNumerator
    ? "ring-2 ring-[#15a85b] ring-offset-2"
    : member.isInDenominator
      ? "ring-2 ring-[#352cff] ring-offset-2"
      : "";

  return (
    <div
      className={`grid aspect-square place-items-center rounded-full border text-[11px] font-black transition ${fillClass} ${ringClass} ${focusClass} ${
        member.isDimmed ? "opacity-25" : "opacity-100"
      }`}
      title={`Person ${member.index + 1}${member.inA ? ", A" : ""}${
        member.inB ? ", B" : ""
      }`}
    >
      {member.inA ? "A" : ""}
    </div>
  );
}

function LegendSwatch({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[12px] font-bold text-[#32466f]">
      <span className={`h-3 w-3 rounded-full border ${className}`} />
      {label}
    </span>
  );
}

function FormulaBox({
  label,
  formula,
  fraction,
  percent,
  tone = "indigo",
}: {
  label: string;
  formula: string;
  fraction: string;
  percent: string;
  tone?: "indigo" | "red" | "green";
}) {
  const toneClass =
    tone === "green"
      ? "text-[#12934d]"
      : tone === "red"
        ? "text-[#f1334a]"
        : "text-[#352cff]";

  return (
    <div className="rounded-[8px] border border-[#dbe2f2] bg-[#fbfbff] px-4 py-4">
      <p className="text-[11px] font-black tracking-[0.06em] text-[#7180a5] uppercase">
        {label}
      </p>
      <p className="mt-2 font-mono text-[17px] leading-[1.35] font-black text-[#071024]">
        {formula}
      </p>
      <p className={`mt-2 font-mono text-[15px] font-black ${toneClass}`}>
        {fraction} = {percent}
      </p>
    </div>
  );
}

function ProbabilityBar({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-black text-[#071024]">{label}</p>
        <p className="font-mono text-[13px] font-black text-[#071024]">
          {formatPercent(value)}
        </p>
      </div>
      <div className="mt-2 h-4 overflow-hidden rounded-full border border-[#dfe4f4] bg-[#f2f5fb]">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${Math.max(value * 100, 2)}%` }}
        />
      </div>
    </div>
  );
}

export function ConditionalProbabilityPlayground() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("independent");
  const [filter, setFilter] = useState<FilterView>("b-given-a");
  const scenario =
    conditionalScenarios.find((entry) => entry.id === scenarioId) ??
    conditionalScenarios[0];
  const analysis = useMemo(
    () => analyzeConditionalProbability(scenarioId, filter),
    [scenarioId, filter],
  );
  const verdictTone = analysis.isIndependent
    ? "border-[#bfe9cf] bg-[#f0fff6] text-[#0b7a3d]"
    : "border-[#ffe1a6] bg-[#fffaf0] text-[#a15f00]";
  const comparisonCopy = analysis.isIndependent
    ? "Independent: filtering by A leaves B unchanged."
    : "Dependent: filtering by A changes B.";

  function chooseScenario(nextScenario: ScenarioId) {
    setScenarioId(nextScenario);
    setFilter("b-given-a");
  }

  return (
    <main className="min-h-screen bg-[#f7faff] px-4 py-5 text-[#071024] sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
        <header className="pb-1">
          <div className="min-w-0">
            <h1 className="text-[42px] leading-none font-black tracking-[-0.04em] text-[#070b1a] sm:text-[52px] lg:text-[60px]">
              Conditional Probability
            </h1>
            <p className="mt-3 max-w-3xl text-[20px] leading-[1.35] font-bold text-[#314571] sm:text-[24px]">
              Probabilities change when the world is filtered.
            </p>
          </div>
        </header>

        <Panel className="p-5 sm:p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.85fr)]">
            <div className="min-w-0">
              <LessonTitle>1. Choose The Relationship</LessonTitle>
              <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
                Each scenario has 100 people and two facts. Pick a relationship,
                then watch how filtering changes the denominator.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {conditionalScenarios.map((entry) => (
                  <ScenarioButton
                    key={entry.id}
                    scenario={entry}
                    isSelected={entry.id === scenarioId}
                    onSelect={() => chooseScenario(entry.id)}
                  />
                ))}
              </div>
            </div>

            <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
              <p className="text-[13px] font-black tracking-[0.02em] text-[#352cff] uppercase">
                Current facts
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <FactPill label="Event A" value={scenario.eventA} />
                <FactPill label="Event B" value={scenario.eventB} />
                <FactPill
                  label="Count A"
                  value={`${analysis.counts.a} / ${analysis.counts.total}`}
                />
                <FactPill
                  label="Count B"
                  value={`${analysis.counts.b} / ${analysis.counts.total}`}
                />
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <LessonTitle>2. Filter The Population</LessonTitle>
              <p className="mt-4 max-w-[820px] text-[16px] leading-[1.45] text-[#16264e]">
                Blue dots are A. Red rings are B. The selected filter dims
                everyone outside the current denominator.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterViews.map((view) => (
                <FilterButton
                  key={view}
                  view={view}
                  isSelected={view === filter}
                  onSelect={() => setFilter(view)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <LegendSwatch
              className="border-[#3267ff] bg-[#3267ff]"
              label="A"
            />
            <LegendSwatch
              className="border-[#ff4f62] bg-white shadow-[inset_0_0_0_2px_rgba(255,79,98,0.3)]"
              label="B"
            />
            <LegendSwatch
              className="border-[#15a85b] bg-white"
              label="numerator"
            />
            <LegendSwatch
              className="border-[#352cff] bg-white"
              label="denominator"
            />
          </div>

          <PopulationGrid members={analysis.members} />
        </Panel>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.58fr)]">
          <Panel className="p-5 sm:p-6">
            <LessonTitle>3. Watch The Denominator</LessonTitle>
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              <FormulaBox
                label="Marginal"
                formula="P(B) = |B| / |S|"
                fraction={`${analysis.counts.b} / ${analysis.counts.total}`}
                percent={formatPercent(analysis.probabilities.pB)}
                tone="red"
              />
              <FormulaBox
                label="Conditional"
                formula="P(B ∣ A) = |A ∩ B| / |A|"
                fraction={`${analysis.counts.intersection} / ${analysis.counts.a}`}
                percent={formatPercent(analysis.probabilities.pBGivenA)}
                tone="indigo"
              />
              <FormulaBox
                label="Joint"
                formula="P(A ∩ B) = |A ∩ B| / |S|"
                fraction={`${analysis.counts.intersection} / ${analysis.counts.total}`}
                percent={formatPercent(analysis.probabilities.pAAndB)}
                tone="green"
              />
            </div>
            <div className="mt-4 rounded-[8px] border border-[#dedcff] bg-[#f8f7ff] px-4 py-3 font-mono text-[15px] leading-[1.45] font-black text-[#2924ff]">
              Selected view: {filterLabels[filter]} = {analysis.filterFraction} =
              {" "}
              {formatPercent(analysis.filterProbability)}
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <LessonTitle>4. Independence Verdict</LessonTitle>
            <div className={`mt-4 rounded-[8px] border px-4 py-3 ${verdictTone}`}>
              <p className="text-[15px] leading-[1.4] font-black">
                {comparisonCopy}
              </p>
              <p className="mt-1 text-[13px] leading-[1.4]">
                {scenario.intuition}
              </p>
            </div>
            <div className="mt-5 space-y-4">
              <ProbabilityBar
                label="P(B) before filtering"
                value={analysis.probabilities.pB}
                colorClass="bg-[#ff4f62]"
              />
              <ProbabilityBar
                label="P(B ∣ A) after filtering"
                value={analysis.probabilities.pBGivenA}
                colorClass="bg-[#352cff]"
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <FactPill
                label="Change"
                value={`${analysis.independenceDelta >= 0 ? "+" : ""}${formatPercent(
                  analysis.independenceDelta,
                )}`}
              />
              <FactPill
                label="Rule"
                value={analysis.isIndependent ? "P(B ∣ A) = P(B)" : "P(B ∣ A) ≠ P(B)"}
              />
            </div>
          </Panel>
        </div>

        <Panel className="p-5 sm:p-6">
          <LessonTitle>5. The Takeaway</LessonTitle>
          <div className="mt-4 rounded-[8px] border border-[#dedcff] bg-[#f8f7ff] px-4 py-4 text-[17px] leading-[1.45] font-bold text-[#2924ff]">
            Conditional probability changes the denominator first.
            Independence means the answer stays the same after filtering.
          </div>
        </Panel>
      </div>
    </main>
  );
}
