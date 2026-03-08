import { type ComponentType } from "react";
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
