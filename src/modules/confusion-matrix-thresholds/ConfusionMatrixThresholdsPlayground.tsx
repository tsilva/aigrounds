"use client";

import { type CSSProperties, useMemo, useState } from "react";
import {
  analyzeThreshold,
  describeTradeoff,
  formatDecimal,
  formatPercent,
  type ClassifiedExample,
  type ConfusionBucket,
  type ThresholdAnalysis,
} from "./confusion-matrix-thresholds-engine";
import {
  defaultThresholdScenario,
  thresholdScenarios,
  type ThresholdScenario,
} from "./scenario";

const bucketStyles: Record<
  ConfusionBucket,
  {
    label: string;
    title: string;
    className: string;
    dotClassName: string;
  }
> = {
  tp: {
    label: "TP",
    title: "True positive",
    className: "border-[#9fd9b4] bg-[#ecfff4] text-[#075f2b]",
    dotClassName: "bg-[#16a34a]",
  },
  fp: {
    label: "FP",
    title: "False positive",
    className: "border-[#ffc5a5] bg-[#fff3eb] text-[#a13b08]",
    dotClassName: "bg-[#f97316]",
  },
  fn: {
    label: "FN",
    title: "False negative",
    className: "border-[#ffb8c0] bg-[#fff0f2] text-[#b41425]",
    dotClassName: "bg-[#ff2525]",
  },
  tn: {
    label: "TN",
    title: "True negative",
    className: "border-[#d9e0ee] bg-[#f7f9fd] text-[#34415f]",
    dotClassName: "bg-[#94a3b8]",
  },
};

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[14px] border border-[#d8e0f3] bg-white/92 shadow-[0_18px_42px_rgba(26,38,80,0.05)] ${className}`}
    >
      {children}
    </section>
  );
}

function LessonTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[17px] leading-none font-black text-[#352cff] uppercase">
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
      <p className="mt-1 truncate font-mono text-[13px] font-bold text-[#071024]">
        {value}
      </p>
    </div>
  );
}

