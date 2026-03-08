import { type ComponentType } from "react";
import { Bm25Playground } from "@/modules/bm25/Bm25Playground";
import { MctsPlayground } from "@/modules/mcts/MctsPlayground";

type Theme = {
  badgeClassName: string;
};

export type ActivePlayground = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  estimatedDuration: string;
  concepts: string[];
  learningGoals: string[];
  theme: Theme;
  component: ComponentType;
};

export type UpcomingPlayground = {
  slug: string;
  title: string;
  summary: string;
};

export const activePlaygrounds: ActivePlayground[] = [
  {
    slug: "bm25",
    title: "BM25 Ranking Lab",
    kicker: "See why rare words spike, repeats saturate, and long docs get checked.",
    summary:
      "Type a query, tune k1 and b, and watch document scores reshuffle. Each result exposes per-term contributions so BM25 stops feeling like a magic relevance number.",
    estimatedDuration: "6 to 9 minutes",
    concepts: [
      "Inverse document frequency",
      "Term saturation",
      "Length normalization",
      "Ranking",
    ],
    learningGoals: [
      "See why rare query terms create more score than common ones.",
      "Understand how repeated matches help, but not linearly forever.",
      "Recognize how document length changes the denominator and the final ranking.",
    ],
    theme: {
      badgeClassName:
        "border-emerald-300 bg-emerald-100 text-emerald-900",
    },
    component: Bm25Playground,
  },
  {
    slug: "mcts",
    title: "Monte Carlo Tree Search",
    kicker: "Watch exploration and exploitation negotiate in public.",
    summary:
      "Run single simulations or let the search loop play out. The tree, scores, and narration update live so the MCTS cycle feels concrete instead of mystical.",
    estimatedDuration: "8 to 12 minutes",
    concepts: ["Selection", "UCT", "Rollouts", "Backpropagation"],
    learningGoals: [
      "See how UCT balances trying popular branches against testing uncertain ones.",
      "Understand what expansion, rollout, and backpropagation each contribute.",
      "Recognize why the best move emerges only after repeated simulations.",
    ],
    theme: {
      badgeClassName:
        "border-amber-300 bg-amber-100 text-amber-900",
    },
    component: MctsPlayground,
  },
];

export const upcomingPlaygrounds: UpcomingPlayground[] = [
  {
    slug: "attention",
    title: "Attention Maps",
    summary:
      "Trace how tokens compete for influence and why context can suddenly dominate a generation.",
  },
  {
    slug: "q-learning",
    title: "Q-Learning Arcade",
    summary:
      "Watch value estimates form over repeated trials and see the effect of exploration schedules.",
  },
  {
    slug: "diffusion",
    title: "Diffusion Studio",
    summary:
      "Scrub through denoising steps to understand why images sharpen gradually rather than appear all at once.",
  },
];

export function getActivePlayground(slug: string) {
  return activePlaygrounds.find((playground) => playground.slug === slug);
}
