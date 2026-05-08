"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  clientXToPercentValue,
  useStackedPointLayout,
} from "@/lib/number-line";
import {
  analyzeRangeQuartiles,
  clampValue,
  movePoint,
  type RangePoint,
  type FiveNumberSummary,
  type RangeQuartileAnalysis,
} from "./range-quartiles-iqr-engine";
import {
  initialRangePreset,
  pointsForPreset,
  rangePresets,
  type RangePreset,
} from "./scenario";

function formatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function sortedPointsFor(points: RangePoint[]) {
  return [...points].sort((left, right) => {
    if (left.value === right.value) {
      return left.label.localeCompare(right.label);
    }

    return left.value - right.value;
  });
}

function middleHalves(sortedValues: number[]) {
  const middle = Math.floor(sortedValues.length / 2);

  return {
    lowerHalf: sortedValues.slice(0, middle),
    upperHalf:
      sortedValues.length % 2 === 0
        ? sortedValues.slice(middle)
        : sortedValues.slice(middle + 1),
  };
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

function PresetButton({
  preset,
  isSelected,
  onSelect,
}: {
  preset: RangePreset;
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
      <p className="mt-1 break-words font-mono text-[13px] leading-[1.35] font-bold text-[#071024]">
        {value}
      </p>
    </div>
  );
}

function NumberLine({
  points,
  activePointId,
  selectedPointId,
  trackRef,
  onPointStart,
  onPointStep,
  onSelectPoint,
}: {
  points: RangePoint[];
  activePointId: string | null;
  selectedPointId: string;
  trackRef: RefObject<HTMLDivElement | null>;
  onPointStart: (pointId: string) => void;
  onPointStep: (pointId: string, delta: number) => void;
  onSelectPoint: (pointId: string) => void;
}) {
  const stackOffsets = useStackedPointLayout(points);
  const sortedPoints = sortedPointsFor(points);
  const outlierIds = new Set(
    points.filter((point) => point.role === "outlier").map((point) => point.id),
  );

  return (
    <div className="mt-6 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <div
        ref={trackRef}
        className="relative h-[176px] select-none overflow-hidden rounded-[10px] bg-white px-4"
      >
        <div className="absolute right-4 left-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#cfd8ec]" />
        {[0, 25, 50, 75, 100].map((tick) => (
          <div
            key={tick}
            className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-[#9aa8c5]"
            style={{ left: `calc(1rem + (100% - 2rem) * ${tick / 100})` }}
          >
            <span className="absolute top-5 left-1/2 -translate-x-1/2 font-mono text-[11px] font-bold text-[#52628a]">
              {tick}
            </span>
          </div>
        ))}
        {points.map((point) => {
          const isActive = activePointId === point.id;
          const isSelected = selectedPointId === point.id;
          const isOutlier = outlierIds.has(point.id);
          const topOffset = stackOffsets.get(point.id) ?? 0;

          return (
            <button
              key={point.id}
              type="button"
              aria-label={`${point.label} value ${point.value}`}
              onClick={() => onSelectPoint(point.id)}
              onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
                const step = event.shiftKey ? 10 : 1;

                if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                  event.preventDefault();
                  onPointStep(point.id, -step);
                }

                if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                  event.preventDefault();
                  onPointStep(point.id, step);
                }
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                onPointStart(point.id);
              }}
              className={`absolute z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full border-2 bg-white font-mono text-[12px] font-black text-[#071024] shadow-[0_10px_20px_rgba(26,38,80,0.13)] transition active:cursor-grabbing ${
                isActive || isSelected
                  ? "scale-110 border-[#352cff]"
                  : "border-white"
              } ${isOutlier ? "ring-4 ring-[#ef4444]/20" : ""}`}
              style={
                {
                  left: `calc(1rem + (100% - 2rem) * ${point.value / 100})`,
                  top: `calc(50% + ${topOffset}px)`,
                  background: `linear-gradient(180deg, #ffffff 0%, ${
                    isOutlier ? "#ef4444" : point.color
                  } 270%)`,
                } as CSSProperties
              }
            >
              {point.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {sortedPoints.map((point) => (
          <button
            key={point.id}
            type="button"
            onClick={() => onSelectPoint(point.id)}
            className={`rounded-full border px-2.5 py-1 font-mono text-[12px] font-black transition ${
              selectedPointId === point.id
                ? "border-[#352cff] bg-[#f2f0ff] text-[#2924ff]"
                : point.role === "outlier"
                  ? "border-[#fecaca] bg-[#fff1f1] text-[#b91c1c]"
                  : "border-[#dfe4f4] bg-white text-[#263a68]"
            }`}
          >
            {point.label}:{point.value}
          </button>
        ))}
      </div>
    </div>
  );
}

function DatasetPanel({
  activePreset,
  points,
  analysis,
  activePointId,
  selectedPointId,
  trackRef,
  onSelectPreset,
  onPointStart,
  onPointStep,
  onSelectPoint,
}: {
  activePreset: RangePreset;
  points: RangePoint[];
  analysis: RangeQuartileAnalysis;
  activePointId: string | null;
  selectedPointId: string;
  trackRef: RefObject<HTMLDivElement | null>;
  onSelectPreset: (preset: RangePreset) => void;
  onPointStart: (pointId: string) => void;
  onPointStep: (pointId: string, delta: number) => void;
  onSelectPoint: (pointId: string) => void;
}) {
  const { lowerHalf, upperHalf } = middleHalves(analysis.sortedValues);
  const markedOutlierPoints = points.filter(
    (point) => point.role === "outlier",
  );
  const medianPoint =
    analysis.sortedPoints[Math.floor(analysis.sortedPoints.length / 2)];

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(320px,0.56fr)]">
        <div className="min-w-0">
          <LessonTitle>1. Shape The Data</LessonTitle>
          <p className="mt-4 max-w-[820px] text-[16px] leading-[1.45] text-[#16264e]">
            Move the dots on the number line. The sorted order decides the
            quartiles.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {rangePresets.map((preset) => (
              <PresetButton
                key={preset.id}
                preset={preset}
                isSelected={preset.id === activePreset.id}
                onSelect={() => onSelectPreset(preset)}
              />
            ))}
          </div>
          <NumberLine
            points={points}
            activePointId={activePointId}
            selectedPointId={selectedPointId}
            trackRef={trackRef}
            onPointStart={onPointStart}
            onPointStep={onPointStep}
            onSelectPoint={onSelectPoint}
          />
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black text-[#352cff] uppercase">
            Current Dataset
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <FactPill label="Count" value={String(analysis.count)} />
            <FactPill
              label="Sorted values"
              value={analysis.sortedValues.join(", ")}
            />
            <FactPill
              label="Quartile halves"
              value={`lower: ${lowerHalf.join(", ")} | upper: ${upperHalf.join(
                ", ",
              )}`}
            />
            <FactPill
              label="Median held out"
              value={
                medianPoint
                  ? `${medianPoint.label}:${formatValue(medianPoint.value)}`
                  : "none"
              }
            />
            <FactPill
              label="Marked far point"
              value={
                markedOutlierPoints.length > 0
                  ? markedOutlierPoints
                      .map((point) => `${point.label}:${point.value}`)
                      .join(", ")
                  : "none"
              }
            />
          </div>
          <div className="mt-4 rounded-[8px] border border-[#dedcff] bg-white px-4 py-3 text-[15px] leading-[1.35] text-[#2924ff]">
            Q1 comes from the lower half, Q3 from the upper half. Drag a dot,
            or select it and use arrow keys.
          </div>
        </div>
      </div>
    </Panel>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[#dfe4f4] bg-white px-3 py-2">
      <p className="text-[11px] font-black text-[#7180a5] uppercase">{label}</p>
      <p className="mt-1 font-mono text-[18px] leading-none font-black text-[#071024]">
        {value}
      </p>
    </div>
  );
}

function BoxPlot({
  summary,
  outlierPoints,
}: {
  summary: FiveNumberSummary;
  outlierPoints: RangePoint[];
}) {
  const boxWidth = Math.max(1, summary.q3 - summary.q1);

  return (
    <div className="rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <div className="relative h-[230px] overflow-hidden rounded-[10px] bg-white px-4">
        <div className="absolute right-4 left-4 top-[54%] h-px bg-[#a8b4ce]" />
        {[0, 25, 50, 75, 100].map((tick) => (
          <div
            key={tick}
            className="absolute top-[54%] h-3 w-px bg-[#9aa8c5]"
            style={{ left: `calc(1rem + (100% - 2rem) * ${tick / 100})` }}
          >
            <span className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[11px] font-bold text-[#52628a]">
              {tick}
            </span>
          </div>
        ))}
        <div
          className="absolute top-[54%] h-1.5 -translate-y-1/2 rounded-full bg-[#ef4444]"
          style={{
            left: `calc(1rem + (100% - 2rem) * ${summary.min / 100})`,
            width: `calc((100% - 2rem) * ${Math.max(1, summary.max - summary.min) / 100})`,
          }}
        />
        <div
          className="absolute top-[54%] h-20 -translate-y-1/2 rounded-[10px] border-2 border-[#352cff] bg-[#eef0ff]"
          style={{
            left: `calc(1rem + (100% - 2rem) * ${summary.q1 / 100})`,
            width: `calc((100% - 2rem) * ${boxWidth / 100})`,
          }}
        />
        <div
          className="absolute top-[54%] h-24 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#071024]"
          style={{
            left: `calc(1rem + (100% - 2rem) * ${summary.median / 100})`,
          }}
        />
        {[summary.min, summary.max].map((value) => (
          <div
            key={value}
            className="absolute top-[54%] h-16 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ef4444]"
            style={{
              left: `calc(1rem + (100% - 2rem) * ${value / 100})`,
            }}
          />
        ))}
        {outlierPoints.map((point, index) => (
          <div
            key={point.id}
            className="absolute grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full border-2 border-white bg-[#ef4444] font-mono text-[11px] font-black text-white shadow-[0_8px_16px_rgba(239,68,68,0.24)]"
            style={{
              left: `calc(1rem + (100% - 2rem) * ${point.value / 100})`,
              top: `${20 + index * 26}px`,
            }}
          >
            {point.label}
          </div>
        ))}
        <SummaryLabel label="min" value={summary.min} y="78%" />
        <SummaryLabel label="Q1" value={summary.q1} y="24%" />
        <SummaryLabel label="median" value={summary.median} y="14%" />
        <SummaryLabel label="Q3" value={summary.q3} y="24%" />
        <SummaryLabel label="max" value={summary.max} y="78%" />
      </div>
    </div>
  );
}

function SummaryLabel({
  label,
  value,
  y,
}: {
  label: string;
  value: number;
  y: string;
}) {
  return (
    <div
      className="absolute -translate-x-1/2 rounded-[7px] border border-[#dfe4f4] bg-white px-2 py-1 text-center shadow-[0_8px_16px_rgba(26,38,80,0.06)]"
      style={{ left: `calc(1rem + (100% - 2rem) * ${value / 100})`, top: y }}
    >
      <p className="text-[10px] leading-none font-black text-[#7180a5] uppercase">
        {label}
      </p>
      <p className="mt-1 font-mono text-[12px] leading-none font-black text-[#071024]">
        {formatValue(value)}
      </p>
    </div>
  );
}

function SummaryPanel({
  analysis,
  points,
}: {
  analysis: RangeQuartileAnalysis;
  points: RangePoint[];
}) {
  const outlierPoints = points.filter((point) => point.role === "outlier");

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <LessonTitle>2. Read The Five-Number Summary</LessonTitle>
          <p className="mt-4 max-w-[860px] text-[16px] leading-[1.45] text-[#16264e]">
            The box plot compresses the sorted data into min, Q1, median, Q3,
            and max. With 9 values, the median sits between the two halves.
          </p>
          <div className="mt-5">
            <BoxPlot summary={analysis} outlierPoints={outlierPoints} />
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[13px] font-black text-[#352cff] uppercase">
            Live Metrics
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MetricCell label="Minimum" value={formatValue(analysis.min)} />
            <MetricCell label="Q1" value={formatValue(analysis.q1)} />
            <MetricCell label="Median" value={formatValue(analysis.median)} />
            <MetricCell label="Q3" value={formatValue(analysis.q3)} />
            <MetricCell label="Maximum" value={formatValue(analysis.max)} />
            <MetricCell
              label="Range"
              value={`${formatValue(analysis.max)} - ${formatValue(
                analysis.min,
              )} = ${formatValue(analysis.range)}`}
            />
            <MetricCell
              label="IQR"
              value={`${formatValue(analysis.q3)} - ${formatValue(
                analysis.q1,
              )} = ${formatValue(analysis.iqr)}`}
            />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ComparisonTrack({
  label,
  value,
  start,
  width,
  color,
  story,
}: {
  label: string;
  value: string;
  start: number;
  width: number;
  color: string;
  story: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[13px] font-black text-[#52628a] uppercase">
            {label}
          </p>
          <p className="mt-1 text-[14px] leading-[1.35] text-[#263a68]">
            {story}
          </p>
        </div>
        <p className="font-mono text-[28px] leading-none font-black" style={{ color }}>
          {value}
        </p>
      </div>
      <div className="relative mt-5 h-12 rounded-[8px] bg-white px-3">
        <div className="absolute right-3 left-3 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#d4dcef]" />
        <div
          className="absolute top-1/2 h-5 -translate-y-1/2 rounded-full"
          style={{
            left: `calc(0.75rem + (100% - 1.5rem) * ${start / 100})`,
            width: `calc((100% - 1.5rem) * ${Math.max(width, 1) / 100})`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function ChangePanel({ analysis }: { analysis: RangeQuartileAnalysis }) {
  const takeaway =
    analysis.rangeJump > 8
      ? "Range jumped, but IQR stayed focused on the middle 50%."
      : "Range uses the extremes. IQR uses Q3 - Q1.";

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.45fr)] xl:items-start">
        <div className="min-w-0">
          <LessonTitle>3. See What Changes</LessonTitle>
          <p className="mt-4 max-w-[860px] text-[16px] leading-[1.45] text-[#16264e]">
            Range spans the full dataset. IQR measures only the box between Q1
            and Q3.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <ComparisonTrack
              label="Range"
              value={formatValue(analysis.range)}
              start={analysis.min}
              width={analysis.range}
              color="#ef4444"
              story={analysis.story.range}
            />
            <ComparisonTrack
              label="IQR"
              value={formatValue(analysis.iqr)}
              start={analysis.q1}
              width={analysis.iqr}
              color="#16a34a"
              story={analysis.story.iqr}
            />
          </div>
        </div>

        <div className="rounded-[12px] border border-[#dedcff] bg-[#f8f7ff] p-5">
          <p className="text-[13px] font-black text-[#352cff] uppercase">
            Takeaway
          </p>
          <p className="mt-4 text-[26px] leading-[1.08] font-black text-[#071024]">
            The middle box is the point.
          </p>
          <p className="mt-3 text-[16px] leading-[1.45] text-[#263a68]">
            {takeaway}
          </p>
          <div className="mt-5 rounded-[8px] border border-[#dedcff] bg-white px-4 py-3 font-mono text-[13px] leading-[1.45] font-bold text-[#2924ff]">
            IQR = Q3 - Q1 = {formatValue(analysis.q3)} -{" "}
            {formatValue(analysis.q1)} = {formatValue(analysis.iqr)}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function PercentilePanel({
  analysis,
  points,
  selectedPointId,
  onSelectPoint,
}: {
  analysis: RangeQuartileAnalysis;
  points: RangePoint[];
  selectedPointId: string;
  onSelectPoint: (pointId: string) => void;
}) {
  const sortedPoints = sortedPointsFor(points);
  const selectedPoint =
    points.find((point) => point.id === selectedPointId) ?? points[0]!;
  const valuesBelow = analysis.sortedValues.filter(
    (value) => value < selectedPoint.value,
  ).length;

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
        <div className="min-w-0">
          <LessonTitle>4. Percentile Check</LessonTitle>
          <p className="mt-4 max-w-[820px] text-[16px] leading-[1.45] text-[#16264e]">
            Pick a dot to see where it lands in the sorted list.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-9">
            {sortedPoints.map((point) => (
              <button
                key={point.id}
                type="button"
                onClick={() => onSelectPoint(point.id)}
                className={`min-h-20 rounded-[10px] border px-3 py-2 text-center transition ${
                  selectedPointId === point.id
                    ? "border-[#5636f5] bg-[linear-gradient(180deg,#694bff,#4a27e8)] text-white shadow-[0_12px_22px_rgba(70,39,232,0.18)]"
                    : "border-[#d8e0f0] bg-white text-[#0d1429] hover:border-[#b9c4de]"
                }`}
              >
                <span className="block font-mono text-[16px] font-black">
                  {point.label}
                </span>
                <span className="mt-1 block font-mono text-[13px] font-bold">
                  {point.value}
                </span>
                <span
                  className={`mt-2 block text-[11px] font-black uppercase ${
                    selectedPointId === point.id
                      ? "text-white/85"
                      : "text-[#7180a5]"
                  }`}
                >
                  rank {sortedPoints.findIndex((item) => item.id === point.id) + 1}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black text-[#352cff] uppercase">
            Selected Value
          </p>
          <div className="mt-4 flex items-center justify-between gap-4 rounded-[10px] border border-[#dfe4f4] bg-white px-4 py-3">
            <div>
              <p className="text-[13px] font-black text-[#071024]">
                Point {analysis.selected.label}
              </p>
              <p className="mt-1 font-mono text-[13px] font-bold text-[#52628a]">
                value = {analysis.selected.value}
              </p>
            </div>
            <p className="font-mono text-[34px] leading-none font-black text-[#16a34a]">
              {formatPercent(analysis.selected.percentileRank)}
            </p>
          </div>
          <div className="mt-4 rounded-[8px] border border-[#e4e8f4] bg-white px-4 py-3 font-mono text-[13px] leading-[1.55] font-bold text-[#071024]">
            percentile rank = values at or below / n
            <br />
            = {analysis.selected.atOrBelow} / {analysis.count}
            <br />= {formatPercent(analysis.selected.percentileRank)}
          </div>
          <p className="mt-4 text-[15px] leading-[1.4] text-[#263a68]">
            {valuesBelow} values are below this point, and{" "}
            {analysis.selected.atOrBelow} are at or below it.
          </p>
        </div>
      </div>
    </Panel>
  );
}

export function RangeQuartilesIqrPlayground() {
  const [activePreset, setActivePreset] = useState(initialRangePreset);
  const [points, setPoints] = useState(() =>
    pointsForPreset(initialRangePreset),
  );
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [selectedPointId, setSelectedPointId] = useState("point-9");
  const trackRef = useRef<HTMLDivElement | null>(null);
  const analysis = useMemo(
    () => analyzeRangeQuartiles(points, selectedPointId),
    [points, selectedPointId],
  );

  const updatePointFromClientX = useCallback(
    (clientX: number) => {
      if (!activePointId || !trackRef.current) {
        return;
      }

      const nextValue = clampValue(
        clientXToPercentValue(clientX, trackRef.current.getBoundingClientRect()),
      );

      setPoints((currentPoints) =>
        movePoint(currentPoints, activePointId, nextValue),
      );
    },
    [activePointId],
  );

  useEffect(() => {
    if (!activePointId) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      updatePointFromClientX(event.clientX);
    }

    function handlePointerUp() {
      setActivePointId(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [activePointId, updatePointFromClientX]);

  function handleSelectPreset(preset: RangePreset) {
    setActivePreset(preset);
    setPoints(pointsForPreset(preset));
    setSelectedPointId("point-9");
    setActivePointId(null);
  }

  function handlePointStart(pointId: string) {
    setActivePointId(pointId);
    setSelectedPointId(pointId);
  }

  function handlePointStep(pointId: string, delta: number) {
    setActivePointId(pointId);
    setSelectedPointId(pointId);
    setPoints((currentPoints) => {
      const point = currentPoints.find((item) => item.id === pointId);

      if (!point) {
        return currentPoints;
      }

      return movePoint(currentPoints, pointId, point.value + delta);
    });
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f7f9ff] px-4 py-5 text-[#071024] sm:px-7 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1536px] flex-col gap-4">
        <header className="py-1">
          <div>
            <h1 className="text-[40px] leading-[0.98] font-black text-[#070b1a] sm:text-[56px]">
              {"Range, Quartiles & IQR Explorer"}
            </h1>
            <p className="mt-3 max-w-4xl text-[18px] leading-[1.35] font-semibold text-[#30446f] sm:text-[21px]">
              Move values around and watch extremes stretch range while the
              middle 50% defines IQR.
            </p>
          </div>
        </header>

        <DatasetPanel
          activePreset={activePreset}
          points={points}
          analysis={analysis}
          activePointId={activePointId}
          selectedPointId={selectedPointId}
          trackRef={trackRef}
          onSelectPreset={handleSelectPreset}
          onPointStart={handlePointStart}
          onPointStep={handlePointStep}
          onSelectPoint={setSelectedPointId}
        />
        <SummaryPanel analysis={analysis} points={points} />
        <ChangePanel analysis={analysis} />
        <PercentilePanel
          analysis={analysis}
          points={points}
          selectedPointId={selectedPointId}
          onSelectPoint={setSelectedPointId}
        />
      </div>
    </main>
  );
}
