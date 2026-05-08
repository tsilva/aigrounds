"use client";

import { type CSSProperties, type ReactNode, useMemo, useState } from "react";
import {
  analyzeArrivals,
  clampEventChance,
  clampWindowMinutes,
  type ArrivalAnalysis,
} from "./waiting-arrival-distributions-engine";
import {
  arrivalScenarios,
  defaultScenario,
  type ArrivalScenario,
} from "./scenario";

function formatDecimal(value: number, digits: number) {
  return value.toFixed(digits);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatSeconds(value: number) {
  return `${value.toFixed(value < 10 ? 1 : 0)} s`;
}

function formatMinutes(value: number) {
  return `${value.toFixed(2)} min`;
}

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
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

function LessonTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[18px] leading-none font-black text-[#352cff] uppercase">
      {children}
    </h2>
  );
}

function FactPill({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
}) {
  return (
    <div className="min-w-0 rounded-[8px] border border-[#dfe4f4] bg-white px-3 py-3">
      <p className="text-[11px] font-black tracking-[0.03em] text-[#617098] uppercase">
        {label}
      </p>
      <div className="mt-1 font-mono text-[24px] leading-none font-black text-[#0c8d3f]">
        {value}
      </div>
      {detail ? (
        <p className="mt-2 text-[12px] leading-tight text-[#263a68]">{detail}</p>
      ) : null}
    </div>
  );
}

function MiniMetric({
  label,
  value,
  detail,
  tone = "green",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "green" | "amber" | "red" | "blue";
}) {
  const color =
    tone === "amber"
      ? "#f59e0b"
      : tone === "red"
        ? "#ff3b30"
        : tone === "blue"
          ? "#352cff"
          : "#0c9a45";

  return (
    <div className="rounded-[8px] border border-[#dfe4f4] bg-white px-3 py-2 text-center">
      <p className="text-[12px] font-bold text-[#263a68]">{label}</p>
      <p className="mt-1 font-mono text-[24px] leading-none font-black" style={{ color }}>
        {value}
      </p>
      {detail ? (
        <p className="mt-1 font-mono text-[11px] text-[#52628a]">{detail}</p>
      ) : null}
    </div>
  );
}

function CursorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-9 w-9">
      <path
        d="M5 3.7 18.5 12 13 13.6l3.2 5.6-2.5 1.4-3.1-5.5-4 4L5 3.7Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M4.1 12.4H2.8M8.3 2.9V1.6M12.3 5.1l1-1M3.8 4.4l-.9-.9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-9 w-9">
      <path
        d="M5 13v-1a7 7 0 0 1 14 0v1M5 13h3v5H6a1 1 0 0 1-1-1v-4ZM19 13h-3v5h2a1 1 0 0 0 1-1v-4ZM14 20h-2.5a2.5 2.5 0 0 1-2.5-2.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-9 w-9">
      <path
        d="m12 3 9 16H3L12 3Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M12 9v4M12 16.5h.01"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ScenarioIcon({ icon }: { icon: ArrivalScenario["icon"] }) {
  if (icon === "headset") {
    return <HeadsetIcon />;
  }

  if (icon === "warning") {
    return <WarningIcon />;
  }

  return <CursorIcon />;
}

