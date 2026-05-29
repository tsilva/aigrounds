"use client";

import { type ReactNode, useMemo, useState } from "react";
import {
  analyzeBroadcast,
  clampOutputIndex,
  clampShapeAxis,
  formatShape,
  getValueTrace,
  type AxisAnalysis,
  type AxisStatus,
  type BroadcastAnalysis,
  type Shape,
} from "./tensor-shape-broadcasting-engine";
import {
  axisProbeValues,
  broadcastPresets,
  defaultBroadcastPreset,
  defaultOutputIndex,
} from "./scenario";

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
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

function LessonTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[18px] leading-none font-black text-[#0536f5] uppercase">
      {children}
    </h2>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v7" />
      <path d="M12 7h.01" />
    </svg>
  );
}

function CheckIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m7.8 12.4 2.6 2.5 5.9-6" />
    </svg>
  );
}

function XIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6" />
      <path d="m15 9-6 6" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M8 3H3v5" />
      <path d="M16 3h5v5" />
      <path d="M3 3l7 7" />
      <path d="M21 3l-7 7" />
      <path d="M8 21H3v-5" />
      <path d="M16 21h5v-5" />
      <path d="M3 21l7-7" />
      <path d="M21 21l-7-7" />
    </svg>
  );
}

function EqualIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2.4"
    >
      <path d="M5 9h14" />
      <path d="M5 15h14" />
    </svg>
  );
}

function statusClass(status: AxisStatus) {
  if (status === "same") {
    return "border-[#a8dfbb] bg-[#f2fff7] text-[#087137]";
  }

  if (status === "fail") {
    return "border-[#ffb6b6] bg-[#fff4f4] text-[#d31515]";
  }

  return "border-[#b8c8ff] bg-[#f6f8ff] text-[#0536f5]";
}

function getStatusLabel(axis: AxisAnalysis) {
  if (axis.status === "same") {
    return "same";
  }

  if (axis.status === "stretch-a") {
    return `A stretches 1 -> ${axis.outputSize}`;
  }

  if (axis.status === "stretch-b") {
    return `B stretches 1 -> ${axis.outputSize}`;
  }

  return "fail";
}

function sameShape(left: Shape, right: Shape) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function AxisChip({
  value,
  onChange,
  min = 1,
  max = 5,
  tone = "neutral",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  tone?: "neutral" | "blue" | "green";
}) {
  const toneClass =
    tone === "green"
      ? "border-[#a8dfbb] bg-[#f8fff9] text-[#087137]"
      : tone === "blue"
        ? "border-[#8da2ff] bg-[#f8faff] text-[#071024]"
        : "border-[#d8e0f3] bg-white text-[#071024]";

  return (
    <div
      className={`grid min-h-12 grid-cols-[34px_1fr_34px] overflow-hidden rounded-[9px] border ${toneClass} font-mono text-[20px] font-black shadow-[0_8px_20px_rgba(26,38,80,0.04)]`}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="border-r border-[#d8e0f3] text-[22px] transition hover:bg-[#eef3ff] disabled:cursor-not-allowed disabled:text-[#9aa8c8]"
        aria-label="Decrease axis size"
      >
        -
      </button>
      <span className="grid place-items-center px-3">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="border-l border-[#d8e0f3] text-[22px] transition hover:bg-[#eef3ff] disabled:cursor-not-allowed disabled:text-[#9aa8c8]"
        aria-label="Increase axis size"
      >
        +
      </button>
    </div>
  );
}

function ShapeRow({
  label,
  shape,
  onChangeAxis,
}: {
  label: string;
  shape: number[];
  onChangeAxis: (axisIndex: number, value: number) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
      <div className="min-w-0">
        <p className="text-[16px] leading-tight font-black text-[#071024]">
          {label}
        </p>
        <p className="mt-1 text-[14px] font-semibold text-[#314777]">rank 3</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {shape.map((axisSize, axisIndex) => (
          <AxisChip
            key={`${label}-${axisIndex}`}
            value={axisSize}
            onChange={(value) => onChangeAxis(axisIndex, value)}
          />
        ))}
      </div>
    </div>
  );
}

