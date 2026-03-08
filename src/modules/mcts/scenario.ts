export type ScenarioAction = {
  label: string;
  targetId: string;
  teaser: string;
};

export type ScenarioNode = {
  id: string;
  label: string;
  title: string;
  description: string;
  x: number;
  y: number;
  actions: ScenarioAction[];
  reward?: number;
};

export const rootNodeId = "bridge";

export const scenarioNodes: Record<string, ScenarioNode> = {
  bridge: {
    id: "bridge",
    label: "Bridge",
    title: "Starship Bridge",
    description:
      "You have one shot at the best mission haul. MCTS needs to decide where to send the crew first.",
    x: 88,
    y: 360,
    actions: [
      {
        label: "Scan Aurora Fields",
        targetId: "aurora",
        teaser: "Big signal energy, medium certainty.",
      },
      {
        label: "Enter Coral Nebula",
        targetId: "coral",
        teaser: "Balanced rewards with fewer disasters.",
      },
      {
        label: "Approach Obsidian Moon",
        targetId: "obsidian",
        teaser: "Highest upside, but scary outcomes too.",
      },
    ],
  },
  aurora: {
    id: "aurora",
    label: "Aurora",
    title: "Aurora Fields",
    description:
      "Electric storms hide a distress call and a cache of volatile crystals.",
    x: 278,
    y: 130,
    actions: [
      {
        label: "Chase the distress signal",
        targetId: "aurora-signal",
        teaser: "Could be a heroic rescue or a decoy.",
      },
      {
        label: "Harvest storm crystals",
        targetId: "aurora-crystals",
        teaser: "Usually decent, rarely spectacular.",
      },
    ],
  },
  coral: {
    id: "coral",
    label: "Coral",
    title: "Coral Nebula",
    description:
      "Trade routes and wreckage fields create a safer but slower mission space.",
    x: 278,
    y: 360,
    actions: [
      {
        label: "Trade at the drift market",
        targetId: "coral-market",
        teaser: "Steady value if the deals land.",
      },
      {
        label: "Sneak through the wreck maze",
        targetId: "coral-wreck",
        teaser: "Sharper swings with salvage upside.",
      },
    ],
  },
  obsidian: {
    id: "obsidian",
    label: "Obsidian",
    title: "Obsidian Moon",
    description:
      "This route contains the best treasure in the tree and some miserable failures.",
    x: 278,
    y: 590,
    actions: [
      {
        label: "Scale the lava ridge",
        targetId: "obsidian-ridge",
        teaser: "Incredible jackpot if the route holds.",
      },
      {
        label: "Tunnel beneath the crater",
        targetId: "obsidian-tunnel",
        teaser: "Safer than it looks, still dangerous.",
      },
    ],
  },
  "aurora-signal": {
    id: "aurora-signal",
    label: "Signal",
    title: "Signal Pursuit",
    description:
      "The signal source is unstable. One branch rescues a crew, another wastes the whole detour.",
    x: 510,
    y: 76,
    actions: [
      {
        label: "Lock onto the real beacon",
        targetId: "aurora-signal-save",
        teaser: "Huge morale and research payout.",
      },
      {
        label: "Follow the decoy ping",
        targetId: "aurora-signal-decoy",
        teaser: "Looks exciting, pays badly.",
      },
    ],
  },
  "aurora-crystals": {
    id: "aurora-crystals",
    label: "Crystals",
    title: "Crystal Harvest",
    description:
      "Less dramatic, more practical. Good engineering rewards if the storm stays calm.",
    x: 510,
    y: 206,
    actions: [
      {
        label: "Stabilize the reactor haul",
        targetId: "aurora-crystals-reactor",
        teaser: "Solid return for the engineering bay.",
      },
      {
        label: "Push deeper into ion rain",
        targetId: "aurora-crystals-rain",
        teaser: "Most crews regret this immediately.",
      },
    ],
  },
  "coral-market": {
    id: "coral-market",
    label: "Market",
    title: "Drift Market",
    description:
      "Negotiation-heavy branch. The upside is good intel, the downside is pure delay.",
    x: 510,
    y: 314,
    actions: [
      {
        label: "Buy the winning star map",
        targetId: "coral-market-map",
        teaser: "Excellent value when the merchant is honest.",
      },
      {
        label: "Get trapped in bargaining",
        targetId: "coral-market-trap",
        teaser: "Burns time for almost nothing.",
      },
    ],
  },
  "coral-wreck": {
    id: "coral-wreck",
    label: "Wreck Maze",
    title: "Wreck Maze",
    description:
      "Fast salvage path with hidden drones. Good if you thread the debris correctly.",
    x: 510,
    y: 440,
    actions: [
      {
        label: "Recover the ancient engine",
        targetId: "coral-wreck-engine",
        teaser: "Strong reward and useful tech.",
      },
      {
        label: "Trigger the drone grid",
        targetId: "coral-wreck-drones",
        teaser: "A painful lesson in impatience.",
      },
    ],
  },
  "obsidian-ridge": {
    id: "obsidian-ridge",
    label: "Lava Ridge",
    title: "Lava Ridge",
    description:
      "This is the flashy branch. It contains the best terminal reward in the whole mission tree.",
    x: 510,
    y: 534,
    actions: [
      {
        label: "Crack open the relic vault",
        targetId: "obsidian-ridge-vault",
        teaser: "Best outcome in the scenario.",
      },
      {
        label: "Retreat after fuel loss",
        targetId: "obsidian-ridge-retreat",
        teaser: "Catastrophic tempo loss.",
      },
    ],
  },
  "obsidian-tunnel": {
    id: "obsidian-tunnel",
    label: "Tunnel",
    title: "Crater Tunnel",
    description:
      "More stable than the ridge, still risky enough that MCTS must test it directly.",
    x: 510,
    y: 654,
    actions: [
      {
        label: "Uncover the safe shortcut",
        targetId: "obsidian-tunnel-shortcut",
        teaser: "Nearly as good as the jackpot branch.",
      },
      {
        label: "Collapse the passage",
        targetId: "obsidian-tunnel-collapse",
        teaser: "A long way home with nothing to show.",
      },
    ],
  },
  "aurora-signal-save": {
    id: "aurora-signal-save",
    label: "Crew Saved",
    title: "Rescue the Research Crew",
    description: "Excellent result with a big knowledge bonus.",
    x: 790,
    y: 44,
    reward: 92,
    actions: [],
  },
  "aurora-signal-decoy": {
    id: "aurora-signal-decoy",
    label: "Decoy",
    title: "Chase a Decoy Beacon",
    description: "The crew spends fuel and finds almost nothing.",
    x: 790,
    y: 100,
    reward: 35,
    actions: [],
  },
  "aurora-crystals-reactor": {
    id: "aurora-crystals-reactor",
    label: "Reactor",
    title: "Stabilize the Reactor Load",
    description: "Strong practical gain, not the overall best route.",
    x: 790,
    y: 168,
    reward: 74,
    actions: [],
  },
  "aurora-crystals-rain": {
    id: "aurora-crystals-rain",
    label: "Ion Rain",
    title: "Lose Time in Ion Rain",
    description: "Some material gain, lots of wasted motion.",
    x: 790,
    y: 224,
    reward: 41,
    actions: [],
  },
  "coral-market-map": {
    id: "coral-market-map",
    label: "Star Map",
    title: "Buy the Winning Star Map",
    description: "Quietly one of the better outcomes in the tree.",
    x: 790,
    y: 292,
    reward: 81,
    actions: [],
  },
  "coral-market-trap": {
    id: "coral-market-trap",
    label: "Bargain Trap",
    title: "Get Stuck in Negotiations",
    description: "The market wins, your crew does not.",
    x: 790,
    y: 348,
    reward: 48,
    actions: [],
  },
  "coral-wreck-engine": {
    id: "coral-wreck-engine",
    label: "Engine",
    title: "Recover an Ancient Engine",
    description: "Good salvage with real long-term utility.",
    x: 790,
    y: 416,
    reward: 66,
    actions: [],
  },
  "coral-wreck-drones": {
    id: "coral-wreck-drones",
    label: "Drones",
    title: "Trigger the Security Drones",
    description: "Immediate trouble and weak reward.",
    x: 790,
    y: 472,
    reward: 28,
    actions: [],
  },
  "obsidian-ridge-vault": {
    id: "obsidian-ridge-vault",
    label: "Relic Vault",
    title: "Claim the Relic Vault",
    description: "This is the jackpot branch MCTS hopes to discover.",
    x: 790,
    y: 540,
    reward: 97,
    actions: [],
  },
  "obsidian-ridge-retreat": {
    id: "obsidian-ridge-retreat",
    label: "Retreat",
    title: "Retreat After Fuel Loss",
    description: "Massive downside despite the tempting entry point.",
    x: 790,
    y: 596,
    reward: 22,
    actions: [],
  },
  "obsidian-tunnel-shortcut": {
    id: "obsidian-tunnel-shortcut",
    label: "Shortcut",
    title: "Uncover a Safe Shortcut",
    description: "A high-value fallback that keeps Obsidian attractive.",
    x: 790,
    y: 664,
    reward: 88,
    actions: [],
  },
  "obsidian-tunnel-collapse": {
    id: "obsidian-tunnel-collapse",
    label: "Cave-in",
    title: "Collapse the Passage",
    description: "A harsh penalty for tunneling too aggressively.",
    x: 790,
    y: 720,
    reward: 17,
    actions: [],
  },
};

export const orderedScenarioNodes = Object.values(scenarioNodes);

export function isTerminalNode(nodeId: string) {
  return scenarioNodes[nodeId].reward !== undefined;
}

export function getActionBetween(fromId: string, toId: string) {
  return scenarioNodes[fromId].actions.find((action) => action.targetId === toId);
}

export function getOptimalRoute(nodeId = rootNodeId): {
  path: string[];
  reward: number;
} {
  const node = scenarioNodes[nodeId];

  if (node.reward !== undefined) {
    return {
      path: [nodeId],
      reward: node.reward,
    };
  }

  const childRoutes = node.actions.map((action) => {
    const route = getOptimalRoute(action.targetId);

    return {
      path: [nodeId, ...route.path],
      reward: route.reward,
    };
  });

  return childRoutes.reduce((best, candidate) =>
    candidate.reward > best.reward ? candidate : best,
  );
}
