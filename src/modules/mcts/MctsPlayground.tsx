"use client";

import { useEffect, useRef, useState } from "react";
import {
  createInitialSearchState,
  runMctsIteration,
  type DecisionScore,
  type SearchState,
} from "./mcts-engine";
import {
  getOptimalRoute,
  isTerminalNode,
  orderedScenarioNodes,
  rootNodeId,
  scenarioNodes,
} from "./scenario";

const optimalRoute = getOptimalRoute();

function formatReward(value: number) {
  return value.toFixed(1);
}

function visitOpacity(visits: number) {
  if (visits === 0) {
    return 0.18;
  }

  return Math.min(0.85, 0.24 + visits / 18);
}

function compareDecisionScores(a: DecisionScore, b: DecisionScore) {
  return b.uctScore - a.uctScore;
}

function compareRootSummariesByVisits(
  left: { visits: number; averageReward: number },
  right: { visits: number; averageReward: number },
) {
  if (right.visits !== left.visits) {
    return right.visits - left.visits;
  }

  return right.averageReward - left.averageReward;
}

export function MctsPlayground() {
  const [searchState, setSearchState] = useState<SearchState>(
    createInitialSearchState,
  );
  const [explorationConstant, setExplorationConstant] = useState(1.4);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [inspectedNodeId, setInspectedNodeId] = useState(rootNodeId);
  const [showOptimalRoute, setShowOptimalRoute] = useState(false);
  const searchStateRef = useRef(searchState);

  useEffect(() => {
    searchStateRef.current = searchState;
  }, [searchState]);

  useEffect(() => {
    if (!isAutoRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      let nextState = searchStateRef.current;

      for (let step = 0; step < 1; step += 1) {
        nextState = runMctsIteration(nextState, explorationConstant);
      }

      searchStateRef.current = nextState;
      setSearchState(nextState);
    }, 820);

    return () => window.clearInterval(intervalId);
  }, [explorationConstant, isAutoRunning]);

  function applyIterations(iterations: number) {
    let nextState = searchStateRef.current;

    for (let step = 0; step < iterations; step += 1) {
      nextState = runMctsIteration(nextState, explorationConstant);
    }

    searchStateRef.current = nextState;
    setSearchState(nextState);
  }

  function resetSearch() {
    const nextState = createInitialSearchState();
    searchStateRef.current = nextState;
    setSearchState(nextState);
    setIsAutoRunning(false);
    setInspectedNodeId(rootNodeId);
    setShowOptimalRoute(false);
  }

  const lastTrace = searchState.lastTrace;
  const highlightedNodeIds = new Set<string>();

  if (lastTrace) {
    for (const nodeId of lastTrace.selectionNodeIds) {
      highlightedNodeIds.add(nodeId);
    }

    for (const nodeId of lastTrace.rolloutNodeIds) {
      highlightedNodeIds.add(nodeId);
    }
  }

  const inspectedScenarioNode = scenarioNodes[inspectedNodeId];
  const inspectedSearchNode = searchState.nodes[inspectedNodeId];
  const rootSummaries =
    lastTrace?.rootActionSummaries ??
    scenarioNodes[rootNodeId].actions.map((action) => ({
      nodeId: action.targetId,
      label: scenarioNodes[action.targetId].label,
      title: scenarioNodes[action.targetId].title,
      visits: 0,
      averageReward: 0,
    }));

  const bestRootAction = [...rootSummaries].sort(compareRootSummariesByVisits)[0];
  const decisionScores = [...(lastTrace?.decisionScores ?? [])].sort(
    compareDecisionScores,
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_55px_rgba(68,64,60,0.1)] backdrop-blur">
        <div className="border-b border-stone-200 px-6 py-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-stone-500">
                  Interactive mission
                </p>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">
                  Search the mission tree
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-stone-600">
                  The tree is the main event. Controls and explanations stay
                  close, but the canvas gets the width so the search pattern is
                  easy to read.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[28rem]">
                <button
                  type="button"
                  onClick={() => applyIterations(1)}
                  className="rounded-full bg-stone-950 px-4 py-2.5 text-sm font-medium text-stone-50 transition-colors hover:bg-stone-800"
                >
                  Run 1 simulation
                </button>
                <button
                  type="button"
                  onClick={() => applyIterations(15)}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:border-stone-950"
                >
                  Run 15 more
                </button>
                <button
                  type="button"
                  onClick={() => setIsAutoRunning((value) => !value)}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                    isAutoRunning
                      ? "border border-amber-400 bg-amber-100 text-amber-950"
                      : "border border-stone-300 bg-white text-stone-900 hover:border-stone-950"
                  }`}
                >
                  {isAutoRunning ? "Pause autoplay" : "Autoplay"}
                </button>
                <button
                  type="button"
                  onClick={resetSearch}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:border-stone-950"
                >
                  Reset tree
                </button>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(20rem,1.3fr)]">
              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-950 p-4 text-stone-50">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
                  Simulations
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-amber-300">
                  {searchState.iteration}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                  Current root leader
                </p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-stone-950">
                  {bestRootAction?.label ?? "Unknown"}
                </p>
                <p className="mt-2 font-mono text-sm text-stone-500">
                  {bestRootAction?.visits ?? 0} visits, avg{" "}
                  {formatReward(bestRootAction?.averageReward ?? 0)}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                  Last reward
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-sky-700">
                  {lastTrace ? lastTrace.reward : "None"}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="exploration"
                    className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500"
                  >
                    Exploration constant
                  </label>
                  <span className="font-mono text-sm text-stone-800">
                    {explorationConstant.toFixed(1)}
                  </span>
                </div>
                <input
                  id="exploration"
                  type="range"
                  min="0.2"
                  max="2.4"
                  step="0.1"
                  value={explorationConstant}
                  onChange={(event) =>
                    setExplorationConstant(Number(event.target.value))
                  }
                  className="mt-4 w-full accent-amber-600"
                />
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  This demo normalizes rewards before applying UCT, so classic
                  exploration values stay meaningful. Lower values exploit
                  early. Higher values keep probing uncertain branches before
                  the search commits.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-6 sm:py-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              MCTS tree view
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              Click a node to inspect it
            </p>
          </div>
          <div className="overflow-x-auto rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(180deg,#fffaf2,#f8f0e3)] p-3 sm:p-5">
            <svg
              viewBox="0 0 920 760"
              className="block h-auto w-[980px] max-w-none overflow-visible"
              role="img"
              aria-label="Monte Carlo Tree Search visualization"
            >
              {orderedScenarioNodes.flatMap((node) =>
                node.actions.map((action) => {
                  const target = scenarioNodes[action.targetId];
                  const edgeHighlighted =
                    highlightedNodeIds.has(node.id) &&
                    highlightedNodeIds.has(target.id);

                  return (
                    <line
                      key={`${node.id}-${target.id}`}
                      x1={node.x}
                      y1={node.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={edgeHighlighted ? "#d97706" : "#d6d3d1"}
                      strokeWidth={edgeHighlighted ? 4 : 2}
                      strokeLinecap="round"
                      opacity={edgeHighlighted ? 0.95 : 0.72}
                    />
                  );
                }),
              )}

              {orderedScenarioNodes.map((node) => {
                const searchNode = searchState.nodes[node.id];
                const visits = searchNode?.visits ?? 0;
                const average = visits > 0 ? searchNode.totalReward / visits : 0;
                const isHighlighted = highlightedNodeIds.has(node.id);
                const isInspected = node.id === inspectedNodeId;
                const isTerminal = isTerminalNode(node.id);
                const fill = isTerminal ? "#fcd34d" : "#0f766e";

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => setInspectedNodeId(node.id)}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isTerminal ? 23 : node.id === rootNodeId ? 28 : 25}
                      fill={fill}
                      opacity={visitOpacity(visits)}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={
                        isInspected
                          ? 31
                          : isTerminal
                            ? 23
                            : node.id === rootNodeId
                              ? 28
                              : 25
                      }
                      fill="none"
                      stroke={
                        isInspected
                          ? "#1c1917"
                          : isHighlighted
                            ? "#d97706"
                            : "#f5f5f4"
                      }
                      strokeWidth={isInspected ? 3 : isHighlighted ? 3 : 1.4}
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fontFamily="var(--font-space-grotesk)"
                      fontSize={11}
                      fontWeight={700}
                      fill={isTerminal ? "#292524" : "#fefce8"}
                    >
                      {node.label}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 40}
                      textAnchor="middle"
                      fontFamily="var(--font-ibm-plex-mono)"
                      fontSize={10}
                      fill="#57534e"
                    >
                      {visits} visits
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 54}
                      textAnchor="middle"
                      fontFamily="var(--font-ibm-plex-mono)"
                      fontSize={10}
                      fill="#78716c"
                    >
                      avg {formatReward(average)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-5">
          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_rgba(68,64,60,0.08)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                  Live narration
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-stone-950">
                  What the last simulation just did
                </h2>
              </div>
              <p className="font-mono text-sm text-stone-500">
                Iteration {lastTrace?.iteration ?? 0}
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "1. Selection",
                  body:
                    lastTrace?.narration[0] ??
                    "Selection starts at the root and only uses UCT once every move from a node has been tried at that tree node.",
                },
                {
                  title: "2. Expansion",
                  body:
                    lastTrace?.narration[1] ??
                    "Expansion adds one new child from the frontier so the tree can grow gradually.",
                },
                {
                  title: "3. Simulation",
                  body:
                    lastTrace?.narration[2] ??
                    "Simulation plays forward from the new node using a random default policy until a terminal outcome appears.",
                },
                {
                  title: "4. Backpropagation",
                  body:
                    lastTrace?.narration[3] ??
                    "Backpropagation updates the visit count and accumulated reward of each tree node on the selected path.",
                },
              ].map((card) => (
                <article
                  key={card.title}
                  className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                    {card.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-stone-700">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_rgba(68,64,60,0.08)]">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
              Root action scoreboard
            </p>
            <div className="mt-4 space-y-3">
              {rootSummaries.map((summary) => (
                <div
                  key={summary.nodeId}
                  className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.03em] text-stone-900">
                        {summary.title}
                      </p>
                      <p className="text-sm text-stone-500">{summary.label}</p>
                    </div>
                    <div className="text-right font-mono text-sm text-stone-700">
                      <p>{summary.visits} visits</p>
                      <p>avg {formatReward(summary.averageReward)}</p>
                    </div>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e,#f59e0b)] transition-all duration-500"
                      style={{
                        width: `${Math.max(4, summary.averageReward)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-[2rem] border border-white/70 bg-stone-50 p-5 shadow-[0_20px_50px_rgba(68,64,60,0.08)]">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
              Node inspector
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-stone-950">
              {inspectedScenarioNode.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              {inspectedScenarioNode.description}
            </p>
            <div className="mt-5 grid gap-3">
              <InspectorStat
                label="Visits"
                value={`${inspectedSearchNode?.visits ?? 0}`}
              />
              <InspectorStat
                label="Average reward"
                value={formatReward(
                  inspectedSearchNode && inspectedSearchNode.visits > 0
                    ? inspectedSearchNode.totalReward / inspectedSearchNode.visits
                    : 0,
                )}
              />
              <InspectorStat
                label="Type"
                value={isTerminalNode(inspectedNodeId) ? "Terminal" : "Decision"}
              />
              {isTerminalNode(inspectedNodeId) ? (
                <InspectorStat
                  label="Reward"
                  value={`${scenarioNodes[inspectedNodeId].reward ?? 0}`}
                />
              ) : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-stone-950 p-5 text-stone-50 shadow-[0_20px_50px_rgba(28,25,23,0.18)]">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
              UCT spotlight
            </p>
            <p className="mt-3 text-sm leading-7 text-stone-300">
              UCT score = normalized average reward + exploration bonus. The
              bonus shrinks as a branch gets visited repeatedly.
            </p>
            <div className="mt-4 space-y-3">
              {decisionScores.length > 0 ? (
                decisionScores.map((score) => (
                  <div
                    key={score.targetId}
                    className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-stone-50">
                        {score.label}
                      </p>
                      <p className="font-mono text-sm text-amber-300">
                        {score.uctScore.toFixed(2)}
                      </p>
                    </div>
                    <p className="mt-2 font-mono text-xs text-stone-400">
                      utility {score.normalizedAverage.toFixed(2)} + bonus{" "}
                      {score.explorationBonus.toFixed(2)} ={" "}
                      {score.uctScore.toFixed(2)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-stone-500">
                      raw avg reward {score.averageReward.toFixed(1)} from{" "}
                      {score.visits} visits
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-[1.25rem] border border-dashed border-white/15 p-4 text-sm leading-7 text-stone-300">
                  No UCT comparison yet. Early on, MCTS expands unseen moves
                  before it needs the full formula.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_50px_rgba(68,64,60,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                  Spoiler mode
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-950">
                  Reveal the optimal route
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOptimalRoute((value) => !value)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  showOptimalRoute
                    ? "bg-stone-950 text-stone-50"
                    : "border border-stone-300 bg-white text-stone-900"
                }`}
              >
                {showOptimalRoute ? "Hide" : "Reveal"}
              </button>
            </div>
            {showOptimalRoute ? (
              <div className="mt-4 space-y-3 rounded-[1.25rem] border border-amber-300 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
                <p>
                  Best route:{" "}
                  {optimalRoute.path
                    .map((nodeId) => scenarioNodes[nodeId].title)
                    .join(" -> ")}
                </p>
                <p>
                  Terminal reward:{" "}
                  <span className="font-mono">{optimalRoute.reward}</span>
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-stone-600">
                Leave this hidden if you want to judge whether the search is
                converging correctly from the statistics alone.
              </p>
            )}
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_rgba(68,64,60,0.08)]">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
              Why MCTS works
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-stone-700">
              <p>
                Instead of evaluating every path in full, MCTS samples promising
                futures and keeps updating the paths that matter.
              </p>
              <p>
                In this demo, the simulation phase uses random rollouts, and
                each terminal reward updates the statistics of the tree path
                that led to that outcome.
              </p>
              <p>
                Branches with little evidence keep a temporary exploration
                bonus, which stops the search from becoming overconfident too
                early.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_rgba(68,64,60,0.08)]">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
              Mental model
            </p>
            <div className="mt-4 grid gap-3">
              <MiniLesson
                title="Selection"
                body="Walk down the known tree using UCT once a node has tried every child at least once."
              />
              <MiniLesson
                title="Expansion"
                body="Add exactly one new child so the frontier moves outward incrementally."
              />
              <MiniLesson
                title="Simulation"
                body="Play to the end quickly with a random default policy instead of perfect planning."
              />
              <MiniLesson
                title="Backpropagation"
                body="Update visit counts and cumulative rewards for each tree node on the selected path."
              />
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function InspectorStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1rem] border border-stone-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-stone-900">
        {value}
      </p>
    </div>
  );
}

function MiniLesson({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4">
      <h3 className="text-lg font-semibold tracking-[-0.03em] text-stone-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-7 text-stone-600">{body}</p>
    </article>
  );
}
