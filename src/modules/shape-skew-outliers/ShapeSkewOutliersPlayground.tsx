"use client";

import { useMemo, useState } from "react";
import {
  analyzeShape,
  clampShapeValue,
  type FiveNumberSummary,
  type HistogramBin,
  type ShapeAnalysis,
} from "./shape-skew-outliers-engine";
import {
  initialShapePreset,
  shapePresets,
  type ShapePreset,
} from "./scenario";

function formatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatSigned(value: number) {
  const formatted = Math.abs(value).toFixed(1);

  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `-${formatted}`;
  }

  return "0.0";
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
      className={`rounded-[14px] border border-[#d8e0f3] bg-white shadow-[0_18px_42px_rgba(26,38,80,0.05)] ${className}`}
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

function ShapeButton({
  preset,
  isSelected,
  onSelect,
}: {
  preset: ShapePreset;
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
      <span className="block text-[13px] font-black uppercase">
        {preset.label}
      </span>
      <span className="mt-2 block text-[16px] leading-[1.25] font-black">
        {preset.shortLabel}
      </span>
      <span
        className={`mt-2 block text-[13px] leading-[1.35] ${
          isSelected ? "text-white/85" : "text-[#30446f]"
        }`}
      >
        {preset.description}
      </span>
    </button>
  );
}

function FactPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[8px] border border-[#dfe4f4] bg-white px-3 py-2">
      <p className="text-[11px] font-black text-[#7180a5] uppercase">{label}</p>
      <p className="mt-1 truncate font-mono text-[13px] font-bold text-[#071024]">
        {value}
      </p>
    </div>
  );
}

