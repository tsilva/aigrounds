"use client";

import { useMemo, useState } from "react";
import {
  analyzeQuantization,
  float32Bits,
  formatPercent,
  formatSigned,
  int4Bits,
  int4CodeCount,
  rangeForPreset,
  type QuantizationAnalysis,
  type QuantizationRangePreset,
} from "./linear-quantization-int4-engine";
import {
  defaultQuantizationScenario,
  quantizationScenarios,
  type QuantizationScenario,
  type QuantizationScenarioId,
} from "./scenario";

const rangePresets: {
  id: QuantizationRangePreset;
  label: string;
  helper: string;
}[] = [
  {
    id: "auto",
    label: "Auto",
    helper: "Use the block range",
  },
  {
    id: "tighter",
    label: "Tighter",
    helper: "Smaller steps",
  },
  {
    id: "wider",
    label: "Wider",
    helper: "Less clipping",
  },
];

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
    <h2 className="text-[18px] leading-none font-black text-[#052cff] uppercase">
      {children}
    </h2>
  );
}

function BlocksIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10">
      <path
        d="M18 6h12v10H18V6ZM8 20h12v10H8V20Zm20 0h12v10H28V20ZM4 34h12v10H4V34Zm14 0h12v10H18V34Zm14 0h12v10H32V34Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10">
      <path
        d="M4 25h7l4-13 7 27 7-31 5 17h10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.8"
      />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10">
      <path
        d="M8 40V8M8 40h34M13 33l8-9 7 5 11-15"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <path
        d="M21 24h.1M28 29h.1M39 14h.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="6"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" />
      <path
        d="m7.8 12.3 2.6 2.5 5.8-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ScenarioIcon({ icon }: { icon: QuantizationScenario["icon"] }) {
  if (icon === "wave") {
    return <WaveIcon />;
  }

  if (icon === "line") {
    return <LineIcon />;
  }

  return <BlocksIcon />;
}

function formatScale(value: number) {
  return value.toFixed(4);
}

