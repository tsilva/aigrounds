"use client";

import { useMemo, useState } from "react";
import {
  analyzeBayesRule,
  type BayesAnalysis,
  type BayesGroup,
  type BayesInputs,
  type BayesMember,
  type BayesScenarioId,
} from "./bayes-rule-engine";
import { bayesScenarios, type BayesScenario } from "./scenario";

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
  scenario: BayesScenario;
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

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-[10px] border border-[#dbe2f2] bg-[#fbfbff] px-4 py-3">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-black text-[#071024]">{label}</span>
        <span className="font-mono text-[13px] font-black text-[#352cff]">
          {formatPercent(value)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-2 w-full accent-[#352cff]"
      />
    </label>
  );
}

function PresetButton({
  label,
  isSelected,
  onSelect,
}: {
  label: string;
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
      {label}
    </button>
  );
}

function PopulationGrid({ members }: { members: BayesMember[] }) {
  return (
    <div className="mt-5 overflow-x-auto pb-2">
      <div
        className="grid min-w-[640px] gap-[3px]"
        style={{ gridTemplateColumns: "repeat(40, minmax(0, 1fr))" }}
      >
        {members.map((member) => (
          <PopulationDot key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

function PopulationDot({ member }: { member: BayesMember }) {
  const tone = groupTone(member.group);

  return (
    <div
      className={`aspect-square rounded-[3px] border transition ${tone.dotClassName}`}
      title={tone.label}
    />
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
      <span className={`h-3 w-3 rounded-[3px] border ${className}`} />
      {label}
    </span>
  );
}

function FormulaBox({
  analysis,
  scenario,
}: {
  analysis: BayesAnalysis;
  scenario: BayesScenario;
}) {
  return (
    <div className="rounded-[10px] border border-[#dedcff] bg-[#f8f7ff] px-4 py-4">
      <p className="text-[11px] font-black tracking-[0.06em] text-[#7180a5] uppercase">
        Posterior
      </p>
      <p className="mt-2 font-mono text-[16px] leading-[1.45] font-black text-[#071024] sm:text-[19px]">
        P(real | positive) = true positives / all positives
      </p>
      <p className="mt-3 font-mono text-[18px] leading-[1.35] font-black text-[#352cff] sm:text-[24px]">
        {analysis.counts.truePositive} / {analysis.counts.positiveTests} ={" "}
        {formatPercent(analysis.rates.posterior)}
      </p>
      <p className="mt-3 text-[14px] leading-[1.45] font-bold text-[#314571]">
        A positive {scenario.title.toLowerCase()} result means{" "}
        {formatPercent(analysis.rates.posterior)} of positive cases are real.
      </p>
    </div>
  );
}

function BreakdownBar({
  label,
  count,
  total,
  colorClass,
}: {
  label: string;
  count: number;
  total: number;
  colorClass: string;
}) {
  const width = total === 0 ? 0 : (count / total) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-black text-[#071024]">{label}</p>
        <p className="font-mono text-[13px] font-black text-[#071024]">
          {count}
        </p>
      </div>
      <div className="mt-2 h-4 overflow-hidden rounded-full border border-[#dfe4f4] bg-[#f2f5fb]">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${Math.max(width, count > 0 ? 2 : 0)}%` }}
        />
      </div>
    </div>
  );
}

function groupTone(group: BayesGroup) {
  if (group === "true-positive") {
    return {
      label: "true positive",
      dotClassName:
        "border-[#18a45b] bg-[#24c26a] shadow-[0_0_0_1px_rgba(36,194,106,0.16)]",
    };
  }

  if (group === "false-positive") {
    return {
      label: "false positive",
      dotClassName:
        "border-[#ff405d] bg-[#ffedf0] shadow-[inset_0_0_0_1px_rgba(255,64,93,0.34)]",
    };
  }

  if (group === "false-negative") {
    return {
      label: "false negative",
      dotClassName:
        "border-[#f59e0b] bg-[#fff4d8] shadow-[inset_0_0_0_1px_rgba(245,158,11,0.32)]",
    };
  }

  return {
    label: "true negative",
    dotClassName: "border-[#d9e1f2] bg-white",
  };
}

export function BayesRulePlayground() {
  const [scenarioId, setScenarioId] = useState<BayesScenarioId>("medical");
  const scenario =
    bayesScenarios.find((entry) => entry.id === scenarioId) ??
    bayesScenarios[0];
  const [inputs, setInputs] = useState<BayesInputs>(scenario.defaultInputs);
  const analysis = useMemo(() => analyzeBayesRule(inputs), [inputs]);
  const positiveFalseShare =
    analysis.counts.positiveTests === 0
      ? 0
      : analysis.counts.falsePositive / analysis.counts.positiveTests;
  const posteriorTone =
    analysis.rates.posterior >= 0.5
      ? "border-[#bfe9cf] bg-[#f0fff6] text-[#0b7a3d]"
      : "border-[#ffe1a6] bg-[#fffaf0] text-[#a15f00]";

  function chooseScenario(nextScenarioId: BayesScenarioId) {
    const nextScenario =
      bayesScenarios.find((entry) => entry.id === nextScenarioId) ??
      bayesScenarios[0];

    setScenarioId(nextScenario.id);
    setInputs(nextScenario.defaultInputs);
  }

  function updateInput(key: keyof Pick<BayesInputs, "prevalence" | "sensitivity" | "falsePositiveRate">) {
    return (value: number) => {
      setInputs((current) => ({
        ...current,
        [key]: value,
      }));
    };
  }

  const presetInputs = [
    {
      label: "Rare",
      inputs: {
        ...inputs,
        prevalence: 0.001,
        sensitivity: 0.5,
        falsePositiveRate: 0.2,
      },
    },
    {
      label: "Balanced",
      inputs: {
        ...inputs,
        prevalence: 0.05,
        sensitivity: 0.8,
        falsePositiveRate: 0.05,
      },
    },
    {
      label: "Clean",
      inputs: {
        ...inputs,
        prevalence: 0.2,
        sensitivity: 0.99,
        falsePositiveRate: 0,
      },
    },
  ];
  const selectedPreset = presetInputs.find(
    (preset) =>
      preset.inputs.prevalence === inputs.prevalence &&
      preset.inputs.sensitivity === inputs.sensitivity &&
      preset.inputs.falsePositiveRate === inputs.falsePositiveRate,
  );

  return (
    <main className="min-h-screen bg-[#f7faff] px-4 py-5 text-[#071024] sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
        <header className="pb-1">
          <div className="min-w-0">
            <h1 className="text-[42px] leading-none font-black tracking-[-0.04em] text-[#070b1a] sm:text-[52px] lg:text-[60px]">
              Bayes Rule Playground
            </h1>
            <p className="mt-3 max-w-3xl text-[20px] leading-[1.35] font-bold text-[#314571] sm:text-[24px]">
              New evidence only makes sense after the base rate.
            </p>
          </div>
        </header>

        <Panel className="p-5 sm:p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.85fr)]">
            <div className="min-w-0">
              <LessonTitle>1. Choose The Signal</LessonTitle>
              <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
                Pick a rare-event story. Bayes asks how many real cases were
                possible before the positive signal arrived.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {bayesScenarios.map((entry) => (
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
                Current population
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <FactPill label="People" value={`${analysis.counts.total}`} />
                <FactPill
                  label="Real cases"
                  value={`${analysis.counts.condition} / ${analysis.counts.total}`}
                />
                <FactPill
                  label="Signal"
                  value={scenario.signalLabel}
                />
                <FactPill
                  label="Prior"
                  value={formatPercent(analysis.rates.prior)}
                />
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.55fr)]">
            <div className="min-w-0">
              <LessonTitle>2. Set Prior And Accuracy</LessonTitle>
              <p className="mt-4 max-w-[820px] text-[16px] leading-[1.45] text-[#16264e]">
                The prior creates real cases. Sensitivity catches real cases.
                False positives add extra positive signals from everyone else.
              </p>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <SliderControl
                  label="Prevalence"
                  min={0.001}
                  max={0.2}
                  step={0.001}
                  value={inputs.prevalence}
                  onChange={updateInput("prevalence")}
                />
                <SliderControl
                  label="Sensitivity"
                  min={0.5}
                  max={0.99}
                  step={0.01}
                  value={inputs.sensitivity}
                  onChange={updateInput("sensitivity")}
                />
                <SliderControl
                  label="False-positive rate"
                  min={0}
                  max={0.2}
                  step={0.001}
                  value={inputs.falsePositiveRate}
                  onChange={updateInput("falsePositiveRate")}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {presetInputs.map((preset) => (
                  <PresetButton
                    key={preset.label}
                    label={preset.label}
                    isSelected={selectedPreset?.label === preset.label}
                    onSelect={() => setInputs(preset.inputs)}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <FactPill
                label="True positives"
                value={`${analysis.counts.truePositive} caught`}
              />
              <FactPill
                label="False positives"
                value={`${analysis.counts.falsePositive} extra positives`}
              />
              <FactPill
                label="All positives"
                value={`${analysis.counts.positiveTests} signals`}
              />
              <FactPill
                label="False alarm share"
                value={formatPercent(positiveFalseShare)}
              />
            </div>
          </div>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <LessonTitle>3. Watch Evidence Sort</LessonTitle>
              <p className="mt-4 max-w-[820px] text-[16px] leading-[1.45] text-[#16264e]">
                Each square is one person. Positive signals split into real
                positives and false alarms.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <LegendSwatch
                className="border-[#18a45b] bg-[#24c26a]"
                label="true positive"
              />
              <LegendSwatch
                className="border-[#ff405d] bg-[#ffedf0]"
                label="false positive"
              />
              <LegendSwatch
                className="border-[#f59e0b] bg-[#fff4d8]"
                label="false negative"
              />
              <LegendSwatch
                className="border-[#d9e1f2] bg-white"
                label="true negative"
              />
            </div>
          </div>

          <PopulationGrid members={analysis.members} />

          <div className="mt-5 grid gap-4 lg:grid-cols-4">
            <BreakdownBar
              label="True positives"
              count={analysis.counts.truePositive}
              total={analysis.counts.total}
              colorClass="bg-[#24c26a]"
            />
            <BreakdownBar
              label="False positives"
              count={analysis.counts.falsePositive}
              total={analysis.counts.total}
              colorClass="bg-[#ff405d]"
            />
            <BreakdownBar
              label="False negatives"
              count={analysis.counts.falseNegative}
              total={analysis.counts.total}
              colorClass="bg-[#f59e0b]"
            />
            <BreakdownBar
              label="True negatives"
              count={analysis.counts.trueNegative}
              total={analysis.counts.total}
              colorClass="bg-[#7b8aa8]"
            />
          </div>
        </Panel>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.58fr)]">
          <Panel className="p-5 sm:p-6">
            <LessonTitle>4. Read The Posterior</LessonTitle>
            <div className="mt-5">
              <FormulaBox analysis={analysis} scenario={scenario} />
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <LessonTitle>5. The Takeaway</LessonTitle>
            <div className={`mt-4 rounded-[8px] border px-4 py-3 ${posteriorTone}`}>
              <p className="text-[15px] leading-[1.4] font-black">
                {scenario.takeaway}
              </p>
              <p className="mt-2 text-[13px] leading-[1.45]">
                The positive result is divided by every positive signal, not
                only by the real cases the test caught.
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <FactPill
                label="Bayes numerator"
                value={`${analysis.counts.truePositive} true positives`}
              />
              <FactPill
                label="Bayes denominator"
                value={`${analysis.counts.positiveTests} positives`}
              />
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