function ScenarioSelector({
  scenario,
  onSelectScenario,
}: {
  scenario: ThresholdScenario;
  onSelectScenario: (scenario: ThresholdScenario) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div className="min-w-0">
          <LessonTitle>1. Choose The Decision</LessonTitle>
          <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
            A threshold turns scores into yes/no decisions. Pick the setting,
            then move the cutoff until the mistakes change shape.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {thresholdScenarios.map((entry) => {
              const isSelected = entry.id === scenario.id;

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onSelectScenario(entry)}
                  className={`min-w-0 rounded-[10px] border p-4 text-left transition ${
                    isSelected
                      ? "border-[#5636f5] bg-[linear-gradient(180deg,#694bff,#4a27e8)] text-white shadow-[0_14px_24px_rgba(70,39,232,0.2)]"
                      : "border-[#d8e0f0] bg-white text-[#0d1429] hover:border-[#b9c4de] hover:bg-[#fbfaff]"
                  }`}
                >
                  <span className="block text-[13px] font-black uppercase tracking-[0.02em]">
                    {entry.label}
                  </span>
                  <span className="mt-2 block text-[16px] leading-[1.25] font-black">
                    {entry.shortLabel}
                  </span>
                  <span
                    className={`mt-2 block text-[13px] leading-[1.35] ${
                      isSelected ? "text-white/85" : "text-[#30446f]"
                    }`}
                  >
                    {entry.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black tracking-[0.02em] text-[#352cff] uppercase">
            Current Contract
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FactPill label="Positive means" value={scenario.positiveLabel} />
            <FactPill label="Negative means" value={scenario.negativeLabel} />
            <FactPill label="Score" value={scenario.scoreLabel} />
            <FactPill
              label="Decision"
              value={`score >= threshold`}
            />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ThresholdSlider({
  scenario,
  threshold,
  onThresholdChange,
}: {
  scenario: ThresholdScenario;
  threshold: number;
  onThresholdChange: (threshold: number) => void;
}) {
  const sliderFill = ((threshold - 0.05) / 0.9) * 100;
  const lowerThreshold = Math.max(0.05, threshold - 0.05);
  const raiseThreshold = Math.min(0.95, threshold + 0.05);

  return (
    <div className="rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <LessonTitle>2. Move The Threshold</LessonTitle>
          <p className="mt-3 text-[15px] leading-[1.4] text-[#263a68]">
            Scores on the left of the cutoff are predicted positive. Everything
            below the cutoff becomes predicted negative.
          </p>
        </div>
        <div className="flex items-stretch gap-2">
          <button
            type="button"
            onClick={() => onThresholdChange(lowerThreshold)}
            className="rounded-[10px] border border-[#d8e0f0] bg-white px-3 text-[18px] font-black text-[#352cff] transition hover:border-[#b9c4de] hover:bg-[#fbfaff]"
            aria-label="Lower threshold"
          >
            -
          </button>
          <div className="rounded-[10px] border border-[#dfe4f4] bg-white px-4 py-2 text-right">
            <p className="text-[11px] font-black tracking-[0.03em] text-[#7180a5] uppercase">
              Threshold
            </p>
            <p className="font-mono text-[22px] font-black text-[#352cff]">
              {threshold.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onThresholdChange(raiseThreshold)}
            className="rounded-[10px] border border-[#d8e0f0] bg-white px-3 text-[18px] font-black text-[#352cff] transition hover:border-[#b9c4de] hover:bg-[#fbfaff]"
            aria-label="Raise threshold"
          >
            +
          </button>
        </div>
      </div>
      <input
        id="threshold-slider"
        type="range"
        min="0.05"
        max="0.95"
        step="0.01"
        value={threshold}
        onChange={(event) => onThresholdChange(Number(event.target.value))}
        onInput={(event) =>
          onThresholdChange(Number(event.currentTarget.value))
        }
        className="mt-5 h-3 w-full cursor-pointer appearance-none rounded-full bg-[#dce2ef] accent-[#5236f2] outline-none"
        style={
          {
            background: `linear-gradient(90deg, #5236f2 ${sliderFill}%, #dce2ef ${sliderFill}%)`,
          } as CSSProperties
        }
        aria-label={`${scenario.thresholdLabel} threshold`}
      />
      <div className="mt-2 flex justify-between font-mono text-[11px] font-bold text-[#7180a5]">
        <span>0.05</span>
        <span>{scenario.thresholdLabel}</span>
        <span>0.95</span>
      </div>
    </div>
  );
}

function ScoreStrip({
  analysis,
  scenario,
}: {
  analysis: ThresholdAnalysis;
  scenario: ThresholdScenario;
}) {
  const sortedExamples = analysis.examples;

  return (
    <div className="rounded-[12px] border border-[#dbe2f2] bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <LessonTitle>Score Strip</LessonTitle>
        <div className="flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.03em]">
          <span className="rounded-full border border-[#9fd9b4] bg-[#ecfff4] px-2.5 py-1 text-[#075f2b]">
            Actual positive
          </span>
          <span className="rounded-full border border-[#d9e0ee] bg-[#f7f9fd] px-2.5 py-1 text-[#34415f]">
            Actual negative
          </span>
        </div>
      </div>
      <div className="relative mt-8 h-32 rounded-[10px] border border-[#e0e6f4] bg-[#fbfbff] px-3">
        <div className="absolute top-10 right-3 left-3 h-1 rounded-full bg-[#d8dfef]" />
        <div
          className="absolute top-4 bottom-4 w-1 rounded-full bg-[#352cff] shadow-[0_0_0_5px_rgba(53,44,255,0.12)]"
          style={{ left: `${(1 - analysis.threshold) * 100}%` }}
        >
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#352cff] px-2 py-1 font-mono text-[11px] font-black text-white">
            {analysis.threshold.toFixed(2)}
          </span>
        </div>
        {sortedExamples.map((example, index) => {
          const left = `${(1 - example.score) * 100}%`;
          const top = index % 2 === 0 ? "34px" : "68px";
          const isActualPositive = example.actual === "positive";

          return (
            <div
              key={example.id}
              className={`absolute flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 font-mono text-[11px] font-black shadow-sm ${
                isActualPositive
                  ? "border-[#16a34a] bg-[#dcfce7] text-[#075f2b]"
                  : "border-[#b9c3d8] bg-white text-[#34415f]"
              } ${
                example.predicted === "positive"
                  ? "ring-4 ring-[#352cff]/15"
                  : "opacity-75"
              }`}
              style={{ left, top }}
              title={`${example.label}: ${example.score.toFixed(2)}`}
            >
              {example.label.slice(0, 2)}
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {sortedExamples.slice(0, 8).map((example) => (
          <ExampleChip
            key={example.id}
            example={example}
            scenario={scenario}
          />
        ))}
      </div>
    </div>
  );
}

function ExampleChip({
  example,
  scenario,
}: {
  example: ClassifiedExample;
  scenario: ThresholdScenario;
}) {
  const bucketStyle = bucketStyles[example.bucket];

  return (
    <div
      className={`min-w-0 rounded-[8px] border px-3 py-2 ${bucketStyle.className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[12px] font-black">{example.label}</p>
        <span className="font-mono text-[12px] font-black">
          {example.score.toFixed(2)}
        </span>
      </div>
      <p className="mt-1 truncate text-[11px] font-bold">
        {bucketStyle.label}:{" "}
        {example.predicted === "positive"
          ? scenario.positiveLabel
          : scenario.negativeLabel}
      </p>
    </div>
  );
}

function ConfusionMatrix({
  analysis,
  scenario,
}: {
  analysis: ThresholdAnalysis;
  scenario: ThresholdScenario;
}) {
  const cells: Array<{
    bucket: ConfusionBucket;
    predicted: string;
    actual: string;
  }> = [
    {
      bucket: "tp",
      predicted: scenario.positiveLabel,
      actual: scenario.positiveLabel,
    },
    {
      bucket: "fp",
      predicted: scenario.positiveLabel,
      actual: scenario.negativeLabel,
    },
    {
      bucket: "fn",
      predicted: scenario.negativeLabel,
      actual: scenario.positiveLabel,
    },
    {
      bucket: "tn",
      predicted: scenario.negativeLabel,
      actual: scenario.negativeLabel,
    },
  ];

  return (
    <div className="rounded-[12px] border border-[#dbe2f2] bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <LessonTitle>Confusion Matrix</LessonTitle>
        <span className="font-mono text-[12px] font-black text-[#7180a5]">
          predicted x actual
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {cells.map((cell) => {
          const style = bucketStyles[cell.bucket];

          return (
            <div
              key={cell.bucket}
              className={`min-h-32 rounded-[10px] border p-4 ${style.className}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-black uppercase tracking-[0.03em]">
                  {style.title}
                </p>
                <span className="rounded-full bg-white/78 px-2 py-1 font-mono text-[12px] font-black">
                  {style.label}
                </span>
              </div>
              <p className="mt-4 font-mono text-[34px] leading-none font-black">
                {analysis.counts[cell.bucket]}
              </p>
              <p className="mt-3 text-[12px] leading-[1.35] font-bold">
                Predicted {cell.predicted}
                <br />
                Actually {cell.actual}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  formula,
  tone = "indigo",
}: {
  label: string;
  value: string;
  formula: string;
  tone?: "indigo" | "green" | "amber" | "red";
}) {
  const toneClassName = {
    indigo: "text-[#352cff]",
    green: "text-[#12a150]",
    amber: "text-[#d97706]",
    red: "text-[#ff2525]",
  }[tone];

  return (
    <div className="rounded-[10px] border border-[#dfe4f4] bg-white px-4 py-3">
      <p className="text-[11px] font-black tracking-[0.03em] text-[#7180a5] uppercase">
        {label}
      </p>
      <p className={`mt-2 font-mono text-[26px] leading-none font-black ${toneClassName}`}>
        {value}
      </p>
      <p className="mt-3 font-mono text-[11px] leading-[1.45] font-bold text-[#405177]">
        {formula}
      </p>
    </div>
  );
}

function MetricsPanel({ analysis }: { analysis: ThresholdAnalysis }) {
  const { counts, metrics } = analysis;

  return (
    <div className="rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <LessonTitle>Live Metrics</LessonTitle>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="Precision"
          value={formatPercent(metrics.precision)}
          formula={`TP / (TP + FP) = ${counts.tp} / ${counts.tp + counts.fp}`}
          tone={counts.fp > counts.fn ? "amber" : "green"}
        />
        <MetricCard
          label="Recall"
          value={formatPercent(metrics.recall)}
          formula={`TP / (TP + FN) = ${counts.tp} / ${counts.tp + counts.fn}`}
          tone={counts.fn > counts.fp ? "red" : "green"}
        />
        <MetricCard
          label="F1"
          value={formatDecimal(metrics.f1)}
          formula="2 * precision * recall / (precision + recall)"
        />
        <MetricCard
          label="Accuracy"
          value={formatPercent(metrics.accuracy)}
          formula={`(TP + TN) / all = ${counts.tp + counts.tn} / ${
            analysis.examples.length
          }`}
        />
      </div>
    </div>
  );
}

function ThresholdSimulator({
  scenario,
  analysis,
  threshold,
  onThresholdChange,
}: {
  scenario: ThresholdScenario;
  analysis: ThresholdAnalysis;
  threshold: number;
  onThresholdChange: (threshold: number) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="min-w-0 space-y-5">
          <ThresholdSlider
            scenario={scenario}
            threshold={threshold}
            onThresholdChange={onThresholdChange}
          />
          <ScoreStrip analysis={analysis} scenario={scenario} />
        </div>
        <div className="min-w-0 space-y-5">
          <ConfusionMatrix analysis={analysis} scenario={scenario} />
          <MetricsPanel analysis={analysis} />
        </div>
      </div>
    </Panel>
  );
}

function TakeawayPanel({
  analysis,
  scenario,
}: {
  analysis: ThresholdAnalysis;
  scenario: ThresholdScenario;
}) {
  const { counts, metrics } = analysis;
  const totalMistakes = counts.fp + counts.fn;

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="min-w-0">
          <LessonTitle>3. The Tradeoff</LessonTitle>
          <p className="mt-4 text-[16px] leading-[1.45] text-[#16264e]">
            {describeTradeoff(analysis)}
          </p>
          <div className="mt-4 rounded-[10px] border border-[#dcd7ff] bg-[#f8f7ff] p-4 text-[#2620c8]">
            <p className="font-mono text-[13px] font-black leading-[1.55]">
              Lower threshold = more predicted {scenario.positiveLabel}
              <br />
              Higher threshold = fewer predicted {scenario.positiveLabel}
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <FactPill
            label="False positives"
            value={`${counts.fp} extra ${scenario.positiveLabel.toLowerCase()}`}
          />
          <FactPill
            label="False negatives"
            value={`${counts.fn} missed ${scenario.positiveLabel.toLowerCase()}`}
          />
          <FactPill label="Mistakes" value={`${totalMistakes} total`} />
          <FactPill
            label="Positive queue"
            value={`${metrics.predictedPositive} examples`}
          />
          <FactPill
            label="Negative queue"
            value={`${metrics.predictedNegative} examples`}
          />
          <FactPill
            label="Best single score"
            value={`F1 ${formatDecimal(metrics.f1)}`}
          />
        </div>
      </div>
    </Panel>
  );
}

export function ConfusionMatrixThresholdsPlayground() {
  const [scenarioId, setScenarioId] = useState(defaultThresholdScenario.id);
  const scenario =
    thresholdScenarios.find((entry) => entry.id === scenarioId) ??
    defaultThresholdScenario;
  const [thresholds, setThresholds] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      thresholdScenarios.map((entry) => [entry.id, entry.defaultThreshold]),
    ),
  );
  const threshold = thresholds[scenario.id] ?? scenario.defaultThreshold;
  const analysis = useMemo(
    () => analyzeThreshold(scenario.examples, threshold),
    [scenario.examples, threshold],
  );

  function selectScenario(nextScenario: ThresholdScenario) {
    setScenarioId(nextScenario.id);
  }

  function updateThreshold(nextThreshold: number) {
    setThresholds((current) => ({
      ...current,
      [scenario.id]: nextThreshold,
    }));
  }

  return (
    <main className="min-h-screen bg-[#f8faff] px-4 py-5 text-[#071024] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
        <header className="flex flex-col gap-4 py-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[40px] leading-[0.95] font-black tracking-[-0.04em] text-[#050816] sm:text-[54px]">
              Confusion Matrix & Thresholds
            </h1>
            <p className="mt-3 max-w-3xl text-[17px] leading-[1.45] font-semibold text-[#314372]">
              One cutoff decides which mistakes you make: false positives above
              the line, false negatives below it.
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-2 rounded-[12px] border border-[#d8e0f3] bg-white/92 p-2 sm:min-w-[350px]">
            <FactPill
              label="Precision"
              value={formatPercent(analysis.metrics.precision)}
            />
            <FactPill
              label="Recall"
              value={formatPercent(analysis.metrics.recall)}
            />
          </div>
        </header>

        <ScenarioSelector
          scenario={scenario}
          onSelectScenario={selectScenario}
        />
        <ThresholdSimulator
          scenario={scenario}
          analysis={analysis}
          threshold={threshold}
          onThresholdChange={updateThreshold}
        />
        <TakeawayPanel analysis={analysis} scenario={scenario} />
      </div>
    </main>
  );
}
