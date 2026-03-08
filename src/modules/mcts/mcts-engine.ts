import {
  getActionBetween,
  isTerminalNode,
  rootNodeId,
  scenarioNodes,
} from "./scenario";

export type SearchTreeNode = {
  id: string;
  parentId: string | null;
  visits: number;
  totalReward: number;
  expandedChildIds: string[];
  unexpandedActionIds: string[];
};

export type RootActionSummary = {
  nodeId: string;
  label: string;
  title: string;
  visits: number;
  averageReward: number;
};

export type DecisionScore = {
  targetId: string;
  label: string;
  averageReward: number;
  normalizedAverage: number;
  visits: number;
  explorationBonus: number;
  uctScore: number;
};

export type SearchTrace = {
  iteration: number;
  selectionNodeIds: string[];
  rolloutNodeIds: string[];
  expandedNodeId: string | null;
  terminalNodeId: string;
  reward: number;
  narration: string[];
  updatedNodeIds: string[];
  decisionNodeId: string | null;
  decisionScores: DecisionScore[];
  rootActionSummaries: RootActionSummary[];
};

export type SearchState = {
  iteration: number;
  nodes: Record<string, SearchTreeNode>;
  lastTrace: SearchTrace | null;
};

function createSearchTreeNode(id: string, parentId: string | null): SearchTreeNode {
  return {
    id,
    parentId,
    visits: 0,
    totalReward: 0,
    expandedChildIds: [],
    unexpandedActionIds: scenarioNodes[id].actions.map((action) => action.targetId),
  };
}

function averageReward(node: SearchTreeNode | undefined) {
  if (!node || node.visits === 0) {
    return 0;
  }

  return node.totalReward / node.visits;
}

const terminalRewards = Object.values(scenarioNodes)
  .map((node) => node.reward)
  .filter((reward): reward is number => reward !== undefined);

const minReward = Math.min(...terminalRewards);
const maxReward = Math.max(...terminalRewards);
const rewardSpan = Math.max(1, maxReward - minReward);

function normalizeReward(reward: number) {
  return (reward - minReward) / rewardSpan;
}