function ScenarioButton({
  scenario,
  isSelected,
  onSelect,
}: {
  scenario: ArrivalScenario;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex min-w-0 items-center gap-4 rounded-[10px] border p-4 text-left transition ${
        isSelected
          ? "border-[#5636f5] bg-[linear-gradient(180deg,#694bff,#4a27e8)] text-white shadow-[0_14px_24px_rgba(70,39,232,0.2)]"
          : "border-[#d8e0f0] bg-white text-[#0d1429] hover:border-[#b9c4de] hover:bg-[#fbfaff]"
      }`}
    >
      <span className="shrink-0">
        <ScenarioIcon icon={scenario.icon} />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] leading-tight font-black">
          {scenario.title}
        </span>
        <span
          className={`mt-1 block text-[13px] ${
            isSelected ? "text-white/85" : "text-[#30446f]"
          }`}
        >
          {scenario.subtitle}
        </span>
      </span>
    </button>
  );
}

function StoryPanel({
  selectedScenario,
  analysis,
  onSelectScenario,
}: {
  selectedScenario: ArrivalScenario["id"];
  analysis: ArrivalAnalysis;
  onSelectScenario: (scenario: ArrivalScenario) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(520px,0.9fr)]">
        <div className="min-w-0">
          <LessonTitle>1. Choose The Arrival Story</LessonTitle>
          <p className="mt-3 text-[15px] leading-[1.4] text-[#16264e]">
            Pick a scenario. The rate sets both waiting times and counts.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {arrivalScenarios.map((scenario) => (
              <ScenarioButton
                key={scenario.id}
                scenario={scenario}
                isSelected={selectedScenario === scenario.id}
                onSelect={() => onSelectScenario(scenario)}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FactPill
            label="Per-second chance p"
            value={formatDecimal(analysis.pPerSecond, 4)}
            detail={`${formatPercent(analysis.pPerSecond)} per second`}
          />
          <FactPill
            label="Arrival rate lambda"
            value={
              <>
                {formatDecimal(analysis.lambdaPerMinute, 2)}
                <span className="ml-1 text-[14px] text-[#263a68]">/ min</span>
              </>
            }
            detail="lambda = 60p"
          />
          <FactPill
            label="Expected count lambda T"
            value={formatDecimal(analysis.expectedCount, 1)}
            detail={`T = ${analysis.windowMinutes} min`}
          />
          <FactPill
            label="Mean wait 1/p"
            value={
              <>
                {formatDecimal(analysis.meanWaitSeconds, 1)}
                <span className="ml-1 text-[14px] text-[#263a68]">s</span>
              </>
            }
            detail="Average time to next event"
          />
        </div>
      </div>
    </Panel>
  );
}

function FormulaPanel() {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)]">
        <div className="min-w-0">
          <LessonTitle>2. Watch The Two Questions Split</LessonTitle>
          <p className="mt-4 text-[14px] leading-[1.35] font-bold text-[#071024]">
            Question A: How long until the next event?
          </p>
          <p className="text-[13px] text-[#263a68]">
            Geometric distribution, discrete time in seconds.
          </p>
          <div className="mt-3 grid gap-3 rounded-[8px] border border-[#dbe2f2] bg-[#fbfbff] p-4 md:grid-cols-[1fr_150px]">
            <div className="text-center font-serif text-[24px] leading-[1.35] text-[#071024] sm:text-[30px]">
              P(W = k) = (1 - p)<sup>k-1</sup>p
              <div className="mt-1 text-[18px]">k = 1, 2, 3, ...</div>
            </div>
            <div className="space-y-1 self-center font-mono text-[12px] font-bold text-[#352cff]">
              <p>p = chance per second</p>
              <p>k = seconds to first event</p>
              <p>W = waiting time</p>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-center rounded-[10px] border border-[#f0ddb4] bg-[#fffaf0] p-4 text-center">
          <p className="text-[12px] font-black tracking-[0.03em] text-[#071024] uppercase">
            Tick model for waits; rate model for counts
          </p>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 font-mono text-[#071024]">
            <div>
              <p className="text-[28px] font-black">p</p>
              <p className="text-[11px]">per second</p>
            </div>
            <span className="text-[24px] text-[#352cff]">→</span>
            <div>
              <p className="text-[23px] font-black">λ = 60p</p>
              <p className="text-[11px]">per minute</p>
            </div>
            <span className="text-[24px] text-[#352cff]">→</span>
            <div>
              <p className="text-[24px] font-black">λT</p>
              <p className="text-[11px]">expected arrivals</p>
            </div>
          </div>
          <p className="mt-3 rounded-full border border-[#d8e0f3] bg-white px-3 py-2 text-[12px] font-bold text-[#263a68]">
            Independent arrivals, steady rate
          </p>
          <p className="mt-2 text-[12px] leading-tight text-[#52628a]">
            Small p over many ticks behaves like a Poisson rate.
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[14px] leading-[1.35] font-bold text-[#071024]">
            Question B: How many events in a fixed window?
          </p>
          <p className="text-[13px] text-[#263a68]">
            Poisson rate model for counts in a time window.
          </p>
          <div className="mt-3 grid gap-3 rounded-[8px] border border-[#dbe2f2] bg-[#fbfbff] p-4 md:grid-cols-[1fr_170px]">
            <div className="text-center font-serif text-[24px] leading-[1.35] text-[#071024] sm:text-[30px]">
              P(N = k) = e<sup>-λT</sup> (λT)<sup>k</sup> / k!
              <div className="mt-1 text-[18px]">k = 0, 1, 2, ...</div>
            </div>
            <div className="space-y-1 self-center font-mono text-[12px] font-bold text-[#352cff]">
              <p>λ = rate per minute</p>
              <p>T = window minutes</p>
              <p>N = count in window</p>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Timeline({
  analysis,
  compact = false,
}: {
  analysis: ArrivalAnalysis;
  compact?: boolean;
}) {
  const ticks = Array.from(
    { length: analysis.windowMinutes + 1 },
    (_, index) => index,
  );

  return (
    <div className="min-w-[330px] sm:min-w-[620px]">
      <div className="relative h-16 px-9">
        <div className="absolute top-7 right-9 left-9 h-[2px] bg-[#16305f]" />
        {ticks.map((tick) => (
          <div
            key={tick}
            className="absolute top-[22px] flex -translate-x-1/2 flex-col items-center"
            style={{ left: `calc(36px + ${(tick / analysis.windowMinutes) * 100}% - ${(tick / analysis.windowMinutes) * 72}px)` }}
          >
            <span className="mb-2 font-mono text-[11px] font-bold text-[#263a68]">
              {tick}
            </span>
            <span className="h-3 w-[1px] bg-[#16305f]" />
          </div>
        ))}
        {analysis.eventMarks.map((mark, index) => {
          const isLongGap =
            index > 0 && (mark - analysis.eventMarks[index - 1]) * 60 > analysis.meanWaitSeconds;
          const isVeryLong =
            index > 0 && (mark - analysis.eventMarks[index - 1]) * 60 > analysis.meanWaitSeconds * 2;
          const color = isVeryLong ? "#ff2525" : isLongGap ? "#f5a400" : "#0c8d3f";

          return (
            <div
              key={`${mark}-${index}`}
              className="absolute top-[20px] flex -translate-x-1/2 flex-col items-center"
              style={{ left: `calc(36px + ${(mark / analysis.windowMinutes) * 100}% - ${(mark / analysis.windowMinutes) * 72}px)` }}
            >
              <span
                className="h-3 w-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="mt-3 font-mono text-[11px] font-bold text-[#263a68]">
                {compact ? mark.toFixed(2) : ""}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between px-2 font-mono text-[12px] font-bold text-[#263a68]">
        <span>0 min</span>
        <span>{analysis.windowMinutes} min</span>
      </div>
    </div>
  );
}

function WaitingHistogram({ analysis }: { analysis: ArrivalAnalysis }) {
  const maxProbability = Math.max(
    ...analysis.waitingBuckets.map((bucket) => bucket.probability),
  );

  return (
    <div className="min-w-0 rounded-[10px] border border-[#dfe4f4] bg-white p-4">
      <p className="text-[14px] font-black text-[#001cff]">
        A) How long until the next event? (Geometric waiting time)
      </p>
      <p className="mt-1 text-[13px] text-[#263a68]">
        Tick-model distribution of waiting time W in seconds.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_150px]">
        <div className="min-w-0 overflow-x-auto">
          <div className="flex h-52 w-full items-end gap-1 border-b border-l border-[#b9c4de] px-1 pb-7 sm:gap-3 sm:px-3">
            {analysis.waitingBuckets.map((bucket) => (
              <div key={bucket.label} className="relative flex flex-1 flex-col items-center">
                <span className="mb-1 font-mono text-[10px] font-black text-[#071024] sm:text-[12px]">
                  {formatPercent(bucket.probability)}
                </span>
                <div
                  className="w-full max-w-[28px] rounded-t-[3px] sm:max-w-[44px]"
                  style={{
                    height: `${(bucket.probability / maxProbability) * 118}px`,
                    backgroundColor: bucket.tone,
                  }}
                />
                <span className="absolute -bottom-6 whitespace-nowrap font-mono text-[9px] font-bold text-[#263a68] sm:text-[11px]">
                  {bucket.label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-[12px] font-bold text-[#263a68]">
            Waiting time (seconds)
          </p>
        </div>
        <div className="grid gap-2">
          <MiniMetric
            label="P(wait <= 20s)"
            value={formatPercent(analysis.waitWithin20Seconds)}
            detail="= 1 - (1 - p)^20"
          />
          <MiniMetric
            label="Median wait"
            value={`~ ${analysis.medianWaitSeconds} s`}
            tone="blue"
          />
          <MiniMetric
            label="P(wait > 60s)"
            value={formatPercent(analysis.waitAfter60Seconds)}
            detail="= (1 - p)^60"
            tone="amber"
          />
        </div>
      </div>
    </div>
  );
}

function PoissonChart({ analysis }: { analysis: ArrivalAnalysis }) {
  const maxProbability = Math.max(
    ...analysis.countMass.map((point) => point.probability),
  );

  return (
    <div className="min-w-0 rounded-[10px] border border-[#dfe4f4] bg-white p-4">
      <p className="text-[14px] font-black text-[#001cff]">
        B) How many events in {analysis.windowMinutes} minutes? (Poisson counts)
      </p>
      <p className="mt-1 text-[13px] text-[#263a68]">
        Rate-model count distribution with mean λT ={" "}
        {formatDecimal(analysis.expectedCount, 1)}.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_150px]">
        <div className="min-w-0 overflow-x-auto">
          <div className="flex h-52 w-full items-end gap-1 border-b border-l border-[#b9c4de] pt-0 pr-6 pb-7 pl-1 sm:gap-2 sm:px-3">
            {analysis.countMass.map((point) => (
              <div key={point.label} className="relative flex flex-1 flex-col items-center">
                <span className="mb-1 font-mono text-[9px] font-black text-[#071024] sm:text-[11px]">
                  {point.label === "9+"
                    ? `${Math.round(point.probability * 100)}%`
                    : formatPercent(point.probability)}
                </span>
                <div
                  className="w-full max-w-[18px] rounded-t-[3px] sm:max-w-[36px]"
                  style={{
                    height: `${(point.probability / maxProbability) * 118}px`,
                    backgroundColor: point.isMode ? "#16a34a" : "#aab5c8",
                  }}
                />
                <span className="absolute -bottom-6 font-mono text-[9px] font-bold text-[#263a68] sm:text-[11px]">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-[12px] font-bold text-[#263a68]">
            Number of arrivals (k)
          </p>
        </div>
        <div className="grid gap-2">
          <MiniMetric label="Most likely count" value={analysis.modeLabel} />
          <MiniMetric
            label="P(0 arrivals)"
            value={formatPercent(analysis.zeroArrivalProbability)}
            detail="= e^-λT"
            tone="blue"
          />
          <MiniMetric
            label="P(at least 1)"
            value={formatPercent(analysis.atLeastOneProbability)}
            detail="= 1 - e^-λT"
          />
        </div>
      </div>
    </div>
  );
}

function IntuitionPanel({ analysis }: { analysis: ArrivalAnalysis }) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <LessonTitle>3. The Intuition: One Rate, Two Linked Views</LessonTitle>
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[13px] font-bold text-[#263a68]">
          <span>p = {formatDecimal(analysis.pPerSecond, 3)} per second</span>
          <span>λ = {formatDecimal(analysis.lambdaPerMinute, 2)} per minute</span>
          <span>T = {analysis.windowMinutes} min</span>
          <span>λT = {formatDecimal(analysis.expectedCount, 1)}</span>
          <span>Mean wait = {formatSeconds(analysis.meanWaitSeconds)}</span>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-[10px] border border-[#dfe4f4] bg-[#fbfbff] px-4 py-3">
        <Timeline analysis={analysis} />
      </div>
      <div className="mt-4 grid gap-4 2xl:grid-cols-2">
        <WaitingHistogram analysis={analysis} />
        <PoissonChart analysis={analysis} />
      </div>
    </Panel>
  );
}

function ChancePanel({
  analysis,
  onChangeP,
  onChangeWindow,
}: {
  analysis: ArrivalAnalysis;
  onChangeP: (value: number) => void;
  onChangeWindow: (value: number) => void;
}) {
  const progress = ((analysis.pPerSecond - 0.001) / (0.1 - 0.001)) * 100;

  return (
    <Panel className="p-5">
      <div className="flex items-baseline justify-between gap-4">
        <LessonTitle>4. Set The Chance</LessonTitle>
        <input
          aria-label="Per-second event chance value"
          type="number"
          min={0.001}
          max={0.1}
          step={0.001}
          value={formatDecimal(analysis.pPerSecond, 4)}
          onChange={(event) => onChangeP(Number(event.target.value))}
          className="h-9 w-24 rounded-[8px] border border-transparent bg-white px-2 text-right font-mono text-[18px] font-black text-[#071024] outline-none transition focus:border-[#6b55ff]"
        />
      </div>
      <label className="mt-5 block">
        <span className="text-[13px] font-bold text-[#263a68]">
          Per-second chance p (events per second)
        </span>
        <input
          type="range"
          min={0.001}
          max={0.1}
          step={0.001}
          value={analysis.pPerSecond}
          onChange={(event) => onChangeP(Number(event.target.value))}
          className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dce1ec] accent-[#352cff] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#352cff] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#352cff]"
          style={
            {
              background: `linear-gradient(90deg, #352cff 0%, #352cff ${progress}%, #dce1ec ${progress}%, #dce1ec 100%)`,
            } as CSSProperties
          }
        />
        <span className="mt-2 flex justify-between font-mono text-[11px] font-bold text-[#263a68]">
          <span>0.001</span>
          <span>0.100</span>
        </span>
      </label>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[13px] font-bold text-[#263a68]">
            Window length T (minutes)
          </p>
          <div className="mt-2 grid grid-cols-[44px_1fr_44px] overflow-hidden rounded-[8px] border border-[#d8e0f3]">
            <button
              type="button"
              onClick={() => onChangeWindow(analysis.windowMinutes - 1)}
              className="h-10 bg-white text-[20px] font-bold text-[#352cff] hover:bg-[#f7f8ff]"
            >
              -
            </button>
            <div className="grid h-10 place-items-center border-x border-[#d8e0f3] bg-white font-mono text-[14px] font-black text-[#071024]">
              {analysis.windowMinutes} min
            </div>
            <button
              type="button"
              onClick={() => onChangeWindow(analysis.windowMinutes + 1)}
              className="h-10 bg-white text-[20px] font-bold text-[#352cff] hover:bg-[#f7f8ff]"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#263a68]">
            Time step (tick)
          </p>
          <div className="mt-2 grid h-10 place-items-center rounded-[8px] border border-[#d8e0f3] bg-white font-mono text-[14px] font-black text-[#071024]">
            1 second
          </div>
        </div>
      </div>
      <div className="mt-4 grid overflow-hidden rounded-[8px] border border-[#d8e0f3] bg-[#fbfbff] text-center sm:grid-cols-3">
        <div className="border-b border-[#d8e0f3] p-3 sm:border-b-0">
          <p className="text-[11px] font-bold text-[#52628a]">λ = 60p</p>
          <p className="font-mono text-[18px] font-black text-[#071024]">
            {formatDecimal(analysis.lambdaPerMinute, 2)}
          </p>
        </div>
        <div className="border-b border-[#d8e0f3] p-3 sm:border-x sm:border-b-0">
          <p className="text-[11px] font-bold text-[#52628a]">λT count</p>
          <p className="font-mono text-[18px] font-black text-[#071024]">
            {formatDecimal(analysis.expectedCount, 1)}
          </p>
        </div>
        <div className="p-3">
          <p className="text-[11px] font-bold text-[#52628a]">Mean wait</p>
          <p className="font-mono text-[18px] font-black text-[#071024]">
            {formatSeconds(analysis.meanWaitSeconds)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-[12px] text-[#263a68]">
        All charts and metrics update when p or T changes.
      </p>
    </Panel>
  );
}

function RunPanel({ analysis }: { analysis: ArrivalAnalysis }) {
  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-center gap-3">
        <LessonTitle>5. Run Arrivals</LessonTitle>
      </div>
      <p className="mt-4 text-[13px] text-[#263a68]">
        Deterministic sample arrivals for the current window (
        {analysis.windowMinutes} minutes, {analysis.eventMarks.length} events).
        Change p or T to regenerate this window.
      </p>
      <div className="mt-2 overflow-x-auto rounded-[10px] border border-[#dfe4f4] bg-[#fbfbff] px-3 py-2">
        <Timeline analysis={analysis} compact />
        <div className="mt-1 flex flex-wrap items-center justify-center gap-4 text-[12px] text-[#263a68]">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0c8d3f]" /> Event
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#f5a400]" /> Longer gap
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ff2525]" /> Very long gap
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-[8px] border border-[#d8e0f3] bg-white text-center sm:grid-cols-4">
        <MiniRunMetric label="Arrivals" value={String(analysis.eventMarks.length)} />
        <MiniRunMetric
          label="Longest gap"
          value={formatMinutes(analysis.longestGapSeconds / 60)}
          detail={`(${formatSeconds(analysis.longestGapSeconds)})`}
          tone="amber"
        />
        <MiniRunMetric
          label="Shortest gap"
          value={formatMinutes(analysis.shortestGapSeconds / 60)}
          detail={`(${formatSeconds(analysis.shortestGapSeconds)})`}
        />
        <MiniRunMetric
          label="Average gap"
          value={formatMinutes(analysis.averageGapSeconds / 60)}
          detail={`(${formatSeconds(analysis.averageGapSeconds)})`}
          tone="blue"
        />
      </div>
    </Panel>
  );
}

