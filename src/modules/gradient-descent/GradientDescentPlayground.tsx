"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import {
  analyzeDescent,
  defaultStartTheta,
  formatNumber,
  formatSigned,
  loss,
  minimumTheta,
  simulateDescent,
  stepDescent,
  type DescentState,
} from "./gradient-descent-engine";
import {
  defaultPreset,
  gradientPresets,
  type GradientPreset,
} from "./scenario";

const chart = {
  width: 720,
  height: 420,
  left: 58,
  right: 24,
  top: 28,
  bottom: 48,
  minX: -3,
  maxX: 3,
  maxY: 4.7,
};

const miniChart = {
  width: 220,
  height: 106,
  left: 20,
  right: 10,
  top: 12,
  bottom: 18,
  minX: -3,
  maxX: 3,
  maxY: 4.7,
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

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="m8 5 11 7-11 7V5Z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M8 5v14M16 5v14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M20 12a8 8 0 1 1-2.35-5.66M20 4v6h-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function StepIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M5 5v14M10 6l8 6-8 6V6Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function xScale(theta: number, bounds = chart) {
  const plotWidth = bounds.width - bounds.left - bounds.right;

  return (
    bounds.left +
    ((theta - bounds.minX) / (bounds.maxX - bounds.minX)) * plotWidth
  );
}

function yScale(value: number, bounds = chart) {
  const plotHeight = bounds.height - bounds.top - bounds.bottom;

  return bounds.top + (1 - value / bounds.maxY) * plotHeight;
}

function curvePath(bounds = chart) {
  const samples = Array.from({ length: 100 }, (_, index) => {
    const theta =
      bounds.minX + (index / 99) * (bounds.maxX - bounds.minX);
    const command = index === 0 ? "M" : "L";

    return `${command}${xScale(theta, bounds).toFixed(2)} ${yScale(
      loss(theta),
      bounds,
    ).toFixed(2)}`;
  });

  return samples.join(" ");
}

function trajectoryPath(
  points: Array<{ theta: number }>,
  bounds = chart,
) {
  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";

      return `${command}${xScale(point.theta, bounds).toFixed(2)} ${yScale(
        loss(point.theta),
        bounds,
      ).toFixed(2)}`;
    })
    .join(" ");
}

function ArrowLine({
  x1,
  y1,
  x2,
  y2,
  color,
  markerId,
  width = 4,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  markerId: string;
  width?: number;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeLinecap="round"
      strokeWidth={width}
      markerEnd={`url(#${markerId})`}
    />
  );
}

