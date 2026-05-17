"use client";

import { useMemo, useState } from "react";
import {
  analyzeBackprop,
  formatFixed,
  formatProbability,
  formatSigned,
  type BackpropAnalysis,
  type WeightUpdate,
} from "./backpropagation-inspector-engine";
import {
  backpropCases,
  defaultCaseId,
  defaultLearningRate,
  getBackpropCase,
  outputWeights,
  type BackpropCase,
  type BackpropCaseId,
} from "./scenario";

type Phase = "forward" | "backward" | "update";

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-[12px] border border-[#c8d5f6] bg-white shadow-[0_14px_34px_rgba(58,88,160,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}

function LessonTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[18px] leading-none font-black text-[#1638ff] uppercase sm:text-[21px]">
      {children}
    </h2>
  );
}

function ValueCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "blue" | "red";
}) {
  const valueClass =
    tone === "blue"
      ? "text-[#1638ff]"
      : tone === "red"
        ? "text-[#ff1d37]"
        : "text-[#071024]";

  return (
    <div className="min-w-0 rounded-[8px] border border-[#dbe4ff] bg-white px-3 py-2 text-center">
      <p className="text-[11px] font-black text-[#6d789b] uppercase">
        {label}
      </p>
      <p className={`mt-1 font-mono text-[17px] font-black ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function FormulaPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "red" | "green";
}) {
  const toneClass =
    tone === "red"
      ? "border-[#ffc6ce] bg-[#fff6f7] text-[#d9001f]"
      : tone === "green"
        ? "border-[#bfe8cf] bg-[#f5fff8] text-[#078036]"
        : "border-[#dbe4ff] bg-[#fbfcff] text-[#071024]";

  return (
    <div
      className={`min-w-0 rounded-[8px] border px-3 py-2 font-mono text-[12px] font-bold sm:text-[13px] ${toneClass}`}
    >
      {children}
    </div>
  );
}

function NodeCircle({
  x,
  y,
  label,
  value,
  tone = "blue",
}: {
  x: number;
  y: number;
  label: string;
  value: string;
  tone?: "blue" | "red";
}) {
  const valueClass = tone === "red" ? "fill-[#ff1d37]" : "fill-[#1638ff]";

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r="39"
        fill="white"
        stroke="#6677a6"
        strokeWidth="1.6"
      />
      <text
        x={x}
        y={y - 7}
        textAnchor="middle"
        className="fill-[#071024] text-[15px] font-black"
      >
        {label}
      </text>
      <text
        x={x}
        y={y + 18}
        textAnchor="middle"
        className={`${valueClass} text-[15px] font-black`}
      >
        {value}
      </text>
    </g>
  );
}

function ForwardGraph({ analysis }: { analysis: BackpropAnalysis }) {
  return (
    <svg
      viewBox="0 0 700 320"
      role="img"
      aria-label="Forward pass graph from hidden activations to prediction"
      className="h-auto w-full"
    >
      <defs>
        <marker
          id="forward-arrow"
          markerHeight="8"
          markerWidth="8"
          orient="auto"
          refX="7"
          refY="4"
        >
          <path d="M0 0 8 4 0 8Z" fill="#7180a8" />
        </marker>
      </defs>
      <line
        x1="116"
        y1="94"
        x2="363"
        y2="143"
        stroke="#7180a8"
        strokeWidth="2.2"
        markerEnd="url(#forward-arrow)"
      />
      <line
        x1="116"
        y1="226"
        x2="363"
        y2="177"
        stroke="#7180a8"
        strokeWidth="2.2"
        markerEnd="url(#forward-arrow)"
      />
      <line
        x1="430"
        y1="160"
        x2="560"
        y2="160"
        stroke="#7180a8"
        strokeWidth="2.2"
        markerEnd="url(#forward-arrow)"
      />
      <line
        x1="399"
        y1="232"
        x2="399"
        y2="200"
        stroke="#7180a8"
        strokeDasharray="5 5"
        strokeWidth="2"
        markerEnd="url(#forward-arrow)"
      />

      <NodeCircle
        x={76}
        y={94}
        label="h1"
        value={formatFixed(analysis.h1)}
      />
      <NodeCircle
        x={76}
        y={226}
        label="h2"
        value={formatFixed(analysis.h2)}
      />
      <NodeCircle
        x={399}
        y={160}
        label="p"
        value={formatProbability(analysis.probability)}
      />

      <text x="208" y="67" textAnchor="middle" className="fill-[#071024] text-[14px] font-black">
        w_out1
      </text>
      <text x="208" y="88" textAnchor="middle" className="fill-[#071024] text-[14px] font-bold">
        {formatFixed(outputWeights.wOut1)}
      </text>
      <text x="208" y="254" textAnchor="middle" className="fill-[#071024] text-[14px] font-black">
        w_out2
      </text>
      <text x="208" y="275" textAnchor="middle" className="fill-[#071024] text-[14px] font-bold">
        {formatFixed(outputWeights.wOut2)}
      </text>
      <text x="447" y="260" textAnchor="middle" className="fill-[#071024] text-[14px] font-black">
        b_out = {formatFixed(outputWeights.bias)}
      </text>

      <text x="600" y="116" className="fill-[#ff1d37] text-[13px] font-black uppercase">
        Target y
      </text>
      <text x="600" y="142" className="fill-[#ff1d37] text-[23px] font-black">
        {analysis.target}
      </text>
      <text x="600" y="189" className="fill-[#ff1d37] text-[13px] font-black uppercase">
        Loss
      </text>
      <text x="600" y="217" className="fill-[#071024] text-[17px] font-black">
        L = {formatFixed(analysis.loss, 3)}
      </text>
    </svg>
  );
}

function BackwardGraph({
  analysis,
  phase,
}: {
  analysis: BackpropAnalysis;
  phase: Phase;
}) {
  const showBackward = phase !== "forward";
  const showUpdate = phase === "update";

  return (
    <svg
      viewBox="0 0 600 260"
      role="img"
      aria-label="Backward pass graph with output gradients"
      className="h-auto w-full"
    >
      <defs>
        <marker
          id="backward-arrow"
          markerHeight="8"
          markerWidth="8"
          orient="auto"
          refX="7"
          refY="4"
        >
          <path d="M0 0 8 4 0 8Z" fill="#ff1d37" />
        </marker>
        <marker
          id="mini-forward-arrow"
          markerHeight="8"
          markerWidth="8"
          orient="auto"
          refX="7"
          refY="4"
        >
          <path d="M0 0 8 4 0 8Z" fill="#7180a8" />
        </marker>
      </defs>

      <line
        x1="117"
        y1="76"
        x2="365"
        y2="125"
        stroke={showBackward ? "#ff1d37" : "#7180a8"}
        strokeWidth={showBackward ? "2.8" : "2.2"}
        markerEnd={showBackward ? "url(#backward-arrow)" : "url(#mini-forward-arrow)"}
      />
      <line
        x1="117"
        y1="184"
        x2="365"
        y2="145"
        stroke={showBackward ? "#ff1d37" : "#7180a8"}
        strokeWidth={showBackward ? "2.8" : "2.2"}
        markerEnd={showBackward ? "url(#backward-arrow)" : "url(#mini-forward-arrow)"}
      />
      <line
        x1="360"
        y1="118"
        x2="125"
        y2="72"
        stroke={showBackward ? "#ff1d37" : "transparent"}
        strokeWidth="2.8"
        markerEnd="url(#backward-arrow)"
      />
      <line
        x1="360"
        y1="153"
        x2="125"
        y2="187"
        stroke={showBackward ? "#ff1d37" : "transparent"}
        strokeWidth="2.8"
        markerEnd="url(#backward-arrow)"
      />

      <NodeCircle
        x={78}
        y={76}
        label="h1"
        value={formatFixed(analysis.h1)}
      />
      <NodeCircle
        x={78}
        y={184}
        label="h2"
        value={formatFixed(analysis.h2)}
      />
      <NodeCircle
        x={402}
        y={136}
        label="p"
        value={formatProbability(analysis.probability)}
      />

      <text x="215" y="63" textAnchor="middle" className="fill-[#071024] text-[13px] font-black">
        w_out1 {formatFixed(outputWeights.wOut1)}
      </text>
      <text x="215" y="205" textAnchor="middle" className="fill-[#071024] text-[13px] font-black">
        w_out2 {formatFixed(outputWeights.wOut2)}
      </text>

      {showBackward ? (
        <>
          <text x="240" y="101" textAnchor="middle" className="fill-[#ff1d37] text-[14px] font-black">
            {formatSigned(analysis.outputGradients.wOut1)}
          </text>
          <text x="240" y="171" textAnchor="middle" className="fill-[#ff1d37] text-[14px] font-black">
            {formatSigned(analysis.outputGradients.wOut2)}
          </text>
          <text x="152" y="44" className="fill-[#ff1d37] text-[14px] font-black">
            {formatSigned(analysis.hiddenCredit.h1)}
          </text>
          <text x="152" y="224" className="fill-[#ff1d37] text-[14px] font-black">
            {formatSigned(analysis.hiddenCredit.h2)}
          </text>
          <text x="486" y="103" className="fill-[#071024] text-[15px] font-black">
            y = {analysis.target}
          </text>
          <text x="486" y="137" className="fill-[#071024] text-[15px] font-black">
            dL/dz
          </text>
          <text x="486" y="165" className="fill-[#ff1d37] text-[17px] font-black">
            {formatSigned(analysis.outputDelta)}
          </text>
        </>
      ) : (
        <text x="486" y="137" className="fill-[#1638ff] text-[15px] font-black">
          Forward cache ready
        </text>
      )}

      {showUpdate ? (
        <text x="306" y="242" textAnchor="middle" className="fill-[#078036] text-[14px] font-black">
          Update uses w = w - eta * dL/dw
        </text>
      ) : null}
    </svg>
  );
}

function CaseSelector({
  selectedCase,
  onSelectCase,
}: {
  selectedCase: BackpropCase;
  onSelectCase: (id: BackpropCaseId) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {backpropCases.map((example) => {
        const isActive = example.id === selectedCase.id;

        return (
          <button
            key={example.id}
            type="button"
            onClick={() => onSelectCase(example.id)}
            className={`min-h-[96px] rounded-[9px] border px-4 py-3 text-center transition ${
              isActive
                ? "border-[#1638ff] bg-[#352cff] text-white shadow-[0_12px_26px_rgba(22,56,255,0.22)]"
                : "border-[#d8e0f3] bg-white text-[#071024] hover:border-[#aebdf1] hover:bg-[#f7f9ff]"
            }`}
          >
            <p className="text-[13px] font-black uppercase">{example.label}</p>
            <p className="mt-2 font-mono text-[14px] font-black">
              h1 = {formatFixed(example.hiddenActivations[0])}, h2 ={" "}
              {formatFixed(example.hiddenActivations[1])}
            </p>
            <p className="mt-1 font-mono text-[14px] font-black">
              y = {example.target}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function PhaseButton({
  phase,
  currentPhase,
  label,
  onClick,
}: {
  phase: Phase;
  currentPhase: Phase;
  label: string;
  onClick: (phase: Phase) => void;
}) {
  const isActive = phase === currentPhase;

  return (
    <button
      type="button"
      onClick={() => onClick(phase)}
      className={`rounded-[8px] border px-4 py-2 text-[12px] font-black uppercase transition sm:px-5 ${
        isActive
          ? "border-[#1638ff] bg-[#352cff] text-white shadow-[0_10px_22px_rgba(22,56,255,0.2)]"
          : "border-[#c8d5f6] bg-white text-[#1638ff] hover:bg-[#f7f9ff]"
      }`}
    >
      {label}
    </button>
  );
}

function GradientTable({ analysis }: { analysis: BackpropAnalysis }) {
  const rows = [
    {
      label: "dL/dz",
      value: formatSigned(analysis.outputDelta),
      how: "p - y",
    },
    {
      label: "dL/dw_out1",
      value: formatSigned(analysis.outputGradients.wOut1),
      how: `h1 * dL/dz = ${formatFixed(analysis.h1)} * ${formatSigned(
        analysis.outputDelta,
      )}`,
    },
    {
      label: "dL/dw_out2",
      value: formatSigned(analysis.outputGradients.wOut2),
      how: `h2 * dL/dz = ${formatFixed(analysis.h2)} * ${formatSigned(
        analysis.outputDelta,
      )}`,
    },
    {
      label: "dL/dh1",
      value: formatSigned(analysis.hiddenCredit.h1),
      how: `w_out1 * dL/dz = ${formatFixed(
        outputWeights.wOut1,
      )} * ${formatSigned(analysis.outputDelta)}`,
    },
    {
      label: "dL/dh2",
      value: formatSigned(analysis.hiddenCredit.h2),
      how: `w_out2 * dL/dz = ${formatFixed(
        outputWeights.wOut2,
      )} * ${formatSigned(analysis.outputDelta)}`,
    },
  ];

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#dbe4ff] bg-white">
      <div className="grid grid-cols-[minmax(86px,1fr)_88px_minmax(130px,1.4fr)] bg-[#f7f9ff] text-[11px] font-black text-[#59678c] uppercase">
        <div className="px-3 py-2">What</div>
        <div className="border-l border-[#dbe4ff] px-3 py-2">Value</div>
        <div className="border-l border-[#dbe4ff] px-3 py-2">How</div>
      </div>
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[minmax(86px,1fr)_88px_minmax(130px,1.4fr)] border-t border-[#dbe4ff] text-[12px] sm:text-[13px]"
        >
          <div className="break-words px-3 py-2 font-mono font-bold text-[#172347]">
            {row.label}
          </div>
          <div className="break-words border-l border-[#dbe4ff] px-3 py-2 font-mono font-black text-[#ff1d37]">
            {row.value}
          </div>
          <div className="break-words border-l border-[#dbe4ff] px-3 py-2 font-mono font-bold text-[#25365f]">
            {row.how}
          </div>
        </div>
      ))}
      <div className="border-t border-[#dbe4ff] bg-[#fbfcff] px-3 py-2 text-[12px] leading-5 font-bold text-[#526183]">
        dL/dw rows update output weights. dL/dh rows are the hidden-unit credit
        signals that would keep flowing backward.
      </div>
    </div>
  );
}

function UpdateTable({ updates }: { updates: BackpropAnalysis["updates"] }) {
  const rows: Array<{ label: string; update: WeightUpdate }> = [
    { label: "w_out1", update: updates.wOut1 },
    { label: "w_out2", update: updates.wOut2 },
  ];

  return (
    <div className="min-w-0 overflow-hidden rounded-[8px] border border-[#dbe4ff] bg-white">
      <div className="grid grid-cols-[minmax(56px,1fr)_repeat(4,minmax(50px,1fr))] bg-[#f7f9ff] text-center text-[10px] font-black text-[#59678c] uppercase sm:grid-cols-[minmax(70px,1fr)_repeat(4,minmax(70px,1fr))] sm:text-[11px]">
        <div className="px-1.5 py-2 text-left sm:px-2">Weight</div>
        <div className="border-l border-[#dbe4ff] px-1.5 py-2 sm:px-2">
          Before
        </div>
        <div className="border-l border-[#dbe4ff] px-1.5 py-2 sm:px-2">
          Gradient
        </div>
        <div className="border-l border-[#dbe4ff] px-1.5 py-2 sm:px-2">
          Change
        </div>
        <div className="border-l border-[#dbe4ff] px-1.5 py-2 sm:px-2">
          After
        </div>
      </div>
      {rows.map(({ label, update }) => (
        <div
          key={label}
          className="grid grid-cols-[minmax(56px,1fr)_repeat(4,minmax(50px,1fr))] border-t border-[#dbe4ff] text-center font-mono text-[12px] font-black sm:grid-cols-[minmax(70px,1fr)_repeat(4,minmax(70px,1fr))] sm:text-[15px]"
        >
          <div className="px-1.5 py-3 text-left text-[#071024] sm:px-2">
            {label}
          </div>
          <div className="border-l border-[#dbe4ff] px-1.5 py-3 text-[#071024] sm:px-2">
            {formatFixed(update.before)}
          </div>
          <div className="border-l border-[#dbe4ff] px-1.5 py-3 text-[#ff1d37] sm:px-2">
            {formatSigned(update.gradient)}
          </div>
          <div className="border-l border-[#dbe4ff] px-1.5 py-3 text-[#078036] sm:px-2">
            {formatSigned(update.change)}
          </div>
          <div className="border-l border-[#dbe4ff] px-1.5 py-3 text-[#1638ff] sm:px-2">
            {formatFixed(update.after)}
          </div>
        </div>
      ))}
    </div>
  );
}

function LearningRateSlider({
  learningRate,
  onChange,
}: {
  learningRate: number;
  onChange: (value: number) => void;
}) {
  const presets = [0.1, 0.2, 0.5];

  return (
    <div className="rounded-[8px] border border-[#dbe4ff] bg-white px-4 py-4">
      <label className="block">
        <span className="mb-3 flex items-center justify-between gap-3 text-[13px] font-black text-[#1638ff] uppercase">
          <span>Learning rate eta</span>
          <span className="rounded-[6px] bg-[#352cff] px-3 py-1 font-mono text-[14px] text-white">
            {formatFixed(learningRate)}
          </span>
        </span>
        <input
          type="range"
          min={0.01}
          max={1}
          step={0.01}
          value={learningRate}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full accent-[#1638ff]"
        />
      </label>
      <span className="mt-2 flex justify-between font-mono text-[11px] font-bold text-[#526183]">
        <span>0.01</span>
        <span>0.20</span>
        <span>0.50</span>
        <span>1.00</span>
      </span>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {presets.map((preset) => {
          const isActive = Math.abs(learningRate - preset) < 0.001;

          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`rounded-[7px] border px-2 py-2 font-mono text-[12px] font-black transition ${
                isActive
                  ? "border-[#1638ff] bg-[#352cff] text-white"
                  : "border-[#c8d5f6] bg-[#fbfcff] text-[#1638ff] hover:bg-[#f3f5ff]"
              }`}
            >
              eta {formatFixed(preset)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BackpropagationInspectorPlayground() {
  const [selectedCaseId, setSelectedCaseId] =
    useState<BackpropCaseId>(defaultCaseId);
  const [phase, setPhase] = useState<Phase>("backward");
  const [learningRate, setLearningRate] = useState(defaultLearningRate);
  const selectedCase = getBackpropCase(selectedCaseId);
  const analysis = useMemo(
    () => analyzeBackprop(selectedCase, learningRate),
    [selectedCase, learningRate],
  );

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfcff] px-3 py-4 text-[#071024] sm:px-5">
      <div className="mx-auto max-w-[1536px]">
        <header className="mb-4 pl-0 sm:pl-6">
          <h1 className="min-w-0 break-words text-[38px] leading-[1] font-black text-[#030713] sm:text-[48px] lg:text-[56px]">
            Backpropagation Inspector
          </h1>
          <p className="mt-2 max-w-[58rem] text-[18px] leading-tight font-medium text-[#30446f] sm:text-[22px]">
            See how one output error flows backward and assigns credit to every
            output weight.
          </p>
        </header>

        <div className="grid gap-4">
          <Panel className="p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)] lg:items-start">
              <div className="min-w-0">
                <LessonTitle>1. Pick One Training Case</LessonTitle>
                <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[#172347] sm:text-[16px]">
                  Different cached activations and targets change the error
                  signal and the credit assigned to each weight.
                </p>
                <div className="mt-5">
                  <CaseSelector
                    selectedCase={selectedCase}
                    onSelectCase={setSelectedCaseId}
                  />
                </div>
              </div>

              <div className="min-w-0 rounded-[10px] border border-[#dbe4ff] bg-[#fbfcff] p-4">
                <p className="text-[13px] font-black text-[#1638ff] uppercase">
                  Current example ({selectedCase.label})
                </p>
                <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-[8px] border border-[#dbe4ff] bg-white">
                  <ValueCard
                    label="h1 cached"
                    value={formatFixed(analysis.h1)}
                    tone="blue"
                  />
                  <ValueCard
                    label="h2 cached"
                    value={formatFixed(analysis.h2)}
                    tone="blue"
                  />
                  <ValueCard
                    label="target y"
                    value={String(analysis.target)}
                    tone="red"
                  />
                </div>
                <div className="mt-3 grid gap-3 rounded-[8px] border border-[#dbe4ff] bg-white p-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-black text-[#6d789b] uppercase">
                      Task
                    </p>
                    <p className="mt-1 font-bold">Binary classification</p>
                  </div>
                  <div className="sm:border-l sm:border-[#dbe4ff] sm:pl-4">
                    <p className="text-[11px] font-black text-[#6d789b] uppercase">
                      Loss
                    </p>
                    <p className="mt-1 font-bold">Binary cross entropy</p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,34rem),1fr))] gap-4">
            <Panel className="p-5 sm:p-6">
              <LessonTitle>2. Step The Signal Forward</LessonTitle>
              <p className="mt-3 text-[15px] leading-6 text-[#172347]">
                Use cached hidden activations with the current output weights.
              </p>
              <div className="mt-4 min-w-0">
                <ForwardGraph analysis={analysis} />
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <FormulaPill>
                  z = {formatFixed(outputWeights.wOut1)} *{" "}
                  {formatFixed(analysis.h1)} {formatFixed(outputWeights.wOut2)} *{" "}
                  {formatFixed(analysis.h2)} {formatSigned(outputWeights.bias, 2)} ={" "}
                  <span className="text-[#1638ff]">{formatFixed(analysis.z)}</span>
                </FormulaPill>
                <FormulaPill>
                  p = sigmoid(z) ={" "}
                  <span className="text-[#1638ff]">
                    {formatProbability(analysis.probability)}
                  </span>
                </FormulaPill>
                <FormulaPill>
                  L = {analysis.target === 1 ? "-log(p)" : "-log(1 - p)"} ={" "}
                  <span className="text-[#ff1d37]">
                    {formatFixed(analysis.loss, 3)}
                  </span>
                </FormulaPill>
              </div>
            </Panel>

            <Panel className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 min-[1100px]:flex-row min-[1100px]:items-start min-[1100px]:justify-between">
                <div className="min-w-0">
                  <LessonTitle>3. Send Credit Backward</LessonTitle>
                  <p className="mt-3 text-[15px] leading-6 text-[#172347]">
                    The output error flows backward through local derivatives.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PhaseButton
                    phase="forward"
                    currentPhase={phase}
                    label="Forward"
                    onClick={setPhase}
                  />
                  <PhaseButton
                    phase="backward"
                    currentPhase={phase}
                    label="Backward"
                    onClick={setPhase}
                  />
                  <PhaseButton
                    phase="update"
                    currentPhase={phase}
                    label="Update"
                    onClick={setPhase}
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,23rem),1fr))] gap-4">
                <div className="min-w-0">
                  <BackwardGraph analysis={analysis} phase={phase} />
                  <div className="mt-2">
                    <FormulaPill tone="red">
                      weight credit = cached activation * downstream error
                    </FormulaPill>
                  </div>
                </div>
                <GradientTable analysis={analysis} />
              </div>
            </Panel>
          </div>

          <Panel className="p-5 sm:p-6">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,21rem),1fr))] gap-5">
              <div className="min-w-0">
                <LessonTitle>4. See The Update</LessonTitle>
                <p className="mt-3 text-[15px] leading-6 text-[#172347]">
                  Weights move opposite the gradient. Larger absolute credit
                  makes a larger step.
                </p>
                <div className="mt-4">
                  <LearningRateSlider
                    learningRate={learningRate}
                    onChange={setLearningRate}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <p className="mb-2 text-[13px] font-black text-[#1638ff] uppercase">
                  Weight updates (delta w = -eta * dL/dw)
                </p>
                <UpdateTable updates={analysis.updates} />
              </div>

              <div className="min-w-0 rounded-[10px] border border-[#dbe4ff] bg-[#fbfcff] p-5">
                <p className="text-[14px] font-black text-[#078036] uppercase">
                  Takeaway
                </p>
                <p className="mt-4 text-[18px] leading-7 font-black text-[#071024]">
                  Bigger cached activation times bigger downstream error means
                  bigger update.
                </p>
                <p className="mt-4 text-[20px] font-black text-[#1638ff]">
                  That is backprop.
                </p>
                <p className="mt-4 rounded-[8px] border border-[#dbe4ff] bg-white px-3 py-2 text-[13px] leading-5 font-bold text-[#30446f]">
                  {selectedCase.note}
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
