"use client";

import { useEffect, useRef, useState } from "react";
import {
  actionIds,
  arcadeCells,
  arcadeGrid,
  isTerminalState,
  startStateId,
  type ActionId,
} from "./arcade";
import {
  createInitialLearningState,
  epsilonSchedulePresets,
  getBestActionForState,
  getEpsilonForEpisode,
  runQlearningEpisode,
  summarizeGreedyPath,
  type LearningState,
  type ScheduleId,
} from "./q-learning-engine";

const actionLabels: Record<ActionId, string> = {
  up: "Up",
  right: "Right",
  down: "Down",
  left: "Left",
};

const actionArrows: Record<ActionId, string> = {
  up: "↑",
  right: "→",
  down: "↓",
  left: "←",
};

function formatSigned(value: number) {
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
}

function formatQ(value: number) {
  return value.toFixed(2);
}

function cellTone(cellId: string) {
  const cell = arcadeCells[cellId];

  switch (cell.type) {
    case "start":
      return "border-sky-300 bg-sky-50";
    case "goal":
      return "border-emerald-300 bg-emerald-50";
    case "trap":
      return "border-rose-300 bg-rose-50";
    case "wall":
      return "border-stone-300 bg-stone-200";
    default:
      return "border-stone-200 bg-white";
  }
}

function cellAccent(cellId: string) {
  const cell = arcadeCells[cellId];

  switch (cell.type) {
    case "start":
      return "text-sky-800";
    case "goal":
      return "text-emerald-800";
    case "trap":
      return "text-rose-800";
    case "wall":
      return "text-stone-500";
    default:
      return "text-stone-800";
  }
}

function getStartActionSummary(learningState: LearningState) {
  const startValues = learningState.qValues[startStateId];

  if (!startValues) {
    return null;
  }

  const bestAction = getBestActionForState(
    learningState.qValues,
    startStateId,
    learningState.visitCounts,
  );

  if (!bestAction) {
    return null;
  }

  return {
    action: bestAction,
    qValue: startValues[bestAction],
    visits: learningState.visitCounts[startStateId][bestAction],
  };
}

