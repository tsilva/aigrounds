import { HomePage, type HomePlaygroundCard } from "@/app/home-page";
import {
  activePlaygrounds,
  upcomingPlaygrounds,
} from "@/lib/playgrounds";
import packageJson from "../../package.json";

const learningProgressionSlugs = [
  "mean-median-mode",
  "range-quartiles-iqr",
  "variance-standard-deviation",
  "shape-skew-outliers",
  "probability-rules",
  "conditional-probability",
  "categorical-cross-entropy",
  "softmax-temperature",
  "gradient-descent",
  "confusion-matrix-thresholds",
  "overfitting",
];

const conceptTags: Record<string, string> = {
  "mean-median-mode": "statistics",
  "range-quartiles-iqr": "statistics",
  "variance-standard-deviation": "statistics",
  "shape-skew-outliers": "statistics",
  "probability-rules": "probability",
  "conditional-probability": "probability",
  "categorical-cross-entropy": "loss",
  "softmax-temperature": "probability",
  "gradient-descent": "optimization",
  "confusion-matrix-thresholds": "evaluation",
  overfitting: "generalization",
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
