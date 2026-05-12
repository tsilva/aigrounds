"use client";

import { useMemo, useState } from "react";
import {
  analyzeBatchNormalization,
  formatValue,
  valueToPercent,
  type NormalizationMode,
} from "./batch-normalization-engine";
import {
  batchNormalizationScenarios,
  defaultBatchScenario,
  type BatchScenario,
  type BatchScenarioId,
} from "./scenario";

const epsilon = 0.001;

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[12px] border border-[#c8d5f6] bg-white shadow-[0_14px_34px_rgba(58,88,160,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}

function LessonTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[19px] leading-none font-black text-[#1638ff] uppercase sm:text-[22px]">
      {children}
    </h2>
  );
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[7px] border border-[#c8d5f6] bg-white px-3 py-2 text-center font-mono text-[14px] font-black text-[#071024] sm:text-[15px]">
      <span className="text-[#4d5c82]">{label}</span> = {value}
    </div>
  );
}

function ScenarioSelector({
  activeScenario,
  onSelectScenario,
}: {
  activeScenario: BatchScenario;
  onSelectScenario: (id: BatchScenarioId) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[14px] font-bold text-[#101832]">Scenario</p>
      <div className="grid overflow-hidden rounded-[7px] border border-[#c8d5f6] sm:grid-cols-4">
        {batchNormalizationScenarios.map((scenario) => {
          const isActive = scenario.id === activeScenario.id;

          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelectScenario(scenario.id)}
              className={`min-h-11 border-[#c8d5f6] px-3 py-2 text-left transition sm:border-l sm:first:border-l-0 ${
                isActive
                  ? "bg-[#1638ff] text-white"
                  : "bg-white text-[#172347] hover:bg-[#f7f9ff]"
              }`}
            >
              <span className="block text-[14px] font-bold">{scenario.label}</span>
              <span
                className={`block text-[12px] leading-tight ${
                  isActive ? "text-white/78" : "text-[#526183]"
                }`}
              >
                {scenario.helper}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  ticks,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  ticks: string[];
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-[14px] font-bold text-[#101832]">
        <span>{label}</span>
        <span className="inline-grid grid-cols-[28px_minmax(58px,auto)_28px] overflow-hidden rounded-[6px] border border-[#c8d5f6] bg-white font-mono text-[13px] text-[#071024]">
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            onClick={(event) => {
              event.preventDefault();
              onChange(Math.max(min, Number((value - step).toFixed(3))));
            }}
            className="border-r border-[#c8d5f6] px-2 font-black text-[#1638ff] hover:bg-[#f7f9ff]"
          >
            −
          </button>
          <span className="px-2 py-1 text-center font-black">{displayValue}</span>
          <button
            type="button"
            aria-label={`Increase ${label}`}
            onClick={(event) => {
              event.preventDefault();
              onChange(Math.min(max, Number((value + step).toFixed(3))));
            }}
            className="border-l border-[#c8d5f6] px-2 font-black text-[#1638ff] hover:bg-[#f7f9ff]"
          >
            +
          </button>
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full accent-[#1638ff]"
      />
      <span className="mt-1 flex justify-between font-mono text-[12px] text-[#31406f]">
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </span>
    </label>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: NormalizationMode;
  onChange: (mode: NormalizationMode) => void;
}) {
  return (
    <div className="grid overflow-hidden rounded-[7px] border border-[#c8d5f6] sm:grid-cols-2">
      {(["training", "inference"] as const).map((item) => {
        const isActive = mode === item;

        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`px-4 py-2 text-[14px] font-black transition ${
              isActive
                ? "bg-[#1638ff] text-white"
                : "bg-white text-[#172347] hover:bg-[#f7f9ff]"
            }`}
          >
            {item === "training" ? "Training" : "Inference"}
          </button>
        );
      })}
    </div>
  );
}

function FormulaBox({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[8px] border border-[#c8d5f6] bg-[#f7f9ff] px-4 py-5 text-center font-mono text-[15px] leading-7 font-black text-[#071024] sm:text-[17px] ${className}`}
    >
      {children}
    </div>
  );
}

function DotStrip({
  title,
  values,
  min,
  max,
  ticks,
  center,
  centerLabel,
  activeIndex,
  onSelectIndex,
  valueLabelMode = "active",
}: {
  title: string;
  values: number[];
  min: number;
  max: number;
  ticks: number[];
  center: number;
  centerLabel: string;
  activeIndex?: number;
  onSelectIndex?: (index: number) => void;
  valueLabelMode?: "all" | "active" | "none";
}) {
  return (
    <div className="min-w-0">
      <p className="mb-7 text-center text-[15px] font-black text-[#071024]">
        {title}
      </p>
      <div className="relative mx-auto h-[112px] w-full max-w-[720px]">
        <div className="absolute inset-x-4 top-[48px] h-px bg-[#172347]" />
        <div
          className="absolute top-[14px] h-[70px] border-l-2 border-dashed border-[#1638ff]"
          style={{ left: `${valueToPercent(center, min, max)}%` }}
        >
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[12px] font-black text-[#1638ff]">
            {centerLabel}
          </span>
        </div>
        {ticks.map((tick) => (
          <div
            key={tick}
            className="absolute top-[48px] -translate-x-1/2"
            style={{ left: `${valueToPercent(tick, min, max)}%` }}
          >
            <span className="block h-2 w-px bg-[#7f89a5]" />
            <span className="mt-1 block font-mono text-[12px] text-[#23325e]">
              {tick}
            </span>
          </div>
        ))}
        {values.map((value, index) => {
          const left = `${valueToPercent(value, min, max)}%`;
          const isActive = index === activeIndex;

          return (
            <button
              key={`${value}-${index}`}
              type="button"
              onClick={() => onSelectIndex?.(index)}
              className="absolute top-[40px] -translate-x-1/2"
              style={{ left }}
              aria-label={`Inspect value ${formatValue(value)}`}
            >
              <span
                className={`block rounded-full ${
                  isActive
                    ? "size-5 border-2 border-white bg-[#ff2525] shadow-[0_0_0_3px_rgba(255,37,37,0.22)]"
                    : "size-3.5 bg-[#1638ff]"
                }`}
              />
              {valueLabelMode === "all" ||
              (valueLabelMode === "active" && isActive) ? (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-[4px] bg-white/90 px-1 font-mono text-[11px] font-bold text-[#071024]">
                  {formatValue(value, Math.abs(value) >= 10 ? 1 : 2)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ValueChips({
  label,
  values,
  activeIndex,
  onSelectIndex,
}: {
  label: string;
  values: number[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <span className="mr-1 text-[12px] font-bold text-[#31406f]">{label}</span>
      {values.map((value, index) => (
        <button
          key={`${value}-${index}`}
          type="button"
          onClick={() => onSelectIndex(index)}
          className={`rounded-[6px] border px-2 py-1 font-mono text-[12px] font-black transition ${
            index === activeIndex
              ? "border-[#ff2525] bg-[#fff1f1] text-[#ba1a1a]"
              : "border-[#c8d5f6] bg-white text-[#071024] hover:bg-[#f7f9ff]"
          }`}
        >
          {formatValue(value)}
        </button>
      ))}
    </div>
  );
}

function ComparisonTable({
  mode,
  analysisMean,
  analysisStd,
  runningMean,
  runningStd,
}: {
  mode: NormalizationMode;
  analysisMean: number;
  analysisStd: number;
  runningMean: number;
  runningStd: number;
}) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#c8d5f6] bg-white">
      <div className="grid grid-cols-2 border-b border-[#c8d5f6] text-center text-[14px] font-black text-[#071024]">
        <div
          className={`border-r border-[#c8d5f6] px-3 py-3 ${
            mode === "training" ? "bg-[#f2f5ff]" : ""
          }`}
        >
          Training path
        </div>
        <div className={`px-3 py-3 ${mode === "inference" ? "bg-[#f2f5ff]" : ""}`}>
          Inference path
        </div>
      </div>
      <div className="grid grid-cols-2 text-[13px] text-[#172347]">
        <div className="border-r border-[#c8d5f6] px-4 py-3">
          <p>Source: this mini-batch</p>
          <p className="mt-3 font-mono text-[15px] font-black">
            μ = {formatValue(analysisMean)}
          </p>
          <p className="font-mono text-[15px] font-black">
            σ = {formatValue(analysisStd)}
          </p>
        </div>
        <div className="px-4 py-3">
          <p>Source: saved training stats</p>
          <p className="mt-3 font-mono text-[15px] font-black">
            μ = {formatValue(runningMean)}
          </p>
          <p className="font-mono text-[15px] font-black">
            σ = {formatValue(runningStd)}
          </p>
        </div>
      </div>
    </div>
  );
}

function domainFor(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max(0.4, (max - min) * 0.08);

  return {
    min: Math.floor(min - padding),
    max: Math.ceil(max + padding),
  };
}

export function BatchNormalizationPlayground() {
  const [scenarioId, setScenarioId] = useState<BatchScenarioId>("centered");
  const [batchSize, setBatchSize] = useState(6);
  const [gamma, setGamma] = useState(1.2);
  const [beta, setBeta] = useState(-0.3);
  const [mode, setMode] = useState<NormalizationMode>("training");
  const [activeIndex, setActiveIndex] = useState(4);

  const scenario =
    batchNormalizationScenarios.find((item) => item.id === scenarioId) ??
    defaultBatchScenario;
  const analysis = useMemo(
    () =>
      analyzeBatchNormalization({
        values: scenario.values,
        batchSize,
        gamma,
        beta,
        epsilon,
        mode,
        runningMean: scenario.runningMean,
        runningStd: scenario.runningStd,
      }),
    [batchSize, beta, gamma, mode, scenario],
  );
  const safeActiveIndex = Math.min(activeIndex, analysis.rawValues.length - 1);
  const rawDomain = domainFor(analysis.rawValues);
  const outputDomain = domainFor(analysis.outputValues);
  const selectedRaw = analysis.rawValues[safeActiveIndex];
  const selectedZ = analysis.normalizedValues[safeActiveIndex];
  const selectedY = analysis.outputValues[safeActiveIndex];
  const formulaVariance = analysis.normalizationStd ** 2;

  function selectScenario(nextScenarioId: BatchScenarioId) {
    setScenarioId(nextScenarioId);
    setActiveIndex((current) => Math.min(current, batchSize - 1));
  }

  function updateBatchSize(nextBatchSize: number) {
    setBatchSize(nextBatchSize);
    setActiveIndex((current) => Math.min(current, nextBatchSize - 1));
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfcff] px-3 py-4 text-[#071024] sm:px-5">
      <div className="mx-auto max-w-[1536px]">
        <header className="mb-4 pl-0 sm:pl-6">
          <h1 className="min-w-0 break-words text-[38px] leading-[1] font-black tracking-[-0.055em] text-[#030713] sm:text-[52px]">
            Batch Normalization Lab
          </h1>
          <p className="mt-2 max-w-[58rem] text-[18px] leading-tight font-medium text-[#30446f] sm:text-[22px]">
            Normalize a mini-batch, then learn scale (γ) and shift (β).
          </p>
        </header>

        <div className="grid gap-3 sm:gap-4">
          <Panel className="p-5 sm:p-6">
            <LessonTitle>1. Shape The Mini-Batch</LessonTitle>
            <div className="mt-4 grid gap-6 lg:grid-cols-[430px_minmax(0,1fr)_170px] lg:items-center">
              <div className="space-y-5">
                <ScenarioSelector
                  activeScenario={scenario}
                  onSelectScenario={selectScenario}
                />
                <p className="text-[12px] leading-snug font-semibold text-[#526183]">
                  Guide path: start Centered, switch to Shifted. Wide and
                  Outlier are optional stress tests.
                </p>
                <SliderControl
                  label="Batch size"
                  value={batchSize}
                  min={4}
                  max={8}
                  step={1}
                  displayValue={String(batchSize)}
                  ticks={["4", "5", "6", "7", "8"]}
                  onChange={updateBatchSize}
                />
              </div>
              <DotStrip
                title={`Raw activations x (${batchSize} examples)`}
                values={analysis.rawValues}
                min={rawDomain.min}
                max={rawDomain.max}
                ticks={Array.from(
                  { length: rawDomain.max - rawDomain.min + 1 },
                  (_, index) => rawDomain.min + index,
                )}
                center={analysis.mean}
                centerLabel={`μ = ${formatValue(analysis.mean)}`}
                activeIndex={safeActiveIndex}
                onSelectIndex={setActiveIndex}
                valueLabelMode="active"
              />
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                <StatPill label="μ_batch" value={formatValue(analysis.mean)} />
                <StatPill label="σ_batch" value={formatValue(analysis.std)} />
                <StatPill label="ε" value={formatValue(epsilon, 3)} />
              </div>
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <LessonTitle>2. Normalize With Batch Stats</LessonTitle>
            <div className="mt-4 grid gap-6 2xl:grid-cols-[330px_minmax(0,1fr)_170px] 2xl:items-center">
              <FormulaBox>
                z = (x - mu) /<br />
                sqrt(var + epsilon)
              </FormulaBox>
              <div className="min-w-0">
                <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)]">
                  <DotStrip
                    title={`Raw x (${scenario.label.toLowerCase()})`}
                    values={analysis.rawValues}
                    min={rawDomain.min}
                    max={rawDomain.max}
                    ticks={[rawDomain.min, analysis.mean, rawDomain.max]}
                    center={analysis.mean}
                    centerLabel={`μ=${formatValue(analysis.mean)}`}
                    activeIndex={safeActiveIndex}
                    onSelectIndex={setActiveIndex}
                    valueLabelMode="none"
                  />
                  <div className="hidden text-center text-[34px] font-black text-[#071024] md:block">
                    →
                  </div>
                  <DotStrip
                    title="Normalized z (centered)"
                    values={analysis.normalizedValues}
                    min={-2.5}
                    max={2.5}
                    ticks={[-2, -1, 0, 1, 2]}
                    center={0}
                    centerLabel="z=0"
                    activeIndex={safeActiveIndex}
                    onSelectIndex={setActiveIndex}
                    valueLabelMode="none"
                  />
                </div>
                <div className="mt-2 grid gap-2 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
                  <ValueChips
                    label="z values"
                    values={analysis.normalizedValues}
                    activeIndex={safeActiveIndex}
                    onSelectIndex={setActiveIndex}
                  />
                  <div className="rounded-[8px] border border-[#c8d5f6] bg-[#f7f9ff] px-3 py-2 font-mono text-[12px] font-bold text-[#071024]">
                    {formatValue(selectedZ)} = ({formatValue(selectedRaw)} -{" "}
                    {formatValue(analysis.normalizationMean)}) / sqrt(
                    {formatValue(formulaVariance)} + ε)
                  </div>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 2xl:grid-cols-1">
                <StatPill
                  label="mean(z)"
                  value={`≈ ${formatValue(
                    analysis.normalizedValues.reduce((a, b) => a + b, 0) /
                      analysis.normalizedValues.length,
                  )}`}
                />
                <StatPill
                  label="std(z)"
                  value={`≈ ${formatValue(
                    Math.sqrt(
                      analysis.normalizedValues.reduce(
                        (total, value) => total + value ** 2,
                        0,
                      ) / analysis.normalizedValues.length,
                    ),
                  )}`}
                />
                <StatPill
                  label="var used"
                  value={`${formatValue(formulaVariance)} = σ_used²`}
                />
              </div>
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <LessonTitle>3. Let The Layer Learn γ And β</LessonTitle>
            <div className="mt-4 grid gap-6 2xl:grid-cols-[330px_340px_minmax(0,1fr)_170px] 2xl:items-center">
              <FormulaBox>
                y = gamma * z + beta
                <br />
                <span className="text-[13px] text-[#30446f]">
                  {formatValue(selectedY)} = {formatValue(gamma)} *{" "}
                  {formatValue(selectedZ)} + {formatValue(beta)}
                </span>
              </FormulaBox>
              <div className="space-y-4">
                <SliderControl
                  label="γ (scale)"
                  value={gamma}
                  min={0.5}
                  max={2}
                  step={0.05}
                  displayValue={formatValue(gamma)}
                  ticks={["0.50", "1.00", "1.50", "2.00"]}
                  onChange={setGamma}
                />
                <SliderControl
                  label="β (shift)"
                  value={beta}
                  min={-2}
                  max={2}
                  step={0.05}
                  displayValue={formatValue(beta)}
                  ticks={["-2", "-1", "0", "1", "2"]}
                  onChange={setBeta}
                />
                <p className="text-[12px] leading-snug font-semibold text-[#526183]">
                  γ changes spread; β moves every y value left or right.
                </p>
              </div>
              <div className="min-w-0">
                <DotStrip
                  title="Output y (after affine)"
                  values={analysis.outputValues}
                  min={outputDomain.min}
                  max={outputDomain.max}
                  ticks={Array.from(
                    { length: outputDomain.max - outputDomain.min + 1 },
                    (_, index) => outputDomain.min + index,
                  )}
                  center={analysis.outputMean}
                  centerLabel={`μy=${formatValue(analysis.outputMean)}`}
                  activeIndex={safeActiveIndex}
                  onSelectIndex={setActiveIndex}
                  valueLabelMode="none"
                />
                <ValueChips
                  label="y values"
                  values={analysis.outputValues}
                  activeIndex={safeActiveIndex}
                  onSelectIndex={setActiveIndex}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <StatPill label="mean(y)" value={`≈ ${formatValue(analysis.outputMean)}`} />
                <StatPill label="std(y)" value={`≈ ${formatValue(analysis.outputStd)}`} />
                <p className="rounded-[7px] border border-[#c8d5f6] bg-[#f7f9ff] px-3 py-2 text-center text-[13px] font-bold text-[#30446f] sm:col-span-2 2xl:col-span-1">
                  γ stretches; β shifts.
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <LessonTitle>4. Compare Training To Inference</LessonTitle>
            <div className="mt-4 grid gap-6 2xl:grid-cols-[280px_minmax(0,560px)_220px] 2xl:items-start">
              <ModeToggle mode={mode} onChange={setMode} />
              <ComparisonTable
                mode={mode}
                analysisMean={analysis.mean}
                analysisStd={analysis.std}
                runningMean={scenario.runningMean}
                runningStd={scenario.runningStd}
              />
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                <StatPill
                  label="using μ"
                  value={formatValue(analysis.normalizationMean)}
                />
                <StatPill
                  label="using σ"
                  value={formatValue(analysis.normalizationStd)}
                />
                <StatPill label="momentum" value="0.10" />
                <p className="rounded-[7px] border border-[#c8d5f6] bg-[#f7f9ff] px-3 py-2 text-center text-[12px] leading-snug font-bold text-[#30446f] sm:col-span-3 2xl:col-span-1">
                  Momentum controls how running stats update during training;
                  here it is fixed context.
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-[8px] border border-[#9db3ff] bg-[#f5f7ff] px-4 py-3 text-center font-mono text-[14px] font-black text-[#1638ff] sm:text-[16px]">
              Takeaway: Normalize for stable signal; γ and β keep expressiveness.
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