function LossChart({
  history,
  learningRate,
  momentum,
}: {
  history: DescentState[];
  learningRate: number;
  momentum: number;
}) {
  const currentState = history[history.length - 1] ?? history[0];
  const analysis = analyzeDescent(currentState, learningRate, momentum);
  const recentHistory = history.slice(-12);
  const currentX = xScale(analysis.theta);
  const currentY = yScale(analysis.loss);
  const nextX = xScale(analysis.nextTheta);
  const nextY = yScale(loss(analysis.nextTheta));
  const gradientDirection = analysis.gradient >= 0 ? -1 : 1;
  const gradientEndTheta = analysis.theta + gradientDirection * 0.55;
  const gradientEndX = xScale(gradientEndTheta);
  const gradientEndY = yScale(loss(analysis.theta) - Math.abs(analysis.gradient) * 0.16);
  const tangentStartTheta = Math.max(chart.minX, analysis.theta - 0.72);
  const tangentEndTheta = Math.min(chart.maxX, analysis.theta + 0.72);
  const tangentStartY =
    analysis.loss + analysis.gradient * (tangentStartTheta - analysis.theta);
  const tangentEndY =
    analysis.loss + analysis.gradient * (tangentEndTheta - analysis.theta);

  return (
    <div className="min-w-0 overflow-hidden rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <LessonTitle>2. Watch One Update</LessonTitle>
        <div className="grid gap-2 sm:grid-cols-3">
          <FactPill label="Position" value={`θ ${formatSigned(analysis.theta)}`} />
          <FactPill
            label="Gradient"
            value={`∂L/∂θ ${formatSigned(analysis.gradient)}`}
          />
          <FactPill label="Loss" value={formatNumber(analysis.loss, 3)} />
        </div>
      </div>

      <svg
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        role="img"
        aria-label="Loss curve with gradient descent update arrows"
        className="mt-4 h-auto w-full"
      >
        <defs>
          <marker
            id="gradient-arrow"
            markerHeight="8"
            markerWidth="8"
            orient="auto"
            refX="7"
            refY="4"
          >
            <path d="M0 0 8 4 0 8Z" fill="#ff3b2f" />
          </marker>
          <marker
            id="step-arrow"
            markerHeight="9"
            markerWidth="9"
            orient="auto"
            refX="8"
            refY="4.5"
          >
            <path d="M0 0 9 4.5 0 9Z" fill="#352cff" />
          </marker>
        </defs>

        {[0, 1, 2, 3, 4].map((tick) => (
          <g key={tick}>
            <line
              x1={chart.left}
              x2={chart.width - chart.right}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="#d7deed"
              strokeDasharray="5 7"
            />
            <text
              x={chart.left - 16}
              y={yScale(tick) + 4}
              textAnchor="end"
              className="font-mono text-[13px] font-bold fill-[#52628a]"
            >
              {tick}
            </text>
          </g>
        ))}

        {[-3, -2, -1, 0, 1, 2, 3].map((tick) => (
          <g key={tick}>
            <line
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={chart.height - chart.bottom}
              y2={chart.height - chart.bottom + 6}
              stroke="#8b99bb"
            />
            <text
              x={xScale(tick)}
              y={chart.height - 16}
              textAnchor="middle"
              className="font-mono text-[13px] font-bold fill-[#52628a]"
            >
              {tick}
            </text>
          </g>
        ))}

        <line
          x1={chart.left}
          x2={chart.width - chart.right}
          y1={chart.height - chart.bottom}
          y2={chart.height - chart.bottom}
          stroke="#8b99bb"
        />
        <line
          x1={chart.left}
          x2={chart.left}
          y1={chart.top}
          y2={chart.height - chart.bottom}
          stroke="#8b99bb"
        />
        <line
          x1={xScale(minimumTheta)}
          x2={xScale(minimumTheta)}
          y1={chart.top + 12}
          y2={chart.height - chart.bottom}
          stroke="#8b99bb"
          strokeDasharray="7 8"
        />
        <text
          x={chart.left + 4}
          y={chart.top + 2}
          textAnchor="start"
          className="font-serif text-[18px] fill-[#071024]"
        >
          L(θ)
        </text>
        <text
          x={chart.width - chart.right - 2}
          y={chart.height - 18}
          textAnchor="end"
          className="font-serif text-[18px] fill-[#071024]"
        >
          θ
        </text>
        <text
          x={xScale(minimumTheta)}
          y={chart.height - 2}
          textAnchor="middle"
          className="font-mono text-[13px] font-bold fill-[#52628a]"
        >
          minimum
        </text>

        <path d={curvePath()} fill="none" stroke="#8b91ff" strokeWidth="4" />
        {recentHistory.length > 1 ? (
          <path
            d={trajectoryPath(recentHistory)}
            fill="none"
            stroke="#ff553e"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        ) : null}
        {recentHistory.map((point, index) => (
          <circle
            key={`${point.step}-${index}`}
            cx={xScale(point.theta)}
            cy={yScale(loss(point.theta))}
            r={index === recentHistory.length - 1 ? 0 : 4}
            fill="#ff553e"
          />
        ))}

        <line
          x1={xScale(tangentStartTheta)}
          x2={xScale(tangentEndTheta)}
          y1={yScale(Math.max(0, Math.min(chart.maxY, tangentStartY)))}
          y2={yScale(Math.max(0, Math.min(chart.maxY, tangentEndY)))}
          stroke="#111827"
          strokeDasharray="8 8"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <ArrowLine
          x1={currentX}
          y1={currentY - 18}
          x2={gradientEndX}
          y2={gradientEndY - 18}
          color="#ff3b2f"
          markerId="gradient-arrow"
          width={5}
        />
        <ArrowLine
          x1={currentX}
          y1={currentY + 20}
          x2={nextX}
          y2={nextY + 20}
          color="#352cff"
          markerId="step-arrow"
          width={6}
        />
        <circle
          cx={nextX}
          cy={nextY}
          r="8"
          fill="#ffffff"
          stroke="#352cff"
          strokeDasharray="3 4"
          strokeWidth="3"
        />
        <circle
          cx={currentX}
          cy={currentY}
          r="12"
          fill="#2f39ff"
          stroke="#ffffff"
          strokeWidth="5"
        />
      </svg>
    </div>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  markers,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  markers: string[];
  onChange: (value: number) => void;
}) {
  const sliderFill = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[15px] font-black text-[#071024]">
          {label}
        </label>
        <output
          htmlFor={id}
          className="font-mono text-[16px] font-black text-[#352cff]"
        >
          {formatNumber(value, 2)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 h-3 w-full cursor-pointer appearance-none rounded-full bg-[#dce1ec] accent-[#5335f4] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#5335f4] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5335f4]"
        style={
          {
            background: `linear-gradient(90deg, #5335f4 0%, #5335f4 ${sliderFill}%, #dce1ec ${sliderFill}%, #dce1ec 100%)`,
          } as CSSProperties
        }
      />
      <div className="mt-2 flex justify-between font-mono text-[12px] font-bold text-[#52628a]">
        {markers.map((marker) => (
          <span key={marker}>{marker}</span>
        ))}
      </div>
    </div>
  );
}

function PresetPanel({
  activePreset,
  onSelectPreset,
}: {
  activePreset: GradientPreset;
  onSelectPreset: (preset: GradientPreset) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>1. Pick A Step Personality</LessonTitle>
      <p className="mt-4 text-[16px] leading-[1.45] text-[#16264e]">
        Each preset starts on the same hill. Only step size and carry-over
        change the path.
      </p>
      <div className="mt-4 grid gap-3">
        {gradientPresets.map((preset) => {
          const isSelected = preset.id === activePreset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`min-w-0 rounded-[10px] border p-4 text-left transition ${
                isSelected
                  ? "border-[#5636f5] bg-[linear-gradient(180deg,#694bff,#4a27e8)] text-white shadow-[0_14px_24px_rgba(70,39,232,0.2)]"
                  : "border-[#d8e0f0] bg-white text-[#0d1429] hover:border-[#b9c4de] hover:bg-[#fbfaff]"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-black uppercase">
                  {preset.label}
                </span>
                <span className="font-mono text-[12px] font-black">
                  η {formatNumber(preset.learningRate, 2)}
                </span>
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
        })}
      </div>
    </Panel>
  );
}

function ControlsPanel({
  learningRate,
  momentum,
  isRunning,
  onLearningRateChange,
  onMomentumChange,
  onStep,
  onRunToggle,
  onReset,
}: {
  learningRate: number;
  momentum: number;
  isRunning: boolean;
  onLearningRateChange: (value: number) => void;
  onMomentumChange: (value: number) => void;
  onStep: () => void;
  onRunToggle: () => void;
  onReset: () => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>3. Tune The Update</LessonTitle>
      <div className="mt-5 grid gap-6">
        <Slider
          id="learning-rate"
          label="Learning rate η"
          min={0.02}
          max={1.8}
          step={0.01}
          value={learningRate}
          markers={["tiny", "useful", "wild"]}
          onChange={onLearningRateChange}
        />
        <Slider
          id="momentum"
          label="Momentum β"
          min={0}
          max={0.9}
          step={0.01}
          value={momentum}
          markers={["none", "carry", "heavy"]}
          onChange={onMomentumChange}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={onStep}
          className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#4a27e8] bg-[#352cff] px-4 py-3 text-[15px] font-black text-white shadow-[0_12px_22px_rgba(70,39,232,0.18)]"
        >
          <StepIcon />
          Step
        </button>
        <button
          type="button"
          onClick={onRunToggle}
          className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#c9d2e8] bg-white px-4 py-3 text-[15px] font-black text-[#071024] transition hover:bg-[#fbfaff]"
        >
          {isRunning ? <PauseIcon /> : <PlayIcon />}
          {isRunning ? "Pause" : "Run"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#c9d2e8] bg-white px-4 py-3 text-[15px] font-black text-[#071024] transition hover:bg-[#fbfaff]"
        >
          <ResetIcon />
          Reset
        </button>
      </div>
    </Panel>
  );
}

function MicroscopePanel({
  state,
  learningRate,
  momentum,
}: {
  state: DescentState;
  learningRate: number;
  momentum: number;
}) {
  const analysis = analyzeDescent(state, learningRate, momentum);
  const rateTerm = -learningRate * analysis.gradient;
  const momentumTerm = momentum * state.velocity;

  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>4. Next Step Microscope</LessonTitle>
      <div className="mt-4 rounded-[10px] border border-[#dedcff] bg-[#f8f7ff] px-4 py-4 font-mono text-[15px] font-black leading-[1.8] text-[#071024] sm:text-[17px]">
        <p>
          θₙ₊₁ ={" "}
          <span className="text-[#2f39ff]">{formatNumber(state.theta, 2)}</span>
        </p>
        <p>
          {" "}
          + <span className="text-[#ff3b2f]">
            {formatSigned(rateTerm, 2)}
          </span>{" "}
          +{" "}
          <span className="text-[#16a34a]">
            {formatSigned(momentumTerm, 2)}
          </span>
        </p>
        <p className="border-t border-[#d6dcf0] pt-2">
          ={" "}
          <span className="text-[#352cff]">
            {formatNumber(analysis.nextTheta, 2)}
          </span>
        </p>
      </div>
      <div className="mt-4 grid gap-3">
        <div className="rounded-[8px] border border-[#dfe4f4] bg-white px-3 py-2 text-[14px] leading-[1.35] text-[#263a68]">
          <span className="font-black text-[#ff3b2f]">Gradient</span> points
          downhill.
        </div>
        <div className="rounded-[8px] border border-[#dfe4f4] bg-white px-3 py-2 text-[14px] leading-[1.35] text-[#263a68]">
          <span className="font-black text-[#352cff]">Learning rate</span>{" "}
          stretches the step.
        </div>
        <div className="rounded-[8px] border border-[#dfe4f4] bg-white px-3 py-2 text-[14px] leading-[1.35] text-[#263a68]">
          <span className="font-black text-[#16a34a]">Momentum</span> carries
          yesterday&apos;s shove.
        </div>
      </div>
      <div className="mt-4 rounded-[8px] border border-[#dedcff] bg-[#fbfbff] px-4 py-3 text-[15px] leading-[1.35] font-bold text-[#2924ff]">
        {analysis.behaviorCopy}
      </div>
    </Panel>
  );
}

function MiniTrajectory({ preset }: { preset: GradientPreset }) {
  const points = useMemo(
    () =>
      simulateDescent(
        defaultStartTheta,
        preset.learningRate,
        preset.momentum,
        12,
      ),
    [preset],
  );
  const lastPoint = points[points.length - 1] ?? points[0];

  return (
    <div className="min-w-0 rounded-[10px] border border-[#dfe4f4] bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-black text-[#071024] uppercase">
            {preset.label}
          </p>
          <p className="mt-1 text-[12px] leading-[1.25] text-[#52628a]">
            {preset.description}
          </p>
        </div>
        <p className="font-mono text-[12px] font-black text-[#352cff]">
          L {formatNumber(loss(lastPoint.theta), 2)}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${miniChart.width} ${miniChart.height}`}
        aria-hidden="true"
        className="mt-2 h-auto w-full"
      >
        <path
          d={curvePath(miniChart)}
          fill="none"
          stroke="#b5b8ff"
          strokeWidth="3"
        />
        <path
          d={trajectoryPath(points, miniChart)}
          fill="none"
          stroke={preset.id === "overshoot" ? "#ff3b2f" : "#352cff"}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.5"
        />
        {points.slice(0, 8).map((point) => (
          <circle
            key={point.step}
            cx={xScale(point.theta, miniChart)}
            cy={yScale(loss(point.theta), miniChart)}
            r="2.8"
            fill={preset.id === "overshoot" ? "#ff3b2f" : "#352cff"}
          />
        ))}
        <line
          x1={xScale(minimumTheta, miniChart)}
          x2={xScale(minimumTheta, miniChart)}
          y1={miniChart.top}
          y2={miniChart.height - miniChart.bottom}
          stroke="#8b99bb"
          strokeDasharray="4 5"
        />
      </svg>
    </div>
  );
}

function ComparisonPanel() {
  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>5. Same Start, Different Behavior</LessonTitle>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {gradientPresets.map((preset) => (
          <MiniTrajectory key={preset.id} preset={preset} />
        ))}
      </div>
    </Panel>
  );
}

function TakeawayPanel({ state }: { state: DescentState }) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)] lg:items-center">
        <div>
          <LessonTitle>6. The Takeaway</LessonTitle>
          <p className="mt-4 max-w-4xl text-[22px] leading-[1.25] font-black text-[#071024] sm:text-[28px]">
            Gradient gives direction. Learning rate decides how far. Momentum
            carries yesterday&apos;s shove.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <FactPill label="Step" value={String(state.step)} />
          <FactPill label="θ" value={formatSigned(state.theta, 3)} />
          <FactPill label="Distance left" value={formatNumber(Math.abs(state.theta), 3)} />
        </div>
      </div>
    </Panel>
  );
}

