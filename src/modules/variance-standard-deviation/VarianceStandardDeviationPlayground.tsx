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
import { clientXToPercentValue } from "@/lib/number-line";
import {
  analyzeSpread,
  clampValue,
  movePoint,
  type DataPoint,
  type DeviationRow,
  type SpreadAnalysis,
} from "./variance-standard-deviation-engine";
import {
  initialSpreadPreset,
  pointsForPreset,
  spreadPresets,
  type SpreadPreset,
} from "./scenario";

function formatValue(value: number, digits = 1) {
  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
}

function formatSigned(value: number) {
  if (Math.abs(value) < 0.05) {
    return "0.0";
  }

  return `${value > 0 ? "+" : "-"}${Math.abs(value).toFixed(1)}`;
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

function PresetButton({
  preset,
  isSelected,
  onSelect,
}: {
  preset: SpreadPreset;
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

function NumberLine({
  points,
  analysis,
  activePointId,
  trackRef,
  onPointStart,
  onPointStep,
}: {
  points: DataPoint[];
  analysis: SpreadAnalysis;
  activePointId: string | null;
  trackRef: RefObject<HTMLDivElement | null>;
  onPointStart: (pointId: string, clientX: number) => void;
  onPointStep: (pointId: string, delta: number) => void;
}) {
  const stackOffsets = useMemo(() => {
    const sortedPoints = points
      .slice()
      .sort((left, right) => left.value - right.value);
    const laneValues: number[] = [];
    const offsets = new Map<string, number>();
    const laneOffsets = [0, -46, -92, -138, 46, 92, 138];

    for (const point of sortedPoints) {
      const laneIndex = laneValues.findIndex(
        (value) => Math.abs(point.value - value) >= 9,
      );
      const nextLaneIndex = laneIndex === -1 ? laneValues.length : laneIndex;

      laneValues[nextLaneIndex] = point.value;
      offsets.set(
        point.id,
        laneOffsets[nextLaneIndex] ?? -(nextLaneIndex * 30),
      );
    }

    return offsets;
  }, [points]);
  const rowsByPoint = new Map(
    analysis.rows.map((row) => [row.point.id, row]),
  );
  const axisTop = 76;

  return (
    <div className="mt-6 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <div
        ref={trackRef}
        className="relative h-[260px] select-none overflow-hidden rounded-[10px] bg-white px-4"
      >
        <div className="absolute top-5 right-4 left-4 bottom-[68px] rounded-[10px] border border-[#eef2fb] bg-[#fbfcff]" />
        <div
          className="absolute right-4 left-4 h-1 -translate-y-1/2 rounded-full bg-[#cfd8ec]"
          style={{ top: `${axisTop}%` }}
        />
        {[0, 25, 50, 75, 100].map((tick) => (
          <div
            key={tick}
            className="absolute h-4 w-px -translate-y-1/2 bg-[#9aa8c5]"
            style={{
              left: `calc(1rem + (100% - 2rem) * ${tick / 100})`,
              top: `${axisTop}%`,
            }}
          >
            <span className="absolute top-7 left-1/2 -translate-x-1/2 font-mono text-[11px] font-bold text-[#52628a]">
              {tick}
            </span>
          </div>
        ))}
        <div
          className="absolute top-[22px] bottom-[38px] z-[1] w-1 -translate-x-1/2 rounded-full bg-[#071024]"
          style={{
            left: `calc(1rem + (100% - 2rem) * ${analysis.mean / 100})`,
          }}
        >
          <span className="absolute -top-1 left-2 rounded-[7px] border border-[#dfe4f4] bg-white px-2 py-1 font-mono text-[11px] font-black whitespace-nowrap text-[#071024] shadow-[0_8px_16px_rgba(26,38,80,0.08)]">
            mean {formatValue(analysis.mean)}
          </span>
        </div>
        {analysis.rows.map((row, index) => {
          const start = Math.min(row.point.value, analysis.mean);
          const width = Math.abs(row.point.value - analysis.mean);
          const isLarge =
            row.point.id === analysis.largestDeviationPointId ||
            row.absoluteDeviation >= analysis.standardDeviation;
          const laneTop = 48 + index * 15;

          return (
            <div key={row.point.id}>
              <div
                className="absolute right-4 left-4 z-[1] h-px bg-[#edf1fa]"
                style={{ top: `${laneTop}px` }}
              />
              <div
                className="absolute z-[2] h-2 -translate-y-1/2 rounded-full"
                style={{
                  left: `calc(1rem + (100% - 2rem) * ${start / 100})`,
                  top: `${laneTop}px`,
                  width: `calc((100% - 2rem) * ${Math.max(width, 0.8) / 100})`,
                  backgroundColor: row.point.color,
                  opacity: isLarge ? 0.9 : 0.58,
                }}
              />
            </div>
          );
        })}
        {points.map((point) => {
          const row = rowsByPoint.get(point.id);
          const isActive = activePointId === point.id;
          const isLargest = point.id === analysis.largestDeviationPointId;
          const topOffset = stackOffsets.get(point.id) ?? 0;

          return (
            <button
              key={point.id}
              type="button"
              aria-label={`${point.label} value ${point.value}`}
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
                onPointStart(point.id, event.clientX);
              }}
              className={`absolute z-10 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full border-2 bg-white font-mono text-[11px] font-black text-[#071024] shadow-[0_10px_20px_rgba(26,38,80,0.13)] transition active:cursor-grabbing ${
                isActive ? "scale-110 border-[#352cff]" : "border-white"
              } ${isLargest ? "ring-4 ring-[#ef4444]/20" : ""}`}
              style={
                {
                  left: `calc(1rem + (100% - 2rem) * ${point.value / 100})`,
                  top: `calc(${axisTop}% + ${topOffset}px)`,
                  background: `linear-gradient(180deg, #ffffff 0%, ${point.color} 270%)`,
                } as CSSProperties
              }
            >
              {point.label}
              <span className="sr-only">
                deviation {row ? formatSigned(row.deviation) : "0.0"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {points
          .slice()
          .sort((left, right) => left.value - right.value)
          .map((point) => {
            const row = rowsByPoint.get(point.id);
            const isLargest = point.id === analysis.largestDeviationPointId;

            return (
              <span
                key={point.id}
                className={`rounded-full border px-2.5 py-1 font-mono text-[12px] font-black ${
                  isLargest
                    ? "border-[#fecaca] bg-[#fff1f1] text-[#b91c1c]"
                    : "border-[#dfe4f4] bg-white text-[#263a68]"
                }`}
              >
                {point.label}:{point.value} ({row ? formatSigned(row.deviation) : "0.0"})
              </span>
            );
          })}
      </div>
    </div>
  );
}

function DatasetPanel({
  activePreset,
  points,
  analysis,
  activePointId,
  trackRef,
  onSelectPreset,
  onPointStart,
  onPointStep,
}: {
  activePreset: SpreadPreset;
  points: DataPoint[];
  analysis: SpreadAnalysis;
  activePointId: string | null;
  trackRef: RefObject<HTMLDivElement | null>;
  onSelectPreset: (preset: SpreadPreset) => void;
  onPointStart: (pointId: string, clientX: number) => void;
  onPointStep: (pointId: string, delta: number) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(320px,0.56fr)]">
        <div className="min-w-0">
          <LessonTitle>1. Set The Data</LessonTitle>
          <p className="mt-4 max-w-[820px] text-[16px] leading-[1.45] text-[#16264e]">
            Pick a same-mean shape or drag a dot. The bars show every distance
            from the mean.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {spreadPresets.map((preset) => (
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
            analysis={analysis}
            activePointId={activePointId}
            trackRef={trackRef}
            onPointStart={onPointStart}
            onPointStep={onPointStep}
          />
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black text-[#352cff] uppercase">
            Current Dataset
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <FactPill label="Count" value={String(analysis.count)} />
            <FactPill label="Mean" value={analysis.mean.toFixed(1)} />
            <FactPill label="Range" value={`${analysis.min} to ${analysis.max}`} />
            <FactPill
              label="Values"
              value={points.map((point) => point.value).join(", ")}
            />
          </div>
          <div className="mt-4 rounded-[8px] border border-[#dedcff] bg-white px-4 py-3 text-[15px] leading-[1.35] text-[#2924ff]">
            The presets keep the mean at 50. Watch spread change without moving
            the center.
          </div>
        </div>
      </div>
    </Panel>
  );
}

function DeviationTile({ row, isLargest }: { row: DeviationRow; isLargest: boolean }) {
  return (
    <div
      className={`rounded-[10px] border px-3 py-3 ${
        isLargest
          ? "border-[#fecaca] bg-[#fff1f1]"
          : "border-[#dfe4f4] bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[16px] font-black text-[#071024]">
          {row.point.label}
        </p>
        <p className="font-mono text-[13px] font-black text-[#52628a]">
          x = {row.point.value}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-[7px] border border-[#e5e9f5] bg-[#fbfbff] px-2 py-2">
          <p className="text-[10px] font-black text-[#7180a5] uppercase">
            x - mean
          </p>
          <p
            className="mt-1 font-mono text-[14px] font-black"
            style={{ color: row.deviation < 0 ? "#2563eb" : "#ef4444" }}
          >
            {formatSigned(row.deviation)}
          </p>
        </div>
        <div className="rounded-[7px] border border-[#e5e9f5] bg-[#fbfbff] px-2 py-2">
          <p className="text-[10px] font-black text-[#7180a5] uppercase">
            squared
          </p>
          <p className="mt-1 font-mono text-[14px] font-black text-[#071024]">
            {row.squaredDeviation.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}

function DeviationPanel({ analysis }: { analysis: SpreadAnalysis }) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <LessonTitle>2. Watch Each Deviation</LessonTitle>
          <p className="mt-4 max-w-[860px] text-[16px] leading-[1.45] text-[#16264e]">
            Subtract the mean from each value. Then square the distance so far
            points count more.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {analysis.rows.map((row) => (
              <DeviationTile
                key={row.point.id}
                row={row}
                isLargest={row.point.id === analysis.largestDeviationPointId}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black text-[#352cff] uppercase">
            Biggest Squared Term
          </p>
          <p className="mt-4 text-[28px] leading-none font-black text-[#071024]">
            Far points dominate.
          </p>
          <p className="mt-3 text-[15px] leading-[1.45] text-[#263a68]">
            {analysis.story.variance}
          </p>
          <div className="mt-5 rounded-[8px] border border-[#dedcff] bg-white px-4 py-3 font-mono text-[13px] leading-[1.5] font-bold text-[#071024]">
            Σ(x − x̄)²
            <br />= {analysis.squaredDeviationSum.toFixed(1)}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function FormulaPanel({ analysis }: { analysis: SpreadAnalysis }) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.45fr)] xl:items-start">
        <div className="min-w-0">
          <LessonTitle>3. Build The Formula</LessonTitle>
          <p className="mt-4 max-w-[820px] text-[16px] leading-[1.45] text-[#16264e]">
            Variance averages the squared distances. Standard deviation takes
            the square root to return to the original units.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
              <p className="text-[13px] font-black text-[#52628a] uppercase">
                Variance
              </p>
              <div className="mt-4 rounded-[8px] border border-[#e4e8f4] bg-white px-4 py-4 font-mono text-[15px] leading-[1.6] font-bold text-[#071024]">
                σ² = mean((x − x̄)²)
                <br />= {analysis.squaredDeviationSum.toFixed(1)} /{" "}
                {analysis.count}
                <br />= <span className="text-[#ef4444]">{analysis.variance.toFixed(1)}</span>
              </div>
            </div>
            <div className="rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
              <p className="text-[13px] font-black text-[#52628a] uppercase">
                Standard Deviation
              </p>
              <div className="mt-4 rounded-[8px] border border-[#e4e8f4] bg-white px-4 py-4 font-mono text-[15px] leading-[1.6] font-bold text-[#071024]">
                σ = √σ²
                <br />= √{analysis.variance.toFixed(1)}
                <br />= <span className="text-[#16a34a]">{analysis.standardDeviation.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#dedcff] bg-[#f8f7ff] p-5">
          <p className="text-[13px] font-black text-[#352cff] uppercase">
            Live Readout
          </p>
          <p className="mt-4 font-mono text-[46px] leading-none font-black text-[#16a34a]">
            {analysis.standardDeviation.toFixed(1)}
          </p>
          <p className="mt-3 text-[16px] leading-[1.45] text-[#263a68]">
            {analysis.story.standardDeviation} Values typically sit about this
            far from the mean.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function MiniSpread({ preset }: { preset: SpreadPreset }) {
  const analysis = analyzeSpread(pointsForPreset(preset));
  const color =
    preset.id === "tight"
      ? "#16a34a"
      : preset.id === "balanced"
        ? "#f59e0b"
        : "#ef4444";

  return (
    <div className="rounded-[10px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[13px] font-black text-[#52628a] uppercase">
            {preset.label}
          </p>
          <p className="mt-1 text-[14px] leading-[1.35] text-[#263a68]">
            mean = {analysis.mean.toFixed(1)}
          </p>
        </div>
        <p className="font-mono text-[26px] leading-none font-black" style={{ color }}>
          {analysis.standardDeviation.toFixed(1)}
        </p>
      </div>
      <div className="relative mt-5 h-12 rounded-[8px] bg-white px-3">
        <div className="absolute right-3 left-3 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#d4dcef]" />
        <div
          className="absolute top-1/2 h-5 -translate-y-1/2 rounded-full"
          style={{
            left: `calc(0.75rem + (100% - 1.5rem) * ${analysis.min / 100})`,
            width: `calc((100% - 1.5rem) * ${Math.max(analysis.range, 1) / 100})`,
            backgroundColor: color,
          }}
        />
        <div
          className="absolute top-1/2 h-7 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#071024]"
          style={{
            left: `calc(0.75rem + (100% - 1.5rem) * ${analysis.mean / 100})`,
          }}
        />
      </div>
    </div>
  );
}

function ComparePanel() {
  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>4. Compare The Spread</LessonTitle>
      <p className="mt-4 max-w-[860px] text-[16px] leading-[1.45] text-[#16264e]">
        These datasets share the same mean. Standard deviation separates the
        clustered story from the wide one.
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {spreadPresets.map((preset) => (
          <MiniSpread key={preset.id} preset={preset} />
        ))}
      </div>
    </Panel>
  );
}

function TakeawayPanel() {
  return (
    <Panel className="border-[#dedcff] bg-[#f8f7ff] px-5 py-4 sm:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-[13px] font-black text-[#352cff] uppercase">
          Takeaway
        </p>
        <p className="max-w-5xl text-[18px] leading-[1.35] font-black text-[#071024]">
          Same mean can hide different spread. Std dev tells how far values
          typically sit from the mean.
        </p>
      </div>
    </Panel>
  );
}

export function VarianceStandardDeviationPlayground() {
  const [activePreset, setActivePreset] = useState(initialSpreadPreset);
  const [points, setPoints] = useState(() =>
    pointsForPreset(initialSpreadPreset),
  );
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const analysis = useMemo(() => analyzeSpread(points), [points]);

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

  function handleSelectPreset(preset: SpreadPreset) {
    setActivePreset(preset);
    setPoints(pointsForPreset(preset));
    setActivePointId(null);
  }

  function handlePointStart(pointId: string, clientX: number) {
    setActivePointId(pointId);
    const rect = trackRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const nextValue = clampValue(clientXToPercentValue(clientX, rect));

    setPoints((currentPoints) => movePoint(currentPoints, pointId, nextValue));
  }

  function handlePointStep(pointId: string, delta: number) {
    setActivePointId(pointId);
    setPoints((currentPoints) => {
      const point = currentPoints.find((item) => item.id === pointId);

      if (!point) {
        return currentPoints;
      }

      return movePoint(currentPoints, pointId, point.value + delta);
    });
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f7f9ff] px-4 pt-5 pb-28 text-[#071024] sm:px-7 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1536px] flex-col gap-4">
        <header className="py-1">
          <div>
            <h1 className="text-[40px] leading-[0.98] font-black text-[#070b1a] sm:text-[56px]">
              {"Variance & Standard Deviation Lab"}
            </h1>
            <p className="mt-3 max-w-4xl text-[18px] leading-[1.35] font-semibold text-[#30446f] sm:text-[21px]">
              Move values and watch squared distances turn spread into a
              typical distance.
            </p>
          </div>
        </header>

        <DatasetPanel
          activePreset={activePreset}
          points={points}
          analysis={analysis}
          activePointId={activePointId}
          trackRef={trackRef}
          onSelectPreset={handleSelectPreset}
          onPointStart={handlePointStart}
          onPointStep={handlePointStep}
        />
        <DeviationPanel analysis={analysis} />
        <FormulaPanel analysis={analysis} />
        <ComparePanel />
        <TakeawayPanel />
      </div>
    </main>
  );
}