function VerdictCard({ analysis }: { analysis: BroadcastAnalysis }) {
  return (
    <div
      className={`rounded-[12px] border px-5 py-4 ${
        analysis.isCompatible
          ? "border-[#a8dfbb] bg-[#f5fff8] text-[#087137]"
          : "border-[#ffb6b6] bg-[#fff7f7] text-[#d31515]"
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="mt-1">
          {analysis.isCompatible ? <CheckIcon /> : <XIcon />}
        </span>
        <div>
          <p className="text-[26px] leading-none font-black">
            {analysis.isCompatible ? "Broadcasts" : "Fails"}
          </p>
          <p className="mt-4 text-[15px] font-semibold text-[#16264e]">
            Output shape
          </p>
          <p className="mt-1 font-mono text-[27px] font-black">
            {analysis.outputShape ? formatShape(analysis.outputShape) : "-"}
          </p>
          <p className="mt-4 text-[15px] font-semibold text-[#16264e]">
            Total elements{" "}
            <span className="font-mono text-[20px] font-black text-[#071024]">
              {analysis.totalElements ?? "-"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ShapePicker({
  aShape,
  bShape,
  analysis,
  onChangeShape,
  onSelectPreset,
}: {
  aShape: number[];
  bShape: number[];
  analysis: BroadcastAnalysis;
  onChangeShape: (target: "a" | "b", axisIndex: number, value: number) => void;
  onSelectPreset: (presetId: string) => void;
}) {
  return (
    <Panel className="p-4 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(260px,0.45fr)] xl:items-center">
        <div>
          <LessonTitle>1. Pick Shapes</LessonTitle>
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.75fr)] lg:items-center">
            <div className="grid gap-4">
              <ShapeRow
                label="A shape"
                shape={aShape}
                onChangeAxis={(axisIndex, value) =>
                  onChangeShape("a", axisIndex, value)
                }
              />
              <ShapeRow
                label="B shape"
                shape={bShape}
                onChangeAxis={(axisIndex, value) =>
                  onChangeShape("b", axisIndex, value)
                }
              />
            </div>
            <div>
              <p className="text-[14px] font-black text-[#071024]">Presets</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {broadcastPresets.map((preset) => {
                  const isSelected =
                    sameShape(aShape, preset.aShape) &&
                    sameShape(bShape, preset.bShape);

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onSelectPreset(preset.id)}
                      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] border px-4 text-[15px] font-black transition ${
                        isSelected
                          ? "border-[#153cff] bg-[#153cff] text-white shadow-[0_12px_22px_rgba(21,60,255,0.18)]"
                          : "border-[#bdcaff] bg-white text-[#1231e5] hover:border-[#8199ff] hover:bg-[#f8faff]"
                      }`}
                    >
                      {preset.id === "stretches" ? <ExpandIcon /> : null}
                      {preset.id === "same-axes" ? <EqualIcon /> : null}
                      {preset.id === "fails" ? <XIcon className="size-5" /> : null}
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <VerdictCard analysis={analysis} />
      </div>
    </Panel>
  );
}

