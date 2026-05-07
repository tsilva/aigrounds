"use client";

import { type CSSProperties, useMemo, useState } from "react";
import {
  analyzeDistribution,
  clampProbability,
  clampTrials,
  type DistributionAnalysis,
  type DistributionMode,
  type MassPoint,
} from "./bernoulli-categorical-binomial-engine";
import { comparisonRows, modeFacts, modeOrder } from "./scenario";

function formatProbability(value: number) {
  return value.toFixed(2);
}

function formatMetric(value: number) {
  return value.toFixed(3);
}

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

function FactPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[8px] border border-[#dfe4f4] bg-white px-3 py-2">
      <p className="text-[11px] font-black tracking-[0.03em] text-[#7180a5] uppercase">
        {label}
      </p>
      <p className="mt-1 break-words font-mono text-[13px] leading-tight font-bold text-[#071024]">
        {value}
      </p>
    </div>
  );
}

function ModeButton({
  mode,
  isSelected,
  onSelect,
}: {
  mode: DistributionMode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const fact = modeFacts[mode];

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
      <span className="block text-[12px] font-black uppercase tracking-[0.02em]">
        {fact.eyebrow}
      </span>
      <span className="mt-2 block text-[16px] leading-[1.2] font-black">
        {fact.title}
      </span>
      <span
        className={`mt-2 block text-[13px] leading-[1.35] ${
          isSelected ? "text-white/85" : "text-[#30446f]"
        }`}
      >
        {fact.question}
      </span>
    </button>
  );
}

