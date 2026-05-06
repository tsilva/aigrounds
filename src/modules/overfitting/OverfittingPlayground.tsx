"use client";

import { type CSSProperties, useMemo, useState } from "react";
import {
  analyzeOverfitting,
  formatMetric,
  formatSigned,
  type ComplexityStatus,
  type FittedPoint,
  type OverfittingAnalysis,
} from "./overfitting-engine";
import {
  defaultOverfittingScenario,
  initialDegree,
  initialNoise,
  overfittingScenarios,
  type OverfittingScenario,
} from "./scenario";

const chart = {
  width: 760,
  height: 430,
  left: 58,
  right: 26,
  top: 28,
  bottom: 50,
  minX: -1,
  maxX: 1,
  minY: -1.1,
  maxY: 1,
};

const gapChart = {
  width: 620,
  height: 250,
  left: 46,
  right: 24,
  top: 26,
  bottom: 42,
};

const statusStyles: Record<
  ComplexityStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  underfit: {
    label: "Underfit",
    className: "border-[#cdd7ea] bg-[#f8fafc] text-[#475569]",
    dotClassName: "bg-[#94a3b8]",
  },
  "sweet-spot": {
    label: "Sweet spot",
    className: "border-[#9fd9b4] bg-[#ecfff4] text-[#075f2b]",
    dotClassName: "bg-[#16a34a]",
  },
  overfit: {
    label: "Overfit",
    className: "border-[#ffc5a5] bg-[#fff3eb] text-[#a13b08]",
    dotClassName: "bg-[#f97316]",
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
      <p className="mt-1 font-mono text-[13px] leading-tight font-bold text-[#071024]">
        {value}
      </p>
    </div>
  );
}

function BulbIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        d="M8.2 15.1a6.2 6.2 0 1 1 7.6 0 5.2 5.2 0 0 0-1.8 3.1H10a5.2 5.2 0 0 0-1.8-3.1Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M10 21h4M9.5 18.2h5M12 3V1.8M5.6 5.6l-.9-.9M18.4 5.6l.9-.9M4 12H2.8M21.2 12H20"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function xScale(x: number) {
  const plotWidth = chart.width - chart.left - chart.right;

  return chart.left + ((x - chart.minX) / (chart.maxX - chart.minX)) * plotWidth;
}

function yScale(y: number) {
  const plotHeight = chart.height - chart.top - chart.bottom;

  return chart.top + (1 - (y - chart.minY) / (chart.maxY - chart.minY)) * plotHeight;
}

function linePath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";

      return `${command}${xScale(point.x).toFixed(2)} ${yScale(point.y).toFixed(
        2,
      )}`;
    })
    .join(" ");
}