function MetricCell({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "red" | "green" | "blue";
}) {
  const color = {
    neutral: "#071024",
    red: "#ef4444",
    green: "#16a34a",
    blue: "#352cff",
  }[tone];

  return (
    <div className="rounded-[8px] border border-[#dfe4f4] bg-white px-3 py-2">
      <p className="text-[11px] font-black text-[#7180a5] uppercase">{label}</p>
      <p
        className="mt-1 font-mono text-[18px] leading-none font-black"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}

function ShapePickerPanel({
  activePreset,
  analysis,
  onSelectPreset,
}: {
  activePreset: ShapePreset;
  analysis: ShapeAnalysis;
  onSelectPreset: (preset: ShapePreset) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.98fr)_minmax(320px,0.52fr)]">
        <div className="min-w-0">
          <LessonTitle>1. Choose The Shape</LessonTitle>
          <p className="mt-4 max-w-[820px] text-[16px] leading-[1.45] text-[#16264e]">
            Pick the pile-up pattern first. The same summaries can mean
            different things when the shape changes.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {shapePresets.map((preset) => (
              <ShapeButton
                key={preset.id}
                preset={preset}
                isSelected={preset.id === activePreset.id}
                onSelect={() => onSelectPreset(preset)}
              />
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black text-[#352cff] uppercase">
            Current Shape
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <FactPill label="Tail direction" value={activePreset.tailDirection} />
            <FactPill label="Pile-up zone" value={activePreset.pileUpZone} />
            <FactPill label="Outlier" value={`${analysis.outlier.value}`} />
            <FactPill label="Robust read" value={activePreset.robustSummary} />
          </div>
          <div className="mt-4 rounded-[8px] border border-[#dedcff] bg-white px-4 py-3 text-[15px] leading-[1.35] text-[#2924ff]">
            {analysis.story.skew}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Histogram({
  bins,
  maxBinCount,
  outlierPercent,
  mean,
  median,
}: {
  bins: HistogramBin[];
  maxBinCount: number;
  outlierPercent: number;
  mean: number;
  median: number;
}) {
  const markers = [
    {
      id: "mean",
      label: "mean",
      value: mean,
      color: "#ef4444",
      offsetClassName: "top-0 -translate-x-full",
    },
    {
      id: "median",
      label: "median",
      value: median,
      color: "#16a34a",
      offsetClassName: "top-5 translate-x-1",
    },
  ];

  return (
    <div className="rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <div className="relative h-[300px] overflow-hidden rounded-[10px] bg-white px-4 pb-10 pt-8">
        <div className="absolute right-4 bottom-10 left-4 h-px bg-[#a8b4ce]" />
        {[0, 25, 50, 75, 100].map((tick) => (
          <div
            key={tick}
            className="absolute bottom-10 h-3 w-px bg-[#9aa8c5]"
            style={{ left: `calc(1rem + (100% - 2rem) * ${tick / 100})` }}
          >
            <span className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[11px] font-bold text-[#52628a]">
              {tick}
            </span>
          </div>
        ))}

        <div
          className="absolute top-5 bottom-10 w-px bg-[#ef4444]/45"
          style={{ left: `calc(1rem + (100% - 2rem) * ${outlierPercent / 100})` }}
        />
        <div
          className="absolute top-4 -translate-x-1/2 rounded-full border border-[#fecaca] bg-[#fff1f1] px-2 py-1 font-mono text-[11px] font-black text-[#ef4444]"
          style={{ left: `calc(1rem + (100% - 2rem) * ${outlierPercent / 100})` }}
        >
          outlier
        </div>

        {markers.map((marker) => (
          <div
            key={marker.id}
            className="absolute top-9 bottom-10 w-0.5"
            style={{
              left: `calc(1rem + (100% - 2rem) * ${marker.value / 100})`,
              backgroundColor: marker.color,
            }}
          >
            <span
              className={`absolute rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-black whitespace-nowrap ${marker.offsetClassName}`}
              style={{ color: marker.color, border: `1px solid ${marker.color}` }}
            >
              {marker.label}
            </span>
          </div>
        ))}

        <div className="absolute right-4 bottom-10 left-4 flex h-[216px] gap-1.5">
          {bins.map((bin) => {
            const height = (bin.count / maxBinCount) * 100;
            const hasOutlier = bin.outlierCount > 0;

            return (
              <div
                key={bin.id}
                className="relative min-w-0 flex-1"
              >
                <span
                  className="absolute left-1/2 -translate-x-1/2 font-mono text-[11px] font-black text-[#071024]"
                  style={{
                    bottom: `calc(${Math.max(height, bin.count > 0 ? 8 : 0)}% + 4px)`,
                  }}
                >
                  {bin.count > 0 ? bin.count : ""}
                </span>
                <div
                  className={`absolute right-0 bottom-0 left-0 rounded-t-[7px] ${
                    hasOutlier
                      ? "bg-[linear-gradient(180deg,#ef4444,#ff8a8a)]"
                      : "bg-[linear-gradient(180deg,#352cff,#4f7cff)]"
                  }`}
                  style={{ height: `${Math.max(height, bin.count > 0 ? 8 : 0)}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BoxPlot({ summary }: { summary: FiveNumberSummary }) {
  const labels = [
    { label: "min", value: summary.min },
    { label: "Q1", value: summary.q1 },
    { label: "median", value: summary.median },
    { label: "Q3", value: summary.q3 },
    { label: "max", value: summary.max },
  ];

  return (
    <div className="rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[13px] font-black text-[#52628a] uppercase">
          Box plot
        </p>
        <p className="text-[13px] leading-[1.35] text-[#52628a]">
          Middle box = IQR; whisker = full range.
        </p>
      </div>
      <div className="relative h-24 rounded-[10px] bg-white px-4">
        <div className="absolute right-4 left-4 top-1/2 h-px bg-[#a8b4ce]" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#ef4444]"
          style={{
            left: `calc(1rem + (100% - 2rem) * ${summary.min / 100})`,
            width: `calc((100% - 2rem) * ${Math.max(summary.range, 1) / 100})`,
          }}
        />
        <div
          className="absolute top-1/2 h-9 -translate-y-1/2 rounded-[7px] border-2 border-[#352cff] bg-[#eef0ff]"
          style={{
            left: `calc(1rem + (100% - 2rem) * ${summary.q1 / 100})`,
            width: `calc((100% - 2rem) * ${Math.max(summary.iqr, 1) / 100})`,
          }}
        />
        <div
          className="absolute top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#071024]"
          style={{
            left: `calc(1rem + (100% - 2rem) * ${summary.median / 100})`,
          }}
        />
        {labels.map((item) => (
          <div
            key={item.label}
            className="absolute bottom-2 -translate-x-1/2 text-center font-mono text-[10px] font-black text-[#52628a]"
            style={{ left: `calc(1rem + (100% - 2rem) * ${item.value / 100})` }}
          >
            <span className="block uppercase">{item.label}</span>
            <span className="block text-[#071024]">{formatValue(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WatchShapePanel({
  activePreset,
  outlierValue,
  analysis,
  onOutlierChange,
}: {
  activePreset: ShapePreset;
  outlierValue: number;
  analysis: ShapeAnalysis;
  onOutlierChange: (value: number) => void;
}) {
  const quickValues = [
    { label: "Low tail", value: 6 },
    { label: "Center", value: 50 },
    { label: "High tail", value: 94 },
  ];

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <LessonTitle>2. Watch The Shape Change</LessonTitle>
          <p className="mt-4 max-w-[860px] text-[16px] leading-[1.45] text-[#16264e]">
            Move one red value. The histogram shows where values pile up, while
            the metrics reveal which summaries get pulled.
          </p>
          <div className="mt-5">
            <Histogram
              bins={analysis.histogram}
              maxBinCount={analysis.maxBinCount}
              outlierPercent={analysis.outlierPercent}
              mean={analysis.mean}
              median={analysis.median}
            />
          </div>
          <div className="mt-4">
            <BoxPlot summary={analysis} />
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[13px] font-black text-[#352cff] uppercase">
            Set The Dataset
          </p>
          <div className="mt-3 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="outlier-position"
                className="text-[13px] font-black text-[#52628a] uppercase"
              >
                Outlier position
              </label>
              <span className="rounded-[7px] border border-[#fecaca] bg-white px-3 py-1 font-mono text-[15px] font-black text-[#ef4444]">
                {outlierValue}
              </span>
            </div>
            <input
              id="outlier-position"
              type="range"
              min="0"
              max="100"
              value={outlierValue}
              onChange={(event) => onOutlierChange(Number(event.target.value))}
              className="mt-5 h-2 w-full accent-[#352cff]"
            />
            <div className="mt-3 flex justify-between font-mono text-[11px] font-bold text-[#52628a]">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {quickValues.map((item) => {
                const isActive = Math.abs(outlierValue - item.value) <= 2;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onOutlierChange(item.value)}
                    className={`rounded-[8px] border px-3 py-2 text-[13px] font-black transition ${
                      isActive
                        ? "border-[#5636f5] bg-[#352cff] text-white shadow-[0_10px_20px_rgba(53,44,255,0.16)]"
                        : "border-[#d8e0f0] bg-white text-[#263a68] hover:border-[#b9c4de]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MetricCell label="Mean" value={analysis.mean.toFixed(1)} tone="red" />
            <MetricCell
              label="Median"
              value={formatValue(analysis.median)}
              tone="green"
            />
            <MetricCell label="Range" value={formatValue(analysis.range)} tone="red" />
            <MetricCell label="IQR" value={formatValue(analysis.iqr)} tone="green" />
          </div>
          <div className="mt-4 rounded-[8px] border border-[#dedcff] bg-white px-4 py-3 text-[15px] leading-[1.35] text-[#2924ff]">
            {activePreset.shortLabel}: {analysis.story.tail}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function MiniHistogram({
  values,
  outlierValue,
}: {
  values: number[];
  outlierValue: number;
}) {
  const analysis = analyzeShape(values, outlierValue);

  return (
    <div className="flex h-14 items-end gap-1 rounded-[8px] border border-[#dbe2f2] bg-white px-2 py-2">
      {analysis.histogram.map((bin) => (
        <div
          key={bin.id}
          className={`min-w-0 flex-1 rounded-t-[4px] ${
            bin.outlierCount > 0 ? "bg-[#ef4444]" : "bg-[#4f7cff]"
          }`}
          style={{
            height: `${Math.max((bin.count / analysis.maxBinCount) * 100, bin.count > 0 ? 8 : 0)}%`,
          }}
        />
      ))}
    </div>
  );
}

function MiniBoxPlot({ summary }: { summary: FiveNumberSummary }) {
  return (
    <div className="relative h-14 rounded-[8px] border border-[#dbe2f2] bg-white px-3">
      <div className="absolute right-3 left-3 top-1/2 h-px bg-[#a8b4ce]" />
      <div
        className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#ef4444]"
        style={{
          left: `calc(0.75rem + (100% - 1.5rem) * ${summary.min / 100})`,
          width: `calc((100% - 1.5rem) * ${Math.max(summary.range, 1) / 100})`,
        }}
      />
      <div
        className="absolute top-1/2 h-7 -translate-y-1/2 rounded-[6px] border-2 border-[#352cff] bg-[#eef0ff]"
        style={{
          left: `calc(0.75rem + (100% - 1.5rem) * ${summary.q1 / 100})`,
          width: `calc((100% - 1.5rem) * ${Math.max(summary.iqr, 1) / 100})`,
        }}
      />
      <div
        className="absolute top-1/2 h-9 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#071024]"
        style={{
          left: `calc(0.75rem + (100% - 1.5rem) * ${summary.median / 100})`,
        }}
      />
    </div>
  );
}

function IntuitionRow({
  label,
  values,
  outlierValue,
  note,
  tone,
}: {
  label: string;
  values: number[];
  outlierValue: number;
  note: string;
  tone: "green" | "amber" | "red";
}) {
  const analysis = analyzeShape(values, outlierValue);
  const color = {
    green: "#16a34a",
    amber: "#f59e0b",
    red: "#ef4444",
  }[tone];

  return (
    <div className="grid gap-3 border-b border-[#e4e8f4] py-4 last:border-b-0 lg:grid-cols-[170px_minmax(160px,0.6fr)_minmax(160px,0.6fr)_minmax(0,1fr)] lg:items-center">
      <div>
        <p className="text-[16px] font-black text-[#071024]">{label}</p>
        <p className="mt-1 font-mono text-[12px] font-bold" style={{ color }}>
          mean {analysis.mean.toFixed(1)} / median {formatValue(analysis.median)}
        </p>
      </div>
      <MiniHistogram values={values} outlierValue={outlierValue} />
      <MiniBoxPlot summary={analysis} />
      <p className="text-[15px] leading-[1.4] text-[#263a68]">{note}</p>
    </div>
  );
}

function IntuitionPanel({ activePreset, analysis }: {
  activePreset: ShapePreset;
  analysis: ShapeAnalysis;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>3. The Intuition</LessonTitle>
      <p className="mt-4 max-w-[860px] text-[16px] leading-[1.45] text-[#16264e]">
        A histogram shows the pile-up and the tail. A box plot shows whether the
        middle half changed.
      </p>
      <div className="mt-5 overflow-hidden rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] px-4">
        <IntuitionRow
          label="Balanced"
          values={shapePresets[0]!.values}
          outlierValue={54}
          note="Mean, median, range, and IQR all describe the same calm center."
          tone="green"
        />
        <IntuitionRow
          label="Skewed"
          values={activePreset.values}
          outlierValue={activePreset.defaultOutlier}
          note="The long tail pulls the mean before it rewrites the middle."
          tone="amber"
        />
        <IntuitionRow
          label="Outlier added"
          values={activePreset.values}
          outlierValue={analysis.outlier.value}
          note="One red value can stretch the range while median and IQR stay steadier."
          tone="red"
        />
      </div>
    </Panel>
  );
}

function ComparisonBar({
  label,
  value,
  baseValue,
  color,
}: {
  label: string;
  value: number;
  baseValue: number;
  color: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-black text-[#52628a] uppercase">
            {label}
          </p>
          <p className="mt-1 text-[14px] leading-[1.35] text-[#263a68]">
            Before {formatValue(baseValue)}; now {formatValue(value)}
          </p>
        </div>
        <p className="font-mono text-[24px] leading-none font-black" style={{ color }}>
          {formatSigned(value - baseValue)}
        </p>
      </div>
      <div className="mt-5 grid gap-2">
        <div className="relative h-4 rounded-full bg-white">
          <div
            className="h-4 rounded-full bg-[#b8c4dd]"
            style={{ width: `${Math.max(2, baseValue)}%` }}
          />
        </div>
        <div className="relative h-4 rounded-full bg-white">
          <div
            className="h-4 rounded-full"
            style={{ width: `${Math.max(2, value)}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}

function ComparePanel({ analysis }: { analysis: ShapeAnalysis }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(280px,0.55fr)]">
      <Panel className="p-5 sm:p-6">
        <LessonTitle>4. Compare Summaries</LessonTitle>
        <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
          Sensitive summaries listen to the edge. Robust summaries keep reading
          the middle.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <ComparisonBar
            label="Mean"
            value={analysis.mean}
            baseValue={analysis.baseMean}
            color="#ef4444"
          />
          <ComparisonBar
            label="Median"
            value={analysis.median}
            baseValue={analysis.baseSummary.median}
            color="#16a34a"
          />
          <ComparisonBar
            label="Range"
            value={analysis.range}
            baseValue={analysis.baseSummary.range}
            color="#ef4444"
          />
          <ComparisonBar
            label="IQR"
            value={analysis.iqr}
            baseValue={analysis.baseSummary.iqr}
            color="#16a34a"
          />
        </div>
      </Panel>

      <Panel className="p-5 sm:p-6">
        <LessonTitle>5. Takeaway</LessonTitle>
        <p className="mt-5 text-[30px] leading-[1.05] font-black text-[#071024]">
          Shape shows the story that one number hides.
        </p>
        <div className="mt-5 grid gap-3">
          <div className="rounded-[8px] border border-[#fecaca] bg-[#fff7f7] px-4 py-3 text-[15px] leading-[1.35] text-[#991b1b]">
            {analysis.story.sensitivity}
          </div>
          <div className="rounded-[8px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-[15px] leading-[1.35] text-[#166534]">
            {analysis.story.robust}
          </div>
          <div className="rounded-[8px] border border-[#dedcff] bg-white px-4 py-3 font-mono text-[13px] leading-[1.45] font-bold text-[#2924ff]">
            mean - median = {analysis.mean.toFixed(1)} -{" "}
            {formatValue(analysis.median)} ={" "}
            {formatSigned(analysis.meanMedianGap)}
          </div>
        </div>
      </Panel>
    </div>
  );
}

export function ShapeSkewOutliersPlayground() {
  const [activePreset, setActivePreset] = useState(initialShapePreset);
  const [outlierValue, setOutlierValue] = useState(
    initialShapePreset.defaultOutlier,
  );
  const analysis = useMemo(
    () => analyzeShape(activePreset.values, outlierValue),
    [activePreset, outlierValue],
  );

  function handleSelectPreset(preset: ShapePreset) {
    setActivePreset(preset);
    setOutlierValue(preset.defaultOutlier);
  }

  return (
    <main className="min-h-screen bg-[#f7f9ff] px-4 py-5 text-[#071024] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1536px]">
        <header className="mb-5">
          <div>
            <h1 className="text-[42px] leading-[0.95] font-black tracking-[-0.02em] text-[#071024] sm:text-[56px]">
              Shape, Skew & Outliers Lab
            </h1>
            <p className="mt-3 max-w-[900px] text-[19px] leading-[1.35] font-semibold text-[#2d4270] sm:text-[22px]">
              See the pile-up, tail, and outlier before trusting one summary.
            </p>
          </div>
        </header>

        <div className="grid gap-4">
          <ShapePickerPanel
            activePreset={activePreset}
            analysis={analysis}
            onSelectPreset={handleSelectPreset}
          />
          <WatchShapePanel
            activePreset={activePreset}
            outlierValue={outlierValue}
            analysis={analysis}
            onOutlierChange={(value) => setOutlierValue(clampShapeValue(value))}
          />
          <IntuitionPanel activePreset={activePreset} analysis={analysis} />
          <ComparePanel analysis={analysis} />
        </div>
      </div>
    </main>
  );
}
