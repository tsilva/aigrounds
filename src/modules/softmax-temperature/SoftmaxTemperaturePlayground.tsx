"use client";

import { type CSSProperties, useMemo, useState } from "react";
import {
  analyzeTemperature,
  formatNumber,
  formatPercent,
  setLogit,
  type TemperatureAnalysis,
} from "./softmax-temperature-engine";
import {
  initialTemperature,
  softmaxClasses,
  softmaxPresets,
  type SoftmaxClassId,
  type SoftmaxClass,
  type SoftmaxLogits,
  type SoftmaxPreset,
} from "./scenario";

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

function PresetSelector({
  activePreset,
  logits,
  onSelectPreset,
}: {
  activePreset: SoftmaxPreset;
  logits: SoftmaxLogits;
  onSelectPreset: (preset: SoftmaxPreset) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="min-w-0">
          <LessonTitle>1. Choose The Logit Pattern</LessonTitle>
          <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
            Logits are raw scores. Pick a starting shape, then soften or sharpen
            the probability distribution with temperature.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {softmaxPresets.map((preset) => {
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
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black tracking-[0.02em] text-[#352cff] uppercase">
            Current Logits
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {softmaxClasses.map((classItem) => (
              <FactPill
                key={classItem.id}
                label={classItem.label}
                value={`z = ${formatNumber(logits[classItem.id], 1)}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function TemperatureFormulaPanel({
  temperature,
  logits,
  analysis,
  confidence,
  entropyLabel,
  temperatureLabel,
  onTemperatureChange,
}: {
  temperature: number;
  logits: SoftmaxLogits;
  analysis: TemperatureAnalysis;
  confidence: number;
  entropyLabel: string;
  temperatureLabel: string;
  onTemperatureChange: (value: number) => void;
}) {
  const sliderFill = ((temperature - 0.25) / 2.75) * 100;
  const exampleClass = analysis.topClass;
  const exampleLogit = logits[exampleClass.id];
  const scaledLogit = exampleLogit / temperature;
  const expValue = Math.exp(scaledLogit);
  const expTotal = softmaxClasses.reduce(
    (total, classItem) =>
      total + Math.exp(logits[classItem.id] / temperature),
    0,
  );
  const exampleProbability = analysis.probabilities[exampleClass.id];
  const exampleRows = [
    {
      label: "Scale logit",
      value: `${formatNumber(exampleLogit, 1)} / ${formatNumber(
        temperature,
        2,
      )} = ${formatNumber(scaledLogit, 2)}`,
    },
    {
      label: "Exponentiate",
      value: `exp(${formatNumber(scaledLogit, 2)}) = ${formatNumber(
        expValue,
        2,
      )}`,
    },
    {
      label: "Sum all exp values",
      value: formatNumber(expTotal, 2),
    },
    {
      label: "Normalize",
      value: `${formatNumber(expValue, 2)} / ${formatNumber(
        expTotal,
        2,
      )} = ${formatPercent(exampleProbability)}`,
    },
  ];

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="min-w-0">
          <LessonTitle>2. Watch The Formula Sharpen</LessonTitle>
          <p className="mt-4 text-[16px] leading-[1.45] text-[#071024]">
            Softmax exponentiates every scaled logit, then normalizes the total
            back to one. Temperature controls the scaling.
          </p>
          <div className="mt-4 overflow-hidden rounded-[8px] border border-[#dbe2f2] bg-[#fbfbff] px-3 py-5 text-center font-serif text-[17px] leading-[1.45] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-4 sm:text-[30px] sm:leading-[1.35]">
            p
            <sub className="text-[12px] sm:text-[14px]">i</sub> ={" "}
            <span className="text-[#ff2525]">exp(z</span>
            <sub className="text-[12px] text-[#ff2525] sm:text-[14px]">i</sub>
            <span className="text-[#ff2525]"> / T)</span> /{" "}
            <span className="text-[#2f39ff]">
              Σ
              <sub className="text-[12px] sm:text-[14px]">j</sub> exp(z
              <sub className="text-[12px] sm:text-[14px]">j</sub> / T)
            </span>
          </div>
          <div className="mt-4 rounded-[8px] border border-[#ead7ac] bg-[#fffdf7] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] font-black tracking-[0.03em] text-[#352cff] uppercase">
                Worked Example: {exampleClass.label}
              </p>
              <span className="w-fit rounded-full border border-[#f2c96b] bg-[#fff7df] px-2.5 py-1 text-[11px] font-black tracking-[0.03em] text-[#9a6500] uppercase">
                Chart example
              </span>
            </div>
            <div className="mt-3 rounded-[7px] border border-[#efe3c4] bg-white px-3 py-2 font-mono text-[12px] font-bold leading-[1.45] text-[#071024] sm:text-[13px]">
              p
              <sub>{exampleClass.label}</sub> = exp(
              {formatNumber(exampleLogit, 1)} / {formatNumber(temperature, 2)})
              / Σ exp(z / T) = {formatPercent(exampleProbability)}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {exampleRows.map((row) => (
                <div
                  key={row.label}
                  className="rounded-[7px] border border-[#ebe4d4] bg-white px-3 py-2"
                >
                  <p className="text-[10px] font-black tracking-[0.04em] text-[#7180a5] uppercase">
                    {row.label}
                  </p>
                  <p className="mt-1 font-mono text-[13px] font-black text-[#071024]">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <LessonTitle>Temperature</LessonTitle>
              <p className="mt-3 text-[15px] leading-[1.4] text-[#263a68]">
                Lower T makes differences louder. Higher T makes every class
                more plausible.
              </p>
            </div>
            <div className="rounded-[10px] border border-[#dfe4f4] bg-white px-4 py-2 text-right">
              <p className="text-[11px] font-black tracking-[0.03em] text-[#7180a5] uppercase">
                T
              </p>
              <p className="font-mono text-[22px] font-black text-[#352cff]">
                {formatNumber(temperature, 2)}
              </p>
            </div>
          </div>

          <input
            type="range"
            min="0.25"
            max="3"
            step="0.05"
            value={temperature}
            onChange={(event) => onTemperatureChange(Number(event.target.value))}
            aria-label="Temperature"
            className="mt-6 h-3 w-full cursor-pointer appearance-none rounded-full bg-[#dce1ec] accent-[#5335f4] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#5335f4] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5335f4]"
            style={
              {
                background: `linear-gradient(90deg, #5335f4 0%, #5335f4 ${sliderFill}%, #dce1ec ${sliderFill}%, #dce1ec 100%)`,
              } as CSSProperties
            }
          />
          <div className="mt-2 flex justify-between font-mono text-[12px] font-bold text-[#52628a]">
            <span>sharp</span>
            <span>soft</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <FactPill label="Shape" value={temperatureLabel} />
            <FactPill label="Confidence" value={formatPercent(confidence)} />
            <FactPill label="Entropy" value={entropyLabel} />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function LogitSlider({
  classItem,
  value,
  onChange,
}: {
  classItem: SoftmaxClass;
  value: number;
  onChange: (value: number) => void;
}) {
  const position = ((value + 3) / 6) * 100;
  const fillStart = Math.min(50, position);
  const fillEnd = Math.max(50, position);

  return (
    <div className="grid grid-cols-[76px_minmax(0,1fr)_58px] items-center gap-3">
      <label
        htmlFor={`logit-${classItem.id}`}
        className="flex min-w-0 items-center gap-2 text-[14px] font-bold text-[#12192e]"
      >
        <span
          className="h-3.5 w-3.5 shrink-0 rounded-full"
          style={{ backgroundColor: classItem.color }}
        />
        <span className="truncate">{classItem.label}</span>
      </label>
      <input
        id={`logit-${classItem.id}`}
        type="range"
        min="-3"
        max="3"
        step="0.1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dce1ec] accent-[#5335f4] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#5335f4] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5335f4]"
        style={
          {
            background: `linear-gradient(90deg, #dce1ec 0%, #dce1ec ${fillStart}%, ${classItem.color} ${fillStart}%, ${classItem.color} ${fillEnd}%, #dce1ec ${fillEnd}%, #dce1ec 100%)`,
          } as CSSProperties
        }
      />
      <output
        htmlFor={`logit-${classItem.id}`}
        className="rounded-[7px] border border-[#dfe4f4] bg-white px-2 py-1 text-center font-mono text-[13px] font-black text-[#071024]"
      >
        {formatNumber(value, 1)}
      </output>
    </div>
  );
}

function BarGroup({
  title,
  values,
  valueFormatter,
  maxValue,
  highlightedClassId,
}: {
  title: string;
  values: SoftmaxLogits;
  valueFormatter: (value: number) => string;
  maxValue: number;
  highlightedClassId?: SoftmaxClassId;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[13px] font-black tracking-[0.03em] text-[#52628a] uppercase">
        {title}
      </p>
      <div className="mt-4 grid h-[220px] grid-cols-4 items-end gap-3 border-b border-[#8b99bb] px-1">
        {softmaxClasses.map((classItem) => {
          const value = values[classItem.id];
          const height = Math.max(6, (Math.abs(value) / maxValue) * 174);
          const isNegative = value < 0;
          const isHighlighted = classItem.id === highlightedClassId;

          return (
            <div
              key={classItem.id}
              className={`grid h-full grid-rows-[34px_1fr_18px] justify-items-center rounded-[8px] border px-1 pt-1 ${
                isHighlighted
                  ? "border-[#f2c96b] bg-[#fff8e8] shadow-[0_0_0_2px_rgba(245,158,11,0.12)]"
                  : "border-transparent"
              }`}
            >
              <div className="grid justify-items-center gap-0.5">
                {isHighlighted ? (
                  <span className="rounded-full bg-[#f59e0b] px-1.5 py-0.5 text-[8px] leading-none font-black tracking-[0.04em] text-white uppercase">
                    example
                  </span>
                ) : null}
                <span className="font-mono text-[12px] leading-none font-black text-[#071024]">
                  {valueFormatter(value)}
                </span>
              </div>
              <div className="flex h-full items-end">
                <div
                  className="w-8 rounded-t-[4px]"
                  style={{
                    height: `${height}px`,
                    background: isNegative
                      ? "linear-gradient(180deg,#c7cedd,#929cac)"
                      : `linear-gradient(180deg,${classItem.color},${classItem.mutedColor})`,
                  }}
                />
              </div>
              <span
                className={`text-[12px] font-bold ${
                  isHighlighted ? "text-[#9a6500]" : "text-[#071024]"
                }`}
              >
                {classItem.label.slice(0, 1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SoftmaxArrow({
  temperature,
  temperatureLabel,
}: {
  temperature: number;
  temperatureLabel: string;
}) {
  return (
    <div className="grid min-h-[220px] place-items-center">
      <div className="w-full rounded-[12px] border border-[#dedcff] bg-[#f8f7ff] p-4 text-center">
        <p className="text-[12px] font-black tracking-[0.04em] text-[#352cff] uppercase">
          Softmax
        </p>
        <div className="mx-auto mt-4 grid h-20 w-20 place-items-center rounded-full border border-[#c9c5ff] bg-white shadow-[inset_0_0_0_7px_#f0efff]">
          <span className="font-mono text-[24px] font-black text-[#352cff]">
            T
          </span>
        </div>
        <p className="mt-3 font-mono text-[20px] font-black text-[#071024]">
          {formatNumber(temperature, 2)}
        </p>
        <p className="mt-1 text-[13px] font-bold text-[#52628a]">
          {temperatureLabel}
        </p>
        <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#5335f4]" />
      </div>
    </div>
  );
}

function SimulatorPanel({
  logits,
  temperature,
  onLogitChange,
}: {
  logits: SoftmaxLogits;
  temperature: number;
  onLogitChange: (classId: SoftmaxClassId, value: number) => void;
}) {
  const analysis = useMemo(
    () => analyzeTemperature(softmaxClasses, logits, temperature),
    [logits, temperature],
  );
  const maxLogit = Math.max(
    3,
    ...softmaxClasses.map((classItem) => Math.abs(logits[classItem.id])),
  );

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <LessonTitle>3. Run The Live Softmax</LessonTitle>
          <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
            Edit raw logits and temperature together. The top class can stay the
            same while confidence changes dramatically.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-4 xl:min-w-[560px]">
          <FactPill label="Top class" value={analysis.topClass.label} />
          <FactPill label="Runner up" value={analysis.runnerUpClass.label} />
          <FactPill label="Margin" value={formatPercent(analysis.margin)} />
          <FactPill label="Confidence" value={analysis.confidenceLabel} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(260px,0.9fr)_150px_minmax(260px,1.1fr)]">
        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black tracking-[0.03em] text-[#52628a] uppercase">
            Raw Logit Controls
          </p>
          <div className="mt-4 grid gap-4">
            {softmaxClasses.map((classItem) => (
              <LogitSlider
                key={classItem.id}
                classItem={classItem}
                value={logits[classItem.id]}
                onChange={(value) => onLogitChange(classItem.id, value)}
              />
            ))}
          </div>
          <div className="mt-5 rounded-[8px] border border-[#dedcff] bg-white px-4 py-3 text-[14px] leading-[1.35] text-[#2924ff]">
            Bigger logit gaps become bigger probability gaps after softmax.
          </div>
        </div>

        <SoftmaxArrow
          temperature={temperature}
          temperatureLabel={analysis.temperatureLabel}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <BarGroup
            title="Scaled logits z / T"
            values={analysis.scaledLogits}
            valueFormatter={(value) => formatNumber(value, 2)}
            maxValue={Math.max(maxLogit / Math.max(temperature, 0.25), 1)}
          />
          <BarGroup
            title="Probabilities p"
            values={analysis.probabilities}
            valueFormatter={formatPercent}
            maxValue={1}
            highlightedClassId={analysis.topClass.id}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_1.5fr]">
        <FactPill
          label="Entropy"
          value={`${analysis.entropyLabel} (${formatNumber(analysis.entropy, 2)})`}
        />
        <FactPill
          label="Winner confidence"
          value={formatPercent(analysis.confidence)}
        />
        <div className="rounded-[8px] border border-[#dedcff] bg-[#f8f7ff] px-4 py-3 text-[15px] leading-[1.35] text-[#2924ff]">
          {analysis.narrative}
        </div>
      </div>
    </Panel>
  );
}

function TakeawayPanel({
  topClass,
  confidence,
  entropyRatio,
}: {
  topClass: SoftmaxClass;
  confidence: number;
  entropyRatio: number;
}) {
  const confidenceTone =
    confidence > 0.72 ? "#16a34a" : confidence < 0.42 ? "#f59e0b" : "#2f7bf5";

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)] lg:items-center">
        <div>
          <LessonTitle>4. The Takeaway</LessonTitle>
          <p className="mt-4 max-w-3xl text-[22px] leading-[1.25] font-black text-[#071024] sm:text-[28px]">
            Temperature changes confidence, not the winner.
          </p>
          <p className="mt-3 max-w-2xl text-[16px] leading-[1.45] text-[#263a68]">
            The largest logit still ranks first. Temperature decides whether the
            model whispers that choice or shouts it.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <FactPill label="Predicted winner" value={topClass.label} />
          <div className="rounded-[8px] border border-[#dfe4f4] bg-white px-3 py-2">
            <p className="text-[11px] font-black tracking-[0.03em] text-[#7180a5] uppercase">
              Confidence
            </p>
            <p
              className="mt-1 font-mono text-[24px] font-black"
              style={{ color: confidenceTone }}
            >
              {formatPercent(confidence)}
            </p>
          </div>
          <FactPill
            label="Spread"
            value={`${Math.round(entropyRatio * 100)}% entropy`}
          />
        </div>
      </div>
    </Panel>
  );
}

export function SoftmaxTemperaturePlayground() {
  const [activePreset, setActivePreset] = useState(softmaxPresets[1]);
  const [logits, setLogits] = useState(activePreset.logits);
  const [temperature, setTemperature] = useState(initialTemperature);
  const analysis = useMemo(
    () => analyzeTemperature(softmaxClasses, logits, temperature),
    [logits, temperature],
  );

  function handleSelectPreset(preset: SoftmaxPreset) {
    setActivePreset(preset);
    setLogits(preset.logits);
  }

  function handleLogitChange(classId: SoftmaxClassId, value: number) {
    setLogits((currentLogits) => setLogit(currentLogits, classId, value));
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f7f9ff] px-4 py-5 text-[#071024] sm:px-7 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1536px] flex-col gap-4">
        <header className="flex flex-col gap-3 py-1 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[44px] leading-[0.95] font-black tracking-[-0.05em] text-[#070b1a] sm:text-[56px]">
              Softmax Temperature Lab
            </h1>
            <p className="mt-3 max-w-3xl text-[18px] leading-[1.35] font-semibold text-[#30446f] sm:text-[21px]">
              Turn logits into probabilities, then decide how sharp the
              distribution should be.
            </p>
          </div>
          <div className="rounded-[10px] border border-[#dedcff] bg-white px-5 py-3 text-center font-mono text-[13px] font-black text-[#2924ff] shadow-[0_12px_30px_rgba(26,38,80,0.04)]">
            z → softmax(z / T) → p
          </div>
        </header>

        <PresetSelector
          activePreset={activePreset}
          logits={logits}
          onSelectPreset={handleSelectPreset}
        />
        <TemperatureFormulaPanel
          temperature={temperature}
          logits={logits}
          analysis={analysis}
          confidence={analysis.confidence}
          entropyLabel={analysis.entropyLabel}
          temperatureLabel={analysis.temperatureLabel}
          onTemperatureChange={setTemperature}
        />
        <SimulatorPanel
          logits={logits}
          temperature={temperature}
          onLogitChange={handleLogitChange}
        />
        <TakeawayPanel
          topClass={analysis.topClass}
          confidence={analysis.confidence}
          entropyRatio={analysis.entropyRatio}
        />
      </div>
    </main>
  );
}