function MiniRunMetric({
  label,
  value,
  detail,
  tone = "green",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "green" | "amber" | "blue";
}) {
  const color = tone === "amber" ? "#f59e0b" : tone === "blue" ? "#352cff" : "#0c9a45";

  return (
    <div className="min-w-0 border-r border-[#d8e0f3] p-3 last:border-r-0">
      <p className="text-[11px] font-bold text-[#52628a]">{label}</p>
      <p className="font-mono text-[20px] font-black" style={{ color }}>
        {value}
      </p>
      {detail ? (
        <p className="font-mono text-[11px] text-[#52628a]">{detail}</p>
      ) : null}
    </div>
  );
}

function RareEventPanel({ analysis }: { analysis: ArrivalAnalysis }) {
  const exact = analysis.atLeastOneProbability;
  const approximation = Math.min(1, analysis.expectedCount);
  const approximationGap = Math.abs(exact - approximation);
  const isTiny = analysis.expectedCount <= 0.1;

  return (
    <Panel className="p-5">
      <LessonTitle>6. Rare Event Takeaway</LessonTitle>
      <p className="mt-3 text-[13px] font-bold text-[#263a68]">
        The approximation P(at least one) ≈ λT works when λT is tiny.
      </p>
      <div className="mt-4 grid overflow-hidden rounded-[10px] border border-[#d8e0f3] bg-white md:grid-cols-2">
        <div className="border-b border-[#d8e0f3] p-4 text-center md:border-r md:border-b-0">
          <p className="text-[12px] font-black text-[#263a68]">Main setting</p>
          <p className="mt-2 font-mono text-[13px] text-[#263a68]">
            Use the exact rate-model formula.
          </p>
          <p className="mt-4 break-words font-mono text-[26px] leading-none font-black text-[#0c9a45] sm:text-[34px]">
            1 - e^-λT
          </p>
        </div>
        <div className="p-4 text-center">
          <p className="text-[12px] font-black text-[#263a68]">
            Current setting
          </p>
          <p className="mt-2 font-mono text-[13px] text-[#263a68]">
            λ = {formatDecimal(analysis.lambdaPerMinute, 2)}/min, T ={" "}
            {analysis.windowMinutes} min, λT ={" "}
            {formatDecimal(analysis.expectedCount, 2)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <MiniMetric
              label="Exact"
              value={formatPercent(exact)}
              detail="1 - e^-λT"
              tone="amber"
            />
            <MiniMetric
              label="Approx"
              value={formatPercent(approximation)}
              detail="λT"
              tone="green"
            />
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-[8px] border border-[#bce6ca] bg-[#eefaf2] px-4 py-3 text-[13px] leading-[1.4] text-[#126b35]">
        {isTiny
          ? `λT is tiny here, so the shortcut is close. Difference: ${formatPercent(
              approximationGap,
            )}.`
          : `λT is not tiny here, so use the exact formula. Shortcut difference: ${formatPercent(
              approximationGap,
            )}.`}
      </div>
    </Panel>
  );
}

export function WaitingArrivalDistributionsPlayground() {
  const [selectedScenario, setSelectedScenario] = useState(defaultScenario.id);
  const [pPerSecond, setPPerSecond] = useState(defaultScenario.pPerSecond);
  const [windowMinutes, setWindowMinutes] = useState(defaultScenario.windowMinutes);
  const analysis = useMemo(
    () => analyzeArrivals(pPerSecond, windowMinutes),
    [pPerSecond, windowMinutes],
  );

  function handleSelectScenario(scenario: ArrivalScenario) {
    setSelectedScenario(scenario.id);
    setPPerSecond(scenario.pPerSecond);
    setWindowMinutes(scenario.windowMinutes);
  }

  return (
    <main className="min-h-screen bg-[#f8faff] px-4 py-6 text-[#071024] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <header className="flex flex-col gap-4 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[38px] leading-none font-black tracking-[-0.03em] text-[#030816] sm:text-[52px]">
              Waiting & Arrival Distributions Lab
            </h1>
            <p className="mt-3 text-[18px] leading-tight font-bold text-[#233b70] sm:text-[22px]">
              One event chance per tick has two faces: how long we wait, and
              how many arrive.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-[8px] border border-[#d9d3ff] bg-white px-6 text-[14px] font-black text-[#2429ff] shadow-[0_10px_30px_rgba(46,43,140,0.06)]"
          >
            ? What are Waiting & Arrival Distributions?
          </button>
        </header>

        <div className="space-y-4">
          <StoryPanel
            selectedScenario={selectedScenario}
            analysis={analysis}
            onSelectScenario={handleSelectScenario}
          />
          <FormulaPanel />
          <IntuitionPanel analysis={analysis} />
          <div className="grid gap-4 xl:grid-cols-[0.95fr_0.95fr_1.05fr]">
            <ChancePanel
              analysis={analysis}
              onChangeP={(value) => setPPerSecond(clampEventChance(value))}
              onChangeWindow={(value) =>
                setWindowMinutes(clampWindowMinutes(value))
              }
            />
            <RunPanel analysis={analysis} />
            <RareEventPanel analysis={analysis} />
          </div>
        </div>
      </div>
    </main>
  );
}
