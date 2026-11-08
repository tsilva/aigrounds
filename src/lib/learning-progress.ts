"use client";

import { getLearningPath } from "@/lib/curriculum";
import { readLearningProgress, readSnapshot, writeSnapshot, type LearningProgress } from "@/lib/learning-progress-store";

export type { LearningProgress } from "@/lib/learning-progress-store";

export function parseLearningProgress(raw: string): LearningProgress {
  return readLearningProgress(raw, path => Boolean(getLearningPath(path)));
}

export function recordLearningProgress(slug: string, kind: "visited" | "reviewed" | "transfer" | "test", path?: string) {
  const progress = parseLearningProgress(readSnapshot());
  const next = { ...progress, last: kind === "test" ? progress.last : { slug, path: getLearningPath(path)?.id } };
  if (kind === "visited") next.visited = [...new Set([...progress.visited, slug])];
  if (kind === "reviewed") next.reviewed = [...new Set([...progress.reviewed, slug])];
  // Revisiting a completed result must not reset the delayed-review clock.
  if (kind === "transfer" && !progress.transfers[slug]) next.transfers = { ...progress.transfers, [slug]: Date.now() };
  if (kind === "test" && !progress.testPasses[slug]) next.testPasses = { ...progress.testPasses, [slug]: Date.now() };
  writeSnapshot(JSON.stringify(next));
}
