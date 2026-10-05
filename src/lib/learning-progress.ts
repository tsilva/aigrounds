"use client";

import { useSyncExternalStore } from "react";
import { getLearningPath } from "@/lib/curriculum";

const storageKey = "aigrounds.learning.v1";
const changeEvent = "aigrounds-learning-changed";
export type LearningProgress = {
  visited: string[];
  reviewed: string[];
  transfers: Record<string, number>;
  last?: { slug: string; path?: string };
};
const emptyProgress: LearningProgress = { visited: [], reviewed: [], transfers: {} };
let memorySnapshot = "";

export function parseLearningProgress(raw: string): LearningProgress {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return emptyProgress;
    const p = value as Record<string, unknown>;
    const slugs = (items: unknown) => Array.isArray(items)
      ? [...new Set(items.filter((item): item is string => typeof item === "string" && /^[a-z0-9-]+$/.test(item)))] : [];
    const transfers: Record<string, number> = {};
    if (p.transfers && typeof p.transfers === "object") {
      for (const [slug, time] of Object.entries(p.transfers)) {
        if (/^[a-z0-9-]+$/.test(slug) && typeof time === "number" && Number.isFinite(time) && time > 0) transfers[slug] = time;
      }
    }
    const last = p.last && typeof p.last === "object" ? p.last as Record<string, unknown> : undefined;
    return { visited: slugs(p.visited), reviewed: slugs(p.reviewed), transfers,
      last: typeof last?.slug === "string" && /^[a-z0-9-]+$/.test(last.slug)
        ? { slug: last.slug, path: typeof last.path === "string" && getLearningPath(last.path) ? last.path : undefined } : undefined };
  } catch { return emptyProgress; }
}
function readSnapshot() {
  try { return window.localStorage.getItem(storageKey) ?? memorySnapshot; }
  catch { return memorySnapshot; }
}
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}
export function useLearningProgress() {
  return parseLearningProgress(useSyncExternalStore(subscribe, readSnapshot, () => ""));
}
export function recordLearningProgress(slug: string, kind: "visited" | "reviewed" | "transfer", path?: string) {
  const progress = parseLearningProgress(readSnapshot());
  const next = { ...progress, last: { slug, path: getLearningPath(path)?.id } };
  if (kind === "visited") next.visited = [...new Set([...progress.visited, slug])];
  if (kind === "reviewed") next.reviewed = [...new Set([...progress.reviewed, slug])];
  // Revisiting a completed result must not reset the delayed-review clock.
  if (kind === "transfer" && !progress.transfers[slug]) next.transfers = { ...progress.transfers, [slug]: Date.now() };
  const serialized = JSON.stringify(next);
  if (serialized === readSnapshot()) return;
  memorySnapshot = serialized;
  try { window.localStorage.setItem(storageKey, serialized); } catch { /* Session-only progress remains available. */ }
  window.dispatchEvent(new Event(changeEvent));
}