function ShapePanel({
  mode,
  onSelectMode,
}: {
  mode: DistributionMode;
  onSelectMode: (mode: DistributionMode) => void;
}) {
  const fact = modeFacts[mode];

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="min-w-0">
          <LessonTitle>1. Choose The Outcome Shape</LessonTitle>
          <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
            The same probability mass can answer three different questions:
            one yes/no trial, one many-way choice, or a count after repeats.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {modeOrder.map((entryMode) => (
              <ModeButton
                key={entryMode}
                mode={entryMode}
                isSelected={entryMode === mode}
                onSelect={() => onSelectMode(entryMode)}
              />
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black tracking-[0.02em] text-[#352cff] uppercase">
            Current Contract
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FactPill label="Outcome" value={fact.targetShape} />
            <FactPill label="Parameter" value={fact.parameter} />
            <FactPill label="Support" value={fact.support} />
            <FactPill label="Question" value={fact.question} />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function FormulaPanel({ mode }: { mode: DistributionMode }) {
  const fact = modeFacts[mode];

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="min-w-0">
          <LessonTitle>2. Watch The Formula Morph</LessonTitle>
          <p className="mt-4 text-[16px] leading-[1.45] text-[#071024]">
            Change the shape first. The probability rule changes because the
            random variable asks for a different kind of outcome.
          </p>
          <div className="mt-4 min-w-0 overflow-hidden rounded-[8px] border border-[#dbe2f2] bg-[#fbfbff] px-4 py-5 text-center font-serif text-[22px] leading-[1.25] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:text-[27px]">
            {fact.formula}
          </div>
          <div className="mt-3 min-w-0 rounded-[8px] border border-[#dbe2f2] bg-white px-4 py-3 text-center font-mono text-[15px] leading-[1.35] font-black text-[#352cff]">
            {fact.simplified}
          </div>
        </div>

        <div className="min-w-0">
          <LessonTitle>Same Mass, Different Question</LessonTitle>
          <div className="mt-4 overflow-hidden rounded-[10px] border border-[#dfe4f4]">
            <div className="grid grid-cols-[1fr_1.15fr_1fr_0.8fr] bg-[#f7f8ff] text-[11px] font-black tracking-[0.03em] text-[#52628a] uppercase">
              <span className="p-3">Model</span>
              <span className="p-3">Asks</span>
              <span className="p-3">Parameter</span>
              <span className="p-3">Support</span>
            </div>
            {comparisonRows.map((row) => (
              <div
                key={row.mode}
                className={`grid grid-cols-[1fr_1.15fr_1fr_0.8fr] border-t border-[#dfe4f4] text-[13px] leading-[1.3] ${
                  row.mode === mode ? "bg-[#f6f4ff]" : "bg-white"
                }`}
              >
                <span className="p-3 font-black text-[#071024]">{row.label}</span>
                <span className="p-3 text-[#263a68]">{row.asks}</span>
                <span className="p-3 font-mono text-[#263a68]">
                  {row.parameter}
                </span>
                <span className="p-3 font-mono text-[#263a68]">
                  {row.support}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[8px] border border-[#dedcff] bg-[#f8f7ff] px-5 py-3 text-[15px] leading-[1.35] text-[#2924ff]">
            {fact.takeaway}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function SliderControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const progress = ((value - 0.05) / 0.9) * 100;

  return (
    <label className="block rounded-[10px] border border-[#dbe2f2] bg-[#fbfbff] px-4 py-3">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-black text-[#071024]">
          Success probability p
        </span>
        <input
          type="number"
          min={0.05}
          max={0.95}
          step={0.01}
          aria-label="Success probability value"
          value={formatProbability(value)}
          onChange={(event) =>
            onChange(clampProbability(Number(event.target.value)))
          }
          className="h-8 w-20 rounded-[8px] border border-[#d7def0] bg-white px-2 text-center font-mono text-[13px] font-black text-[#352cff] outline-none transition focus:border-[#6b55ff]"
        />
      </span>
      <input
        type="range"
        min={0.05}
        max={0.95}
        step={0.01}
        value={value}
        onChange={(event) => onChange(clampProbability(Number(event.target.value)))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dce1ec] accent-[#352cff] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#352cff] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#352cff]"
        style={
          {
            background: `linear-gradient(90deg, #352cff 0%, #352cff ${progress}%, #dce1ec ${progress}%, #dce1ec 100%)`,
          } as CSSProperties
        }
      />
    </label>
  );
}

function TrialStepper({
  value,
  isActive,
  onChange,
}: {
  value: number;
  isActive: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div
      className={`rounded-[10px] border px-4 py-3 ${
        isActive
          ? "border-[#dbe2f2] bg-[#fbfbff]"
          : "border-[#e6eaf4] bg-[#f8fafc] text-[#7280a0]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-black text-[#071024]">Trials n</p>
          <p className="mt-1 text-[12px] leading-tight text-[#52628a]">
            Only the count model repeats the trial.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!isActive}
            onClick={() => onChange(clampTrials(value - 1))}
            className="grid size-9 place-items-center rounded-[8px] border border-[#ccd5eb] bg-white text-[20px] leading-none font-black text-[#352cff] disabled:cursor-not-allowed disabled:text-[#aab4c8]"
            aria-label="Decrease trials"
          >
            -
          </button>
          <span className="w-10 text-center font-mono text-[17px] font-black text-[#071024]">
            {value}
          </span>
          <button
            type="button"
            disabled={!isActive}
            onClick={() => onChange(clampTrials(value + 1))}
            className="grid size-9 place-items-center rounded-[8px] border border-[#ccd5eb] bg-white text-[20px] leading-none font-black text-[#352cff] disabled:cursor-not-allowed disabled:text-[#aab4c8]"
            aria-label="Increase trials"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function OutcomeChips({ points }: { points: MassPoint[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {points.map((point) => (
        <span
          key={point.id}
          className={`rounded-full border px-3 py-1.5 font-mono text-[12px] font-black ${
            point.isTarget
              ? "border-[#9ee8b9] bg-[#effdf4] text-[#12823a]"
              : "border-[#dbe2f2] bg-white text-[#34466f]"
          }`}
        >
          {point.label}: {formatProbability(point.probability)}
        </span>
      ))}
    </div>
  );
}

function MassChart({ analysis }: { analysis: DistributionAnalysis }) {
  const maxProbability = Math.max(
    ...analysis.massPoints.map((point) => point.probability),
    0.01,
  );
  const columnWidth =
    analysis.mode === "binomial" ? "minmax(30px,1fr)" : "minmax(70px,1fr)";
  const chartMinWidth =
    analysis.mode === "binomial"
      ? `${Math.max(420, analysis.massPoints.length * 42)}px`
      : "100%";

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15px] font-black text-[#121a35]">
          {modeFacts[analysis.mode].simulatorTitle}
        </h3>
        <span className="font-mono text-[12px] font-black text-[#52628a]">
          total mass = 1.00
        </span>
      </div>
      <div className="overflow-x-auto rounded-[10px] border border-[#dfe4f4] bg-[#fbfbff] p-4">
        <div
          className="grid items-end gap-2"
          style={{
            gridTemplateColumns: `repeat(${analysis.massPoints.length}, ${columnWidth})`,
            minWidth: chartMinWidth,
          }}
        >
          {analysis.massPoints.map((point) => {
            const height = Math.max(8, (point.probability / maxProbability) * 178);

            return (
              <div
                key={point.id}
                className="grid h-[244px] grid-rows-[34px_184px_26px] justify-items-center"
              >
                <span
                  className="font-mono text-[12px] font-black"
                  style={{ color: point.isTarget ? point.tone : "#071024" }}
                >
                  {formatProbability(point.probability)}
                </span>
                <div className="flex h-[184px] items-end">
                  <div
                    className="w-8 rounded-t-[5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                    style={{
                      height,
                      background: point.isTarget
                        ? `linear-gradient(180deg, ${point.tone}, #13a044)`
                        : `linear-gradient(180deg, ${point.tone}, #a8b3c8)`,
                    }}
                  />
                </div>
                <span className="text-center font-mono text-[12px] font-black text-[#071024]">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
        <div
          className="mt-1 h-px bg-[#8b99bb]"
          style={{ minWidth: chartMinWidth }}
        />
      </div>
    </div>
  );
}

function SimulatorPanel({
  analysis,
  p,
  trials,
  onChangeP,
  onChangeTrials,
}: {
  analysis: DistributionAnalysis;
  p: number;
  trials: number;
  onChangeP: (value: number) => void;
  onChangeTrials: (value: number) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>3. Move The Mass</LessonTitle>
      <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.22fr)]">
        <div className="min-w-0">
          <div className="grid gap-3">
            <SliderControl value={p} onChange={onChangeP} />
            <TrialStepper
              value={trials}
              isActive={analysis.mode === "binomial"}
              onChange={onChangeTrials}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FactPill
              label="Expected value"
              value={formatMetric(analysis.expectedValue)}
            />
            <FactPill label="Variance" value={formatMetric(analysis.variance)} />
            <FactPill
              label="Highlighted mass"
              value={formatProbability(analysis.targetProbability)}
            />
            <FactPill label="Most likely" value={analysis.mostLikelyLabel} />
          </div>

          <div className="mt-4 rounded-[8px] border border-[#dedcff] bg-[#f8f7ff] px-4 py-3">
            <p className="text-[13px] font-black text-[#352cff] uppercase">
              Outcome mass
            </p>
            <div className="mt-3">
              <OutcomeChips points={analysis.massPoints} />
            </div>
          </div>
        </div>

        <MassChart analysis={analysis} />
      </div>
    </Panel>
  );
}

function TakeawayPanel({ analysis }: { analysis: DistributionAnalysis }) {
  const fact = modeFacts[analysis.mode];

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
        <div>
          <LessonTitle>4. Keep The Question Straight</LessonTitle>
          <p className="mt-4 text-[16px] leading-[1.45] text-[#16264e]">
            {fact.takeaway}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[10px] border border-[#dfe4f4] bg-[#fbfbff] p-4">
            <p className="text-[12px] font-black text-[#52628a] uppercase">
              One trial
            </p>
            <p className="mt-2 text-[16px] leading-tight font-black text-[#071024]">
              Bernoulli asks yes or no.
            </p>
          </div>
          <div className="rounded-[10px] border border-[#dfe4f4] bg-[#fbfbff] p-4">
            <p className="text-[12px] font-black text-[#52628a] uppercase">
              One choice
            </p>
            <p className="mt-2 text-[16px] leading-tight font-black text-[#071024]">
              Categorical picks one class.
            </p>
          </div>
          <div className="rounded-[10px] border border-[#dfe4f4] bg-[#fbfbff] p-4">
            <p className="text-[12px] font-black text-[#52628a] uppercase">
              Many repeats
            </p>
            <p className="mt-2 text-[16px] leading-tight font-black text-[#071024]">
              Binomial counts successes.
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function BernoulliCategoricalBinomialPlayground() {
  const [mode, setMode] = useState<DistributionMode>("bernoulli");
  const [p, setP] = useState(0.62);
  const [trials, setTrials] = useState(8);
  const analysis = useMemo(
    () => analyzeDistribution(mode, p, trials),
    [mode, p, trials],
  );

  return (
    <main className="min-h-screen bg-[#f7faff] px-4 py-6 text-[#071024] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px]">
        <header className="flex flex-col gap-4 pb-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-[42px] leading-[0.95] font-black tracking-normal text-[#060917] sm:text-[56px]">
              Bernoulli, Categorical & Binomial Lab
            </h1>
            <p className="mt-3 max-w-3xl text-[20px] leading-[1.25] font-semibold text-[#263f73] sm:text-[22px]">
              One trial, one choice, or many repeated trials: probability mass
              tells the story.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-[8px] border border-[#cbc8ff] bg-white/80 px-5 text-[15px] font-black text-[#2924ff] shadow-[0_12px_28px_rgba(61,54,255,0.05)]"
          >
            ? What are distributions?
          </button>
        </header>

        <div className="grid gap-4">
          <ShapePanel mode={mode} onSelectMode={setMode} />
          <FormulaPanel mode={mode} />
          <SimulatorPanel
            analysis={analysis}
            p={p}
            trials={trials}
            onChangeP={setP}
            onChangeTrials={setTrials}
          />
          <TakeawayPanel analysis={analysis} />
        </div>
      </div>
    </main>
  );
}