export function GradientDescentPlayground() {
  const [activePreset, setActivePreset] = useState(defaultPreset);
  const [learningRate, setLearningRate] = useState(defaultPreset.learningRate);
  const [momentum, setMomentum] = useState(defaultPreset.momentum);
  const [history, setHistory] = useState<DescentState[]>([
    {
      theta: defaultStartTheta,
      velocity: 0,
      step: 0,
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const currentState = history[history.length - 1] ?? history[0];

  const analysis = useMemo(
    () => analyzeDescent(currentState, learningRate, momentum),
    [currentState, learningRate, momentum],
  );

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setHistory((currentHistory) => {
        const latest = currentHistory[currentHistory.length - 1];

        if (!latest || latest.step >= 60 || Math.abs(latest.theta) < 0.002) {
          window.clearInterval(timer);
          setIsRunning(false);

          return currentHistory;
        }

        return [...currentHistory, stepDescent(latest, learningRate, momentum)];
      });
    }, 520);

    return () => window.clearInterval(timer);
  }, [isRunning, learningRate, momentum]);

  function resetHistory() {
    setHistory([
      {
        theta: defaultStartTheta,
        velocity: 0,
        step: 0,
      },
    ]);
  }

  function handleSelectPreset(preset: GradientPreset) {
    setActivePreset(preset);
    setLearningRate(preset.learningRate);
    setMomentum(preset.momentum);
    setIsRunning(false);
    resetHistory();
  }

  function handleLearningRateChange(value: number) {
    setLearningRate(value);
    setIsRunning(false);
  }

  function handleMomentumChange(value: number) {
    setMomentum(value);
    setIsRunning(false);
  }

  function handleStep() {
    setIsRunning(false);
    setHistory((currentHistory) => {
      const latest = currentHistory[currentHistory.length - 1];

      if (!latest) {
        return currentHistory;
      }

      return [...currentHistory, stepDescent(latest, learningRate, momentum)];
    });
  }

  function handleReset() {
    setIsRunning(false);
    resetHistory();
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f7f9ff] px-4 py-5 text-[#071024] sm:px-7 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1536px] flex-col gap-4">
        <header className="flex flex-col gap-3 py-1 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[42px] leading-[0.95] font-black text-[#070b1a] sm:text-[56px]">
              Gradient Descent Playground
            </h1>
            <p className="mt-3 max-w-3xl text-[18px] leading-[1.35] font-semibold text-[#30446f] sm:text-[21px]">
              Step downhill on a loss curve and see why the same gradient can
              crawl, land, or launch past the valley.
            </p>
          </div>
          <div className="rounded-[10px] border border-[#dedcff] bg-white px-5 py-3 text-center font-mono text-[13px] font-black text-[#2924ff] shadow-[0_12px_30px_rgba(26,38,80,0.04)]">
            θₙ₊₁ = θₙ - η · ∇L(θₙ) + β · vₙ
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[minmax(330px,0.82fr)_minmax(0,1.3fr)_minmax(300px,0.78fr)]">
          <div className="grid content-start gap-4">
            <PresetPanel
              activePreset={activePreset}
              onSelectPreset={handleSelectPreset}
            />
            <ControlsPanel
              learningRate={learningRate}
              momentum={momentum}
              isRunning={isRunning}
              onLearningRateChange={handleLearningRateChange}
              onMomentumChange={handleMomentumChange}
              onStep={handleStep}
              onRunToggle={() => setIsRunning((current) => !current)}
              onReset={handleReset}
            />
          </div>

          <LossChart
            history={history}
            learningRate={learningRate}
            momentum={momentum}
          />

          <div className="grid content-start gap-4">
            <MicroscopePanel
              state={currentState}
              learningRate={learningRate}
              momentum={momentum}
            />
            <Panel className="p-5 sm:p-6">
              <LessonTitle>Live Values</LessonTitle>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <FactPill label="Behavior" value={analysis.behavior} />
                <FactPill label="Step size" value={formatNumber(analysis.stepSize, 3)} />
                <FactPill
                  label="Velocity"
                  value={formatSigned(currentState.velocity, 3)}
                />
                <FactPill
                  label="Next θ"
                  value={formatSigned(analysis.nextTheta, 3)}
                />
              </div>
            </Panel>
          </div>
        </div>

        <ComparisonPanel />
        <TakeawayPanel state={currentState} />
      </div>
    </main>
  );
}
