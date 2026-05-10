"use client";

import { type CSSProperties, useMemo, useState } from "react";
import {
  analyzeZeroKnowledgeProof,
  graphEdges,
  graphNodes,
  type ColorName,
  type GraphEdge,
  type GraphNode,
  type ProverMode,
  type TranscriptRow,
} from "./zero-knowledge-proofs-engine";

const colorStyles: Record<ColorName, { fill: string; soft: string; text: string }> = {
  red: {
    fill: "#ff2525",
    soft: "#fff1f1",
    text: "#b91c1c",
  },
  blue: {
    fill: "#2447ff",
    soft: "#eef2ff",
    text: "#2637c9",
  },
  green: {
    fill: "#16a34a",
    soft: "#ecfdf3",
    text: "#107437",
  },
};

function formatProbability(value: number) {
  return value.toFixed(2);
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
      className={`rounded-[14px] border border-[#d8e0f3] bg-white/92 shadow-[0_18px_42px_rgba(26,38,80,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}

function LessonTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[22px] leading-[1.05] font-black text-[#1534dc] uppercase">
      {children}
    </h2>
  );
}

function FactPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[10px] border border-[#dce4f6] bg-[#fbfcff] px-4 py-3">
      <p className="text-[11px] font-black text-[#7180a5] uppercase">
        {label}
      </p>
      <p className="mt-1 text-[14px] leading-[1.25] font-bold text-[#071024]">
        {value}
      </p>
    </div>
  );
}

function ColorDot({ color }: { color: ColorName }) {
  return (
    <span
      className="inline-block size-4 rounded-full border border-white shadow-[0_1px_4px_rgba(7,16,36,0.25)]"
      style={{ backgroundColor: colorStyles[color].fill }}
      aria-label={color}
    />
  );
}

function SealedCommitment() {
  return (
    <div className="relative grid size-11 place-items-center rounded-[8px] border border-[#aeb8d2] bg-[#f7f8fc] shadow-[0_8px_18px_rgba(26,38,80,0.08)]">
      <div className="h-5 w-7 rounded-[3px] border border-[#68738d] bg-[#e9edf5]">
        <div className="mx-auto mt-[3px] h-[13px] w-[13px] rotate-45 border-r border-b border-[#68738d]" />
      </div>
    </div>
  );
}

function OpenCommitment({ color }: { color: ColorName }) {
  return (
    <div className="grid size-12 place-items-center rounded-[9px] border border-[#9da9ca] bg-white shadow-[0_10px_20px_rgba(26,38,80,0.12)]">
      <div
        className="size-7 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(7,16,36,0.25)]"
        style={{ backgroundColor: colorStyles[color].fill }}
      />
    </div>
  );
}

function ProverChoicePanel({
  mode,
  onSelectMode,
}: {
  mode: ProverMode;
  onSelectMode: (mode: ProverMode) => void;
}) {
  const choices: { mode: ProverMode; label: string; caption: string }[] = [
    {
      mode: "honest",
      label: "Honest prover",
      caption: "Knows a valid coloring",
    },
    {
      mode: "cheating",
      label: "Cheating prover",
      caption: "Has two bad edges",
    },
  ];

  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>1. Choose The Prover</LessonTitle>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:max-w-[600px]">
        {choices.map((choice) => {
          const isSelected = choice.mode === mode;

          return (
            <button
              key={choice.mode}
              type="button"
              onClick={() => onSelectMode(choice.mode)}
              className={`min-w-0 rounded-[10px] border px-5 py-4 text-left transition ${
                isSelected
                  ? "border-[#5636f5] bg-[linear-gradient(180deg,#2447ff,#4425df)] text-white shadow-[0_14px_24px_rgba(70,39,232,0.2)]"
                  : "border-[#d8e0f0] bg-white text-[#0d1429] hover:border-[#b9c4de] hover:bg-[#fbfaff]"
              }`}
            >
              <span className="block text-[17px] font-black">
                {choice.label}
              </span>
              <span
                className={`mt-1 block text-[13px] ${
                  isSelected ? "text-white/82" : "text-[#30446f]"
                }`}
              >
                {choice.caption}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <FactPill label="Secret" value="valid 3-coloring" />
        <FactPill label="Fresh shuffle" value="hidden every round" />
        <FactPill label="Reveal" value="one edge only" />
        <FactPill label="Verifier learns" value="endpoint colors differ" />
        <FactPill label="Full coloring" value="hidden" />
      </div>
    </Panel>
  );
}

function GraphView({
  currentEdge,
  currentOpenedColors,
  currentVerdict,
  hiddenShuffleToken,
}: {
  currentEdge: GraphEdge;
  currentOpenedColors: [ColorName, ColorName];
  currentVerdict: "pass" | "caught";
  hiddenShuffleToken: string;
}) {
  const nodeById = new Map(graphNodes.map((node) => [node.id, node]));
  const openedNodeIds = new Set([currentEdge.from, currentEdge.to]);
  const openedColorsByNode = new Map([
    [currentEdge.from, currentOpenedColors[0]],
    [currentEdge.to, currentOpenedColors[1]],
  ]);

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[16px] font-black text-[#071024]">
          Graph (8 nodes, 9 edges)
        </h3>
        <span
          className={`rounded-[8px] border px-3 py-1.5 text-[13px] font-black ${
            currentVerdict === "pass"
              ? "border-[#b6e7c6] bg-[#ecfdf3] text-[#107437]"
              : "border-[#fecaca] bg-[#fff1f1] text-[#b91c1c]"
          }`}
        >
          {currentVerdict === "pass" ? "PASS" : "CAUGHT"}
        </span>
      </div>
      <div className="relative aspect-[1.12] min-h-[300px] overflow-hidden rounded-[12px] border border-[#dce4f6] bg-[#fbfcff]">
        <svg
          viewBox="0 0 100 100"
          aria-label="Graph coloring proof with one challenged edge open"
          className="absolute inset-0 h-full w-full"
        >
          {graphEdges.map((edge) => {
            const from = nodeById.get(edge.from) as GraphNode;
            const to = nodeById.get(edge.to) as GraphNode;
            const isCurrent = edge.id === currentEdge.id;

            return (
              <line
                key={edge.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isCurrent ? "#2447ff" : "#1f2937"}
                strokeWidth={isCurrent ? "1.8" : "0.9"}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        {graphNodes.map((node) => {
          const isOpened = openedNodeIds.has(node.id);
          const color = openedColorsByNode.get(node.id);

          return (
            <div
              key={node.id}
              className="absolute grid -translate-x-1/2 -translate-y-1/2 justify-items-center gap-1"
              style={
                {
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                } as CSSProperties
              }
            >
              <span className="text-[15px] leading-none font-black text-[#071024]">
                {node.id}
              </span>
              {isOpened && color ? (
                <OpenCommitment color={color} />
              ) : (
                <SealedCommitment />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-[8px] border border-[#dce4f6] bg-white px-3 py-2 font-mono text-[13px] font-bold text-[#1534dc]">
          Fresh hidden shuffle: {hiddenShuffleToken}
        </div>
        <div className="rounded-[8px] border border-[#dce4f6] bg-white px-3 py-2 font-mono text-[13px] font-bold text-[#071024]">
          Only edge {currentEdge.id} opened
        </div>
      </div>
    </div>
  );
}

function TranscriptTable({ rows }: { rows: TranscriptRow[] }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[10px] border border-[#dce4f6] bg-white">
      <div className="border-b border-[#dce4f6] bg-[#f7f8ff] px-4 py-3">
        <h3 className="text-[15px] font-black text-[#071024]">
          Transcript (verifier view)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead className="bg-[#fbfcff] text-[11px] font-black text-[#52628a] uppercase">
            <tr>
              <th className="border-b border-[#dce4f6] px-3 py-3">Round</th>
              <th className="border-b border-[#dce4f6] px-3 py-3">Challenge edge</th>
              <th className="border-b border-[#dce4f6] px-3 py-3">Opened colors</th>
              <th className="border-b border-[#dce4f6] px-3 py-3">Shuffle token</th>
              <th className="border-b border-[#dce4f6] px-3 py-3">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.round}-${row.edge.id}`} className="text-[14px]">
                <td className="border-b border-[#edf1fb] px-3 py-3 font-mono font-bold text-[#071024]">
                  {row.round}
                </td>
                <td className="border-b border-[#edf1fb] px-3 py-3 font-mono font-bold text-[#071024]">
                  {row.edge.id}
                </td>
                <td className="border-b border-[#edf1fb] px-3 py-3">
                  <div className="flex items-center gap-2">
                    <ColorDot color={row.openedColors[0]} />
                    <span className="font-mono text-[#52628a]">/</span>
                    <ColorDot color={row.openedColors[1]} />
                  </div>
                </td>
                <td className="border-b border-[#edf1fb] px-3 py-3 font-mono font-bold text-[#1534dc]">
                  {row.shuffleToken}
                </td>
                <td className="border-b border-[#edf1fb] px-3 py-3">
                  <span
                    className={`rounded-[7px] border px-2.5 py-1 text-[12px] font-black ${
                      row.verdict === "pass"
                        ? "border-[#b6e7c6] bg-[#ecfdf3] text-[#107437]"
                        : "border-[#fecaca] bg-[#fff1f1] text-[#b91c1c]"
                    }`}
                  >
                    {row.verdict === "pass" ? "PASS" : "CAUGHT"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProtocolPanel({
  analysis,
  onNextChallenge,
  onRoundsChange,
  rounds,
}: {
  analysis: ReturnType<typeof analyzeZeroKnowledgeProof>;
  onNextChallenge: () => void;
  onRoundsChange: (rounds: number) => void;
  rounds: number;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>2. Commit, Shuffle, Open One Edge</LessonTitle>
      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.05fr)]">
        <GraphView
          currentEdge={analysis.currentEdge}
          currentOpenedColors={analysis.currentOpenedColors}
          currentVerdict={analysis.currentVerdict}
          hiddenShuffleToken={analysis.transcript[0]?.shuffleToken ?? "s1"}
        />
        <div className="min-w-0 space-y-4">
          <TranscriptTable rows={analysis.transcript} />
          <div className="rounded-[10px] border border-[#dce4f6] bg-[#fbfcff] p-4">
            <div className="flex items-center justify-between gap-4 text-[14px] font-bold text-[#071024]">
              <span>Number of rounds to run (k)</span>
              <span className="font-mono text-[#1534dc]">Current k = {rounds}</span>
            </div>
            <div className="mt-4 grid grid-cols-[24px_minmax(0,1fr)_30px] items-center gap-3">
              <span className="font-mono text-[13px] font-bold text-[#52628a]">
                1
              </span>
              <input
                aria-label="Number of proof rounds"
                type="range"
                min="1"
                max="20"
                step="1"
                value={rounds}
                onChange={(event) => onRoundsChange(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dce1ec] accent-[#2447ff] [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#2447ff] [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2447ff]"
                style={
                  {
                    background: `linear-gradient(90deg, #2447ff 0%, #2447ff ${((rounds - 1) / 19) * 100}%, #dce1ec ${((rounds - 1) / 19) * 100}%, #dce1ec 100%)`,
                  } as CSSProperties
                }
              />
              <span className="text-right font-mono text-[13px] font-bold text-[#52628a]">
                20
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "Low", value: 1 },
                { label: "Middle", value: 6 },
                { label: "High", value: 20 },
              ].map((preset) => {
                const isSelected = preset.value === rounds;

                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onRoundsChange(preset.value)}
                    className={`rounded-[8px] border px-3 py-2 text-[12px] font-black transition ${
                      isSelected
                        ? "border-[#2447ff] bg-[#eef2ff] text-[#1534dc]"
                        : "border-[#dce4f6] bg-white text-[#30446f] hover:border-[#b9c4de]"
                    }`}
                    aria-label={`Set rounds to ${preset.value}`}
                  >
                    {preset.label} k = {preset.value}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="text-[14px] leading-[1.35] text-[#30446f]">
                Each click runs the next round with a new random edge and fresh
                shuffle.
              </p>
              <button
                type="button"
                onClick={onNextChallenge}
                className="rounded-[10px] border border-[#2447ff] bg-[#2447ff] px-5 py-3 text-[15px] font-black text-white shadow-[0_12px_22px_rgba(36,71,255,0.22)] transition hover:bg-[#1534dc]"
              >
                Next challenge
              </button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function EscapeChart({
  currentProbability,
  points,
  rounds,
}: {
  currentProbability: number;
  points: { rounds: number; probability: number }[];
  rounds: number;
}) {
  const width = 300;
  const height = 190;
  const chart = { left: 42, right: 18, top: 18, bottom: 34 };
  const plotWidth = width - chart.left - chart.right;
  const plotHeight = height - chart.top - chart.bottom;
  const xMax = 20;
  const yMax = 1;
  const yMin = 0;
  const currentX = chart.left + (Math.min(rounds, xMax) / xMax) * plotWidth;
  const currentY =
    chart.top + (1 - (Math.min(currentProbability, yMax) - yMin) / (yMax - yMin)) * plotHeight;
  const path = points
    .map((point, index) => {
      const x = chart.left + (point.rounds / xMax) * plotWidth;
      const y = chart.top + (1 - point.probability) * plotHeight;

      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="min-w-0">
      <h3 className="text-[15px] font-black text-[#071024]">
        Cheater escape over rounds
      </h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Cheater escape probability is ${formatProbability(
          currentProbability,
        )} after ${rounds} rounds`}
        className="mt-3 h-auto w-full"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = chart.top + (1 - tick) * plotHeight;

          return (
            <g key={tick}>
              <line
                x1={chart.left}
                y1={y}
                x2={width - chart.right}
                y2={y}
                stroke="#e4e9f5"
              />
              <text
                x={chart.left - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-[#52628a] text-[10px] font-bold"
              >
                {tick === 1 ? "1.0" : tick.toFixed(2)}
              </text>
            </g>
          );
        })}
        {[0, 4, 8, 12, 16, 20].map((tick) => {
          const x = chart.left + (tick / xMax) * plotWidth;

          return (
            <g key={tick}>
              <line
                x1={x}
                y1={chart.top}
                x2={x}
                y2={height - chart.bottom}
                stroke="#edf1fb"
              />
              <text
                x={x}
                y={height - 12}
                textAnchor="middle"
                className="fill-[#52628a] text-[10px] font-bold"
              >
                {tick}
              </text>
            </g>
          );
        })}
        <path d={path} fill="none" stroke="#2447ff" strokeWidth="3" />
        {points.map((point) => {
          const x = chart.left + (point.rounds / xMax) * plotWidth;
          const y = chart.top + (1 - point.probability) * plotHeight;

          return (
            <circle
              key={point.rounds}
              cx={x}
              cy={y}
              r="4"
              fill="#2447ff"
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        <line
          x1={currentX}
          y1={chart.top}
          x2={currentX}
          y2={height - chart.bottom}
          stroke="#2447ff"
          strokeDasharray="4 4"
        />
        <circle
          cx={currentX}
          cy={currentY}
          r="6"
          fill="#2447ff"
          stroke="white"
          strokeWidth="2"
        />
        <foreignObject x={Math.min(currentX + 8, width - 88)} y={Math.max(8, currentY - 24)} width="78" height="48">
          <div className="rounded-[8px] border border-[#bfc9ff] bg-white px-2 py-1 text-center font-mono text-[12px] font-black text-[#1534dc] shadow-[0_8px_18px_rgba(26,38,80,0.12)]">
            k = {rounds}
            <br />
            {formatProbability(currentProbability)}
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}

function FormulaBlock({
  caughtEdges,
  escapeProbability,
  passingEdges,
  rounds,
  totalEdges,
}: {
  caughtEdges: number;
  escapeProbability: number;
  passingEdges: number;
  rounds: number;
  totalEdges: number;
}) {
  return (
    <div className="rounded-[10px] border border-[#dce4f6] bg-[#fbfcff] p-4">
      <h3 className="text-[15px] font-black text-[#071024]">
        Cheater escape probability
      </h3>
      <div className="mt-4 space-y-4 font-mono text-[15px] font-bold text-[#071024]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce4f6] pb-4">
          <span>Honest prover pass probability</span>
          <span className="text-[25px] text-[#107437]">1.00</span>
        </div>
        <div className="space-y-2">
          <p>Cheater escape after k rounds</p>
          <p>
            = (passing edges / total edges)<sup>k</sup>
          </p>
          <p>
            = ({passingEdges} / {totalEdges})<sup>{rounds}</sup> ={" "}
            <span className="text-[25px] text-[#ff2525]">
              {formatProbability(escapeProbability)}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-[13px] font-bold text-[#30446f]">
        <p>Passing edges (different colors) = {passingEdges}</p>
        <p>Caught edges (same color) = {caughtEdges}</p>
        <p>passing edges + caught edges = {totalEdges}</p>
      </div>
    </div>
  );
}

function SecrecyMeter() {
  return (
    <div className="rounded-[10px] border border-[#dce4f6] bg-[#fbfcff] p-4">
      <h3 className="text-[15px] font-black text-[#071024]">Secrecy meter</h3>
      <div className="mt-4 space-y-4">
        <div className="rounded-[8px] border border-[#dce4f6] bg-white px-3 py-3 text-center">
          <p className="text-[13px] font-bold text-[#30446f]">
            Opened each round
          </p>
          <p className="mt-1 font-mono text-[24px] font-black text-[#1534dc]">
            1 edge
          </p>
        </div>
        <div className="rounded-[8px] border border-[#dce4f6] bg-white px-3 py-3 text-center">
          <p className="text-[13px] font-bold text-[#30446f]">
            Shuffle token changes each round
          </p>
          <p className="mt-1 font-mono text-[18px] font-black text-[#1534dc]">
            s1, s2, s3...
          </p>
        </div>
        <div>
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className={`h-3 rounded-full ${
                  index === 0 ? "bg-[#2447ff]" : "bg-[#cfd7e8]"
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[12px] font-bold text-[#52628a]">
            <span>one edge</span>
            <span>full coloring hidden</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfidencePanel({
  analysis,
  rounds,
}: {
  analysis: ReturnType<typeof analyzeZeroKnowledgeProof>;
  rounds: number;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>3. Confidence Grows, Secret Stays Hidden</LessonTitle>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_minmax(260px,0.8fr)]">
        <FormulaBlock
          caughtEdges={analysis.caughtEdges}
          escapeProbability={analysis.escapeProbability}
          passingEdges={analysis.passingEdges}
          rounds={rounds}
          totalEdges={analysis.totalEdges}
        />
        <EscapeChart
          currentProbability={analysis.escapeProbability}
          points={analysis.chartPoints}
          rounds={rounds}
        />
        <SecrecyMeter />
      </div>
      <div className="mt-5 rounded-[10px] border border-[#f3cc75] bg-[#fff8e6] px-5 py-4 text-[17px] leading-[1.35] font-bold text-[#5b3b00]">
        <span className="font-black">Takeaway:</span> Each round proves one
        local check; the hidden shuffle keeps those checks from revealing the
        whole coloring.
      </div>
    </Panel>
  );
}

export function ZeroKnowledgeProofsPlayground() {
  const [mode, setMode] = useState<ProverMode>("honest");
  const [rounds, setRounds] = useState(6);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const analysis = useMemo(
    () => analyzeZeroKnowledgeProof({ challengeIndex, mode, rounds }),
    [challengeIndex, mode, rounds],
  );

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f8faff] px-4 py-8 text-[#071024] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 pt-12 sm:pt-16 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-[44px] leading-[0.95] font-black text-black sm:text-[64px] lg:text-[76px]">
              Zero-Knowledge Proofs
            </h1>
            <p className="mt-4 max-w-3xl text-[18px] leading-[1.45] font-bold text-[#14275d]">
              Prove you know a valid graph coloring without revealing the
              coloring itself.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 rounded-[8px] border border-[#b8c5ff] bg-white px-4 py-3 text-[14px] font-black text-[#1534dc] shadow-[0_8px_20px_rgba(26,38,80,0.05)]"
            aria-label="How zero-knowledge graph coloring proofs work"
          >
            <span className="grid size-5 place-items-center rounded-full border border-[#1534dc] font-mono text-[12px]">
              ?
            </span>
            How does this work?
          </button>
        </header>

        <ProverChoicePanel mode={mode} onSelectMode={setMode} />
        <ProtocolPanel
          analysis={analysis}
          onNextChallenge={() =>
            setChallengeIndex((current) => (current + 1) % graphEdges.length)
          }
          onRoundsChange={setRounds}
          rounds={rounds}
        />
        <ConfidencePanel analysis={analysis} rounds={rounds} />
      </div>
    </main>
  );
}