function valueToPercent(value: number, min: number, max: number) {
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

function ScenarioSelector({
  activeScenario,
  analysis,
  onSelectScenario,
}: {
  activeScenario: QuantizationScenario;
  analysis: QuantizationAnalysis;
  onSelectScenario: (scenario: QuantizationScenario) => void;
}) {
  return (
    <Panel className="p-4 sm:p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div>
          <LessonTitle>1. Choose The Block</LessonTitle>
          <p className="mt-2 text-[14px] font-semibold text-[#10245a]">
            Pick a block to set the value distribution and starting range.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {quantizationScenarios.map((scenario) => {
              const isSelected = scenario.id === activeScenario.id;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => onSelectScenario(scenario)}
                  className={`relative flex min-h-[92px] items-center gap-4 rounded-[10px] border px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-[#2637ff] bg-[#f7f9ff] text-[#052cff] shadow-[0_12px_24px_rgba(38,55,255,0.08)]"
                      : "border-[#d7dff1] bg-white text-[#071024] hover:border-[#aebced]"
                  }`}
                >
                  <span className="shrink-0 text-[#1231e5]">
                    <ScenarioIcon icon={scenario.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[16px] font-black">
                      {scenario.title}
                    </span>
                    <span className="mt-1 block text-[13px] leading-[1.25] text-[#293d70]">
                      {scenario.subtitle}
                    </span>
                  </span>
                  {isSelected ? (
                    <span className="absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full bg-[#1735ff] text-white">
                      <CheckIcon />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-[10px] border border-[#cdd8f3] bg-white px-5 py-5 text-center text-[#071854]">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[18px] font-black sm:text-[24px]">
              <span>{int4Bits} bits</span>
              <span className="text-[#7280ad]">.</span>
              <span>{int4CodeCount} codes</span>
              <span className="text-[#7280ad]">.</span>
              <span>scale {formatScale(analysis.scale)}</span>
              <span className="text-[#7280ad]">.</span>
              <span>zero point {analysis.zeroPoint}</span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function LinearMap({ analysis }: { analysis: QuantizationAnalysis }) {
  const realPercent = valueToPercent(
    analysis.selectedValue,
    analysis.min,
    analysis.max,
  );
  const dequantPercent = valueToPercent(
    analysis.selected.dequantized,
    analysis.min,
    analysis.max,
  );
  const errorStart = Math.min(realPercent, dequantPercent);
  const errorWidth = Math.max(2, Math.abs(dequantPercent - realPercent));
  const stackedLabels = Math.abs(realPercent - dequantPercent) < 10;

  return (
    <Panel className="p-4 sm:p-5">
      <LessonTitle>2. Map Real Value To Code</LessonTitle>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
        <div className="min-w-0">
          <div className="mx-auto max-w-[460px] rounded-[8px] border border-[#dce4f7] bg-white px-4 py-2 text-center font-serif text-[18px] text-[#071024] sm:text-[25px]">
            q = clip(round(x / s) + z)
          </div>

          <div className="mt-6 rounded-[10px] border border-[#e2e7f5] bg-[#fbfcff] px-4 py-5">
            <div className="mb-2 flex items-center justify-between font-mono text-[12px] font-black text-[#071854]">
              <span>{formatSigned(analysis.min, 2)}</span>
              <span>0</span>
              <span>{formatSigned(analysis.max, 2)}</span>
            </div>
            <div className="relative h-24">
              <div className="absolute top-10 right-0 left-0 h-[2px] bg-[#071854]" />
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((tick) => (
                <span
                  key={tick}
                  className="absolute top-[37px] h-3 w-[1px] bg-[#071854]"
                  style={{ left: `${tick * 12.5}%` }}
                />
              ))}
              <span
                className="absolute top-3 h-16 border-l border-dashed border-[#159947]"
                style={{ left: `${realPercent}%` }}
              />
              <span
                className="absolute top-7 h-12 border-l border-dashed border-[#1735ff]"
                style={{ left: `${dequantPercent}%` }}
              />
              <span
                className="absolute top-[33px] z-10 h-4 w-4 -translate-x-1/2 rounded-full bg-[#159947]"
                style={{ left: `${realPercent}%` }}
              />
              <span
                className="absolute top-[33px] z-10 h-4 w-4 -translate-x-1/2 rounded-full bg-[#1735ff]"
                style={{ left: `${dequantPercent}%` }}
              />
              <span
                className="absolute top-0 z-20 -translate-x-1/2 rounded-[5px] border border-[#93d4a9] bg-[#f1fff5] px-2 py-0.5 font-mono text-[12px] font-black text-[#08702b]"
                style={{ left: `${realPercent}%` }}
              >
                x = {formatSigned(analysis.selectedValue, 3)}
              </span>
              <span
                className={`absolute z-20 -translate-x-1/2 rounded-[5px] border border-[#aebcff] bg-white px-2 py-0.5 font-mono text-[12px] font-black text-[#1735ff] ${
                  stackedLabels ? "top-7" : "top-0"
                }`}
                style={{ left: `${dequantPercent}%` }}
              >
                x_hat = {formatSigned(analysis.selected.dequantized, 3)}
              </span>
              <span
                className="absolute top-16 h-3 border-t-2 border-r-2 border-l-2 border-[#ff5a1f]"
                style={{
                  left: `${errorStart}%`,
                  width: `${errorWidth}%`,
                }}
              />
              <span
                className="absolute top-[76px] -translate-x-1/2 font-mono text-[12px] font-black text-[#ff4a00]"
                style={{ left: `${errorStart + errorWidth / 2}%` }}
              >
                error {formatSigned(analysis.selected.error, 3)}
              </span>
            </div>

            <div
              className="mt-6 grid overflow-hidden rounded-[7px] border border-[#aebced] bg-white"
              style={{ gridTemplateColumns: `repeat(${int4CodeCount}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: int4CodeCount }, (_, code) => (
                <div
                  key={code}
                  className={`border-r border-[#aebced] py-2 text-center font-mono text-[12px] font-black last:border-r-0 sm:text-[16px] ${
                    code === analysis.selected.code
                      ? "bg-[#dff4e5] text-[#08702b]"
                      : "text-[#071854]"
                  }`}
                >
                  {code}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[12px] font-black text-[#071854]">
              <span>0 min</span>
              <span>{analysis.zeroPoint} zero</span>
              <span>{analysis.selected.code} selected</span>
              <span>15 max</span>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-center gap-4">
          <div className="rounded-[10px] border border-[#dce4f7] bg-white p-4">
            <p className="text-[12px] font-black tracking-[0.03em] text-[#7180a5] uppercase">
              Selected value
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 font-mono text-[18px] font-black">
              <span className="text-[#08702b]">
                x = {formatSigned(analysis.selectedValue, 3)}
              </span>
              <span className="text-[#071854]">-&gt;</span>
              <span className="text-[#08702b]">
                q = {analysis.selected.code}
              </span>
              <span className="text-[#071854]">-&gt;</span>
              <span className="text-[#1735ff]">
                x_hat = {formatSigned(analysis.selected.dequantized, 3)}
              </span>
            </div>
          </div>
          <div className="rounded-[10px] border border-[#f0d1b8] bg-[#fffaf5] p-4 text-center">
            <p className="font-mono text-[13px] font-black text-[#071854]">
              Code {analysis.selected.code} represents values near{" "}
              {formatSigned(analysis.selected.dequantized, 3)}
            </p>
            <p className="mt-2 font-mono text-[13px] font-bold text-[#ff4a00]">
              round interval {formatSigned(analysis.roundingInterval.start, 3)}
              {" to "}
              {formatSigned(analysis.roundingInterval.end, 3)}
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function RealHistogram({ analysis }: { analysis: QuantizationAnalysis }) {
  return (
    <div className="min-w-0">
      <p className="text-center text-[13px] font-black text-[#071854]">
        Original weights (real values)
      </p>
      <div className="mt-3 flex h-32 items-end gap-1 border-b border-[#9aabcf] px-2">
        {analysis.realHistogram.map((bin) => (
          <div
            key={`${bin.start}-${bin.end}`}
            className={`flex-1 rounded-t-[3px] border ${
              bin.clipped
                ? "border-[#ff7a1a] bg-[#ffb15e]"
                : "border-[#2f65ff] bg-[#9fc1ff]"
            }`}
            style={{ height: `${Math.max(6, bin.ratio * 100)}%` }}
            title={`${bin.label}: ${bin.count}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[12px] font-bold text-[#071854]">
        <span>{formatSigned(analysis.min, 2)}</span>
        <span>0</span>
        <span>{formatSigned(analysis.max, 2)}</span>
      </div>
    </div>
  );
}

function ShelfLadder({ analysis }: { analysis: QuantizationAnalysis }) {
  return (
    <div className="min-w-0">
      <p className="text-center text-[13px] font-black text-[#071854]">
        Snap to nearest shelf
      </p>
      <div className="mt-3 flex h-32 flex-col justify-between px-6 py-1">
        {Array.from({ length: int4CodeCount }, (_, index) => {
          const code = int4CodeCount - 1 - index;
          const selected = code === analysis.selected.code;

          return (
            <div key={code} className="relative flex items-center">
              <span className="h-[1px] flex-1 bg-[#b8c5e4]" />
              <span
                className={`mx-2 h-2.5 w-2.5 rounded-full ${
                  selected ? "bg-[#159947]" : "bg-[#6f7d99]"
                }`}
              />
              <span className="h-[1px] flex-1 bg-[#b8c5e4]" />
              {selected ? (
                <span className="absolute left-[calc(50%+22px)] whitespace-nowrap font-mono text-[12px] font-black text-[#08702b]">
                  q={code}, center {formatSigned(analysis.selected.dequantized, 3)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuantizedHistogram({ analysis }: { analysis: QuantizationAnalysis }) {
  const axisLabels = new Set([0, 4, 8, analysis.selected.code, 15]);

  return (
    <div className="min-w-0">
      <p className="text-center text-[13px] font-black text-[#071854]">
        Quantized values (dequantized)
      </p>
      <div className="mt-3 flex h-32 items-end gap-1 border-b border-[#9aabcf] px-2">
        {analysis.codeBins.map((bin) => (
          <div
            key={bin.code}
            className={`flex-1 rounded-t-[3px] border ${
              bin.selected
                ? "border-[#08702b] bg-[#73c887]"
                : bin.code === 0 || bin.code === 15
                  ? "border-[#ff7a1a] bg-[#ffb15e]"
                  : "border-[#2f65ff] bg-[#9fc1ff]"
            }`}
            style={{ height: `${Math.max(5, bin.ratio * 100)}%` }}
            title={`q=${bin.code}, center=${formatSigned(bin.center, 3)}`}
          />
        ))}
      </div>
      <div
        className="mt-2 grid font-mono text-[12px] font-bold text-[#071854]"
        style={{ gridTemplateColumns: `repeat(${int4CodeCount}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: int4CodeCount }, (_, code) => (
          <span
            key={code}
            className={`text-center ${
              code === analysis.selected.code ? "text-[#08702b]" : ""
            }`}
          >
            {axisLabels.has(code) ? code : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  helper,
  tone = "blue",
}: {
  label: string;
  value: string;
  helper: string;
  tone?: "blue" | "green" | "orange";
}) {
  const color =
    tone === "green" ? "text-[#08702b]" : tone === "orange" ? "text-[#ff4a00]" : "text-[#1735ff]";

  return (
    <div className="rounded-[9px] border border-[#dce4f7] bg-white px-3 py-3 text-center">
      <p className="text-[11px] font-black tracking-[0.03em] text-[#071854] uppercase">
        {label}
      </p>
      <p className={`mt-1 font-mono text-[24px] font-black ${color}`}>
        {value}
      </p>
      <p className="mt-1 text-[11px] font-semibold text-[#263a68]">{helper}</p>
    </div>
  );
}

function ErrorPanel({ analysis }: { analysis: QuantizationAnalysis }) {
  return (
    <Panel className="p-4 sm:p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <LessonTitle>3. 16 Shelves, Two Kinds Of Error</LessonTitle>
          <p className="mt-2 text-[14px] font-semibold text-[#10245a]">
            Many real values snap to one of 16 shelves. Values beyond the chosen
            range clip to the ends.
          </p>
          <div className="mt-4 grid gap-8 md:grid-cols-3 md:gap-5">
            <RealHistogram analysis={analysis} />
            <ShelfLadder analysis={analysis} />
            <QuantizedHistogram analysis={analysis} />
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-[12px] font-bold text-[#263a68]">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-[3px] bg-[#9fc1ff]" />
              within range
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-[3px] bg-[#73c887]" />
              selected q={analysis.selected.code}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-[3px] bg-[#ffb15e]" />
              clipped
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <MetricTile
            label="Rounding error"
            value={analysis.averageAbsoluteError.toFixed(3)}
            helper="mean abs error"
            tone="blue"
          />
          <MetricTile
            label="Clipped"
            value={formatPercent(analysis.clippedRatio)}
            helper="of values"
            tone="orange"
          />
          <MetricTile
            label="Memory vs FP32"
            value={`${analysis.compressionRatio.toFixed(0)}x`}
            helper={`${float32Bits}-bit -> ${int4Bits}-bit`}
            tone="green"
          />
        </div>
      </div>
    </Panel>
  );
}

function RangePanel({
  analysis,
  activePreset,
  onSelectPreset,
}: {
  analysis: QuantizationAnalysis;
  activePreset: QuantizationRangePreset;
  onSelectPreset: (preset: QuantizationRangePreset) => void;
}) {
  return (
    <Panel className="p-4 sm:p-5">
      <LessonTitle>4. Tune The Range</LessonTitle>
      <p className="mt-2 text-[14px] font-semibold text-[#10245a]">
        The block range sets both the code spacing and the amount of clipping.
      </p>
      <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-[8px] border border-[#cdd8f3]">
        {rangePresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset.id)}
            className={`px-3 py-2 text-[13px] font-black transition ${
              preset.id === activePreset
                ? "bg-[#1735ff] text-white"
                : "bg-white text-[#071854] hover:bg-[#f4f7ff]"
            }`}
          >
            <span className="block">{preset.label}</span>
            <span
              className={`mt-0.5 block text-[10px] font-bold ${
                preset.id === activePreset ? "text-white/80" : "text-[#52648f]"
              }`}
            >
              {preset.helper}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-[10px] border border-[#dce4f7] bg-[#fbfcff] p-4">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full bg-[#1735ff]" />
          <span className="h-[6px] flex-1 rounded-full bg-[#1735ff]" />
          <span className="h-4 w-4 rounded-full bg-[#1735ff]" />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[12px] font-black text-[#071854]">
          <span>{formatSigned(analysis.min, 2)}</span>
          <span>{formatSigned(analysis.max, 2)}</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div
            className={`rounded-[8px] border px-3 py-3 ${
              activePreset === "tighter"
                ? "border-[#1735ff] bg-white"
                : "border-[#dce4f7] bg-white/70"
            }`}
          >
            <p className="text-[12px] font-black text-[#1735ff]">
              Tighter range
            </p>
            <p className="mt-1 text-[12px] font-bold text-[#263a68]">
              Smaller scale, closer shelves, more clipping.
            </p>
          </div>
          <div
            className={`rounded-[8px] border px-3 py-3 ${
              activePreset === "wider"
                ? "border-[#159947] bg-white"
                : "border-[#dce4f7] bg-white/70"
            }`}
          >
            <p className="text-[12px] font-black text-[#08702b]">
              Wider range
            </p>
            <p className="mt-1 text-[12px] font-bold text-[#263a68]">
              Larger scale, farther shelves, less clipping.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MetricTile
          label="Min"
          value={formatSigned(analysis.min, 2)}
          helper="range low"
        />
        <MetricTile
          label="Max"
          value={formatSigned(analysis.max, 2)}
          helper="range high"
        />
        <MetricTile
          label="Scale s"
          value={formatScale(analysis.scale)}
          helper="step size"
          tone="green"
        />
      </div>
    </Panel>
  );
}

function InspectPanel({
  analysis,
  activeScenario,
  activePreset,
  selectedValue,
  onSelectedValueChange,
}: {
  analysis: QuantizationAnalysis;
  activeScenario: QuantizationScenario;
  activePreset: QuantizationRangePreset;
  selectedValue: number;
  onSelectedValueChange: (value: number) => void;
}) {
  const range = rangeForPreset(activeScenario, activePreset);
  const sliderMin = Math.min(range.min, activeScenario.defaultMin) - 0.03;
  const sliderMax = Math.max(range.max, activeScenario.defaultMax) + 0.03;
  const codeDelta = analysis.selected.code - analysis.zeroPoint;
  const firstNibble = analysis.selected.code.toString(2).padStart(4, "0");
  const secondCode = 6;
  const secondNibble = secondCode.toString(2).padStart(4, "0");
  const packedByte = Number.parseInt(`${firstNibble}${secondNibble}`, 2)
    .toString(16)
    .toUpperCase()
    .padStart(2, "0");

  const steps = [
    {
      label: "divide by scale",
      helper: "x / s",
      value: (selectedValue / analysis.scale).toFixed(2),
    },
    {
      label: "round",
      helper: "round(x / s)",
      value: String(codeDelta),
    },
    {
      label: "add zero point",
      helper: "+ z",
      value: String(analysis.zeroPoint),
    },
    {
      label: "code",
      helper: "q",
      value: String(analysis.selected.code),
      tone: "green" as const,
    },
    {
      label: "nibble",
      helper: "4 bits",
      value: firstNibble,
      tone: "green" as const,
    },
  ];
  const updateSelectedValue = (value: number) => {
    const boundedValue = Math.min(sliderMax, Math.max(sliderMin, value));

    onSelectedValueChange(Number(boundedValue.toFixed(3)));
  };
  const updateSelectedValueFromPointer = (
    event: React.PointerEvent<HTMLInputElement>,
  ) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio =
      bounds.width > 0 ? (event.clientX - bounds.left) / bounds.width : 0;

    updateSelectedValue(sliderMin + ratio * (sliderMax - sliderMin));
  };

  return (
    <Panel className="p-4 sm:p-5">
      <LessonTitle>5. Inspect And Pack</LessonTitle>
      <div className="mt-4 grid gap-5 min-[1700px]:grid-cols-[minmax(0,1fr)_430px]">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="selected-value"
              className="text-[13px] font-black text-[#071854]"
            >
              Inspect one value
            </label>
            <span className="font-mono text-[16px] font-black text-[#08702b]">
              {formatSigned(selectedValue, 3)}
            </span>
          </div>
          <input
            id="selected-value"
            type="range"
            suppressHydrationWarning
            min={sliderMin}
            max={sliderMax}
            step="0.001"
            value={selectedValue}
            onInput={(event) =>
              updateSelectedValue(Number(event.currentTarget.value))
            }
            onChange={(event) =>
              updateSelectedValue(Number(event.currentTarget.value))
            }
            onPointerDown={updateSelectedValueFromPointer}
            onPointerMove={(event) => {
              if (event.buttons === 1) {
                updateSelectedValueFromPointer(event);
              }
            }}
            onPointerUp={updateSelectedValueFromPointer}
            onKeyUp={(event) =>
              updateSelectedValue(Number(event.currentTarget.value))
            }
            className="mt-3 h-2 w-full accent-[#1735ff]"
          />
          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            {steps.map((step) => (
              <div
                key={step.label}
                className="min-w-0"
              >
                <div
                  className={`min-h-[88px] min-w-0 flex-1 rounded-[9px] border px-3 py-3 text-center ${
                    step.tone === "green"
                      ? "border-[#b7dcc0] bg-[#f5fff7]"
                      : "border-[#dce4f7] bg-white"
                  }`}
                >
                  <p className="truncate text-[11px] font-black text-[#071854]">
                    {step.label}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-[#52648f]">
                    {step.helper}
                  </p>
                  <p
                    className={`mt-2 font-mono text-[21px] font-black ${
                      step.tone === "green" ? "text-[#08702b]" : "text-[#1735ff]"
                    }`}
                  >
                    {step.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-[10px] border border-[#dce4f7] bg-[#fbfcff] p-4">
          <p className="text-center text-[13px] font-black text-[#071854]">
            Pack two codes per byte
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
            <NibbleCard label="first code" code={analysis.selected.code} bits={firstNibble} />
            <span className="hidden text-center text-[22px] font-black text-[#071854] sm:block">+</span>
            <NibbleCard label="second code" code={secondCode} bits={secondNibble} />
            <span className="hidden text-center text-[22px] font-black text-[#071854] sm:block">=</span>
            <div className="rounded-[9px] border border-[#dce4f7] bg-white px-3 py-4 text-center">
              <p className="text-[11px] font-black text-[#071854]">byte</p>
              <p className="mt-2 font-mono text-[27px] font-black text-[#6d2dff]">
                0x{packedByte}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-4 rounded-[10px] border border-[#badbc4] bg-[#f3fff6] px-4 py-4 text-[#07521f]">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#159947]">
          <CheckIcon />
        </span>
        <p className="text-[16px] leading-[1.35] font-bold">
          INT4 saves memory by sharing one scale and zero point across a block;
          values come back approximate, not exact.
        </p>
      </div>
    </Panel>
  );
}

function NibbleCard({
  label,
  code,
  bits,
}: {
  label: string;
  code: number;
  bits: string;
}) {
  return (
    <div className="rounded-[9px] border border-[#dce4f7] bg-white px-3 py-4 text-center">
      <p className="text-[11px] font-black text-[#071854]">{label}</p>
      <p className="mt-1 font-mono text-[20px] font-black text-[#08702b]">
        {code}
      </p>
      <p className="font-mono text-[15px] font-black text-[#08702b]">{bits}</p>
    </div>
  );
}

export function LinearQuantizationInt4Playground() {
  const [scenarioId, setScenarioId] =
    useState<QuantizationScenarioId>(defaultQuantizationScenario.id);
  const [rangePreset, setRangePreset] =
    useState<QuantizationRangePreset>("auto");
  const [selectedValue, setSelectedValue] = useState(
    defaultQuantizationScenario.selectedValue,
  );
  const activeScenario =
    quantizationScenarios.find((scenario) => scenario.id === scenarioId) ??
    defaultQuantizationScenario;
  const analysis = useMemo(
    () => analyzeQuantization(activeScenario, rangePreset, selectedValue),
    [activeScenario, rangePreset, selectedValue],
  );

  function selectScenario(scenario: QuantizationScenario) {
    setScenarioId(scenario.id);
    setRangePreset("auto");
    setSelectedValue(scenario.selectedValue);
  }

  return (
    <main className="min-h-screen bg-[#fbfcff] px-4 py-4 text-[#071024] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[40px] leading-[0.94] font-black tracking-normal text-black sm:text-[58px] lg:text-[68px]">
              Linear Quantization (INT4) Lab
            </h1>
            <p className="mt-3 max-w-[980px] text-[17px] leading-[1.35] font-bold text-[#061b66] sm:text-[22px]">
              Turn real weights into 16 reusable integer codes, then see what
              memory savings cost.
            </p>
          </div>
        </header>

        <div className="mt-5 space-y-3">
          <ScenarioSelector
            activeScenario={activeScenario}
            analysis={analysis}
            onSelectScenario={selectScenario}
          />
          <LinearMap analysis={analysis} />
          <ErrorPanel analysis={analysis} />
          <div className="grid gap-3 2xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
            <RangePanel
              analysis={analysis}
              activePreset={rangePreset}
              onSelectPreset={setRangePreset}
            />
            <InspectPanel
              analysis={analysis}
              activeScenario={activeScenario}
              activePreset={rangePreset}
              selectedValue={selectedValue}
              onSelectedValueChange={setSelectedValue}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
