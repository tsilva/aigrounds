import { type BetInput } from "./expected-value-risk-engine";

export type BetPreset = {
  id: string;
  label: string;
  description: string;
  bets: BetInput[];
};

export const expectedValuePresets: BetPreset[] = [
  {
    id: "steady",
    label: "Steady vs Swingy",
    description: "Similar payoffs, different spread.",
    bets: [
      {
        id: "safe",
        label: "Safe Bet",
        shortLabel: "Safe",
        probability: 0.72,
        winAmount: 35,
        lossAmount: -18,
        color: "#16a34a",
        mutedColor: "#86efac",
      },
      {
        id: "risky",
        label: "Risky Bet",
        shortLabel: "Risky",
        probability: 0.34,
        winAmount: 125,
        lossAmount: -38,
        color: "#f59e0b",
        mutedColor: "#fde68a",
      },
    ],
  },
  {
    id: "upside",
    label: "Higher EV, Wider Swings",
    description: "A better average can still feel rough.",
    bets: [
      {
        id: "safe",
        label: "Safe Bet",
        shortLabel: "Safe",
        probability: 0.76,
        winAmount: 30,
        lossAmount: -20,
        color: "#16a34a",
        mutedColor: "#86efac",
      },
      {
        id: "risky",
        label: "Risky Bet",
        shortLabel: "Risky",
        probability: 0.28,
        winAmount: 190,
        lossAmount: -42,
        color: "#f59e0b",
        mutedColor: "#fde68a",
      },
    ],
  },
  {
    id: "trap",
    label: "Bad Long Shot",
    description: "Big prizes can hide a negative average.",
    bets: [
      {
        id: "safe",
        label: "Safe Bet",
        shortLabel: "Safe",
        probability: 0.68,
        winAmount: 28,
        lossAmount: -14,
        color: "#16a34a",
        mutedColor: "#86efac",
      },
      {
        id: "risky",
        label: "Risky Bet",
        shortLabel: "Risky",
        probability: 0.12,
        winAmount: 210,
        lossAmount: -36,
        color: "#f59e0b",
        mutedColor: "#fde68a",
      },
    ],
  },
];

export const roundOptions = [24, 60, 120] as const;