function uctScore(
  child: SearchTreeNode,
  parentVisits: number,
  explorationConstant: number,
) {
  const meanReward = averageReward(child);
  const normalizedAverage = normalizeReward(meanReward);
  const explorationBonus =
    explorationConstant * Math.sqrt(Math.log(parentVisits + 1) / child.visits);

  return {
    meanReward,
    normalizedAverage,
    explorationBonus,
    score: normalizedAverage + explorationBonus,
  };
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function createInitialSearchState(): SearchState {
  return {
    iteration: 0,
    nodes: {
      [rootNodeId]: createSearchTreeNode(rootNodeId, null),
    },
    lastTrace: null,
  };
}

export function runMctsIteration(
  currentState: SearchState,
  explorationConstant: number,
): SearchState {
  const nodes: Record<string, SearchTreeNode> = Object.fromEntries(
    Object.entries(currentState.nodes).map(([id, node]) => [
      id,
      {
        ...node,
        expandedChildIds: [...node.expandedChildIds],
        unexpandedActionIds: [...node.unexpandedActionIds],
      },
    ]),
  );

  let currentNodeId = rootNodeId;
  const selectionNodeIds = [rootNodeId];
  let decisionNodeId: string | null = null;
  let decisionScores: DecisionScore[] = [];

  while (!isTerminalNode(currentNodeId)) {
    const searchNode = nodes[currentNodeId];

    if (searchNode.unexpandedActionIds.length > 0) {
      break;
    }

    decisionNodeId = currentNodeId;
    decisionScores = searchNode.expandedChildIds.map((childId) => {
      const child = nodes[childId];
      const score = uctScore(child, searchNode.visits, explorationConstant);
      const action = getActionBetween(currentNodeId, childId);

      return {
        targetId: childId,
        label: action?.label ?? scenarioNodes[childId].title,
        averageReward: score.meanReward,
        normalizedAverage: score.normalizedAverage,
        visits: child.visits,
        explorationBonus: score.explorationBonus,
        uctScore: score.score,
      };
    });

    const selectedChild = decisionScores.reduce((best, candidate) =>
      candidate.uctScore > best.uctScore ? candidate : best,
    );

    currentNodeId = selectedChild.targetId;
    selectionNodeIds.push(currentNodeId);
  }

  let expandedNodeId: string | null = null;

  if (!isTerminalNode(currentNodeId)) {
    const searchNode = nodes[currentNodeId];
    const nextActionId = randomItem(searchNode.unexpandedActionIds);
    const actionIndex = searchNode.unexpandedActionIds.indexOf(nextActionId);

    searchNode.unexpandedActionIds.splice(actionIndex, 1);
    searchNode.expandedChildIds.push(nextActionId);

    if (!nodes[nextActionId]) {
      nodes[nextActionId] = createSearchTreeNode(nextActionId, currentNodeId);
    }

    currentNodeId = nextActionId;
    expandedNodeId = currentNodeId;
    selectionNodeIds.push(currentNodeId);
  }

  const rolloutNodeIds: string[] = [];

  while (!isTerminalNode(currentNodeId)) {
    const rolloutAction = randomItem(scenarioNodes[currentNodeId].actions);
    currentNodeId = rolloutAction.targetId;
    rolloutNodeIds.push(currentNodeId);
  }

  const terminalNodeId = currentNodeId;
  const reward = scenarioNodes[terminalNodeId].reward ?? 0;
  const updatedNodeIds = [...selectionNodeIds];

  for (const nodeId of updatedNodeIds) {
    const node = nodes[nodeId];
    node.visits += 1;
    node.totalReward += reward;
  }

  const rootActionSummaries = scenarioNodes[rootNodeId].actions.map((action) => {
    const node = nodes[action.targetId];

    return {
      nodeId: action.targetId,
      label: scenarioNodes[action.targetId].label,
      title: scenarioNodes[action.targetId].title,
      visits: node?.visits ?? 0,
      averageReward: averageReward(node),
    };
  });

  const lastSelectionNodeId = selectionNodeIds[selectionNodeIds.length - 2];
  const expandedAction =
    expandedNodeId && selectionNodeIds.length >= 2
      ? getActionBetween(selectionNodeIds[selectionNodeIds.length - 2], expandedNodeId)
      : null;

  const rolloutSourceId =
    rolloutNodeIds.length > 0
      ? expandedNodeId ?? selectionNodeIds[selectionNodeIds.length - 1]
      : null;

  const firstRolloutAction =
    rolloutSourceId && rolloutNodeIds.length > 0
      ? getActionBetween(rolloutSourceId, rolloutNodeIds[0])
      : null;
  const selectedChildId =
    decisionNodeId && selectionNodeIds.length >= 2
      ? selectionNodeIds[selectionNodeIds.indexOf(decisionNodeId) + 1] ?? null
      : null;

  const narration = [
    decisionNodeId
      ? `Selection used UCT at ${scenarioNodes[decisionNodeId].title} and chose ${scenarioNodes[selectedChildId ?? decisionNodeId].title} as the best tradeoff between reward and uncertainty.`
      : "Selection stayed at the root because there was still an unexplored move available.",
    expandedNodeId
      ? `Expansion opened ${scenarioNodes[expandedNodeId].title} by taking “${expandedAction?.label}”.`
      : `Expansion was skipped because the search landed on the terminal state ${scenarioNodes[terminalNodeId].title}.`,
    rolloutNodeIds.length > 0
      ? `Simulation rolled out from ${scenarioNodes[rolloutSourceId ?? lastSelectionNodeId].title} via “${firstRolloutAction?.label}” until it hit ${scenarioNodes[terminalNodeId].title}.`
      : `Simulation finished immediately because the expanded node was already terminal.`,
    `Backpropagation sent ${reward} reward back through ${updatedNodeIds.length} visited tree nodes.`,
  ];

  return {
    iteration: currentState.iteration + 1,
    nodes,
    lastTrace: {
      iteration: currentState.iteration + 1,
      selectionNodeIds,
      rolloutNodeIds,
      expandedNodeId,
      terminalNodeId,
      reward,
      narration,
      updatedNodeIds,
      decisionNodeId,
      decisionScores,
      rootActionSummaries,
    },
  };
}