export function QLearningPlayground() {
  const [learningState, setLearningState] = useState<LearningState>(
    createInitialLearningState,
  );
  const [scheduleId, setScheduleId] = useState<ScheduleId>("cooling");
  const [alpha, setAlpha] = useState(0.45);
  const [gamma, setGamma] = useState(0.92);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [selectedStateId, setSelectedStateId] = useState(startStateId);
  const learningStateRef = useRef(learningState);

  useEffect(() => {
    learningStateRef.current = learningState;
  }, [learningState]);

  useEffect(() => {
    if (!isAutoRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const nextState = runQlearningEpisode(learningStateRef.current, {
        alpha,
        gamma,
        scheduleId,
      });

      learningStateRef.current = nextState;
      setLearningState(nextState);
    }, 700);

    return () => window.clearInterval(intervalId);
  }, [alpha, gamma, isAutoRunning, scheduleId]);

  function applyEpisodes(episodes: number) {
    let nextState = learningStateRef.current;

    for (let episode = 0; episode < episodes; episode += 1) {
      nextState = runQlearningEpisode(nextState, {
        alpha,
        gamma,
        scheduleId,
      });
    }

    learningStateRef.current = nextState;
    setLearningState(nextState);
  }

  function resetLearning() {
    const nextState = createInitialLearningState();
    learningStateRef.current = nextState;
    setLearningState(nextState);
    setIsAutoRunning(false);
    setSelectedStateId(startStateId);
  }

  const nextEpisodeNumber = learningState.episode + 1;
  const nextEpsilon = getEpsilonForEpisode(scheduleId, nextEpisodeNumber);
  const selectedCell = arcadeCells[selectedStateId];
  const selectedQValues = learningState.qValues[selectedStateId] ?? null;
  const selectedVisits = learningState.visitCounts[selectedStateId] ?? null;
  const startAction = getStartActionSummary(learningState);
  const greedyPath = summarizeGreedyPath(
    learningState.qValues,
    learningState.visitCounts,
  );
  const greedyPathStateIds = new Set(greedyPath.stateIds);
  const lastEpisode = learningState.lastEpisode;
  const totalSteps =
    learningState.totalExploreSteps + learningState.totalExploitSteps;
  const exploreShare =
    totalSteps === 0
      ? 0
      : learningState.totalExploreSteps / totalSteps;
  const selectedActionInsights = selectedQValues
    ? [...actionIds]
        .map((action) => ({
          action,
          qValue: selectedQValues[action],
          visits: selectedVisits?.[action] ?? 0,
        }))
        .sort((left, right) => right.qValue - left.qValue)
    : [];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_55px_rgba(68,64,60,0.1)] backdrop-blur">
        <div className="border-b border-stone-200 px-6 py-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-stone-500">
                  Reinforcement playground
                </p>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">
                  Train a policy on the arcade floor
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-stone-600">
                  The agent starts without a model and only keeps a Q-table. Run
                  full episodes, then inspect which actions gained value and how
                  the exploration schedule changes whether it settles for the
                  safe cashout or keeps learning the jackpot route.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[30rem]">
                <button
                  type="button"
                  onClick={() => applyEpisodes(1)}
                  className="rounded-full bg-stone-950 px-4 py-2.5 text-sm font-medium text-stone-50 transition-colors hover:bg-stone-800"
                >
                  Run 1 episode
                </button>
                <button
                  type="button"
                  onClick={() => applyEpisodes(25)}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:border-stone-950"
                >
                  Run 25 more
                </button>
                <button
                  type="button"
                  onClick={() => setIsAutoRunning((value) => !value)}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                    isAutoRunning
                      ? "border border-sky-300 bg-sky-100 text-sky-950"
                      : "border border-stone-300 bg-white text-stone-900 hover:border-stone-950"
                  }`}
                >
                  {isAutoRunning ? "Pause autoplay" : "Autoplay"}
                </button>
                <button
                  type="button"
                  onClick={resetLearning}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:border-stone-950"
                >
                  Reset learner
                </button>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(20rem,1.15fr)]">
              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-950 p-4 text-stone-50">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
                  Episodes
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-sky-300">
                  {learningState.episode}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                  Next epsilon
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-stone-950">
                  {nextEpsilon.toFixed(2)}
                </p>
                <p className="mt-2 font-mono text-sm text-stone-500">
                  episode {nextEpisodeNumber}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                  Start-state leader
                </p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-stone-950">
                  {startAction ? `${actionArrows[startAction.action]} ${actionLabels[startAction.action]}` : "No data"}
                </p>
                <p className="mt-2 font-mono text-sm text-stone-500">
                  Q {formatQ(startAction?.qValue ?? 0)} | visits{" "}
                  {startAction?.visits ?? 0}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                  Last return
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-stone-950">
                  {formatSigned(lastEpisode?.totalReturn ?? 0)}
                </p>
                <p className="mt-2 font-mono text-sm text-stone-500">
                  {lastEpisode?.terminalStateId
                    ? arcadeCells[lastEpisode.terminalStateId].label
                    : "No terminal yet"}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                  Epsilon schedule
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {epsilonSchedulePresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setScheduleId(preset.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        preset.id === scheduleId
                          ? "bg-sky-300 text-sky-950"
                          : "bg-white text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  {
                    epsilonSchedulePresets.find((preset) => preset.id === scheduleId)
                      ?.description
                  }
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="alpha"
                    className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500"
                  >
                    Alpha: learning rate
                  </label>
                  <span className="font-mono text-sm text-stone-900">
                    {alpha.toFixed(2)}
                  </span>
                </div>
                <input
                  id="alpha"
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={alpha}
                  onChange={(event) => setAlpha(Number(event.target.value))}
                  className="mt-4 w-full accent-sky-600"
                />
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  Higher alpha overwrites old beliefs faster. Lower alpha makes
                  value estimates move more slowly but also less noisily.
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="gamma"
                    className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500"
                  >
                    Gamma: future reward weight
                  </label>
                  <span className="font-mono text-sm text-stone-900">
                    {gamma.toFixed(2)}
                  </span>
                </div>
                <input
                  id="gamma"
                  type="range"
                  min="0.2"
                  max="0.99"
                  step="0.01"
                  value={gamma}
                  onChange={(event) => setGamma(Number(event.target.value))}
                  className="mt-4 w-full accent-sky-600"
                />
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  Higher gamma makes the longer jackpot route more attractive,
                  because later rewards reach further back into the Q-table.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-4 py-4 sm:px-6 sm:py-6 xl:grid-cols-[minmax(0,1.35fr)_22rem]">
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(180deg,#f8fbff,#edf6ff)] p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                  State grid
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                  Click a square to inspect its Q-values
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                {arcadeGrid.flat().map((cell) => {
                  const bestAction = getBestActionForState(
                    learningState.qValues,
                    cell.id,
                    learningState.visitCounts,
                  );
                  const qValues = learningState.qValues[cell.id];
                  const isSelected = selectedStateId === cell.id;
                  const onGreedyPath =
                    greedyPathStateIds.has(cell.id) && cell.type !== "wall";

                  if (cell.type === "wall") {
                    return (
                      <div
                        key={cell.id}
                        className={`min-h-44 rounded-[1.35rem] border p-3 ${cellTone(cell.id)}`}
                      >
                        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                          Blocked
                        </p>
                        <p className="mt-6 text-lg font-semibold text-stone-700">
                          {cell.title}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-stone-600">
                          {cell.description}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={cell.id}
                      type="button"
                      onClick={() => setSelectedStateId(cell.id)}
                      className={`min-h-44 rounded-[1.35rem] border p-3 text-left transition-colors ${cellTone(
                        cell.id,
                      )} ${isSelected ? "ring-2 ring-stone-950/70" : ""} ${
                        onGreedyPath ? "shadow-[0_0_0_1px_rgba(14,116,144,0.22),0_18px_32px_rgba(14,116,144,0.08)]" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                            {cell.type === "goal"
                              ? "Goal"
                              : cell.type === "trap"
                                ? "Trap"
                                : cell.type === "start"
                                  ? "Start"
                                  : "State"}
                          </p>
                          <p
                            className={`mt-2 text-lg font-semibold ${cellAccent(
                              cell.id,
                            )}`}
                          >
                            {cell.label}
                          </p>
                        </div>
                        {cell.reward !== undefined ? (
                          <span
                            className={`rounded-full px-2 py-1 font-mono text-xs ${
                              cell.reward > 0
                                ? "bg-emerald-200 text-emerald-950"
                                : "bg-rose-200 text-rose-950"
                            }`}
                          >
                            {formatSigned(cell.reward)}
                          </span>
                        ) : null}
                      </div>

                      {isTerminalState(cell.id) ? (
                        <div className="mt-8 rounded-2xl border border-white/80 bg-white/70 p-4">
                          <p className="text-sm leading-7 text-stone-600">
                            {cell.description}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-5 grid grid-cols-3 gap-2">
                          <div />
                          <div
                            className={`rounded-xl px-2 py-2 text-center text-xs font-mono ${
                              bestAction === "up"
                                ? "bg-sky-300 text-sky-950"
                                : "bg-white/85 text-stone-600"
                            }`}
                          >
                            ↑ {formatQ(qValues?.up ?? 0)}
                          </div>
                          <div />
                          <div
                            className={`rounded-xl px-2 py-2 text-center text-xs font-mono ${
                              bestAction === "left"
                                ? "bg-sky-300 text-sky-950"
                                : "bg-white/85 text-stone-600"
                            }`}
                          >
                            ← {formatQ(qValues?.left ?? 0)}
                          </div>
                          <div className="flex min-h-16 flex-col items-center justify-center rounded-xl border border-white/80 bg-white/75 px-2 py-3">
                            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-stone-500">
                              Best
                            </p>
                            <p className="mt-2 text-lg font-semibold text-stone-950">
                              {bestAction ? actionArrows[bestAction] : "·"}
                            </p>
                          </div>
                          <div
                            className={`rounded-xl px-2 py-2 text-center text-xs font-mono ${
                              bestAction === "right"
                                ? "bg-sky-300 text-sky-950"
                                : "bg-white/85 text-stone-600"
                            }`}
                          >
                            → {formatQ(qValues?.right ?? 0)}
                          </div>
                          <div />
                          <div
                            className={`rounded-xl px-2 py-2 text-center text-xs font-mono ${
                              bestAction === "down"
                                ? "bg-sky-300 text-sky-950"
                                : "bg-white/85 text-stone-600"
                            }`}
                          >
                            ↓ {formatQ(qValues?.down ?? 0)}
                          </div>
                          <div />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-stone-200 bg-stone-950 p-5 text-stone-50">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
                  Learned greedy route
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  This is the route the current Q-table would choose with
                  epsilon set to zero.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {greedyPath.actions.length === 0 ? (
                    <span className="rounded-full bg-stone-800 px-3 py-1.5 text-sm text-stone-300">
                      No route yet
                    </span>
                  ) : (
                    greedyPath.actions.map((step, index) => (
                      <span
                        key={`${step.stateId}-${step.action}-${index}`}
                        className="rounded-full bg-stone-800 px-3 py-1.5 text-sm text-stone-200"
                      >
                        {arcadeCells[step.stateId].label} {actionArrows[step.action]}
                      </span>
                    ))
                  )}
                </div>
                <p className="mt-5 text-sm leading-7 text-stone-300">
                  {greedyPath.reachedTerminal && greedyPath.terminalStateId
                    ? `Current policy terminates at ${arcadeCells[greedyPath.terminalStateId].title}.`
                    : "Current policy still loops or stops before reaching a terminal state."}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                  Exploration mix
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-stone-950">
                  {(exploreShare * 100).toFixed(0)}%
                </p>
                <p className="mt-2 font-mono text-sm text-stone-500">
                  {learningState.totalExploreSteps} explore /{" "}
                  {learningState.totalExploitSteps} exploit
                </p>
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  If this number collapses too quickly, the policy can freeze on
                  the safe cashout. If it stays high forever, the Q-table learns
                  but the executed policy remains noisy.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                Selected state
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-stone-950">
                {selectedCell.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                {selectedCell.description}
              </p>

              {selectedQValues ? (
                <div className="mt-5 space-y-3">
                  {selectedActionInsights.map((entry) => (
                    <div
                      key={entry.action}
                      className="rounded-[1.15rem] border border-stone-200 bg-stone-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium text-stone-900">
                          {actionArrows[entry.action]} {actionLabels[entry.action]}
                        </p>
                        <p className="font-mono text-sm text-stone-600">
                          visits {entry.visits}
                        </p>
                      </div>
                      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-stone-950">
                        {formatQ(entry.qValue)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.15rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-600">
                  Terminal states do not carry outgoing Q-values. They only send
                  reward backward into the states that led into them.
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                Last episode trace
              </p>
              <div className="mt-4 space-y-3">
                {lastEpisode?.steps.length ? (
                  lastEpisode.steps.map((step) => (
                    <div
                      key={`${step.step}-${step.stateId}-${step.action}`}
                      className="rounded-[1.15rem] border border-stone-200 bg-stone-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium text-stone-900">
                          {step.step}. {arcadeCells[step.stateId].label}{" "}
                          {actionArrows[step.action]}{" "}
                          {arcadeCells[step.nextStateId].label}
                        </p>
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-[0.2em] ${
                            step.mode === "explore"
                              ? "bg-sky-200 text-sky-950"
                              : "bg-stone-200 text-stone-700"
                          }`}
                        >
                          {step.mode}
                        </span>
                      </div>
                      <p className="mt-2 font-mono text-xs leading-6 text-stone-600">
                        reward {formatSigned(step.reward)} | target{" "}
                        {formatQ(step.tdTarget)} | Q {formatQ(step.previousQ)} →{" "}
                        {formatQ(step.updatedQ)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-[1.15rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-600">
                    Run an episode to see the TD updates line by line.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
