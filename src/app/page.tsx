import { HomePage, type HomePlaygroundCard } from "@/app/home-page";
import {
  activePlaygrounds,
  upcomingPlaygrounds,
} from "@/lib/playgrounds";
import packageJson from "../../package.json";

const learningProgressionSlugs = [
  "mean-median-mode",
  "range-quartiles-iqr",
  "shape-skew-outliers",
  "categorical-cross-entropy",
  "softmax-temperature",
  "gradient-descent",
  "confusion-matrix-thresholds",
  "overfitting",
  "bm25",
  "attention",
  "q-learning",
  "mcts",
  "diffusion",
];

const conceptTags: Record<string, string> = {
  "mean-median-mode": "statistics",
  "range-quartiles-iqr": "statistics",
  "shape-skew-outliers": "statistics",
  "categorical-cross-entropy": "loss",
  "softmax-temperature": "probability",
  "gradient-descent": "optimization",
  "confusion-matrix-thresholds": "evaluation",
  overfitting: "generalization",
  bm25: "retrieval",
  attention: "transformers",
  "q-learning": "reinforcement",
  mcts: "planning",
  diffusion: "generation",
};

function compactOutcome(summary: string) {
  return summary.split(".")[0] ?? summary;
}

function sortByLearningProgression<T extends { slug: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftIndex = learningProgressionSlugs.indexOf(left.slug);
    const rightIndex = learningProgressionSlugs.indexOf(right.slug);

    return (
      (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) -
      (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex)
    );
  });
}

export default function Home() {
  const liveCards: HomePlaygroundCard[] = sortByLearningProgression(
    activePlaygrounds,
  ).map((playground, index) => ({
    step: index + 1,
    slug: playground.slug,
    title: playground.title,
    tag: conceptTags[playground.slug] ?? playground.concepts[0] ?? "concept",
    outcome: compactOutcome(playground.summary),
    duration: playground.estimatedDuration,
    level: `level ${String(index + 1).padStart(2, "0")}`,
    concepts: playground.concepts,
    status: "live",
    href: `/playgrounds/${playground.slug}`,
  }));

  const upcomingCards: HomePlaygroundCard[] = sortByLearningProgression(
    upcomingPlaygrounds,
  ).map((playground, index) => ({
    step: liveCards.length + index + 1,
    slug: playground.slug,
    title: playground.title,
    tag: conceptTags[playground.slug] ?? "concept",
    outcome: compactOutcome(playground.summary),
    duration: "coming soon",
    level: `level ${String(liveCards.length + index + 1).padStart(2, "0")}`,
    concepts: [],
    status: "coming-soon",
  }));

  return (
    <HomePage
      playgrounds={[...liveCards, ...upcomingCards]}
      version={packageJson.version}
    />
  );
}