function ScenarioSelector({
  scenario,
  onSelectScenario,
}: {
  scenario: OverfittingScenario;
  onSelectScenario: (scenario: OverfittingScenario) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div className="min-w-0">
          <LessonTitle>1. Set The Data</LessonTitle>
          <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
            The hidden signal is smooth, but each observed dot has noise. Pick
            the split, then let the model decide how much of the noise to trust.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {overfittingScenarios.map((entry) => {
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
            Current Split
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FactPill
              label="Training Dots"
              value={`${scenario.trainX.length} blue examples`}
            />
            <FactPill
              label="Test Dots"
              value={`${scenario.testX.length} red examples`}
            />
            <FactPill label="Goal" value="Low future error" />
            <FactPill label="Model" value="Polynomial curve" />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  valueText,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  valueText: string;
}) {
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <label className="block rounded-[12px] border border-[#dbe2f2] bg-white p-4">
      <span className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-black tracking-[0.02em] text-[#352cff] uppercase">
          {label}
        </span>
        <span className="font-mono text-[18px] font-black text-[#071024]">
          {valueText}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        onInput={(event) => onChange(Number(event.currentTarget.value))}
        className="mt-4 h-3 w-full cursor-pointer appearance-none rounded-full bg-[#dce2ef] accent-[#5236f2] outline-none"
        style={
          {
            background: `linear-gradient(90deg, #5236f2 ${fill}%, #dce2ef ${fill}%)`,
          } as CSSProperties
        }
      />
    </label>
  );
}

function StatusPills({ activeStatus }: { activeStatus: ComplexityStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(statusStyles) as ComplexityStatus[]).map((status) => {
        const style = statusStyles[status];
        const isActive = status === activeStatus;

        return (
          <span
            key={status}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-black uppercase tracking-[0.03em] ${
              isActive
                ? style.className
                : "border-[#dbe2f2] bg-white text-[#7180a5]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isActive ? style.dotClassName : "bg-[#cbd5e1]"
              }`}
            />
            {style.label}
          </span>
        );
      })}
    </div>
  );
}

function FitChart({ analysis }: { analysis: OverfittingAnalysis }) {
  const trueCurvePath = linePath(
    analysis.curve.map((point) => ({ x: point.x, y: point.trueY })),
  );
  const fitCurvePath = linePath(analysis.curve);

  return (
    <div className="min-w-0 overflow-hidden rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <LessonTitle>2. Fit The Curve</LessonTitle>
        <div className="flex flex-wrap gap-2 font-mono text-[11px] font-bold">
          <span className="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2.5 py-1 text-[#1d4ed8]">
            Blue = train
          </span>
          <span className="rounded-full border border-[#fecaca] bg-[#fff1f2] px-2.5 py-1 text-[#dc2626]">
            Red = test
          </span>
          <span className="rounded-full border border-[#d8e0f3] bg-white px-2.5 py-1 text-[#475569]">
            Gray = hidden signal
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        role="img"
        aria-label="Training and test points with a fitted model curve"
        className="mt-4 h-auto w-full"
      >
        <defs>
          <clipPath id="overfitting-fit-clip">
            <rect
              x={chart.left}
              y={chart.top}
              width={chart.width - chart.left - chart.right}
              height={chart.height - chart.top - chart.bottom}
              rx="12"
            />
          </clipPath>
        </defs>
        <rect
          x={chart.left}
          y={chart.top}
          width={chart.width - chart.left - chart.right}
          height={chart.height - chart.top - chart.bottom}
          rx="12"
          fill="#ffffff"
          stroke="#dce4f3"
        />
        {[-0.5, 0, 0.5].map((tick) => (
          <g key={`grid-x-${tick}`}>
            <line
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={chart.top}
              y2={chart.height - chart.bottom}
              stroke="#edf1f8"
              strokeWidth="1"
            />
            <text
              x={xScale(tick)}
              y={chart.height - 20}
              textAnchor="middle"
              className="fill-[#7180a5] font-mono text-[12px] font-bold"
            >
              {tick}
            </text>
          </g>
        ))}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((tick) => (
          <g key={`grid-y-${tick}`}>
            <line
              x1={chart.left}
              x2={chart.width - chart.right}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="#edf1f8"
              strokeWidth="1"
            />
            <text
              x={chart.left - 12}
              y={yScale(tick) + 4}
              textAnchor="end"
              className="fill-[#7180a5] font-mono text-[12px] font-bold"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}
        <g clipPath="url(#overfitting-fit-clip)">
          <path
            d={trueCurvePath}
            fill="none"
            stroke="#94a3b8"
            strokeDasharray="8 8"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            d={fitCurvePath}
            fill="none"
            stroke="#352cff"
            strokeLinecap="round"
            strokeWidth="5"
          />
          {analysis.trainPoints.map((point) => (
            <DataDot key={point.id} point={point} color="#2f7bf5" />
          ))}
          {analysis.testPoints.map((point) => (
            <DataDot key={point.id} point={point} color="#ff2525" />
          ))}
        </g>
        <text
          x={chart.left + 10}
          y={chart.top + 24}
          className="fill-[#352cff] font-mono text-[13px] font-black"
        >
          degree {analysis.degree}
        </text>
      </svg>
    </div>
  );
}

function DataDot({ point, color }: { point: FittedPoint; color: string }) {
  return (
    <g>
      <line
        x1={xScale(point.x)}
        x2={xScale(point.x)}
        y1={yScale(point.y)}
        y2={yScale(point.predictedY)}
        stroke={color}
        strokeOpacity="0.22"
        strokeWidth="2"
      />
      <circle
        cx={xScale(point.x)}
        cy={yScale(point.y)}
        r="6"
        fill={color}
        stroke="#ffffff"
        strokeWidth="2.5"
      />
    </g>
  );
}

function FitControls({
  analysis,
  degree,
  noise,
  onDegreeChange,
  onNoiseChange,
}: {
  analysis: OverfittingAnalysis;
  degree: number;
  noise: number;
  onDegreeChange: (degree: number) => void;
  onNoiseChange: (noise: number) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="space-y-4">
        <SliderControl
          label="Model Complexity"
          min={1}
          max={12}
          step={1}
          value={degree}
          valueText={`degree ${degree}`}
          onChange={onDegreeChange}
        />
        <SliderControl
          label="Noise"
          min={0}
          max={0.45}
          step={0.01}
          value={noise}
          valueText={noise.toFixed(2)}
          onChange={onNoiseChange}
        />
      </div>
      <div className="rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <LessonTitle>Current Fit</LessonTitle>
            <p className="mt-3 text-[15px] leading-[1.45] text-[#263a68]">
              {analysis.narrative}
            </p>
          </div>
          <StatusPills activeStatus={analysis.status} />
        </div>
        <div className="mt-4 grid gap-3">
          <FactPill label="Train MSE" value={formatMetric(analysis.trainMse)} />
          <FactPill label="Test MSE" value={formatMetric(analysis.testMse)} />
          <FactPill label="Gap" value={formatSigned(analysis.gap, 3)} />
        </div>
      </div>
    </div>
  );
}

function GapChart({ analysis }: { analysis: OverfittingAnalysis }) {
  const maxLoss = Math.max(
    0.05,
    ...analysis.lossByDegree.flatMap((point) => [point.trainMse, point.testMse]),
  );
  const xFor = (degree: number) =>
    gapChart.left +
    ((degree - 1) / 11) * (gapChart.width - gapChart.left - gapChart.right);
  const yFor = (loss: number) =>
    gapChart.top +
    (1 - loss / maxLoss) * (gapChart.height - gapChart.top - gapChart.bottom);
  const pathFor = (key: "trainMse" | "testMse") =>
    analysis.lossByDegree
      .map((point, index) => {
        const command = index === 0 ? "M" : "L";

        return `${command}${xFor(point.degree).toFixed(2)} ${yFor(
          point[key],
        ).toFixed(2)}`;
      })
      .join(" ");
  const activeX = xFor(analysis.degree);

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <LessonTitle>3. Watch The Gap</LessonTitle>
            <div className="flex flex-wrap gap-2 font-mono text-[11px] font-bold">
              <span className="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2.5 py-1 text-[#1d4ed8]">
                train loss
              </span>
              <span className="rounded-full border border-[#fecaca] bg-[#fff1f2] px-2.5 py-1 text-[#dc2626]">
                test loss
              </span>
            </div>
          </div>
          <svg
            viewBox={`0 0 ${gapChart.width} ${gapChart.height}`}
            role="img"
            aria-label="Training and test mean squared error by model complexity"
            className="mt-4 h-auto w-full"
          >
            <rect
              x={gapChart.left}
              y={gapChart.top}
              width={gapChart.width - gapChart.left - gapChart.right}
              height={gapChart.height - gapChart.top - gapChart.bottom}
              rx="10"
              fill="#ffffff"
              stroke="#dce4f3"
            />
            {[1, 4, 8, 12].map((degree) => (
              <g key={degree}>
                <line
                  x1={xFor(degree)}
                  x2={xFor(degree)}
                  y1={gapChart.top}
                  y2={gapChart.height - gapChart.bottom}
                  stroke="#edf1f8"
                />
                <text
                  x={xFor(degree)}
                  y={gapChart.height - 16}
                  textAnchor="middle"
                  className="fill-[#7180a5] font-mono text-[12px] font-bold"
                >
                  {degree}
                </text>
              </g>
            ))}
            <line
              x1={activeX}
              x2={activeX}
              y1={gapChart.top}
              y2={gapChart.height - gapChart.bottom}
              stroke="#352cff"
              strokeDasharray="6 6"
              strokeWidth="2"
            />
            <path
              d={pathFor("trainMse")}
              fill="none"
              stroke="#2f7bf5"
              strokeLinecap="round"
              strokeWidth="4"
            />
            <path
              d={pathFor("testMse")}
              fill="none"
              stroke="#ff2525"
              strokeLinecap="round"
              strokeWidth="4"
            />
            <text
              x={gapChart.left - 10}
              y={gapChart.top + 5}
              textAnchor="end"
              className="fill-[#7180a5] font-mono text-[12px] font-bold"
            >
              mse
            </text>
            <text
              x={(gapChart.width + gapChart.left - gapChart.right) / 2}
              y={gapChart.height - 2}
              textAnchor="middle"
              className="fill-[#7180a5] font-mono text-[12px] font-bold"
            >
              model complexity
            </text>
          </svg>
        </div>
        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <LessonTitle>Same Score, Different Contract</LessonTitle>
          <div className="mt-4 rounded-[10px] border border-[#dfe4f4] bg-white p-4 text-center">
            <p className="text-[13px] font-black tracking-[0.02em] text-[#7180a5] uppercase">
              Mean Squared Error
            </p>
            <p className="mt-3 font-mono text-[24px] font-black text-[#071024]">
              MSE = mean((y - yhat)^2)
            </p>
          </div>
          <div className="mt-4 grid gap-3">
            <FactPill
              label="Training Contract"
              value="Fit the dots already seen"
            />
            <FactPill
              label="Generalization Contract"
              value="Predict dots not used for fitting"
            />
          </div>
          <div className="mt-4 flex gap-3 rounded-[10px] border border-[#c7d2fe] bg-[#f7f6ff] p-4 text-[#2921d9]">
            <div className="shrink-0 pt-0.5">
              <BulbIcon />
            </div>
            <p className="text-[15px] leading-[1.45]">
              Lower training loss is not the goal; lower future error is.
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function OverfittingPlayground() {
  const [scenario, setScenario] = useState(defaultOverfittingScenario);
  const [degree, setDegree] = useState(initialDegree);
  const [noise, setNoise] = useState(initialNoise);
  const analysis = useMemo(
    () => analyzeOverfitting(scenario.id, degree, noise),
    [degree, noise, scenario.id],
  );

  return (
    <main className="min-h-screen bg-[#f8faff] px-4 py-6 text-[#071024] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1536px]">
        <header>
          <div>
            <h1 className="text-[44px] leading-none font-black tracking-normal text-[#050816] sm:text-[54px]">
              Overfitting Lab
            </h1>
            <p className="mt-3 max-w-3xl text-[21px] leading-[1.35] font-semibold text-[#344777]">
              Watch a curve get better at memorizing the past and worse at
              predicting the future.
            </p>
          </div>
        </header>

        <div className="mt-6 space-y-4">
          <ScenarioSelector scenario={scenario} onSelectScenario={setScenario} />

          <Panel className="p-5 sm:p-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
              <FitChart analysis={analysis} />
              <FitControls
                analysis={analysis}
                degree={degree}
                noise={noise}
                onDegreeChange={setDegree}
                onNoiseChange={setNoise}
              />
            </div>
          </Panel>

          <GapChart analysis={analysis} />
        </div>
      </div>
    </main>
  );
}
