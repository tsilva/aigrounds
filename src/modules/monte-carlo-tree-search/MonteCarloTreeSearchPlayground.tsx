"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  analyzeSearch,
  formatPercent,
  formatRate,
  initialSearchState,
  runSearchSteps,
  stepSearch,
  type MoveAnalysis,
  type MoveId,
  type SearchState,
} from "./mcts-engine";
import {
  searchProblems,
  type SearchProblem,
  type SearchProblemId,
} from "./scenario";

const nodePositions: Record<MoveId, { x: number; y: number }> = {
  a1: { x: 118, y: 270 },
  b2: { x: 292, y: 270 },
  c3: { x: 466, y: 270 },
  d4: { x: 640, y: 270 },
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
      className={`min-w-0 rounded-[14px] border border-[#d8e0f3] bg-white/92 shadow-[0_18px_42px_rgba(26,38,80,0.05)] ${className}`}
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

function QuestionIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9.7 9.4a2.5 2.5 0 1 1 4 2c-.9.6-1.6 1.2-1.6 2.3M12 17.2h.01"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function BoardPreview({ problem }: { problem: SearchProblem }) {
  return (
    <div className="grid w-full max-w-[132px] grid-cols-3 overflow-hidden rounded-[8px] border border-[#aeb9d0] bg-white">
      {problem.board.flatMap((row, rowIndex) =>
        row.map((cell, columnIndex) => (
          <div
            key={`${rowIndex}-${columnIndex}`}
            className="grid aspect-square place-items-center border border-[#d7deed] font-mono text-[18px] font-black text-[#071024]"
          >
            {cell}
          </div>
        )),
      )}
    </div>
  );
}