function AxisZipper({ analysis }: { analysis: BroadcastAnalysis }) {
  return (
    <Panel className="p-4 sm:p-5">
      <LessonTitle>2. Zip Axes From The Right</LessonTitle>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0">
          <div className="grid gap-4 sm:grid-cols-3">
            {analysis.axes.map((axis) => (
              <div
                key={axis.axisLabel}
                className="relative rounded-[10px] border border-[#e2e8f6] bg-[#fcfdff] p-3"
              >
                <div className="text-center">
                  <p className="text-[15px] font-black text-[#071024]">
                    axis {axis.axisLabel}
                  </p>
                  <p className="text-[12px] font-semibold text-[#52658e]">
                    {axis.axisIndex === 0
                      ? "leftmost"
                      : axis.axisIndex === analysis.axes.length - 1
                        ? "rightmost"
                        : "middle"}
                  </p>
                </div>
                <div className="mt-3 grid gap-2">
                  <div className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-2">
                    <span className="text-[13px] font-black text-[#1b2c5d]">
                      A
                    </span>
                    <div className="rounded-[8px] border border-[#d8e0f3] bg-white px-4 py-2 text-center font-mono text-[22px] font-black">
                      {axis.aSize}
                    </div>
                  </div>
                  <div className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-2">
                    <span className="text-[13px] font-black text-[#1b2c5d]">
                      B
                    </span>
                    <div className="rounded-[8px] border border-[#d8e0f3] bg-white px-4 py-2 text-center font-mono text-[22px] font-black">
                      {axis.bSize}
                    </div>
                  </div>
                  <div
                    className={`rounded-[8px] border px-3 py-2 text-center text-[14px] font-black ${statusClass(axis.status)}`}
                  >
                    {getStatusLabel(axis)}
                  </div>
                  <div className="rounded-[8px] border border-[#a8dfbb] bg-[#f2fff7] px-4 py-2 text-center font-mono text-[24px] font-black text-[#087137]">
                    {axis.outputSize ?? "-"}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[8px] border border-[#d8e0f3] bg-white px-4 py-3 text-center font-mono text-[15px] font-semibold text-[#071024]">
            <span className="font-black text-[#0536f5]">Rule:</span>{" "}
            <span className="rounded border border-[#a8dfbb] bg-[#f2fff7] px-2 py-1 text-[#087137]">
              same
            </span>{" "}
            size OR one{" "}
            <span className="rounded border border-[#bdcaff] bg-[#f8faff] px-2 py-1 text-[#0536f5]">
              1
            </span>
            ; output = max(A, B)
          </div>
        </div>
        <div className="rounded-[10px] border border-[#d8e0f3] bg-white p-4 text-[14px] font-semibold text-[#16264e]">
          <p className="font-black text-[#071024]">Legend</p>
          <div className="mt-4 grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded border border-[#a8dfbb] bg-[#f2fff7] px-3 py-1 text-[#087137]">
                same
              </span>
              <span>sizes match</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="rounded border border-[#b8c8ff] bg-[#f6f8ff] px-3 py-1 text-[#0536f5]">
                stretch
              </span>
              <span>one is 1</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="rounded border border-[#ffb6b6] bg-[#fff4f4] px-3 py-1 text-[#d31515]">
                fail
              </span>
              <span>incompatible</span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function AxisProbe({ aAxisSize, bAxisSize }: { aAxisSize: number; bAxisSize: number }) {
  const selectedValue = axisProbeValues.includes(
    bAxisSize as (typeof axisProbeValues)[number],
  )
    ? bAxisSize
    : axisProbeValues[0];

  return (
    <Panel className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LessonTitle>3. Axis -3 Outcomes</LessonTitle>
        <div className="flex flex-wrap items-center gap-2 rounded-[9px] border border-[#d8e0f3] bg-white px-3 py-2 text-[14px] font-black text-[#071024]">
          <span>Current focus</span>
          <span className="rounded border border-[#d8e0f3] px-2 py-1 font-mono">
            A = {aAxisSize}
          </span>
          <span className="rounded border border-[#d8e0f3] px-2 py-1 font-mono">
            B = {bAxisSize}
          </span>
          <span className="font-mono text-[#087137]">
            Output{" "}
            {aAxisSize === bAxisSize || bAxisSize === 1
              ? Math.max(aAxisSize, bAxisSize)
              : "-"}
          </span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {axisProbeValues.map((candidate) => {
          const status: AxisStatus =
            candidate === aAxisSize ? "same" : candidate === 1 ? "stretch-b" : "fail";
          const outputSize = status === "fail" ? null : Math.max(aAxisSize, candidate);
          const isSelected = candidate === selectedValue;

          return (
            <div
              key={candidate}
              className={`rounded-[10px] border px-4 py-3 text-center ${
                status === "fail"
                  ? "border-[#ffb6b6] bg-[#fffafa]"
                  : isSelected
                    ? "border-[#8199ff] bg-[#f8faff] shadow-[0_12px_24px_rgba(21,60,255,0.08)]"
                    : "border-[#d8e0f3] bg-white"
              }`}
            >
              <p className="font-mono text-[15px] font-black text-[#071024]">
                B axis -3 = {candidate}
              </p>
              <p className="mt-1 text-[12px] font-semibold text-[#52658e]">
                vs A axis -3 = {aAxisSize}
              </p>
              <div
                className={`mx-auto mt-3 w-fit rounded border px-4 py-1 text-[14px] font-black ${statusClass(status)}`}
              >
                {status === "stretch-b"
                  ? "stretch"
                  : status === "same"
                    ? "same"
                    : "fail"}
              </div>
              <p className="mt-3 font-mono text-[16px] font-black text-[#071024]">
                {status === "fail"
                  ? `${candidate} vs ${aAxisSize}`
                  : `${candidate} -> ${outputSize}`}
              </p>
              <p className="mt-3 text-[12px] font-black text-[#52658e]">
                output axis
              </p>
              <p
                className={`mt-1 font-mono text-[26px] font-black ${
                  status === "fail" ? "text-[#d31515]" : "text-[#087137]"
                }`}
              >
                {outputSize ?? "-"}
              </p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function IndexChip({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-center text-[13px] font-black text-[#1b2c5d]">
        {label}
      </p>
      <AxisChip value={value} min={0} max={Math.max(0, max)} onChange={onChange} />
    </div>
  );
}

function ShapeIndex({ name, index }: { name: string; index: Shape }) {
  return (
    <span>
      {name}[
      {index.map((value, valueIndex) => (
        <span key={`${name}-${valueIndex}`}>
          {valueIndex > 0 ? "," : ""}
          <span className={value === 0 ? "text-[#0536f5]" : undefined}>
            {value}
          </span>
        </span>
      ))}
      ]
    </span>
  );
}

function InspectValue({
  analysis,
  outputIndex,
  onChangeOutputIndex,
}: {
  analysis: BroadcastAnalysis;
  outputIndex: number[];
  onChangeOutputIndex: (axisIndex: number, value: number) => void;
}) {
  const trace = analysis.outputShape
    ? getValueTrace({
        aShape: analysis.aShape,
        bShape: analysis.bShape,
        outputIndex,
      })
    : null;

  return (
    <Panel className="p-4 sm:p-5">
      <LessonTitle>4. Inspect One Value</LessonTitle>
      {trace && analysis.outputShape ? (
        <div className="mt-4 grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)] xl:items-center">
          <div>
            <p className="text-[14px] font-black text-[#1b2c5d]">
              Output index
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {["i", "j", "k"].map((label, axisIndex) => (
                <IndexChip
                  key={label}
                  label={label}
                  value={outputIndex[axisIndex] ?? 0}
                  max={analysis.outputShape?.[axisIndex] ?? 0}
                  onChange={(value) => onChangeOutputIndex(axisIndex, value)}
                />
              ))}
            </div>
            <p className="mt-3 text-[12px] font-semibold text-[#314777]">
              blue 0 = reused size-1 axis
            </p>
          </div>
          <div className="rounded-[10px] border border-[#d8e0f3] bg-white px-5 py-4 font-mono text-[18px] font-semibold text-[#071024]">
            <p className="text-center">
              C[{trace.outputIndex.join(",")}] ={" "}
              <ShapeIndex name="A" index={trace.aIndex} /> +{" "}
              <ShapeIndex name="B" index={trace.bIndex} />
            </p>
            <p className="mt-4 text-center">
              = <span className="text-[#0536f5]">{trace.aValue}</span> +{" "}
              <span className="text-[#0536f5]">{trace.bValue}</span> ={" "}
              <span className="text-[26px] font-black text-[#087137]">
                {trace.outputValue}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-[10px] border border-[#ffb6b6] bg-[#fffafa] px-5 py-4 text-[15px] font-bold text-[#d31515]">
          No output value exists until every aligned axis broadcasts.
        </div>
      )}
    </Panel>
  );
}

function Takeaway() {
  return (
    <Panel className="p-4 sm:p-5">
      <LessonTitle>5. Takeaway</LessonTitle>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#1ba64b] text-[#087137]">
            <CheckIcon className="size-7" />
          </span>
          <p className="text-[18px] leading-[1.35] font-black text-[#071024]">
            Broadcasting <span className="text-[#0536f5]">reuses</span> values
            along size-1 axes; it does{" "}
            <span className="text-[#0536f5]">not</span> copy data first.
          </p>
        </div>
        <div className="rounded-[10px] border border-[#d8e0f3] bg-white px-4 py-4 text-center">
          <p className="text-[13px] font-semibold text-[#16264e]">
            One value stretched across 4 positions
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 font-mono font-black text-[#0536f5]">
            <span className="grid h-10 w-10 place-items-center rounded border border-[#153cff] bg-[#153cff] text-white">
              v
            </span>
            <span className="px-2">...</span>
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className="grid h-10 w-10 place-items-center rounded border border-[#8da2ff] bg-[#f8faff]"
              >
                v
              </span>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function TensorShapeBroadcastingPlayground() {
  const [aShape, setAShape] = useState<number[]>([
    ...defaultBroadcastPreset.aShape,
  ]);
  const [bShape, setBShape] = useState<number[]>([
    ...defaultBroadcastPreset.bShape,
  ]);
  const [outputIndex, setOutputIndex] = useState<number[]>([
    ...defaultOutputIndex,
  ]);
  const [showHelp, setShowHelp] = useState(false);

  const analysis = useMemo(() => analyzeBroadcast(aShape, bShape), [aShape, bShape]);
  const safeOutputIndex = useMemo(
    () => clampOutputIndex(outputIndex, analysis.outputShape),
    [analysis.outputShape, outputIndex],
  );

  function updateShapes(nextA: number[], nextB: number[]) {
    const nextAnalysis = analyzeBroadcast(nextA, nextB);
    setAShape(nextA);
    setBShape(nextB);
    setOutputIndex((current) =>
      clampOutputIndex(current, nextAnalysis.outputShape),
    );
  }

  function handleShapeChange(target: "a" | "b", axisIndex: number, value: number) {
    const nextValue = clampShapeAxis(value);
    const nextA = [...aShape];
    const nextB = [...bShape];

    if (target === "a") {
      nextA[axisIndex] = nextValue;
    } else {
      nextB[axisIndex] = nextValue;
    }

    updateShapes(nextA, nextB);
  }

  function handlePresetSelect(presetId: string) {
    const preset =
      broadcastPresets.find((candidate) => candidate.id === presetId) ??
      defaultBroadcastPreset;
    const nextAnalysis = analyzeBroadcast(preset.aShape, preset.bShape);

    setAShape([...preset.aShape]);
    setBShape([...preset.bShape]);
    setOutputIndex(clampOutputIndex([...defaultOutputIndex], nextAnalysis.outputShape));
  }

  function handleOutputIndexChange(axisIndex: number, value: number) {
    if (!analysis.outputShape) {
      return;
    }

    setOutputIndex((current) =>
      current.map((axisValue, index) =>
        index === axisIndex
          ? Math.min(Math.max(0, value), (analysis.outputShape?.[index] ?? 1) - 1)
          : axisValue,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fd] px-4 py-5 text-[#071024] sm:px-6 lg:px-8 2xl:pr-56">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[42px] leading-[0.95] font-black tracking-[-0.05em] text-[#050912] sm:text-[56px] lg:text-[64px]">
              Tensor Shape & Broadcasting Lab
            </h1>
            <p className="mt-3 max-w-3xl text-[18px] leading-[1.35] font-semibold text-[#0e3b88] sm:text-[22px]">
              Pick two tensor shapes and see axes stretch or fail.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowHelp((value) => !value)}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-[9px] border border-[#bfd0ff] bg-white px-6 text-[15px] font-black text-[#0a3df0] shadow-[0_8px_24px_rgba(26,38,80,0.05)] transition hover:border-[#7898ff] focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <InfoIcon />
            How does this work?
          </button>
        </header>

        {showHelp ? (
          <div className="mt-5 rounded-[10px] border border-[#d8e0f3] bg-white px-5 py-4 text-[15px] leading-[1.55] text-[#16264e] shadow-[0_18px_42px_rgba(26,38,80,0.05)]">
            Broadcasting lets tensors with different shapes share an operation
            when each right-aligned axis either matches or has size 1. A size-1
            axis reuses the same value across the larger axis.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          <ShapePicker
            aShape={aShape}
            bShape={bShape}
            analysis={analysis}
            onChangeShape={handleShapeChange}
            onSelectPreset={handlePresetSelect}
          />
          <AxisZipper analysis={analysis} />
          <AxisProbe aAxisSize={aShape[0] ?? 1} bAxisSize={bShape[0] ?? 1} />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
            <InspectValue
              analysis={analysis}
              outputIndex={safeOutputIndex}
              onChangeOutputIndex={handleOutputIndexChange}
            />
            <Takeaway />
          </div>
        </div>
      </div>
    </main>
  );
}
