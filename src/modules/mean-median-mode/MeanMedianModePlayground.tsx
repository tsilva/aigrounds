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
  analyzeTypicalValues,
  clampValue,
  movePoint,
  type DataPoint,
  type TypicalValuesAnalysis,
} from "./mean-median-mode-engine";
import {
  initialTypicalPreset,
  pointsForPreset,
  typicalPresets,
  type TypicalPreset,
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
      className={`rounded-[14px] border border-[#d8e0f3] bg-white/92 shadow-[0_18px_42px_rgba(26,38,80,0.05)] ${className}`}
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
      <p className="mt-1 truncate font-mono text-[13px] font-bold text-[#071024]">
        {value}
      </p>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 10.5v6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="12" cy="7.4" r="1.15" fill="currentColor" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M9.7 9.2a2.4 2.4 0 0 1 4.7.6c0 2.3-2.4 2.1-2.4 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function PresetButton({
  preset,
  isSelected,
  onSelect,
}: {
  preset: TypicalPreset;
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
      <span className="block text-[13px] font-black uppercase tracking-[0.02em]">
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

function useStackedPointLayout(points: DataPoint[]) {
  return useMemo(() => {
    const grouped = new Map<number, DataPoint[]>();

    for (const point of points) {
      grouped.set(point.value, [...(grouped.get(point.value) ?? []), point]);
    }

    const offsets = new Map<string, number>();

    for (const group of grouped.values()) {
      group.forEach((point, index) => {
        const offset = (index - (group.length - 1) / 2) * 20;
        offsets.set(point.id, offset);
      });
    }

    return offsets;
  }, [points]);
}

function NumberLine({
  points,
  modeValues,
  activePointId,
  trackRef,
  onPointStart,
  onPointStep,
}: {
  points: DataPoint[];
  modeValues: number[];
  activePointId: string | null;
  trackRef: RefObject<HTMLDivElement | null>;
  onPointStart: (pointId: string, clientX: number) => void;
  onPointStep: (pointId: string, delta: number) => void;
}) {
  const stackOffsets = useStackedPointLayout(points);
  const modeSet = new Set(modeValues);

  return (
    <div className="mt-6 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <div
        ref={trackRef}
        className="relative h-[180px] select-none overflow-hidden rounded-[10px] bg-white px-4"
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
          const isMode = modeSet.has(point.value);
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
              className={`absolute z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full border-2 bg-white font-mono text-[12px] font-black text-[#071024] shadow-[0_10px_20px_rgba(26,38,80,0.13)] transition active:cursor-grabbing ${
                isActive ? "scale-110 border-[#352cff]" : "border-white"
              } ${isMode ? "ring-4 ring-[#f59e0b]/20" : ""}`}
              style={
                {
                  left: `calc(1rem + (100% - 2rem) * ${point.value / 100})`,
                  top: `calc(50% + ${topOffset}px)`,
                  background: `linear-gradient(180deg, #ffffff 0%, ${point.color} 270%)`,
                } as CSSProperties
              }
            >
              {point.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {points
          .slice()
          .sort((left, right) => left.value - right.value)
          .map((point) => (
            <span
              key={point.id}
              className={`rounded-full border px-2.5 py-1 font-mono text-[12px] font-black ${
                modeSet.has(point.value)
                  ? "border-[#f2c96b] bg-[#fff7df] text-[#9a6500]"
                  : "border-[#dfe4f4] bg-white text-[#263a68]"
              }`}
            >
              {point.label}:{point.value}
            </span>
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
  trackRef,
  onSelectPreset,
  onPointStart,
  onPointStep,
}: {
  activePreset: TypicalPreset;
  points: DataPoint[];
  analysis: TypicalValuesAnalysis;
  activePointId: string | null;
  trackRef: RefObject<HTMLDivElement | null>;
  onSelectPreset: (preset: TypicalPreset) => void;
  onPointStart: (pointId: string, clientX: number) => void;
  onPointStep: (pointId: string, delta: number) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(320px,0.56fr)]">
        <div className="min-w-0">
          <LessonTitle>1. Build The Dataset</LessonTitle>
          <p className="mt-4 max-w-[820px] text-[16px] leading-[1.45] text-[#16264e]">
            Move the dots along the number line. Each summary answers a
            different version of typical.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {typicalPresets.map((preset) => (
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
            modeValues={analysis.modeValues}
            activePointId={activePointId}
            trackRef={trackRef}
            onPointStart={onPointStart}
            onPointStep={onPointStep}
          />
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black tracking-[0.03em] text-[#352cff] uppercase">
            Current Dataset
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <FactPill label="Count" value={String(analysis.count)} />
            <FactPill label="Range" value={`${analysis.min} to ${analysis.max}`} />
            <FactPill
              label="Sorted values"
              value={analysis.sortedValues.join(", ")}
            />
            <FactPill
              label="Repeated value"
              value={
                analysis.modeValues.length > 0
                  ? `${analysis.modeValues.join(", ")} appears ${analysis.modeFrequency}x`
                  : "none"
              }
            />
          </div>
          <div className="mt-4 rounded-[8px] border border-[#dedcff] bg-white px-4 py-3 text-[15px] leading-[1.35] text-[#2924ff]">
            Drag the far-right value left or right and watch the mean move more
            than the median.
          </div>
        </div>
      </div>
    </Panel>
  );
}

function MarkerTrack({
  title,
  value,
  color,
  formula,
  story,
  modeValues,
}: {
  title: string;
  value: number | null;
  color: string;
  formula: string;
  story: string;
  modeValues?: number[];
}) {
  const markerValues = modeValues && modeValues.length > 0 ? modeValues : [];

  return (
    <div className="rounded-[10px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[13px] font-black tracking-[0.04em] text-[#52628a] uppercase">
            {title}
          </p>
          <p className="mt-1 text-[14px] leading-[1.35] text-[#263a68]">
            {story}
          </p>
        </div>
        <p className="font-mono text-[26px] leading-none font-black" style={{ color }}>
          {value === null ? "none" : formatValue(value)}
        </p>
      </div>

      <div className="relative mt-5 h-12 rounded-[8px] bg-white px-3">
        <div className="absolute right-3 left-3 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#d4dcef]" />
        {value !== null && markerValues.length === 0 ? (
          <div
            className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-[0_8px_14px_rgba(26,38,80,0.16)]"
            style={{
              left: `calc(0.75rem + (100% - 1.5rem) * ${value / 100})`,
              backgroundColor: color,
            }}
          />
        ) : null}
        {markerValues.map((markerValue) => (
          <div
            key={markerValue}
            className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-[0_8px_14px_rgba(26,38,80,0.16)]"
            style={{
              left: `calc(0.75rem + (100% - 1.5rem) * ${markerValue / 100})`,
              backgroundColor: color,
            }}
          />
        ))}
      </div>

      <div className="mt-4 rounded-[7px] border border-[#e4e8f4] bg-white px-3 py-2 font-mono text-[12px] leading-[1.45] font-bold text-[#071024] sm:text-[13px]">
        {formula}
      </div>
    </div>
  );
}

function SummaryPanel({ analysis }: { analysis: TypicalValuesAnalysis }) {
  const modeValue =
    analysis.modeValues.length === 1 ? analysis.modeValues[0] ?? null : null;

  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>2. Watch The Summaries Move</LessonTitle>
      <p className="mt-4 max-w-[860px] text-[16px] leading-[1.45] text-[#16264e]">
        The same dataset can have three honest typical values. The marker tracks
        show what each summary pays attention to.
      </p>
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <MarkerTrack
          title="Mean"
          value={analysis.mean}
          color="#2563eb"
          story={analysis.story.mean}
          formula={`mean = sum / count = ${analysis.sum} / ${analysis.count} = ${analysis.mean.toFixed(1)}`}
        />
        <MarkerTrack
          title="Median"
          value={analysis.median}
          color="#5335f4"
          story={analysis.story.median}
          formula={`median = middle sorted value = ${formatValue(analysis.median)}`}
        />
        <MarkerTrack
          title="Mode"
          value={modeValue}
          color="#f59e0b"
          story={analysis.story.mode}
          formula={
            analysis.modeValues.length > 0
              ? `mode = ${analysis.modeValues.join(", ")} appears ${analysis.modeFrequency}x`
              : "mode = no repeated value"
          }
          modeValues={analysis.modeValues}
        />
      </div>
    </Panel>
  );
}

function StoryRow({
  label,
  value,
  color,
  phrase,
  detail,
}: {
  label: string;
  value: string;
  color: string;
  phrase: string;
  detail: string;
}) {
  return (
    <div className="grid gap-3 border-b border-[#e4e8f4] py-4 last:border-b-0 md:grid-cols-[160px_120px_minmax(0,1fr)] md:items-center">
      <div className="flex items-center gap-3">
        <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-[16px] font-black text-[#071024]">{label}</p>
      </div>
      <p className="font-mono text-[22px] leading-none font-black" style={{ color }}>
        {value}
      </p>
      <p className="text-[15px] leading-[1.4] text-[#263a68]">
        <span className="font-black text-[#071024]">{phrase}</span> {detail}
      </p>
    </div>
  );
}

function ComparePanel({ analysis }: { analysis: TypicalValuesAnalysis }) {
  const modeCopy =
    analysis.modeValues.length > 0
      ? analysis.modeValues.join(", ")
      : "none";

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.5fr)] xl:items-start">
        <div className="min-w-0">
          <LessonTitle>3. Compare The Story</LessonTitle>
          <div className="mt-4 overflow-hidden rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] px-4">
            <StoryRow
              label="Mean"
              value={analysis.mean.toFixed(1)}
              color="#2563eb"
              phrase="Pulled by extremes."
              detail={`It sits ${formatSigned(analysis.meanMedianGap)} away from the median.`}
            />
            <StoryRow
              label="Median"
              value={formatValue(analysis.median)}
              color="#5335f4"
              phrase="Resists extremes."
              detail="Only the order and the middle position matter."
            />
            <StoryRow
              label="Mode"
              value={modeCopy}
              color="#f59e0b"
              phrase="Finds repetition."
              detail="It ignores distance and looks for the most frequent value."
            />
          </div>
        </div>

        <div className="rounded-[12px] border border-[#dedcff] bg-[#f8f7ff] p-5">
          <p className="text-[13px] font-black tracking-[0.04em] text-[#352cff] uppercase">
            Takeaway
          </p>
          <p className="mt-4 text-[26px] leading-[1.08] font-black text-[#071024]">
            Typical depends on the question.
          </p>
          <p className="mt-3 text-[16px] leading-[1.45] text-[#263a68]">
            Balance point, middle point, or most common point can all be right.
            Pick the one that matches the story you need to tell.
          </p>
        </div>
      </div>
    </Panel>
  );
}

export function MeanMedianModePlayground() {
  const [activePreset, setActivePreset] = useState(initialTypicalPreset);
  const [points, setPoints] = useState(() => pointsForPreset(initialTypicalPreset));
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const analysis = useMemo(() => analyzeTypicalValues(points), [points]);

  const updatePointFromClientX = useCallback(
    (clientX: number) => {
      if (!activePointId || !trackRef.current) {
        return;
      }

      const rect = trackRef.current.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const nextValue = clampValue(ratio * 100);

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

  function handleSelectPreset(preset: TypicalPreset) {
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

    const ratio = (clientX - rect.left) / rect.width;
    const nextValue = clampValue(ratio * 100);

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
    <main className="min-h-screen overflow-x-clip bg-[#f7f9ff] px-4 py-5 text-[#071024] sm:px-7 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1536px] flex-col gap-4">
        <header className="flex flex-col gap-3 py-1 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-[42px] leading-[0.95] font-black tracking-[-0.05em] text-[#070b1a] sm:text-[56px]">
              {"Mean, Median & Mode Lab"}
              <span className="text-[#315690]">
                <InfoIcon />
              </span>
            </h1>
            <p className="mt-3 max-w-3xl text-[18px] leading-[1.35] font-semibold text-[#30446f] sm:text-[21px]">
              Drag a dataset around and watch three ideas of typical disagree.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex w-fit items-center justify-center gap-3 rounded-[10px] border border-[#dedcff] bg-white px-5 py-3 text-center font-mono text-[13px] font-black text-[#2924ff] shadow-[0_12px_30px_rgba(26,38,80,0.04)]"
          >
            <HelpIcon />
            What is typical?
          </button>
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
        <SummaryPanel analysis={analysis} />
        <ComparePanel analysis={analysis} />
      </div>
    </main>
  );
}