function ProblemPanel({
  activeProblemId,
  onSelectProblem,
}: {
  activeProblemId: SearchProblemId;
  onSelectProblem: (problemId: SearchProblemId) => void;
}) {
  const activeProblem =
    searchProblems.find((problem) => problem.id === activeProblemId) ??
    searchProblems[0];

  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>1. Pick The Search Problem</LessonTitle>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {searchProblems.map((problem) => {
          const isSelected = problem.id === activeProblemId;

          return (
            <button
              key={problem.id}
              type="button"
              onClick={() => onSelectProblem(problem.id)}
              className={`rounded-[10px] border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-[#5636f5] bg-[linear-gradient(180deg,#694bff,#4a27e8)] text-white shadow-[0_14px_24px_rgba(70,39,232,0.18)]"
                  : "border-[#d8e0f0] bg-white text-[#0d1429] hover:border-[#b9c4de]"
              }`}
            >
              <span className="block text-[15px] font-black">
                {problem.label}
              </span>
              <span
                className={`mt-1 block text-[13px] ${
                  isSelected ? "text-white/82" : "text-[#30446f]"
                }`}
              >
                {problem.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-5 grid gap-4 rounded-[10px] border border-[#dfe4f4] bg-[#fbfbff] p-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center">
        <BoardPreview problem={activeProblem} />
        <div>
          <p className="font-mono text-[13px] font-bold leading-[1.5] text-[#071024]">
            Root state: choose one candidate move, then let rollouts estimate
            what happens next.
          </p>
          <p className="mt-3 text-[14px] leading-[1.4] font-medium text-[#30446f]">
            {activeProblem.goal}
          </p>
        </div>
      </div>
    </Panel>
  );
}

function FormulaPanel({
  explorationConstant,
  onExplorationChange,
}: {
  explorationConstant: number;
  onExplorationChange: (value: number) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <LessonTitle>2. Score Confidence + Curiosity</LessonTitle>
          <p className="mt-4 text-[15px] leading-[1.4] text-[#263a68]">
            UCB adds current evidence to a bonus for moves with fewer visits.
          </p>
        </div>
        <div className="rounded-[10px] border border-[#dfe4f4] bg-white px-4 py-2 text-right">
          <p className="text-[11px] font-black tracking-[0.03em] text-[#7180a5] uppercase">
            c
          </p>
          <p className="font-mono text-[22px] font-black text-[#352cff]">
            {explorationConstant.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[9px] border border-[#bcc8ff] bg-[#fbfbff] px-3 py-5 text-center font-mono text-[14px] leading-tight font-black whitespace-nowrap text-[#071024] sm:text-[23px]">
        UCB = <span className="text-[#0f8a44]">Q</span> +{" "}
        <span className="text-[#db8b00]">c</span> sqrt(ln N / n)
      </div>

      <div className="mt-4">
        <input
          aria-label="Exploration constant"
          type="range"
          min="0.1"
          max="2.5"
          step="0.1"
          value={explorationConstant}
          onChange={(event) => onExplorationChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dfe5f5] accent-[#352cff]"
        />
        <div className="mt-2 flex justify-between font-mono text-[12px] font-bold text-[#30446f]">
          <span>0.1 exploit</span>
          <span>1.4 balanced</span>
          <span>2.5 explore</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <FactPill label="Q" value="win rate" />
        <FactPill label="N" value="parent visits" />
        <FactPill label="n" value="child visits" />
      </div>
    </Panel>
  );
}

function UcbTable({
  moves,
  selectedMoveId,
}: {
  moves: MoveAnalysis[];
  selectedMoveId: MoveId;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>3. Choose By UCB</LessonTitle>
      <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e2e7f3]">
        <table className="w-full table-fixed border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-b border-[#dfe4f4] bg-[#fbfbff] text-[11px] font-black tracking-[0.04em] text-[#7180a5] uppercase">
              <th className="w-[17%] px-2 py-3">Move</th>
              <th className="w-[17%] px-2 py-3">Q</th>
              <th className="w-[21%] px-2 py-3">Bonus</th>
              <th className="w-[19%] px-2 py-3">UCB</th>
              <th className="w-[26%] px-2 py-3">Pick</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((move) => {
              const isSelected = move.id === selectedMoveId;

              return (
                <tr
                  key={move.id}
                  className={`border-b border-[#e8edf7] font-mono ${
                    isSelected
                      ? "bg-[#fff8df] text-[#071024]"
                      : "bg-white text-[#263a68]"
                  }`}
                >
                  <td className="px-3 py-3 font-black text-[#352cff]">
                    {move.label}
                  </td>
                  <td className="px-2 py-3">{formatRate(move.q)}</td>
                  <td className="px-2 py-3 text-[#b66b00]">
                    {formatRate(move.bonus)}
                  </td>
                  <td className="px-2 py-3 font-black">
                    {formatRate(move.ucb)}
                  </td>
                  <td className="px-2 py-3 font-sans text-[11px] font-black uppercase tracking-[0.02em]">
                    {isSelected
                      ? move.isBestProven
                        ? "Proven"
                        : "Explore"
                      : move.isBestProven
                        ? "Best Q"
                        : "Wait"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[14px] leading-[1.35] font-medium text-[#30446f]">
        The next rollout follows the largest UCB score, not necessarily the
        largest win rate.
      </p>
    </Panel>
  );
}

function TreeNode({
  x,
  y,
  radius,
  move,
  selected,
}: {
  x: number;
  y: number;
  radius: number;
  move: MoveAnalysis;
  selected: boolean;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={selected ? "#fff8df" : "#fbfbff"}
        stroke={selected ? "#2450ff" : "#8d98ab"}
        strokeWidth={selected ? 5 : 2}
      />
      <text
        x={x}
        y={y - 12}
        textAnchor="middle"
        className="fill-[#071024] font-mono text-[16px] font-black"
      >
        {move.label}
      </text>
      <text
        x={x}
        y={y + 9}
        textAnchor="middle"
        className="fill-[#30446f] font-mono text-[13px] font-bold"
      >
        {move.visits} visits
      </text>
      <text
        x={x}
        y={y + 29}
        textAnchor="middle"
        className={`font-mono text-[16px] font-black ${
          move.q >= 0.5 ? "fill-[#119348]" : "fill-[#ff2525]"
        }`}
      >
        {formatPercent(move.q)}
      </text>
    </g>
  );
}

function TreeVisualization({
  state,
  analysis,
}: {
  state: SearchState;
  analysis: ReturnType<typeof analyzeSearch>;
}) {
  const root = { x: 380, y: 88 };
  const selectedPosition = nodePositions[analysis.selectedMove.id];
  const expandedChild = {
    x: selectedPosition.x,
    y: selectedPosition.y + 112,
  };
  const maxVisits = Math.max(...analysis.moves.map((move) => move.visits));

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <LessonTitle>4. One Simulation Step</LessonTitle>
          <p className="mt-3 text-[15px] leading-[1.4] text-[#263a68]">
            Selection follows UCB, expansion adds a child, simulation returns a
            result.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <FactPill label="Root N" value={String(state.rootVisits)} />
          <FactPill label="Root Q" value={formatRate(analysis.rootQ)} />
          <FactPill label="Select" value={analysis.selectedMove.label} />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff]">
        <svg
          viewBox="0 0 760 500"
          role="img"
          aria-label="Monte Carlo tree with selected branch, expansion, and rollout"
          className="h-auto w-full"
        >
          <defs>
            <marker
              id="mcts-arrow"
              markerHeight="8"
              markerWidth="8"
              orient="auto"
              refX="7"
              refY="4"
            >
              <path d="M0,0 L8,4 L0,8 Z" fill="#2450ff" />
            </marker>
          </defs>

          {analysis.moves.map((move) => {
            const position = nodePositions[move.id];
            const selected = move.id === analysis.selectedMove.id;

            return (
              <line
                key={`edge-${move.id}`}
                x1={root.x}
                y1={root.y + 47}
                x2={position.x}
                y2={position.y - 48}
                stroke={selected ? "#2450ff" : "#8791a6"}
                strokeLinecap="round"
                strokeWidth={selected ? 6 : 3}
                opacity={selected ? 1 : 0.82}
                markerEnd={selected ? "url(#mcts-arrow)" : undefined}
              />
            );
          })}

          <circle
            cx={root.x}
            cy={root.y}
            r="52"
            fill="#f4f6ff"
            stroke="#7a8498"
            strokeWidth="2.4"
          />
          <text
            x={root.x}
            y={root.y - 14}
            textAnchor="middle"
            className="fill-[#071024] font-mono text-[15px] font-black"
          >
            Root
          </text>
          <text
            x={root.x}
            y={root.y + 7}
            textAnchor="middle"
            className="fill-[#30446f] font-mono text-[13px] font-bold"
          >
            N={state.rootVisits}
          </text>
          <text
            x={root.x}
            y={root.y + 28}
            textAnchor="middle"
            className="fill-[#119348] font-mono text-[15px] font-black"
          >
            Q={formatRate(analysis.rootQ)}
          </text>

          {analysis.moves.map((move) => {
            const position = nodePositions[move.id];
            const radius = 31 + (move.visits / maxVisits) * 26;

            return (
              <TreeNode
                key={move.id}
                x={position.x}
                y={position.y}
                radius={radius}
                move={move}
                selected={move.id === analysis.selectedMove.id}
              />
            );
          })}

          <line
            x1={selectedPosition.x}
            y1={selectedPosition.y + 56}
            x2={expandedChild.x}
            y2={expandedChild.y - 28}
            stroke="#2450ff"
            strokeLinecap="round"
            strokeWidth="4"
            markerEnd="url(#mcts-arrow)"
          />
          <circle
            cx={expandedChild.x}
            cy={expandedChild.y}
            r="30"
            fill="#fff8df"
            stroke="#db8b00"
            strokeDasharray="5 5"
            strokeWidth="3"
          />
          <text
            x={expandedChild.x}
            y={expandedChild.y - 4}
            textAnchor="middle"
            className="fill-[#071024] font-mono text-[12px] font-black"
          >
            child
          </text>
          <text
            x={expandedChild.x}
            y={expandedChild.y + 14}
            textAnchor="middle"
            className="fill-[#b66b00] font-mono text-[11px] font-black"
          >
            EXPAND
          </text>

          <text
            x={selectedPosition.x}
            y={selectedPosition.y - 74}
            textAnchor="middle"
            className="fill-[#2450ff] font-mono text-[13px] font-black"
          >
            SELECT
          </text>

          <g transform="translate(64 438)">
            <rect
              width="632"
              height="38"
              rx="10"
              fill="#ffffff"
              stroke="#d8e0f3"
            />
            <text
              x="24"
              y="24"
              className="fill-[#30446f] font-mono text-[13px] font-bold"
            >
              rollout:
            </text>
            {Array.from({ length: 5 }, (_, index) => (
              <g key={index} transform={`translate(${105 + index * 54} 19)`}>
                <circle
                  r="9"
                  fill={index < 4 ? "#dff7e8" : state.lastResult ? "#16a34a" : "#ffdede"}
                  stroke={index < 4 ? "#119348" : state.lastResult ? "#119348" : "#ff2525"}
                  strokeWidth="2"
                />
                {index < 4 ? (
                  <text
                    x="23"
                    y="5"
                    className="fill-[#a9b3c7] font-mono text-[14px] font-bold"
                  >
                    -&gt;
                  </text>
                ) : null}
              </g>
            ))}
            <text
              x="420"
              y="24"
              className={`font-mono text-[14px] font-black ${
                state.lastResult ? "fill-[#119348]" : "fill-[#ff2525]"
              }`}
            >
              SIMULATE: {state.lastResult ? "win" : "loss"}
            </text>
          </g>
        </svg>
      </div>
    </Panel>
  );
}

function BackpropPanel({
  state,
  previousState,
  explorationConstant,
}: {
  state: SearchState;
  previousState: SearchState | null;
  explorationConstant: number;
}) {
  const beforeState = previousState ?? state;
  const afterState = previousState
    ? state
    : stepSearch(state, explorationConstant);
  const beforeAnalysis = analyzeSearch(beforeState, explorationConstant);
  const moveId = previousState ? state.lastMoveId : beforeAnalysis.selectedMove.id;
  const beforeMove = beforeState.moves.find((move) => move.id === moveId);
  const afterMove = afterState.moves.find((move) => move.id === moveId);
  const result = previousState ? state.lastResult : afterState.lastResult;

  if (!beforeMove || !afterMove) {
    return null;
  }

  const beforeMoveQ = beforeMove.wins / beforeMove.visits;
  const afterMoveQ = afterMove.wins / afterMove.visits;
  const rows = [
    {
      node: afterMove.label,
      visits: `${beforeMove.visits} -> ${afterMove.visits}`,
      wins: `${beforeMove.wins} -> ${afterMove.wins}`,
      q: `${formatRate(beforeMoveQ)} -> ${formatRate(afterMoveQ)}`,
    },
    {
      node: "Root",
      visits: `${beforeState.rootVisits} -> ${afterState.rootVisits}`,
      wins: `${beforeState.rootWins} -> ${afterState.rootWins}`,
      q: `${formatRate(beforeState.rootWins / beforeState.rootVisits)} -> ${formatRate(
        afterState.rootWins / afterState.rootVisits,
      )}`,
    },
  ];

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <LessonTitle>5. Backpropagate</LessonTitle>
          <p className="mt-3 text-[15px] leading-[1.4] text-[#263a68]">
            The rollout result updates every node on the selected path.
          </p>
        </div>
        <div
          className={`w-fit rounded-full border px-3 py-2 text-[12px] font-black uppercase tracking-[0.03em] ${
            result
              ? "border-[#9fd8b6] bg-[#ecfff3] text-[#0f7b3b]"
              : "border-[#ffc7c7] bg-[#fff1f1] text-[#d91f1f]"
          }`}
        >
          {result ? "Rollout win" : "Rollout loss"}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[92px_minmax(0,1fr)]">
        <div className="flex items-center justify-center">
          <div className="grid justify-items-center gap-2">
            <div
              className={`grid h-16 w-16 place-items-center rounded-full border-2 text-center text-[11px] font-black leading-tight ${
                result
                  ? "border-[#119348] bg-[#ecfff3] text-[#0f7b3b]"
                  : "border-[#ff2525] bg-[#fff1f1] text-[#d91f1f]"
              }`}
            >
              {result ? "WIN" : "LOSS"}
            </div>
            <div className="h-8 w-[3px] rounded-full bg-[#6b7890]" />
            <div className="grid h-11 w-11 place-items-center rounded-full border border-[#9ea8bb] bg-[#f5f7fc] font-mono text-[11px] font-black text-[#30446f]">
              {afterMove.label}
            </div>
            <div className="h-8 w-[3px] rounded-full bg-[#6b7890]" />
            <div className="grid h-11 w-11 place-items-center rounded-full border border-[#9ea8bb] bg-[#f5f7fc] font-mono text-[11px] font-black text-[#30446f]">
              root
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-[#e2e7f3]">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-[#dfe4f4] bg-[#fbfbff] text-[11px] font-black tracking-[0.04em] text-[#7180a5] uppercase">
                <th className="w-[22%] px-2 py-3">Node</th>
                <th className="w-[24%] px-2 py-3">Visits</th>
                <th className="w-[24%] px-2 py-3">Wins</th>
                <th className="w-[30%] px-2 py-3">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.node}
                  className="border-b border-[#e8edf7] bg-white font-mono text-[12px] font-bold text-[#071024]"
                >
                  <td className="px-2 py-3 text-[#352cff]">{row.node}</td>
                  <td className="px-2 py-3">{row.visits}</td>
                  <td className="px-2 py-3 text-[#119348]">{row.wins}</td>
                  <td className="px-2 py-3 text-[#119348]">{row.q}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}

function ControlsPanel({
  budget,
  isRunning,
  state,
  analysis,
  onBudgetChange,
  onStep,
  onRunToggle,
  onReset,
}: {
  budget: number;
  isRunning: boolean;
  state: SearchState;
  analysis: ReturnType<typeof analyzeSearch>;
  onBudgetChange: (value: number) => void;
  onStep: () => void;
  onRunToggle: () => void;
  onReset: () => void;
}) {
  const remaining = Math.max(0, budget - state.rootVisits);

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <LessonTitle>6. Run Controls + Takeaway</LessonTitle>
          <div className="mt-4 flex items-center justify-between gap-4">
            <label
              htmlFor="mcts-budget"
              className="text-[14px] font-black text-[#16264e]"
            >
              Simulation Budget
            </label>
            <span className="font-mono text-[22px] font-black text-[#352cff]">
              {budget}
            </span>
          </div>
          <input
            id="mcts-budget"
            aria-label="Simulation budget"
            type="range"
            min="65"
            max="160"
            step="1"
            value={budget}
            onChange={(event) => onBudgetChange(Number(event.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dfe5f5] accent-[#352cff]"
          />
          <div className="mt-2 flex justify-between font-mono text-[12px] font-bold text-[#30446f]">
            <span>65</span>
            <span>96</span>
            <span>128</span>
            <span>160</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={onStep}
              className="flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[#2450ff] px-3 py-2 text-[14px] font-black text-white shadow-[0_12px_22px_rgba(36,80,255,0.18)] transition hover:bg-[#143be8]"
            >
              <StepIcon />
              Step
            </button>
            <button
              type="button"
              onClick={onRunToggle}
              className="flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[#352cff] px-3 py-2 text-[14px] font-black text-white shadow-[0_12px_22px_rgba(53,44,255,0.18)] transition hover:bg-[#2920e0]"
            >
              {isRunning ? <PauseIcon /> : <PlayIcon />}
              {isRunning ? "Pause" : "Run"}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-[#d7deee] bg-white px-3 py-2 text-[14px] font-black text-[#352cff] transition hover:border-[#b9c4de]"
            >
              <ResetIcon />
              Reset
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <FactPill label="Selected move" value={analysis.selectedMove.label} />
            <FactPill
              label="Why selected"
              value={
                analysis.selectedMove.isBestProven
                  ? "Best Q"
                  : "Exploration"
              }
            />
            <FactPill label="Best proven" value={analysis.bestProvenMove.label} />
            <FactPill label="Rollouts left" value={String(remaining)} />
          </div>
          <div className="rounded-[10px] border border-[#dedcff] bg-[#fbfaff] p-4">
            <p className="text-[15px] leading-[1.45] font-medium text-[#16264e]">
              MCTS alternates between proving strong moves and checking
              uncertain ones. More rollouts turn curiosity into evidence.
            </p>
            <p className="mt-3 font-mono text-[13px] font-black text-[#352cff]">
              recommended after this budget: {analysis.recommendedMove.label}
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function MonteCarloTreeSearchPlayground() {
  const [activeProblemId, setActiveProblemId] =
    useState<SearchProblemId>("tic-tac-toe");
  const [explorationConstant, setExplorationConstant] = useState(1.4);
  const [searchState, setSearchState] = useState<SearchState>(initialSearchState);
  const [previousState, setPreviousState] = useState<SearchState | null>(null);
  const [budget, setBudget] = useState(65);
  const [isRunning, setIsRunning] = useState(false);
  const analysis = useMemo(
    () => analyzeSearch(searchState, explorationConstant),
    [searchState, explorationConstant],
  );

  function applyStep() {
    setSearchState((current) => {
      const next = stepSearch(current, explorationConstant);

      setPreviousState(current);
      setBudget((currentBudget) => Math.max(currentBudget, next.rootVisits));

      return next;
    });
  }

  function resetSearch() {
    setSearchState(initialSearchState);
    setPreviousState(null);
    setBudget(65);
    setIsRunning(false);
  }

  const runToBudget = useCallback(() => {
    setSearchState((current) => {
      const steps = Math.max(0, Math.min(8, budget - current.rootVisits));

      if (steps === 0) {
        setIsRunning(false);
        return current;
      }

      const next = runSearchSteps(current, explorationConstant, steps);
      const previous = runSearchSteps(current, explorationConstant, steps - 1);

      setPreviousState(previous);

      return next;
    });
  }, [budget, explorationConstant]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const delay = searchState.rootVisits >= budget ? 0 : 520;
    const timeout = window.setTimeout(runToBudget, delay);

    return () => window.clearTimeout(timeout);
  }, [budget, isRunning, runToBudget, searchState.rootVisits]);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfcff] px-3 py-4 text-[#071024] sm:px-5">
      <div className="mx-auto max-w-[1536px]">
        <header className="mb-4 flex flex-col gap-3 pl-0 sm:flex-row sm:items-start sm:justify-between sm:pl-6">
          <div className="min-w-0">
            <h1 className="min-w-0 break-words text-[38px] leading-[1] font-black tracking-[-0.055em] text-[#030713] sm:text-[54px]">
              Monte Carlo Tree Search
            </h1>
            <p className="mt-2 max-w-[58rem] text-[18px] leading-tight font-medium text-[#30446f] sm:text-[22px]">
              Choose by confidence plus curiosity.
            </p>
          </div>
          <button
            type="button"
            className="flex w-fit items-center gap-2 rounded-[8px] border border-[#aebcff] bg-white px-4 py-2 text-[14px] font-black text-[#2450ff] transition hover:bg-[#f8f9ff]"
          >
            <QuestionIcon />
            How It Works
          </button>
        </header>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)_minmax(360px,0.92fr)]">
          <ProblemPanel
            activeProblemId={activeProblemId}
            onSelectProblem={setActiveProblemId}
          />
          <FormulaPanel
            explorationConstant={explorationConstant}
            onExplorationChange={setExplorationConstant}
          />
          <UcbTable
            moves={analysis.moves}
            selectedMoveId={analysis.selectedMove.id}
          />
        </div>

        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.9fr)]">
          <TreeVisualization state={searchState} analysis={analysis} />
          <BackpropPanel
            state={searchState}
            previousState={previousState}
            explorationConstant={explorationConstant}
          />
        </div>

        <div className="mt-4">
          <ControlsPanel
            budget={budget}
            isRunning={isRunning}
            state={searchState}
            analysis={analysis}
            onBudgetChange={(value) => {
              setBudget(Math.max(value, searchState.rootVisits));
              if (value <= searchState.rootVisits) {
                setIsRunning(false);
              }
            }}
            onStep={applyStep}
            onRunToggle={() => setIsRunning((current) => !current)}
            onReset={resetSearch}
          />
        </div>
      </div>
    </main>
  );
}
